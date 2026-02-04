import * as vscode from 'vscode';
import * as os from 'os';
import { execShell } from '../../utils/shellUtils';

// ===========================================================
// Ollama 헬스체크 및 설치 관리
// ===========================================================

/**
 * Ollama 서버 실행 여부 확인 (localhost:11434)
 */
export async function isOllamaServerRunning(): Promise<boolean> {
    try {
        const response = await fetch('http://127.0.0.1:11434');
        return response.status === 200;
    } catch (e) {
        return false;
    }
}

/**
 * Ollama 및 모델이 준비되었는지 확인
 * - 서버가 꺼져있으면 시작 시도 (외부 함수 호출)
 * - 모델이 없으면 다운로드 안내
 */
export async function ensureOllamaReady(
    localModel: string,
    startServerFunc: () => Promise<boolean>
): Promise<boolean> {
    const isRunning = await isOllamaServerRunning();
    if (!isRunning) {
        const started = await startServerFunc();
        if (!started) return false;
    }

    return new Promise((resolve) => {
        execShell(`ollama list`, (err, stdout) => {
            if (!stdout.includes(localModel)) {
                vscode.window.showWarningMessage(
                    `⚠️ 모델 '${localModel}'이 없습니다. 다운로드 하시겠습니까? (약 1.6GB)`,
                    { modal: true },
                    '다운로드 시작'
                ).then(selection => {
                    if (selection === '다운로드 시작') {
                        pullModel(localModel);
                    }
                });
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * Ollama 모델 다운로드 (터미널에서 실행)
 */
export function pullModel(modelName: string) {
    const terminal = vscode.window.createTerminal(`Download ${modelName}`);
    terminal.show();

    const cmd = `ollama pull ${modelName}`;
    terminal.sendText(cmd);

    vscode.window.showInformationMessage(
        `다운로드가 시작되었습니다. 완료되면 '생성' 버튼을 다시 눌러주세요.`
    );
}

/**
 * Ollama 설치 (OS별 자동 설치)
 */
export function installOllama() {
    const terminal = vscode.window.createTerminal('Ollama Installer');
    terminal.show();
    const platform = os.platform();

    if (platform === 'darwin') {
        terminal.sendText('if which brew >/dev/null; then brew install ollama; else open https://ollama.com/download/mac; fi');
    } else if (platform === 'win32') {
        terminal.sendText('winget install Ollama.Ollama');
    } else {
        terminal.sendText('curl -fsSL https://ollama.com/install.sh | sh');
    }
}
