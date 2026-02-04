import * as vscode from 'vscode';
import { SpecEngine } from '../core/SpecEngine';
import { SpecEngineState, WebviewToExtensionMessage } from '../types';
import { ensureOllamaReady } from '../services/ollama/OllamaHealthCheck';
import { startOllamaServer } from '../services/ollama/OllamaProcessManager';
import { generateDocsWithOllamaStream } from '../services/ai/AIService';

// ===========================================================
// Webview Provider: UI 관리 및 메시지 핸들링
// ===========================================================

export class WebviewProvider {
    private panel: vscode.WebviewPanel | undefined;
    private engine: SpecEngine;
    private lastActiveDocument: vscode.TextDocument | undefined;
    private context: vscode.ExtensionContext;
    private abortController: AbortController | null = null;  // 취소 기능용

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.engine = new SpecEngine();
    }

    /**
     * Webview 패널 생성 또는 표시
     */
    public createOrShow() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Two);
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'specEngine',
                'Spec-Engine Preview',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            this.panel.webview.html = this.getWebviewContent();

            // 메시지 핸들러
            this.panel.webview.onDidReceiveMessage(
                async (message: any) => {
                    if (message.command === 'downloadMarkdown') {
                        await this.saveMarkdownFile(message.text || '');
                    } else if (message.command === 'triggerAI') {
                        await this.triggerAIDocs();
                    } else if (message.command === 'cancelAI') {
                        this.cancelGeneration();
                    }
                },
                undefined,
                this.context.subscriptions
            );

            this.panel.onDidDispose(
                () => {
                    this.panel = undefined;
                },
                null,
                this.context.subscriptions
            );
        }

        // .spec 파일이 열려있으면 로직 계산
        if (vscode.window.activeTextEditor?.document.fileName.endsWith('.spec')) {
            this.lastActiveDocument = vscode.window.activeTextEditor.document;
            this.updateLogicOnly();
        }
    }

    /**
     * 문서 변경 시 로직만 재계산 (AI 호출 X)
     */
    public onDocumentChange(document: vscode.TextDocument) {
        if (document.fileName.endsWith('.spec')) {
            this.lastActiveDocument = document;
            if (this.panel) {
                this.updateLogicOnly();
            }
        }
    }

    /**
     * Active Editor 변경 시 처리
     */
    public onActiveEditorChange(editor: vscode.TextEditor | undefined) {
        if (editor && editor.document.fileName.endsWith('.spec')) {
            this.lastActiveDocument = editor.document;
            this.updateLogicOnly();
        }
    }

    /**
     * 로직만 계산하여 Webview 업데이트
     */
    private updateLogicOnly() {
        if (!this.panel || !this.lastActiveDocument) return;

        const result = this.engine.execute(this.lastActiveDocument.getText());
        this.panel.webview.postMessage({
            command: 'updateApp',
            data: result
        });
    }

    /**
     * AI 기획서 생성 트리거 (Stream 모드)
     */
    private async triggerAIDocs() {
        // 현재 활성화된 .spec 파일 찾기
        let doc = vscode.window.activeTextEditor?.document;
        if (!doc || !doc.fileName.endsWith('.spec')) {
            doc = this.lastActiveDocument;
        }
        if (!doc) {
            doc = vscode.window.visibleTextEditors.find(
                e => e.document.fileName.endsWith('.spec')
            )?.document;
        }

        if (!doc) {
            vscode.window.showErrorMessage("파일을 찾을 수 없습니다.");
            return;
        }

        const text = doc.getText();
        const result = this.engine.execute(text);
        const config = vscode.workspace.getConfiguration('spec-engine');
        const localModel = config.get<string>('localModelName') || 'gemma2';

        // Ollama 준비 확인
        const isReady = await ensureOllamaReady(localModel, startOllamaServer);
        if (!isReady) return;

        // 로딩 상태 전송
        this.panel?.webview.postMessage({ command: 'docLoading' });

        // AbortController 생성 (취소 기능용)
        this.abortController = new AbortController();

        // AI 생성 (진행률 표시)
        await generateDocsWithOllamaStream(
            text,
            result,
            (progress) => {
                // 진행률 업데이트 (0-100)
                this.panel?.webview.postMessage({
                    command: 'updateProgress',
                    data: progress
                });
            },
            (finalMarkdown) => {
                // 완료 시: 최종 문서 전송
                this.panel?.webview.postMessage({
                    command: 'updateDocs',
                    data: finalMarkdown
                });
                this.abortController = null;
            },
            this.abortController.signal
        );
    }

    /**
     * AI 생성 취소
     */
    public cancelGeneration() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    /**
     * Markdown 파일 저장
     */
    private async saveMarkdownFile(content: string) {
        const options: vscode.SaveDialogOptions = {
            defaultUri: vscode.workspace.workspaceFolders
                ? vscode.workspace.workspaceFolders[0].uri
                : undefined,
            filters: { 'Markdown Files': ['md'] },
            title: '기획서 내보내기'
        };

        const fileUri = await vscode.window.showSaveDialog(options);
        if (fileUri) {
            const encoder = new TextEncoder();
            await vscode.workspace.fs.writeFile(fileUri, encoder.encode(content));
            vscode.window.showInformationMessage(`✅ 저장됨: ${fileUri.fsPath}`);
        }
    }

    /**
     * Webview HTML 생성
     */
    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 30px; padding-bottom: 100px; color: var(--vscode-editor-foreground); line-height: 1.7; max-width: 800px; margin: 0 auto; }
        .status-bar { position: fixed; top: 20px; right: 20px; font-size: 12px; color: #888; background: var(--vscode-editor-background); padding: 5px 10px; border: 1px solid #444; border-radius: 20px; }
        .fab-container { position: fixed; bottom: 30px; right: 30px; display: flex; gap: 10px; flex-direction: column; align-items: flex-end; }
        button { border: none; padding: 12px 20px; border-radius: 25px; font-size: 14px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        #saveBtn { background-color: #555; color: white; display: none; }
        #genBtn { background-color: #007acc; color: white; }
        #genBtn:hover { transform: translateY(-2px); }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 122, 204, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); } }
        /* ===== 마크다운 스타일 (GitHub 스타일 기반) ===== */
        .markdown-body {
            margin-top: 40px;
            font-size: 16px;
            line-height: 1.6;
            word-wrap: break-word;
        }

        /* 헤더 */
        .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        .markdown-body h1 {
            font-size: 2em;
            border-bottom: 2px solid var(--vscode-panel-border, #444);
            padding-bottom: 0.3em;
            color: var(--vscode-editor-foreground);
        }
        .markdown-body h2 {
            font-size: 1.5em;
            border-bottom: 1px solid var(--vscode-panel-border, #444);
            padding-bottom: 0.3em;
            color: var(--vscode-editor-foreground);
        }
        .markdown-body h3 {
            font-size: 1.25em;
            color: var(--vscode-editor-foreground);
        }
        .markdown-body h4 { font-size: 1em; }
        .markdown-body h5 { font-size: 0.875em; }
        .markdown-body h6 { font-size: 0.85em; color: #6a737d; }

        /* 테이블 */
        .markdown-body table {
            border-collapse: collapse;
            border-spacing: 0;
            width: 100%;
            margin: 16px 0;
            overflow: auto;
            display: block;
        }
        .markdown-body table th {
            font-weight: 600;
            background-color: var(--vscode-editor-lineHighlightBackground, rgba(255, 255, 255, 0.05));
            padding: 8px 13px;
            border: 1px solid var(--vscode-panel-border, #444);
        }
        .markdown-body table td {
            padding: 8px 13px;
            border: 1px solid var(--vscode-panel-border, #444);
        }
        .markdown-body table tr:nth-child(2n) {
            background-color: var(--vscode-editor-lineHighlightBackground, rgba(255, 255, 255, 0.02));
        }

        /* 리스트 */
        .markdown-body ul, .markdown-body ol {
            padding-left: 2em;
            margin: 12px 0;
        }
        .markdown-body li {
            margin: 4px 0;
        }
        .markdown-body li > p {
            margin: 0;
        }
        .markdown-body li + li {
            margin-top: 0.25em;
        }

        /* 체크박스 리스트 */
        .markdown-body input[type="checkbox"] {
            margin-right: 8px;
        }

        /* 코드 블록 */
        .markdown-body code {
            background-color: var(--vscode-textCodeBlock-background, rgba(110, 118, 129, 0.2));
            border-radius: 3px;
            font-size: 85%;
            margin: 0;
            padding: 0.2em 0.4em;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }
        .markdown-body pre {
            background-color: var(--vscode-textCodeBlock-background, rgba(110, 118, 129, 0.2));
            border-radius: 6px;
            font-size: 85%;
            line-height: 1.45;
            overflow: auto;
            padding: 16px;
            margin: 16px 0;
        }
        .markdown-body pre code {
            background-color: transparent;
            border: 0;
            display: inline;
            line-height: inherit;
            margin: 0;
            overflow: visible;
            padding: 0;
            word-wrap: normal;
        }

        /* 인용문 */
        .markdown-body blockquote {
            border-left: 4px solid var(--vscode-textBlockQuote-border, #dfe2e5);
            color: var(--vscode-textBlockQuote-foreground, #6a737d);
            padding: 0 1em;
            margin: 16px 0;
        }

        /* 수평선 */
        .markdown-body hr {
            height: 0.25em;
            padding: 0;
            margin: 24px 0;
            background-color: var(--vscode-panel-border, #444);
            border: 0;
        }

        /* 강조 */
        .markdown-body strong {
            font-weight: 600;
        }
        .markdown-body em {
            font-style: italic;
        }

        /* 링크 */
        .markdown-body a {
            color: var(--vscode-textLink-foreground, #58a6ff);
            text-decoration: none;
        }
        .markdown-body a:hover {
            text-decoration: underline;
        }

        /* 단락 */
        .markdown-body p {
            margin-top: 0;
            margin-bottom: 16px;
        }

        /* 로딩 컨테이너 */
        .loading-container { text-align: center; margin-top: 80px; }

        /* 스피너 애니메이션 */
        .spinner { width: 60px; height: 60px; margin: 0 auto 30px; border: 4px solid rgba(255, 165, 0, 0.2); border-top: 4px solid #FFA500; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* 프로그레스 바 (실제 진행률 표시) */
        .progress-container { width: 100%; max-width: 400px; height: 8px; background: rgba(255, 165, 0, 0.2); border-radius: 10px; margin: 20px auto; overflow: hidden; }
        .progress-bar { height: 100%; background: linear-gradient(90deg, #FFA500, #FF8C00); border-radius: 10px; transition: width 0.3s ease; width: 0%; }

        /* 로딩 텍스트 */
        .loading-text { font-size: 18px; color: #FFA500; font-weight: bold; margin-bottom: 10px; }
        .loading-subtitle { font-size: 14px; color: #888; margin-top: 5px; }

        /* 도트 애니메이션 */
        .dots { display: inline-block; }
        .dots::after { content: ''; animation: dots 1.5s steps(4, end) infinite; }
        @keyframes dots { 0%, 20% { content: ''; } 40% { content: '.'; } 60% { content: '..'; } 80%, 100% { content: '...'; } }
    </style>
</head>
<body>
    <div class="status-bar"><span id="engineStatus">⚡ Engine Ready</span></div>
    <div id="docView" class="markdown-body">
        <div style="text-align: center; margin-top: 100px; color: #666;">
            <h2>Spec-Engine (Local AI)</h2>
            <p>1. 코드 작성<br>2. [✨ AI 기획서 생성] 클릭</p>
        </div>
    </div>
    <div class="fab-container">
        <button id="saveBtn" onclick="saveFile()"><span>💾</span> Save</button>
        <button id="cancelBtn" onclick="cancelAI()" style="background-color: #d9534f; display: none;"><span>⏹️</span> 취소</button>
        <button id="genBtn" class="pulse" onclick="triggerAI()"><span>✨ AI 기획서 생성</span></button>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const docView = document.getElementById('docView');
        const engineStatus = document.getElementById('engineStatus');
        const saveBtn = document.getElementById('saveBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const genBtn = document.getElementById('genBtn');

        // 원본 마크다운 텍스트 저장 (HTML이 아닌 MD로 저장하기 위함)
        let originalMarkdown = '';

        function triggerAI() { vscode.postMessage({ command: 'triggerAI' }); }
        function saveFile() { vscode.postMessage({ command: 'downloadMarkdown', text: originalMarkdown }); }
        function cancelAI() { vscode.postMessage({ command: 'cancelAI' }); }

        // 로딩 상태 관리
        let loadingInterval;
        const loadingSteps = [
            { emoji: '🔍', text: '코드 분석 중', subtitle: '비즈니스 로직을 파악하고 있습니다' },
            { emoji: '🧠', text: 'AI 사고 중', subtitle: '기획서 구조를 설계하고 있습니다' },
            { emoji: '✍️', text: '문서 생성 중', subtitle: 'PRD를 작성하고 있습니다' },
            { emoji: '✨', text: '마무리 중', subtitle: '최종 검토를 진행하고 있습니다' }
        ];

        function showLoadingUI() {
            // HTML은 한 번만 렌더링 (프로그레스 바 초기화 방지)
            docView.innerHTML = \`
                <div class="loading-container">
                    <div class="spinner"></div>
                    <div class="loading-text">
                        <span id="loadingEmoji">🔍</span>
                        <span id="loadingMessage">코드 분석 중</span>
                        <span class="dots"></span>
                    </div>
                    <div class="loading-subtitle" id="loadingSubtitle">비즈니스 로직을 파악하고 있습니다</div>
                    <div class="progress-container">
                        <div id="progressBar" class="progress-bar" style="width: 0%;"></div>
                    </div>
                    <div style="margin-top: 10px; font-size: 13px; color: #888;">
                        <span id="progressText">0%</span>
                    </div>
                </div>
            \`;

            // 3초마다 메시지만 변경 (HTML 재렌더링 X)
            let stepIndex = 0;
            loadingInterval = setInterval(() => {
                const step = loadingSteps[stepIndex];
                const emojiEl = document.getElementById('loadingEmoji');
                const messageEl = document.getElementById('loadingMessage');
                const subtitleEl = document.getElementById('loadingSubtitle');

                if (emojiEl) emojiEl.innerText = step.emoji;
                if (messageEl) messageEl.innerText = step.text;
                if (subtitleEl) subtitleEl.innerText = step.subtitle;

                stepIndex = (stepIndex + 1) % loadingSteps.length;
            }, 3000);
        }

        function hideLoadingUI() {
            if (loadingInterval) {
                clearInterval(loadingInterval);
                loadingInterval = null;
            }
        }

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateApp') {
                engineStatus.innerText = "⚡ Logic Synced";
                engineStatus.style.color = "#4caf50";
            } else if (message.command === 'docLoading') {
                showLoadingUI();
                genBtn.style.display = "none";  // 생성 버튼 숨김
                cancelBtn.style.display = "flex";  // 취소 버튼 표시
            } else if (message.command === 'updateProgress') {
                // 진행률 업데이트 (0-100)
                const progress = message.data;
                const progressBar = document.getElementById('progressBar');
                const progressText = document.getElementById('progressText');
                if (progressBar) progressBar.style.width = progress + '%';
                if (progressText) progressText.innerText = progress + '%';
            } else if (message.command === 'updateDocs') {
                // 완료: 최종 문서 표시
                hideLoadingUI();
                originalMarkdown = message.data;
                docView.innerHTML = marked.parse(message.data);
                genBtn.innerText = "✨ 다시 생성";
                genBtn.classList.add("pulse");
                genBtn.style.display = "flex";
                cancelBtn.style.display = "none";
                saveBtn.style.display = "flex";
            }
        });
    </script>
</body>
</html>`;
    }
}
