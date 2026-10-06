import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import SelectInputImport from 'ink-select-input';
import { getGitStatus, getServerStatus, getLanIp } from './utils/system.js';
import { startServer, stopServer, readLogs } from './utils/serverManager.js';
import { detectCommitInfo, executeCommitAndPush, CommitInfo } from './utils/gitWorkflow.js';
import { promoteAndDeploy, mergeFeatureToDev, DeployStep } from './utils/deployWorkflow.js';
import QRCode from './components/QRCode.js';

// Handle ESM import for ink-select-input
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectInput = (SelectInputImport as any).default || SelectInputImport;

export default function App() {
    const { exit } = useApp();
    const [gitStatus, setGitStatus] = useState({ branch: '...', isDirty: false, status: '...' });
    const [serverStatus, setServerStatus] = useState({ isRunning: false, pid: '', port: 5173 });
    const [lanIp, setLanIp] = useState('...');
    
    const [view, setView] = useState<'menu' | 'logs' | 'commit' | 'deploy' | 'merge'>('menu');
    const [logs, setLogs] = useState<string>('');
    const [commitInfo, setCommitInfo] = useState<CommitInfo | null>(null);
    const [commitStatus, setCommitStatus] = useState<'loading' | 'confirm' | 'pushing' | 'done' | 'error'>('loading');
    
    const [deploySteps, setDeploySteps] = useState<DeployStep[]>([]);
    const [deployStatus, setDeployStatus] = useState<'confirm' | 'running' | 'done'>('confirm');

    useEffect(() => {
        const update = async () => {
            setGitStatus(await getGitStatus());
            setServerStatus(await getServerStatus());
            setLanIp(await getLanIp());
            
            if (view === 'logs') {
                setLogs(await readLogs(20));
            }
        };
        update();
        const interval = setInterval(update, 2000);
        return () => clearInterval(interval);
    }, [view]);

    useInput(async (input, key) => {
        if (view === 'logs' && (input === 'q' || key.escape)) {
            setView('menu');
        }
        
        if (view === 'commit' && commitStatus === 'confirm') {
            if (input.toLowerCase() === 'y' || key.return) {
                setCommitStatus('pushing');
                if (commitInfo) {
                    const success = await executeCommitAndPush(commitInfo, gitStatus.branch);
                    setCommitStatus(success ? 'done' : 'error');
                }
            } else if (input.toLowerCase() === 'n' || key.escape) {
                setView('menu');
            }
        }
        
        if (view === 'commit' && (commitStatus === 'done' || commitStatus === 'error')) {
            if (key.return || key.escape) {
                setView('menu');
            }
        }
        
        if (view === 'deploy' && deployStatus === 'confirm') {
            if (input.toLowerCase() === 'y' || key.return) {
                setDeployStatus('running');
                await promoteAndDeploy('patch', setDeploySteps);
                setDeployStatus('done');
            } else if (input.toLowerCase() === 'n' || key.escape) {
                setView('menu');
            }
        }
        
        if (view === 'deploy' && deployStatus === 'done') {
            if (key.return || key.escape) {
                setView('menu');
            }
        }
        
        if (view === 'merge' && deployStatus === 'confirm') {
            if (input.toLowerCase() === 'y' || key.return) {
                setDeployStatus('running');
                await mergeFeatureToDev(gitStatus.branch, setDeploySteps);
                setDeployStatus('done');
            } else if (input.toLowerCase() === 'n' || key.escape) {
                setView('menu');
            }
        }
        
        if (view === 'merge' && deployStatus === 'done') {
            if (key.return || key.escape) {
                setView('menu');
            }
        }
    });

    const handleSelect = async (item: { label: string; value: string }) => {
        if (item.value === 'exit') {
            exit();
        } else if (item.value === 'start_server') {
            await startServer();
            setServerStatus(await getServerStatus());
        } else if (item.value === 'stop_server') {
            await stopServer();
            setServerStatus(await getServerStatus());
        } else if (item.value === 'logs') {
            setLogs(await readLogs(20));
            setView('logs');
        } else if (item.value === 'commit') {
            if (gitStatus.isDirty) {
                setView('commit');
                setCommitStatus('loading');
                const info = await detectCommitInfo();
                setCommitInfo(info);
                setCommitStatus('confirm');
            }
        } else if (item.value === 'promote') {
            if (!gitStatus.isDirty) {
                setView('deploy');
                setDeployStatus('confirm');
                setDeploySteps([]);
            }
        } else if (item.value === 'merge') {
            if (!gitStatus.isDirty) {
                setView('merge');
                setDeployStatus('confirm');
                setDeploySteps([]);
            }
        }
    };

    const isFeatureBranch = gitStatus.branch !== 'dev' && gitStatus.branch !== 'main' && gitStatus.branch !== '...';

    const items = [
        { label: '🚀 Start Dev Server', value: 'start_server' },
        { label: '🛑 Stop Dev Server', value: 'stop_server' },
        { label: '🪵 View Server Logs', value: 'logs' },
        { label: `💾 Commit & Push (${gitStatus.branch})${gitStatus.isDirty ? '' : ' [Disabled: Clean]'}`, value: 'commit' },
    ];
    
    if (isFeatureBranch) {
        items.push({ label: `🔀 Merge ${gitStatus.branch} -> dev${gitStatus.isDirty ? ' [Disabled: Dirty]' : ''}`, value: 'merge' });
    } else {
        items.push({ label: `🚢 Promote dev -> main${gitStatus.isDirty ? ' [Disabled: Dirty]' : ''}`, value: 'promote' });
    }
    
    items.push({ label: '❌ Exit Console', value: 'exit' });

    const renderSteps = () => (
        <Box flexDirection="column">
            {deploySteps.map((step, i) => {
                let icon = '○'; let color = 'gray';
                if (step.status === 'running') { icon = '●'; color = 'cyan'; }
                else if (step.status === 'success') { icon = '✓'; color = 'green'; }
                else if (step.status === 'error') { icon = '✗'; color = 'red'; }
                
                return (
                    <Box key={i}>
                        <Text color={color}>{icon} {step.message}</Text>
                    </Box>
                );
            })}
        </Box>
    );

    if (view === 'merge') {
        return (
            <Box flexDirection="column" padding={1}>
                <Box borderStyle="bold" borderColor="magenta" paddingX={2} flexDirection="column">
                    <Text bold color="magenta">Merge Feature Branch Protocol</Text>
                </Box>
                <Box marginY={1} paddingX={1} flexDirection="column">
                    {deployStatus === 'confirm' && (
                        <Box flexDirection="column">
                            <Text>This will checkout 'dev', merge '{gitStatus.branch}',</Text>
                            <Text>push the result, and delete your feature branch locally and remotely.</Text>
                            <Box marginTop={1}>
                                <Text bold color="yellow">Proceed with merge? [Y/n]: </Text>
                            </Box>
                        </Box>
                    )}
                    {deployStatus !== 'confirm' && renderSteps()}
                    {deployStatus === 'done' && (
                        <Box marginTop={2}>
                            <Text dimColor>(Press Enter to return)</Text>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    }

    if (view === 'deploy') {
        return (
            <Box flexDirection="column" padding={1}>
                <Box borderStyle="bold" borderColor="blue" paddingX={2} flexDirection="column">
                    <Text bold color="blue">Promote 'dev' -{'>'} 'main' Release Protocol</Text>
                </Box>
                <Box marginY={1} paddingX={1} flexDirection="column">
                    {deployStatus === 'confirm' && (
                        <Box flexDirection="column">
                            <Text>This will run quality gates (typecheck/lint), bump the version,</Text>
                            <Text>merge to 'main', and trigger the 'gh-pages' deployment.</Text>
                            <Box marginTop={1}>
                                <Text bold color="yellow">Proceed with deployment? [Y/n]: </Text>
                            </Box>
                        </Box>
                    )}
                    {deployStatus !== 'confirm' && renderSteps()}
                    {deployStatus === 'done' && (
                        <Box marginTop={2}>
                            <Text dimColor>(Press Enter to return)</Text>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    }
    
    if (view === 'commit') {
        return (
            <Box flexDirection="column" padding={1}>
                <Box borderStyle="bold" borderColor="magenta" paddingX={2} flexDirection="column">
                    <Text bold color="magenta">Git Commit & Push Workflow</Text>
                </Box>
                <Box marginY={1} paddingX={1} flexDirection="column">
                    {commitStatus === 'loading' && <Text color="cyan">Analyzing workspace changes...</Text>}
                    {commitStatus === 'confirm' && commitInfo && (
                        <>
                            <Text bold>Auto-Detected Commit Details:</Text>
                            <Box flexDirection="column" paddingLeft={2} marginY={1}>
                                <Text>• <Text bold>Job ID:</Text> {commitInfo.jobId ? <Text color="yellow">{commitInfo.jobId}</Text> : <Text dimColor>(none detected)</Text>}</Text>
                                <Text>• <Text bold>Subject:</Text> <Text color="white">{commitInfo.subject}</Text></Text>
                            </Box>
                            <Box flexDirection="column" paddingLeft={2}>
                                <Text bold>Detailed Highlights:</Text>
                                <Text dimColor>{commitInfo.body}</Text>
                            </Box>
                            
                            <Box marginTop={2}>
                                <Text bold color="yellow">Proceed with commit & push to origin/{gitStatus.branch}? [Y/n]: </Text>
                            </Box>
                        </>
                    )}
                    {commitStatus === 'pushing' && <Text color="blue">Committing and pushing to origin/{gitStatus.branch}...</Text>}
                    {commitStatus === 'done' && (
                        <Box flexDirection="column" marginTop={1}>
                            <Text color="green" bold>✓ Successfully pushed changes to origin/{gitStatus.branch}!</Text>
                            <Box marginTop={1}><Text dimColor>(Press Enter to return)</Text></Box>
                        </Box>
                    )}
                    {commitStatus === 'error' && (
                        <Box flexDirection="column" marginTop={1}>
                            <Text color="red" bold>✗ Failed to commit or push.</Text>
                            <Box marginTop={1}><Text dimColor>(Press Enter to return)</Text></Box>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    }

    if (view === 'logs') {
        return (
            <Box flexDirection="column" padding={1}>
                <Box borderStyle="bold" borderColor="yellow" paddingX={2}>
                    <Text bold color="yellow">Server Logs (Press 'q' or ESC to exit)</Text>
                </Box>
                <Box marginY={1} paddingX={1}>
                    <Text dimColor>{logs}</Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Box borderStyle="bold" borderColor="cyan" flexDirection="column" paddingX={2} paddingY={1}>
                <Box justifyContent="space-between">
                    <Text bold color="white">UWGAS — ANGLE SETTER DEV CONSOLE</Text>
                    <Text color="yellow">MAIN MENU</Text>
                </Box>
                <Box marginY={1}>
                    <Text color="cyan">{"-".repeat(70)}</Text>
                </Box>
                

                <Box flexDirection="row">
                    <Box flexDirection="column" flexGrow={1}>
                        <Box>
                            <Text bold>Server: </Text>
                            {serverStatus.isRunning ? (
                                <Text bold color="green">● RUNNING <Text dimColor>(PID: {serverStatus.pid} | Port: {serverStatus.port})</Text></Text>
                            ) : (
                                <Text color="red">○ STOPPED <Text dimColor>(Port: {serverStatus.port})</Text></Text>
                            )}
                        </Box>
                        <Box>
                            <Text bold>URLs:   </Text>
                            {serverStatus.isRunning ? (
                                <Text color="cyan">http://localhost:{serverStatus.port} <Text dimColor>| LAN:</Text> <Text color="blue">http://{lanIp}:{serverStatus.port}</Text></Text>
                            ) : (
                                <Text dimColor>http://localhost:{serverStatus.port} (offline)</Text>
                            )}
                        </Box>
                        <Box marginTop={1}>
                            <Text bold>Git:    </Text>
                            <Text color="magenta" bold>{gitStatus.branch}  </Text>
                            {gitStatus.isDirty ? (
                                <Text color="yellow">[{gitStatus.status}]</Text>
                            ) : (
                                <Text color="green">[Clean]</Text>
                            )}
                        </Box>
                        
                        <Box marginTop={2}>
                            <SelectInput items={items} onSelect={handleSelect} />
                        </Box>
                    </Box>
                    
                    {serverStatus.isRunning && (
                        <Box borderStyle="round" borderColor="blue" paddingX={1} flexDirection="column" alignItems="center" flexShrink={0} marginLeft={2}>
                            <Text color="cyan" bold>Scan LAN</Text>
                            <QRCode url={`http://${lanIp}:${serverStatus.port}`} />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
