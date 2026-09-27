import * as React from 'react';
import {
  IconSliders,
  IconDatabase,
  IconBook,
  IconBug,
  IconTerminal,
} from '../../icons';
import { APP_VERSION, APP_VERSION_DISPLAY } from '../../version';
import { useUIStore } from '../../state/uiStore';
import { useStore } from '../../state/store';
import { SettingGroup, SettingItem } from '../ui';

export type SettingsSection = 'general' | 'import' | 'glossary';

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
        calibApplied: store.calibAppliedIds,
      };
      stateDump = JSON.stringify(summary, null, 2);

      const uiState = useUIStore.getState();
      uiDump = JSON.stringify(
        {
          view: uiState.view,
          settingsView: uiState.settingsView,
          isSetupPanelOpen: uiState.isSetupPanelOpen,
          activeSheet: uiState.activeSheet,
        },
        null,
        2
      );

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
    const targetEmail = 'bug-report@example.com';

    window.location.href = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-20 w-full animate-in fade-in duration-200">
      <div className="flex flex-col items-center py-4 mb-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <div className="text-xs text-white/40 font-mono mt-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          v{APP_VERSION_DISPLAY} (Build {APP_VERSION})
        </div>
      </div>

      {/* Workshop & Engine */}
      <SettingGroup title="Workshop & Engine">
        <SettingItem
          icon={<IconSliders />}
          title="General"
          description="Calculation & general preferences"
          onClick={() => setSettingsView('general')}
        />
      </SettingGroup>

      {/* Data & Storage */}
      <SettingGroup title="Data & Storage">
        <SettingItem
          icon={<IconDatabase />}
          title="Import / Export"
          description="Backup and restore data"
          onClick={() => setSettingsView('import')}
        />
      </SettingGroup>

      {/* Reference & Help */}
      <SettingGroup title="Reference & Help">
        <SettingItem
          icon={<IconBook />}
          title="Glossary"
          description="Terminology and formulas"
          onClick={() => setSettingsView('glossary')}
        />
        <SettingItem
          icon={<IconBug />}
          title="Report a Bug"
          description="Email a bug report to the developer"
          onClick={handleBugReport}
        />
      </SettingGroup>

      {/* Developer Suite */}
      {import.meta.env.DEV && (
        <SettingGroup title="Developer Suite">
          <SettingItem
            icon={<IconTerminal />}
            title="Developer Mode"
            description="Live UI configuration lab & state explorer"
            onClick={() => setSettingsView('dev')}
          />
        </SettingGroup>
      )}
    </div>
  );
}
