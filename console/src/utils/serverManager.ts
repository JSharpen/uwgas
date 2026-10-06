import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);
export const ROOT_DIR = path.resolve(process.cwd(), '..');
export const LOG_DIR = path.join(ROOT_DIR, 'logs');
export const PID_FILE = path.join(ROOT_DIR, '.dev-server.pid');
export const DEV_LOG = path.join(LOG_DIR, 'dev-server.log');

export function ensureLogDir() {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}

export async function startServer(port: number = 5173) {
    ensureLogDir();
    const out = fs.openSync(DEV_LOG, 'a');
    
    // Spawn detached process
    const child = spawn('npm', ['run', 'dev', '--', '--host', '--port', port.toString()], {
        cwd: ROOT_DIR,
        detached: true,
        stdio: ['ignore', out, out]
    });
    
    child.unref(); 
    
    if (child.pid) {
        fs.writeFileSync(PID_FILE, child.pid.toString());
        return child.pid;
    }
    return null;
}

export async function stopServer(port: number = 5173) {
    try {
        const { stdout } = await execAsync(`lsof -ti :${port} -sTCP:LISTEN || true`);
        const pids = stdout.trim().split('\n').filter(Boolean);
        for (const pid of pids) {
            await execAsync(`kill -9 ${pid}`);
        }
        
        if (fs.existsSync(PID_FILE)) {
            fs.unlinkSync(PID_FILE);
        }
        return true;
    } catch {
        return false;
    }
}

export async function readLogs(lines: number = 40): Promise<string> {
    try {
        if (!fs.existsSync(DEV_LOG)) return 'No logs available.';
        const { stdout } = await execAsync(`tail -n ${lines} ${DEV_LOG}`);
        return stdout;
    } catch {
        return 'Error reading logs.';
    }
}
