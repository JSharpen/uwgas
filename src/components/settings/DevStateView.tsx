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
    const state = useStore.getState();
    const wheels = state.wheels;
    const coarseWheel = wheels.find((w) => w.id === 'w-sg250') || wheels[0];
    const fineWheel = wheels.find((w) => w.id === 'w-sj250') || wheels[0];
    const leatherWheel = wheels.find((w) => w.id === 'w-la220') || wheels[1] || wheels[0];

    if (!coarseWheel || !fineWheel || !leatherWheel) {
      alert('Could not find required default wheels in state to inject dummy data.');
      return;
    }

    import('../../utils/id').then(({ generateId }) => {
      const dummyPreset1: import('../../types/core').SessionPreset = {
        id: generateId(),
        name: 'Standard Kitchen Knife',
        createdAt: new Date().toISOString(),
        version: 2 as const,
        steps: [
          { wheelId: coarseWheel.id, wheelName: coarseWheel.name, base: 'rear', angleOffset: 0 },
          { wheelId: fineWheel.id, wheelName: fineWheel.name, base: 'rear', angleOffset: 0 },
          { wheelId: leatherWheel.id, wheelName: leatherWheel.name, base: 'front', angleOffset: 0.2 },
        ],
        includeHardware: true,
        context: {
          targetAngle: 15,
          machineId: state.machines[0]?.id || 'default-machine',
          usbId: state.usbs.find(u => u.name.includes('Frontal'))?.id || 'usb-fvb'
        }
      };

      const dummyPreset2: import('../../types/core').SessionPreset = {
        id: generateId(),
        name: 'Quick Touch Up',
        createdAt: new Date().toISOString(),
        version: 2 as const,
        steps: [
          { wheelId: fineWheel.id, wheelName: fineWheel.name, base: 'rear', angleOffset: 0 },
        ],
        includeHardware: false,
        context: {
          targetAngle: 20
        }
      };

      useStore.setState(s => ({
        sessionPresets: [...s.sessionPresets, dummyPreset1, dummyPreset2]
      }));

      // Also set it as the active progression just in case
      state.clearSessionSteps();
      state.addStep(coarseWheel.id);
      state.addStep(fineWheel.id);
      state.addStep(leatherWheel.id);
      
      alert('Injected 3 dummy progression steps and 2 dummy presets with full metadata!');
    });
  };

  
  const handleInjectDummyMappingData = () => {
    const state = useStore.getState();
    if (state.machines.length === 0) {
      alert('No machines found. Please add a machine first.');
      return;
    }
    
    import('../../utils/id').then(({ generateId }) => {
      const p1 = {
        id: generateId(),
        name: 'Factory Default',
        createdAt: new Date().toISOString(),
        scope: 'both' as const, Da: 12, Ds: 12,
        rear: { hc: 50, o: 20, diagnostics: { maxAbsResidualMm: 1.2, residuals: [0.1, -0.2] }, angleErrorDeg: null, measurements: [] },
        front: { hc: -10, o: 30, diagnostics: { maxAbsResidualMm: 0.9, residuals: [0.05, -0.05] }, angleErrorDeg: null, measurements: [] }
      };

      const p2 = {
        id: generateId(),
        name: 'Precision Laser Aligned',
        createdAt: new Date().toISOString(),
        scope: 'both' as const, Da: 12, Ds: 11.98,
        rear: { hc: 49.5, o: 19.8, diagnostics: { maxAbsResidualMm: 0.1, residuals: [0.01, -0.02] }, angleErrorDeg: 0.05, measurements: [] },
        front: { hc: -9.5, o: 30.2, diagnostics: { maxAbsResidualMm: 0.05, residuals: [0.01, -0.01] }, angleErrorDeg: 0.02, measurements: [] }
      };

      useStore.setState(s => {
        const newMachines = [...s.machines];
        const m = { ...newMachines[0] };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        m.calibrationProfiles = [p1 as any, p2 as any];
        m.activeCalibrationId = p2.id;
        m.constants = {
          rear: { hc: p2.rear.hc, o: p2.rear.o },
          front: { hc: p2.front.hc, o: p2.front.o }
        };
        newMachines[0] = m;
        return { machines: newMachines };
      });
      alert('Injected 2 dummy geometry mappings into the first machine!');
    });
  };

  const handleDebugZod = () => {
    const raw = localStorage.getItem('uwgas_app_state_v1');
    if (!raw) {
      alert('No save data found in local storage!');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      import('../../state/schema').then(({ AppPersistedStateSchema }) => {
        const result = AppPersistedStateSchema.safeParse(parsed.state);
        if (!result.success) {
          alert('ZOD ERRORS FOUND:\n\n' + result.error.message);
          console.error("Zod Errors:", result.error);
        } else {
          alert('Zod validation SUCCESSFUL on your raw save data!');
        }
      });
    } catch {
      alert('Failed to parse JSON from local storage.');
    }
  };

  const handleSpoofReminder = () => {
    const state = useStore.getState();
    if (state.wheels.length === 0) {
      alert('No wheels found. Please add a wheel first.');
      return;
    }
    
    useStore.setState(s => {
      const newWheels = [...s.wheels];
      const wheelToSpoof = { ...newWheels[0] };
      wheelToSpoof.isWearable = true;
      wheelToSpoof.remeasureInterval = 1;
      wheelToSpoof.remeasureIntervalUnit = 'days';
      // Set the measurement time to 2 days ago to force an overdue state
      wheelToSpoof.measuredAt = Date.now() - (2 * 24 * 60 * 60 * 1000);
      newWheels[0] = wheelToSpoof;
      return { wheels: newWheels };
    });
    alert(`Spoofed reminder for wheel: ${state.wheels[0].name}. It should now appear as overdue!`);
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
            Inject Dummy Data
          </button>
          <p className="text-xs text-white/40 -mt-2">Injects dummy presets with full metadata, and populates your active progression.</p>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
          <button
            type="button"
            onClick={handleInjectDummyMappingData}
            className="flex items-center justify-center p-3 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 active:bg-amber-400/30 text-amber-400 font-semibold border border-amber-400/20 transition-colors"
          >
            Inject Machine Mappings
          </button>
          <p className="text-xs text-white/40 -mt-2">Injects 2 dummy geometry mappings into the first machine.</p>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
          <button
            type="button"
            onClick={handleDebugZod}
            className="flex items-center justify-center p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 active:bg-purple-500/30 text-purple-400 font-semibold border border-purple-500/20 transition-colors"
          >
            Debug Zod Error
          </button>
          <p className="text-xs text-white/40 -mt-2">Checks your raw corrupted save data to tell us exactly which field is causing the crash.</p>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
          <button
            type="button"
            onClick={handleSpoofReminder}
            className="flex items-center justify-center p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 text-emerald-400 font-semibold border border-emerald-500/20 transition-colors"
          >
            Spoof Overdue Wheel Reminder
          </button>
          <p className="text-xs text-white/40 -mt-2">Forces the first wheel in your library to become artificially overdue for measurement.</p>
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
