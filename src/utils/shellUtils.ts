import * as cp from 'child_process';
import * as os from 'os';

// ===========================================================
// Shell 유틸리티 함수
// ===========================================================

/**
 * OS별 PATH 환경변수를 설정하여 Shell 명령어 실행
 * Mac/Linux: /usr/local/bin, /opt/homebrew/bin을 PATH에 추가
 */
export function execShell(
    cmd: string,
    callback: (error: cp.ExecException | null, stdout: string, stderr: string) => void
) {
    const platform = os.platform();
    let finalCmd = cmd;

    if (platform === 'darwin' || platform === 'linux') {
        finalCmd = `export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin && ${cmd}`;
    }

    cp.exec(finalCmd, callback);
}
