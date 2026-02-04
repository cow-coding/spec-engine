// ===========================================================
// 공통 타입 정의
// ===========================================================

/**
 * SpecEngine 계산 결과 상태
 */
export interface SpecEngineState {
    [key: string]: any;
}

/**
 * AI 서비스 설정
 */
export interface AIServiceConfig {
    aiProvider: 'ollama' | 'gemini';
    localModelName: string;
    apiKey?: string;
    modelName?: string;
}

/**
 * Webview 메시지 커맨드
 */
export type MessageCommand =
    | 'updateApp'
    | 'updateDocs'
    | 'docLoading'
    | 'triggerAI'
    | 'downloadMarkdown';

/**
 * Extension → Webview 메시지
 */
export interface ExtensionToWebviewMessage {
    command: 'updateApp' | 'updateDocs' | 'docLoading';
    data?: any;
}

/**
 * Webview → Extension 메시지
 */
export interface WebviewToExtensionMessage {
    command: 'triggerAI' | 'downloadMarkdown';
    text?: string;
}
