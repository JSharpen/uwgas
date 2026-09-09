import * as React from 'react';
import { useStore } from '../../state/store';
import { useUIStore } from '../../state/uiStore';

export default function DevStateView() {
  const handleDumpState = () => {
    const appState = useStore.getState();
    const uiState = useUIStore.getState();
    console.group('🛠️ UWGAS Dev State Dump');
    console.log('App Store (Persisted):', appState);
    console.log('UI Store (Ephemeral):', uiState);
    console.groupEnd();
    alert('State dumped to browser console! Open DevTools (F12) to inspect.');
  };

  const handleInjectDummyData = () => {
    const { addStep, wheels } = useStore.getState();
    const coarseWheel = wheels.find((w) => w.id === 'w-sg250') || wheels[0];
    const fineWheel = wheels.find((w) => w.id === 'w-sj250') || wheels[0];
    const leatherWheel = wheels.find((w) => w.id === 'w-la220') || wheels[1] || wheels[0];

    if (!coarseWheel || !fineWheel || !leatherWheel) {
      alert('Could not find required default wheels in state to inject dummy data.');
      return;
    }

    addStep(coarseWheel.id);
    addStep(fineWheel.id);
    addStep(leatherWheel.id);
    alert('Injected 3 dummy progression steps!');
  };

  const handleNukeState = () => {
    if (confirm('Are you sure you want to NUKE all local state and reload? This is irreversible!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-20 w-full animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="flex flex-col items-center py-4 mb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">State & Storage Tools</h1>
        <p className="text-sm text-white/50 mt-1">Data Injection & Reset Lab</p>
      </div>

      <div className="neu-convex border border-black/40 rounded-3xl p-4 sm:p-5 flex flex-col gap-6">
        <h2 className="text-lg font-bold text-white mb-2">State Actions</h2>
        
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={handleDumpState}
            className="flex items-center justify-center p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 active:bg-sky-500/30 text-sky-400 font-semibold border border-sky-500/20 transition-colors"
          >
            Dump State to Console
          </button>
          <p className="text-xs text-white/40 -mt-2">Logs the entire Zustand state tree into the browser dev tools for debugging.</p>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
          <button
            type="button"
            onClick={handleInjectDummyData}
            className="flex items-center justify-center p-3 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 active:bg-amber-400/30 text-amber-400 font-semibold border border-amber-400/20 transition-colors"
          >
            Inject Dummy Progression
          </button>
          <p className="text-xs text-white/40 -mt-2">Fills your active progression list with a coarse, fine, and honing wheel step.</p>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
          <button
            type="button"
            onClick={handleNukeState}
            className="flex items-center justify-center p-3 rounded-xl bg-danger/10 hover:bg-danger/20 active:bg-danger/30 text-danger font-semibold border border-danger/20 transition-colors"
          >
            Nuke All State (Factory Reset)
          </button>
          <p className="text-xs text-white/40 -mt-2">Clears localStorage entirely and hard-reloads the application. You will lose everything.</p>
        </div>
      </div>
    </div>
  );
}
