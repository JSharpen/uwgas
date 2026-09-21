import * as React from 'react';
import { IconChevronRight } from '../../icons';
import { APP_VERSION, APP_VERSION_DISPLAY } from '../../version';

import { useUIStore } from '../../state/uiStore';
import { useStore } from '../../state/store';

export type SettingsSection = 'measurement' | 'import' | 'glossary';

export type SettingsRootViewProps = Record<string, never>;

export default function SettingsRootView() {
  const setSettingsView = useUIStore((s) => s.setSettingsView);
  
  const handleBugReport = () => {
    const version = APP_VERSION_DISPLAY;
    const build = APP_VERSION;
    const userAgent = navigator.userAgent;
    const screen = `${window.innerWidth}x${window.innerHeight} (DPR: ${window.devicePixelRatio || 1})`;
    
    const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const displayMode = isStandalone ? 'Standalone PWA' : 'Browser Tab';
    
    const cores = navigator.hardwareConcurrency || 'Unknown';
    const touchPoints = navigator.maxTouchPoints || 0;
    
    // Attempt to pull a meaningful but compact snapshot of the app's current state
    let stateDump = '';
    let uiDump = '';
    let storageSize = 'Unknown';
    
    try {
      const store = useStore.getState();
      const summary = {
        global: store.global,
        heightMode: store.heightMode,
        defaultMachineId: store.defaultMachineId,
        stepCount: store.sessionSteps?.length || 0,
        jigCount: store.jigs?.length || 0,
        usbCount: store.usbs?.length || 0,
        wheelCount: store.wheels?.length || 0,
        calibApplied: store.calibAppliedIds
      };
      stateDump = JSON.stringify(summary, null, 2);
      
      const uiState = useUIStore.getState();
      uiDump = JSON.stringify({
        view: uiState.view,
        settingsView: uiState.settingsView,
        isSetupPanelOpen: uiState.isSetupPanelOpen,
        activeSheet: uiState.activeSheet
      }, null, 2);
      
      if (typeof localStorage !== 'undefined') {
        const stateStr = localStorage.getItem('uwgas_app_state_v1') || '';
        storageSize = (stateStr.length / 1024).toFixed(2) + ' KB';
      }
    } catch {
      stateDump = 'Unable to serialize state.';
      uiDump = 'Unable to serialize UI.';
    }
    
    const body = `Please describe the bug you encountered:
[Type here...]



---
Diagnostic Info:
App Version: ${version} (Build ${build})
User Agent: ${userAgent}
Screen Size: ${screen}
Display Mode: ${displayMode}
Cores: ${cores} | Max Touch Points: ${touchPoints}
Local Storage Size (uwgas_app_state_v1): ${storageSize}

UI State:
${uiDump}

App State Snapshot:
${stateDump}

Note: If your bug is highly specific to a tool or custom profile, please also attach a full JSON backup (Settings > Import / Export > Export JSON backup) to this email.
`;

    const subject = `UWGAS Bug Report - v${version}`;
    // Replace this with your actual monitoring email
    const targetEmail = 'bug-report@example.com';
    
    window.location.href = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const sections: { id: SettingsSection | 'dev' | 'bug_report'; label: string; desc: string; action?: () => void }[] = [
    { id: 'measurement', label: 'Measurement', desc: 'Calculation & measurement modes' },
    { id: 'import', label: 'Import / Export', desc: 'Backup and restore data' },
    { id: 'glossary', label: 'Glossary', desc: 'Terminology and formulas' },
    { id: 'bug_report', label: 'Report a Bug', desc: 'Email a bug report to the developer', action: handleBugReport },
  ];

  if (import.meta.env.DEV) {
    sections.push({
      id: 'dev',
      label: 'Developer Mode',
      desc: 'Live UI configuration lab',
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-20 w-full">
      <div className="flex flex-col items-center py-4 mb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <div className="text-xs text-white/40 font-mono mt-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          v{APP_VERSION_DISPLAY} (Build {APP_VERSION})
        </div>
      </div>

      <div className="neu-convex rounded-[var(--ui-radius-mid)] border border-black/40 shadow-lg relative flex flex-col overflow-hidden">
        {/* Subtle Top Edge Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-[var(--ui-radius-mid)] z-0" />

        {sections.map((sec, i) => (
          <button
            key={sec.id}
            type="button"
            className={`group relative z-10 flex items-center justify-between p-4 sm:p-5 text-left hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer ${
              i < sections.length - 1 ? 'border-b border-white/5' : ''
            }`}
            onClick={() => {
              if (sec.action) {
                sec.action();
              } else {
                // @ts-expect-error: TypeScript complains about sec.id not strictly matching SettingsSection union, but we enforce it upstream
                setSettingsView(sec.id);
              }
            }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-semibold text-white tracking-wide group-hover:text-white transition-colors">
                {sec.label}
              </span>
              <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
                {sec.desc}
              </span>
            </div>
            <IconChevronRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}


