import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { ROOT_DIR } from './system.js';

const execAsync = promisify(exec);

export interface CommitInfo {
    jobId: string;
    subject: string;
    body: string;
}

export async function detectCommitInfo(): Promise<CommitInfo> {
    let jobId = '';
    let subject = '';
    let body = '';

    const changelogPath = path.join(ROOT_DIR, 'docs', 'CHANGELOG.md');
    const planPath = path.join(ROOT_DIR, 'docs', 'PROJECT_PLAN.md');

    try {
        const { stdout: rawStatus } = await execAsync('git status --porcelain', { cwd: ROOT_DIR });
        if (!rawStatus) return { jobId, subject, body }; // no changes

        const lines = rawStatus.split('\n').filter(Boolean);
        const changedFiles = lines.map(line => line.substring(3));

        // Strategy 1: CHANGELOG.md
        if (changedFiles.some(f => f.includes('CHANGELOG.md')) && fs.existsSync(changelogPath)) {
            const { stdout: diff } = await execAsync(`git diff HEAD -- "${changelogPath}" || true`, { cwd: ROOT_DIR });
            const addedLines = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.substring(1));
            
            if (addedLines.length > 0) {
                const fullText = addedLines.join('\n');
                
                const sessionMatch = fullText.match(/\(Session:\s*([^)]+)\)/);
                if (sessionMatch) subject = sessionMatch[1];
                
                const jobMatches = fullText.match(/JOB-[0-9]{3}/g);
                if (jobMatches) jobId = Array.from(new Set(jobMatches)).join(', ');
                
                const bullets = addedLines.filter(l => l.trim().startsWith('-'));
                const shortTitles: string[] = [];
                const fullBullets: string[] = [];
                
                bullets.forEach(b => {
                    const clean = b.replace(/^\s*-\s*/, '');
                    const boldTitleMatch = clean.match(/^\*\*([^*]+)\*\*/);
                    if (boldTitleMatch) {
                        shortTitles.push(boldTitleMatch[1].replace(/:\s*$/, ''));
                    }
                    fullBullets.push(clean.replace(/\*\*/g, ''));
                });

                if (!subject && shortTitles.length > 0) subject = shortTitles[0];
                else if (!subject && fullBullets.length > 0) subject = fullBullets[0].substring(0, 50) + '...';
                
                if (fullBullets.length > 0) {
                    body = "Key Changes & Highlights:\n" + fullBullets.map(b => `• ${b}`).join('\n');
                }
            }
        }

        // Strategy 2: PROJECT_PLAN.md
        if ((!jobId || !subject) && fs.existsSync(planPath)) {
            if (changedFiles.some(f => f.includes('PROJECT_PLAN.md'))) {
                const { stdout: diff } = await execAsync(`git diff HEAD -- "${planPath}" || true`, { cwd: ROOT_DIR });
                const addedLines = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.substring(1));
                
                const fullText = addedLines.join('\n');
                const jobMatch = fullText.match(/JOB-[0-9]{3}/);
                if (!jobId && jobMatch) jobId = jobMatch[0];
                
                const titleMatch = fullText.match(/\|\s*\*\*(JOB-[0-9]+)\*\*\s*\|\s*([^|]+)\|/);
                if (!subject && titleMatch) subject = titleMatch[2].trim();
            } else {
                const planContent = fs.readFileSync(planPath, 'utf8');
                const inProgLine = planContent.split('\n').find(l => l.includes('[IN PROGRESS]'));
                if (inProgLine) {
                    const jobMatch = inProgLine.match(/JOB-[0-9]{3}/);
                    if (!jobId && jobMatch) jobId = jobMatch[0];
                    const parts = inProgLine.split('|');
                    if (!subject && parts.length >= 3) {
                        subject = parts[2].trim();
                    }
                }
            }
        }

        // Strategy 4: File mapping
        if (!subject || !body) {
            let hasComponents = false, hasMath = false, hasState = false, hasTooling = false, hasDocs = false, hasLegacy = false;
            const fileBodyItems: string[] = [];

            for (const line of lines) {
                const st = line.substring(0, 2).trim();
                const fpath = line.substring(3).trim();
                const fname = path.basename(fpath);

                if (fpath.match(/(angle-dev-console|package\.json|vite\.config|\.gitignore|\.desktop|console\/)/)) {
                    hasTooling = true;
                    fileBodyItems.push(`Dev Console & Tooling: [${st}] ${fname}`);
                } else if (fpath.includes('src/math/')) {
                    hasMath = true;
                    fileBodyItems.push(`Math Engine: [${st}] ${fname}`);
                } else if (fpath.includes('src/components/')) {
                    hasComponents = true;
                    fileBodyItems.push(`UI Components: [${st}] ${fname}`);
                } else if (fpath.match(/src\/state\/|src\/types\//)) {
                    hasState = true;
                    fileBodyItems.push(`State & Types: [${st}] ${fname}`);
                } else if (fpath.match(/(docs\/|README|\.md)/)) {
                    hasDocs = true;
                    fileBodyItems.push(`Docs: [${st}] ${fname}`);
                } else if (fpath.match(/legacy\/|temp_|structure\.txt/)) {
                    hasLegacy = true;
                } else {
                    fileBodyItems.push(`General: [${st}] ${fname}`);
                }
            }

            const changedAreas: string[] = [];
            if (hasTooling) changedAreas.push("Dev Console & Tooling");
            if (hasComponents) changedAreas.push("UI Components");
            if (hasMath) changedAreas.push("Math Engine");
            if (hasState) changedAreas.push("State Management");
            if (hasDocs) changedAreas.push("Docs");
            if (hasLegacy) changedAreas.push("Legacy Cleanup");

            if (!subject) {
                subject = changedAreas.length > 0 ? `Update ${changedAreas.join(', ')}` : "Workspace updates and improvements";
            }
            if (!body) {
                body = "Changes in this commit:\n" + fileBodyItems.map(b => `• ${b}`).join('\n');
            }
        }

    } catch (e) {
        console.error(e);
    }
    
    return { jobId, subject, body };
}

export async function executeCommitAndPush(info: CommitInfo, branch: string) {
    try {
        // Increment build number
        const pkgPath = path.join(ROOT_DIR, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        pkg.buildNumber = (pkg.buildNumber || 0) + 1;
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        
        const finalMsg = info.jobId ? `[${info.jobId}] ${info.subject}` : info.subject;
        
        await execAsync('git add -A', { cwd: ROOT_DIR });
        
        if (info.body) {
            await execAsync(`git commit -m "${finalMsg}" -m "${info.body}"`, { cwd: ROOT_DIR });
        } else {
            await execAsync(`git commit -m "${finalMsg}"`, { cwd: ROOT_DIR });
        }
        
        await execAsync(`git push origin ${branch}`, { cwd: ROOT_DIR });
        return true;
    } catch (e) {
        return false;
    }
}
