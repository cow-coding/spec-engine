import * as vscode from 'vscode';
import { WebviewProvider } from './ui/WebviewProvider';
import { cleanupOnDeactivate } from './services/ollama/OllamaProcessManager';

// ===========================================================
// Spec-Engine Extension 진입점
// ===========================================================

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Spec-Engine is now active!');

    // Webview Provider 초기화
    const webviewProvider = new WebviewProvider(context);

    // 커맨드 등록: Preview 패널 열기
    const openPreviewCommand = vscode.commands.registerCommand(
        'spec-engine.openPreview',
        () => {
            webviewProvider.createOrShow();
        }
    );

    // 문서 변경 이벤트 리스너
    const documentChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
        webviewProvider.onDocumentChange(event.document);
    });

    // Active Editor 변경 이벤트 리스너
    const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(editor => {
        webviewProvider.onActiveEditorChange(editor);
    });

    // 구독 등록
    context.subscriptions.push(
        openPreviewCommand,
        documentChangeListener,
        editorChangeListener
    );
}

export function deactivate() {
    // Ollama 프로세스 정리
    cleanupOnDeactivate();
}
