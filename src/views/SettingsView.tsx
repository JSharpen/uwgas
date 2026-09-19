import * as React from 'react';
import { useUIStore } from '../state/uiStore';
import { ContextBar } from '../components/layout/ContextBar';
import { APP_VERSION_DISPLAY } from '../version';
import SettingsRootView from '../components/settings/SettingsRootView';
import MeasurementSettingsView from '../components/settings/MeasurementSettingsView';
import ImportExportPanel from '../components/ImportExportPanel';
import GlossaryPage from '../components/GlossaryPage';
import DevRootView from '../components/settings/DevRootView';
import DevUIThemeView from '../components/settings/DevUIThemeView';
import DevStateView from '../components/settings/DevStateView';

export default function SettingsView() {
  const settingsView = useUIStore((s) => s.settingsView);
  const setSettingsView = useUIStore(s => s.setSettingsView);
  
  const titleMap: Record<string, string> = {
    'measurement': 'Measurement',
    'import': 'Import / Export',
    'glossary': 'Glossary',
    'dev': 'Dev Mode',
    'dev-ui': 'UI Settings',
    'dev-interaction': 'Interaction Mode',
    'dev-state': 'State Explorer'
  };

  if (settingsView === 'root') {
    return (
      <>
        <ContextBar.Slot name="left">
          <div className="h-11 px-3 rounded-2xl font-mono text-[10px] sm:text-xs text-white/30 border border-white/5 bg-black/20 flex items-center justify-center">
            v{APP_VERSION_DISPLAY}
          </div>
        </ContextBar.Slot>
        <ContextBar.Slot name="center">
          <ContextBar.AmbientInfo>Settings</ContextBar.AmbientInfo>
        </ContextBar.Slot>
        <SettingsRootView />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
      <ContextBar.Slot name="left">
        <ContextBar.Button
          variant="nav"
          onClick={() => setSettingsView(settingsView.startsWith('dev-') ? 'dev' : 'root')}
        >
          ← Back
        </ContextBar.Button>
      </ContextBar.Slot>
      <ContextBar.Slot name="center">
        <ContextBar.AmbientInfo>
          {titleMap[settingsView] || 'Settings'}
        </ContextBar.AmbientInfo>
      </ContextBar.Slot>
      {settingsView === 'measurement' && <MeasurementSettingsView />}
      {settingsView === 'import' && <ImportExportPanel />}
      {settingsView === 'glossary' && <GlossaryPage />}
      {settingsView === 'dev' && import.meta.env.DEV && <DevRootView />}
      {settingsView === 'dev-ui' && import.meta.env.DEV && <DevUIThemeView />}
      {settingsView === 'dev-state' && import.meta.env.DEV && <DevStateView />}

      {/* Safari flex gap scroll spacer */}
      <div className="h-px shrink-0 w-full" />
    </div>
  );
}
