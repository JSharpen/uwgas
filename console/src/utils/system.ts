import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
export const ROOT_DIR = path.resolve(process.cwd(), '..');

export async function getGitStatus() {
    try {
        const { stdout: branchOut } = await execAsync('git branch --show-current', { cwd: ROOT_DIR });
        const branch = branchOut.trim() || 'detached';
        
        const { stdout: statusOut } = await execAsync('git status --porcelain', { cwd: ROOT_DIR });
        const changes = statusOut.split('\n').filter(line => line.trim().length > 0).length;
        
        return {
            branch,
            isDirty: changes > 0,
            status: changes > 0 ? `Modified (${changes} changes)` : 'Clean'
        };
    } catch {
        return { branch: '[No Git]', isDirty: false, status: 'N/A' };
    }
}

export async function getServerStatus(port: number = 5173) {
    try {
        const { stdout } = await execAsync(`lsof -ti :${port} -sTCP:LISTEN || true`);
        const pid = stdout.trim();
        if (pid) {
            return { isRunning: true, pid, port };
        }
        return { isRunning: false, pid: '', port };
    } catch {
        return { isRunning: false, pid: '', port };
    }
}

export async function getLanIp() {
    try {
        const { stdout } = await execAsync(`ip route get 1.1.1.1 | grep -oP 'src \\K\\S+' || true`);
        const ip = stdout.trim();
        if (ip) return ip;
        
        const { stdout: hostOut } = await execAsync(`hostname -I | awk '{print $1}' || true`);
        const hostIp = hostOut.trim();
        return hostIp || '127.0.0.1';
    } catch {
        return '127.0.0.1';
    }
}
