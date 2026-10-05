import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { ROOT_DIR } from './system.js';

const execAsync = promisify(exec);

export type DeployStep = {
    status: 'pending' | 'running' | 'success' | 'error';
    message: string;
};

export async function promoteAndDeploy(
    bumpType: 'patch' | 'minor' | 'major',
    onProgress: (steps: DeployStep[]) => void
) {
    const steps: DeployStep[] = [
        { status: 'pending', message: 'Verify clean working tree' },
        { status: 'pending', message: 'Run typecheck & lint' },
        { status: 'pending', message: 'Bump version & commit' },
        { status: 'pending', message: 'Merge to main & push' },
        { status: 'pending', message: 'Deploy to GitHub Pages' },
    ];
    
    const update = (idx: number, status: DeployStep['status']) => {
        steps[idx].status = status;
        onProgress([...steps]);
    };

    try {
        // Step 0: Verify clean tree
        update(0, 'running');
        const { stdout: rawStatus } = await execAsync('git status --porcelain', { cwd: ROOT_DIR });
        if (rawStatus.trim().length > 0) {
            update(0, 'error');
            return false;
        }
        await execAsync('git checkout dev', { cwd: ROOT_DIR });
        update(0, 'success');

        // Step 1: Typecheck & lint
        update(1, 'running');
        await execAsync('npm run typecheck', { cwd: ROOT_DIR });
        await execAsync('npm run lint', { cwd: ROOT_DIR });
        update(1, 'success');

        // Step 2: Bump version
        update(2, 'running');
        const pkgPath = path.join(ROOT_DIR, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const versionParts = pkg.version.split('.').map(Number);
        if (bumpType === 'major') {
            versionParts[0]++; versionParts[1] = 0; versionParts[2] = 0;
        } else if (bumpType === 'minor') {
            versionParts[1]++; versionParts[2] = 0;
        } else {
            versionParts[2]++;
        }
        pkg.version = versionParts.join('.');
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        
        await execAsync('git add package.json', { cwd: ROOT_DIR });
        await execAsync(`git commit -m "v${pkg.version}"`, { cwd: ROOT_DIR });
        await execAsync('git push origin dev', { cwd: ROOT_DIR });
        update(2, 'success');

        // Step 3: Merge and push main
        update(3, 'running');
        await execAsync('git checkout main', { cwd: ROOT_DIR });
        await execAsync('git pull origin main || true', { cwd: ROOT_DIR });
        await execAsync('git merge dev', { cwd: ROOT_DIR });
        await execAsync('git push origin main', { cwd: ROOT_DIR });
        await execAsync('git checkout dev', { cwd: ROOT_DIR });
        update(3, 'success');

        // Step 4: Deploy
        update(4, 'running');
        await execAsync('npm run deploy', { cwd: ROOT_DIR });
        update(4, 'success');

        return true;
    } catch (e) {
        // Find running step and mark as error
        const activeIdx = steps.findIndex(s => s.status === 'running');
        if (activeIdx !== -1) update(activeIdx, 'error');
        return false;
    }
}
