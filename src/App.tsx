import * as React from 'react';
import { useUIStore } from './state/uiStore';
import { useDevStore } from './state/devStore';

import CalculatorView from './views/CalculatorView';
import EquipmentView from './views/EquipmentView';
import SettingsView from './views/SettingsView';
import PresetsView from './views/PresetsView';
import { PresetManagerModal } from './components/presets/PresetManagerModal';
import { SavePresetDialog } from './components/presets/SavePresetDialog';
import { ContextBar } from './components/layout/ContextBar';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { useHardwareBackButton } from './hooks/useHardwareBackButton';

export default function App() {
  useHardwareBackButton();
  const view = useUIStore((s) => s.view);
  // setView removed
  const devState = useDevStore();

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('collapseAll'));
  }, [view]);

  React.useEffect(() => {
    if (import.meta.env.DEV) {
      document.documentElement.style.setProperty('--ui-scale', devState.uiScale.toString());
      document.documentElement.style.setProperty('--step-card-height', `${devState.stepCardHeight}px`);
      document.documentElement.style.setProperty('--card-stack-gap', `${devState.cardStackGap}px`);
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
    devState.topBarThickness, 
    devState.uiRadius, 
    devState.debugLayoutMode
  ]);

  return (
    <div className="min-h-dvh bg-[#09090b] text-white px-3 py-3 sm:px-0 sm:py-4 pb-[110px] flex flex-col gap-4 max-w-[576px] mx-auto selection:bg-amber-400/30 selection:text-white">
      {import.meta.env.DEV && (
        <div className="fixed top-1 left-1 opacity-40 pointer-events-none z-[100] px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[9px] font-mono font-bold text-amber-400">
          UWGAS DEV BUILD
        </div>
      )}

      {/* Top Mask to hide scrolling cards behind the sticky gap, placed independently to preserve ContextBar's ring highlights */}
      <div className="fixed top-0 left-0 right-0 max-w-[576px] mx-auto h-12 bg-[#09090b] pointer-events-none z-[45]" />

      {/* Global Context Bar */}
      <ContextBar />

      {/* Main Routed View */}
      <main className="flex-1 w-full">
        {view === 'calculator' && <CalculatorView />}
        {view === 'equipment' && <EquipmentView />}
        {view === 'presets' && <PresetsView />}
        {view === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals */}
      <PresetManagerModal />
      <SavePresetDialog />

      {/* Workshop Bottom Tab Navigation Bar */}
      {/* We extend the bar 10px below the viewport (bottom-[-10px]) and add 10px to the height and padding.
          This prevents sub-pixel rounding errors (often caused by browser zoom or OS scaling) from letting
          scrolling content peek through a 1px gap at the absolute bottom of the screen. */}
      <BottomTabBar />
    </div>
  );
}
