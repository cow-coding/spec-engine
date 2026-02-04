import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as os from 'os';
import { isOllamaServerRunning } from './OllamaHealthCheck';

// ===========================================================
// Ollama 프로세스 생명주기 관리
// ===========================================================

let ollamaProcess: cp.ChildProcess | null = null;
let shutdownTimer: NodeJS.Timeout | undefined = undefined;
const IDLE_TIMEOUT = 5 * 60 * 1000; // 5분

/**
 * Ollama 서버 시작 (백그라운드 프로세스)
 * - 최대 15초 대기하며 Polling
 */
export async function startOllamaServer(): Promise<boolean> {
    return new Promise((resolve) => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Ollama 서버를 시작하는 중...",
            cancellable: false
        }, async (progress) => {
            console.log("[Ollama] Starting server process...");

            if (ollamaProcess) {
                resolve(true);
                return;
            }

            const platform = os.platform();
            let cmd = 'ollama';
            let args = ['serve'];

            ollamaProcess = cp.spawn(cmd, args, {
                detached: false,
                shell: true
            });

            ollamaProcess.on('error', (err) => {
                console.error('Failed to start ollama process:', err);
                ollamaProcess = null;
            });

            // 최대 15초 동안 1초마다 체크
            for (let i = 0; i < 15; i++) {
                progress.report({ message: `연결 시도 중... (${i + 1}/15)` });
                await new Promise(r => setTimeout(r, 1000));
                if (await isOllamaServerRunning()) {
                    resolve(true);
                    return;
                }
            }

            stopOllamaServer();
            vscode.window.showErrorMessage("❌ 서버 시작 실패. 'ollama serve'를 수동으로 실행해주세요.");
            resolve(false);
        });
    });
}

/**
 * Ollama 서버 종료
 */
export function stopOllamaServer() {
    if (ollamaProcess) {
        if (os.platform() === 'win32') {
            cp.exec(`taskkill /pid ${ollamaProcess.pid} /f /t`);
        } else {
            ollamaProcess.kill('SIGTERM');
        }
        ollamaProcess = null;
        vscode.window.setStatusBarMessage("🌙 Ollama 절전 모드 (메모리 해제됨)", 5000);
    }
}

/**
 * 5분 후 자동 종료 타이머 설정
 */
export function scheduleShutdown() {
    if (shutdownTimer) clearTimeout(shutdownTimer);
    shutdownTimer = setTimeout(() => {
        if (ollamaProcess) {
            stopOllamaServer();
            shutdownTimer = undefined;
        }
    }, IDLE_TIMEOUT);
}

/**
 * Extension 종료 시 Ollama 프로세스도 강제 종료
 */
export function cleanupOnDeactivate() {
    stopOllamaServer();
}
