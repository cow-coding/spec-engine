import * as vscode from 'vscode';
import { SpecEngineState } from '../../types';
import { SYSTEM_PROMPT, buildUserMessage } from './PromptTemplates';
import { scheduleShutdown } from '../ollama/OllamaProcessManager';

// ===========================================================
// AI 문서 생성 서비스
// ===========================================================

/**
 * Ollama를 사용하여 PRD 문서 생성
 */
export async function generateDocsWithOllama(
    code: string,
    state: SpecEngineState
): Promise<string> {
    const userMessage = buildUserMessage(code, state);
    const config = vscode.workspace.getConfiguration('spec-engine');
    const localModel = config.get<string>('localModelName') || 'gemma2';

    try {
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: localModel,
                prompt: SYSTEM_PROMPT + "\n" + userMessage,
                stream: false
            })
        });

        scheduleShutdown(); // 타이머 연장

        if (!response.ok) {
            return `❌ Ollama Error: ${response.statusText}`;
        }

        const data: any = await response.json();
        return cleanAIOutput(data.response);

    } catch (error: any) {
        return `❌ 연결 실패: ${error.message}`;
    }
}

/**
 * Ollama Stream 모드로 PRD 문서 생성 (진행률 표시)
 * @param code 입력 코드
 * @param state 계산된 상태
 * @param onProgress 진행률 업데이트 콜백 (0-100)
 * @param onComplete 완료 시 호출될 콜백 함수 (최종 텍스트 전달)
 * @param signal AbortSignal (취소 기능용)
 */
export async function generateDocsWithOllamaStream(
    code: string,
    state: SpecEngineState,
    onProgress: (progress: number) => void,
    onComplete: (finalText: string) => void,
    signal?: AbortSignal
): Promise<void> {
    const userMessage = buildUserMessage(code, state);
    const config = vscode.workspace.getConfiguration('spec-engine');
    const localModel = config.get<string>('localModelName') || 'gemma2';

    let accumulatedText = '';
    let lastUpdateTime = Date.now();
    let lastReportedProgress = 0;  // 마지막으로 보고한 진행률
    const THROTTLE_DELAY = 300; // 300ms
    const ESTIMATED_LENGTH = 3000; // 예상 기획서 길이 (평균)
    const PROGRESS_STEP = 5; // 진행률 업데이트 단위 (5%)

    try {
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: localModel,
                prompt: SYSTEM_PROMPT + "\n" + userMessage,
                stream: true  // 스트리밍 활성화
            }),
            signal  // 취소 기능 지원
        });

        if (!response.ok) {
            onComplete(`❌ Ollama Error: ${response.statusText}`);
            return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
            onComplete('❌ Stream reader를 생성할 수 없습니다.');
            return;
        }

        const decoder = new TextDecoder();
        let isStreamDone = false;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const json = JSON.parse(line);
                        if (json.response) {
                            accumulatedText += json.response;

                            // 300ms throttle: 진행률 계산
                            const now = Date.now();
                            if (now - lastUpdateTime >= THROTTLE_DELAY) {
                                // 진행률 계산 (최대 95%)
                                const currentLength = accumulatedText.length;
                                let progress = Math.min(
                                    Math.floor((currentLength / ESTIMATED_LENGTH) * 100),
                                    95
                                );

                                // 5% 단위로만 업데이트 (1% → 5% → 10% → 15% ...)
                                const roundedProgress = Math.floor(progress / PROGRESS_STEP) * PROGRESS_STEP;
                                if (roundedProgress > lastReportedProgress) {
                                    onProgress(roundedProgress);
                                    lastReportedProgress = roundedProgress;
                                }

                                lastUpdateTime = now;
                            }
                        }
                        if (json.done) {
                            isStreamDone = true;
                            scheduleShutdown(); // 완료 후 타이머 시작
                        }
                    } catch (e) {
                        // JSON 파싱 실패 무시
                    }
                }
            }
        }

        // 완료: 100% + 최종 텍스트 전달
        onProgress(100);
        onComplete(cleanAIOutput(accumulatedText));

    } catch (error: any) {
        if (error.name === 'AbortError') {
            onComplete('⏸️ 사용자가 생성을 취소했습니다.');
        } else {
            onComplete(`❌ 연결 실패: ${error.message}`);
        }
    }
}

/**
 * AI 출력에서 Markdown 코드 블록 제거
 */
export function cleanAIOutput(text: string): string {
    if (!text) return "";

    let cleaned = text.replace(/^```(markdown)?\s*/i, '');
    cleaned = cleaned.replace(/```\s*$/, '');

    return cleaned.trim();
}
