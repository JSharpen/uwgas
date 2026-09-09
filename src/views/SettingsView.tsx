import * as React from 'react';
import { useUIStore } from '../state/uiStore';
import SettingsRootView from '../components/settings/SettingsRootView';
import MeasurementSettingsView from '../components/settings/MeasurementSettingsView';
import HardwareManagerView from '../components/settings/HardwareManagerView';
import MachineManagerView from '../components/settings/MachineManagerView';
import ImportExportPanel from '../components/ImportExportPanel';
import GlossaryPage from '../components/GlossaryPage';
import DevRootView from '../components/settings/DevRootView';
import DevUIThemeView from '../components/settings/DevUIThemeView';
import DevStateView from '../components/settings/DevStateView';

export default function SettingsView() {
  const settingsView = useUIStore((s) => s.settingsView);
  const setSettingsView = useUIStore((s) => s.setSettingsView);

  if (settingsView === 'root') {
    return <SettingsRootView />;
  }

  const handleBack = () => {
    if (settingsView === 'dev-ui' || settingsView === 'dev-state') {
      setSettingsView('dev');
    } else {
      setSettingsView('root');
    }
  };

  const backLabel = (settingsView === 'dev-ui' || settingsView === 'dev-state') 
    ? 'Back to Dev Suite' 
    : 'Back to Settings';

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
      {settingsView !== 'measurement' && (
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 text-white/70 hover:text-white transition w-fit min-h-[44px] text-xs font-bold cursor-pointer"
        >
          <span>&larr;</span>
          <span>{backLabel}</span>
        </button>
      )}

      {settingsView === 'measurement' && <MeasurementSettingsView />}
      {settingsView === 'hardware' && <HardwareManagerView />}
      {settingsView === 'machine' && <MachineManagerView />}
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
