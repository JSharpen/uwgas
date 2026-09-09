import * as React from 'react';
import { useUIStore } from './state/uiStore';
import { useDevStore } from './state/devStore';
import { IconCalculator, IconDisc, IconSettings } from './icons';
import { APP_VERSION, APP_VERSION_DISPLAY } from './version';
import CalculatorView from './views/CalculatorView';
import WheelManagerView from './components/wheels/WheelManagerView';
import SettingsView from './views/SettingsView';
import { PresetManagerModal } from './components/presets/PresetManagerModal';
import { SavePresetDialog } from './components/presets/SavePresetDialog';

export default function App() {
  const view = useUIStore((s) => s.view);
  const setView = useUIStore((s) => s.setView);
  const devState = useDevStore();

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('collapseAll'));
  }, [view]);

  React.useEffect(() => {
    if (import.meta.env.DEV) {
      document.documentElement.style.setProperty('--ui-scale', devState.uiScale.toString());
      document.documentElement.style.setProperty('--step-card-height', `${devState.stepCardHeight}px`);
      document.documentElement.style.setProperty('--card-stack-gap', `${devState.cardStackGap}px`);
      document.documentElement.style.setProperty('--pill-bottom', `${devState.pillBottom}px`);
      document.documentElement.style.setProperty('--top-bar-thickness', `${devState.topBarThickness}px`);
      document.documentElement.style.setProperty('--ui-radius', `${devState.uiRadius}px`);
      
      // Cleanup all old classes first
      document.body.classList.remove(
        'debug-layouts-semantic', 
        'debug-layouts-universal',
        'debug-layouts-touch',
        'debug-layouts-wireframe'
      );

      if (devState.debugLayoutMode !== 'none') {
        document.body.classList.add(`debug-layouts-${devState.debugLayoutMode}`);
      }
    }
  }, [
    devState.uiScale, 
    devState.stepCardHeight, 
    devState.cardStackGap, 
    devState.pillBottom, 
    devState.topBarThickness, 
    devState.uiRadius, 
    devState.debugLayoutMode
  ]);

  return (
    <div className="min-h-dvh bg-[#09090b] text-white px-2 py-3 sm:p-4 pb-[140px] flex flex-col gap-4 max-w-4xl mx-auto selection:bg-amber-400/30 selection:text-white">
      {view === 'settings' && (
        <div
          className="fixed top-3 right-4 text-xs text-white/30 font-mono tracking-wider pointer-events-none z-30"
          aria-label={`App version ${APP_VERSION}`}
        >
          v{APP_VERSION_DISPLAY}
        </div>
      )}
      {import.meta.env.DEV && (
        <div className="fixed top-1 left-1 opacity-40 pointer-events-none z-[100] px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[9px] font-mono font-bold text-amber-400">
          UWGAS DEV BUILD
        </div>
      )}

      {/* Main Routed View */}
      <main className="flex-1 w-full">
        {view === 'calculator' && <CalculatorView />}
        {view === 'wheels' && <WheelManagerView />}
        {view === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals */}
      <PresetManagerModal />
      <SavePresetDialog />

      {/* Workshop Bottom Tab Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#18181b]/95 backdrop-blur-lg border-t border-white/5 flex items-center justify-around z-40 pb-safe shadow-2xl">
        <button
          type="button"
          onClick={() => setView('calculator')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
            view === 'calculator'
              ? 'text-amber-400 font-bold'
              : 'text-white/40 hover:text-white/80'
          }`}
          aria-label="Calculator View"
        >
          <div
            className={`flex items-center justify-center w-12 h-10 rounded-2xl transition-all ${
              view === 'calculator' ? 'bg-amber-400/10' : ''
            }`}
          >
            <IconCalculator className="w-6 h-6" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setView('wheels')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
            view === 'wheels' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white/80'
          }`}
          aria-label="Wheels View"
        >
          <div
            className={`flex items-center justify-center w-12 h-10 rounded-2xl transition-all ${
              view === 'wheels' ? 'bg-amber-400/10' : ''
            }`}
          >
            <IconDisc className="w-6 h-6" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setView('settings')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
            view === 'settings' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white/80'
          }`}
          aria-label="Settings View"
        >
          <div
            className={`flex items-center justify-center w-12 h-10 rounded-2xl transition-all ${
              view === 'settings' ? 'bg-amber-400/10' : ''
            }`}
          >
            <IconSettings className="w-6 h-6" />
          </div>
        </button>
      </nav>
    </div>
  );
}
