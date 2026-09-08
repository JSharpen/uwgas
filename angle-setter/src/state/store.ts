import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { AppPersistedStateSchema } from './schema';
import { migrateLegacyStorageIfNeeded } from './migration';

// Slice creators
import { createCalculatorSlice, type CalculatorSlice } from './slices/calculatorSlice';
import { createProgressionSlice, type ProgressionSlice } from './slices/progressionSlice';
import { createMachineSlice, type MachineSlice } from './slices/machineSlice';
import { createHardwareSlice, type HardwareSlice } from './slices/hardwareSlice';
import { createWheelSlice, type WheelSlice } from './slices/wheelSlice';
import { createPresetSlice, type PresetSlice } from './slices/presetSlice';
import { createSettingsSlice, type SettingsSlice } from './slices/settingsSlice';

export type RootStoreState = CalculatorSlice &
  ProgressionSlice &
  MachineSlice &
  HardwareSlice &
  WheelSlice &
  PresetSlice &
  SettingsSlice & {
    importState: (
      rawJson: string,
      sections: Record<string, boolean>,
      modes: Record<string, 'merge' | 'overwrite'>
    ) => { summary?: string; error?: string };
  };

export type AppState = RootStoreState;

// Debounced Storage Wrapper with Unload Flush & Cross-Tab Sync
let pendingWritePayload: { key: string; value: string } | null = null;
let debounceTimerId: ReturnType<typeof setTimeout> | null = null;

export const flushPendingWrite = (): void => {
  if (debounceTimerId) {
    clearTimeout(debounceTimerId);
    debounceTimerId = null;
  }
  if (pendingWritePayload && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(pendingWritePayload.key, pendingWritePayload.value);
    } catch (e) {
      console.error('Failed to flush storage on unload', e);
    }
    pendingWritePayload = null;
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushPendingWrite);
}

export const createDebouncedStorage = () => ({
  getItem: (name: string): string | null => {
    if (name === 'uwgas_app_state_v1') {
      migrateLegacyStorageIfNeeded();
    }
    return typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null;
  },
  setItem: (name: string, value: string): void => {
    pendingWritePayload = { key: name, value };
    if (debounceTimerId) clearTimeout(debounceTimerId);
    debounceTimerId = setTimeout(() => {
      flushPendingWrite();
    }, 300);
  },
  removeItem: (name: string): void => {
    if (debounceTimerId) clearTimeout(debounceTimerId);
    debounceTimerId = null;
    pendingWritePayload = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(name);
    }
  },
});

export const useStore = create<RootStoreState>()(
  persist(
    (set, ...a) => ({
      ...createCalculatorSlice(set, ...a),
      ...createProgressionSlice(set, ...a),
      ...createMachineSlice(set, ...a),
      ...createHardwareSlice(set, ...a),
      ...createWheelSlice(set, ...a),
      ...createPresetSlice(set, ...a),
      ...createSettingsSlice(set, ...a),

      importState: (rawJson, sections, modes) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(rawJson);
        } catch {
          return { error: 'Import failed: invalid JSON.' };
        }
        if (typeof parsed !== 'object' || parsed === null) {
          return { error: 'Import failed: not an object.' };
        }

        const parsedObj = parsed as Record<string, unknown>;
        const mergeById = <T extends { id: string }>(current: T[], incoming: T[]): T[] => {
          const map = new Map<string, T>();
          current.forEach((item) => {
            if (item && item.id) map.set(item.id, item);
          });
          incoming.forEach((item) => {
            if (item && item.id) map.set(item.id, item);
          });
          return Array.from(map.values());
        };

        const appliedSummary: string[] = [];

        set((state) => {
          const nextState = { ...state };

          if (
            sections.global &&
            typeof parsedObj.global === 'object' &&
            parsedObj.global !== null
          ) {
            nextState.global = {
              ...state.global,
              ...(parsedObj.global as Record<string, unknown>),
            };
            appliedSummary.push(`global: ${modes.global}`);
          }

          if (sections.constants) {
            if (Array.isArray(parsedObj.machines)) {
              nextState.machines =
                modes.constants === 'overwrite'
                  ? (parsedObj.machines as RootStoreState['machines'])
                  : mergeById(state.machines, parsedObj.machines as RootStoreState['machines']);
              if (typeof parsedObj.defaultMachineId === 'string') {
                nextState.defaultMachineId = parsedObj.defaultMachineId;
              }
              appliedSummary.push(`machines: ${modes.constants}`);
            }
            if (Array.isArray(parsedObj.jigs)) {
              nextState.jigs =
                modes.constants === 'overwrite'
                  ? (parsedObj.jigs as RootStoreState['jigs'])
                  : mergeById(state.jigs, parsedObj.jigs as RootStoreState['jigs']);
              appliedSummary.push(`jigs: ${modes.constants}`);
            }
            if (Array.isArray(parsedObj.usbs)) {
              nextState.usbs =
                modes.constants === 'overwrite'
                  ? (parsedObj.usbs as RootStoreState['usbs'])
                  : mergeById(state.usbs, parsedObj.usbs as RootStoreState['usbs']);
              appliedSummary.push(`usbs: ${modes.constants}`);
            }
          }

          if (sections.wheels && Array.isArray(parsedObj.wheels)) {
            nextState.wheels =
              modes.wheels === 'overwrite'
                ? (parsedObj.wheels as RootStoreState['wheels'])
                : mergeById(state.wheels, parsedObj.wheels as RootStoreState['wheels']);
            appliedSummary.push(`wheels: ${modes.wheels}`);
          }

          if (sections.sessionSteps && Array.isArray(parsedObj.sessionSteps)) {
            nextState.sessionSteps =
              modes.sessionSteps === 'overwrite'
                ? (parsedObj.sessionSteps as RootStoreState['sessionSteps'])
                : mergeById(
                    state.sessionSteps,
                    parsedObj.sessionSteps as RootStoreState['sessionSteps']
                  );
            appliedSummary.push(`steps: ${modes.sessionSteps}`);
          }

          if (sections.sessionPresets && Array.isArray(parsedObj.sessionPresets)) {
            nextState.sessionPresets =
              modes.sessionPresets === 'overwrite'
                ? (parsedObj.sessionPresets as RootStoreState['sessionPresets'])
                : mergeById(
                    state.sessionPresets,
                    parsedObj.sessionPresets as RootStoreState['sessionPresets']
                  );
            appliedSummary.push(`presets: ${modes.sessionPresets}`);
          }

          if (
            sections.heightMode &&
            (parsedObj.heightMode === 'hn' || parsedObj.heightMode === 'hr')
          ) {
            nextState.heightMode = parsedObj.heightMode;
            appliedSummary.push('heightMode: updated');
          }

          return nextState;
        });

        const summary =
          appliedSummary.length > 0
            ? `Import applied (${appliedSummary.join('; ')})`
            : 'Import did not apply any sections.';
        return { summary };
      },
    }),
    {
      name: 'uwgas_app_state_v1',
      storage: createJSONStorage(() => createDebouncedStorage()),
      version: 1,
      merge: (persistedState: unknown, currentState: RootStoreState) => {
        if (persistedState === null || persistedState === undefined) {
          return currentState;
        }
        const parsed = AppPersistedStateSchema.safeParse(persistedState);
        if (parsed.success) {
          return { ...currentState, ...parsed.data } as RootStoreState;
        }
        console.error('Storage validation failed, falling back to defaults', parsed.error);
        return currentState;
      },
    }
  )
);

// Multi-Tab Synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'uwgas_app_state_v1') {
      void useStore.persist.rehydrate();
    }
  });
}

// Atomic Selector Hooks to Prevent Re-Render Storms
export const useCalculatorSettings = () =>
  useStore(
    useShallow((s) => ({
      global: s.global,
      setGlobal: s.setGlobal,
      setTargetAngle: s.setTargetAngle,
      setProjection: s.setProjection,
      setCalcMode: s.setCalcMode,
      setActiveUsbId: s.setActiveUsbId,
      setActiveJigId: s.setActiveJigId,
      setFixedUsbHeight: s.setFixedUsbHeight,
      setFixedUsbRear: s.setFixedUsbRear,
      setFixedUsbFront: s.setFixedUsbFront,
      setFixedUsbMode: s.setFixedUsbMode,
      setUseCustomFrontUsb: s.setUseCustomFrontUsb,
      setProtrusionMode: s.setProtrusionMode,
      setProtrusion: s.setProtrusion,
      setShowAdvancedStepOverrides: s.setShowAdvancedStepOverrides,
      resetGlobal: s.resetGlobal,
    }))
  );

export const useProgressionState = () =>
  useStore(
    useShallow((s) => ({
      sessionSteps: s.sessionSteps,
      addStep: s.addStep,
      deleteStep: s.deleteStep,
      updateStep: s.updateStep,
      moveStep: s.moveStep,
      setSessionSteps: s.setSessionSteps,
      clearSessionSteps: s.clearSessionSteps,
      loadDefaultProgression: s.loadDefaultProgression,
    }))
  );

export const useHardwareState = () =>
  useStore(
    useShallow((s) => ({
      jigs: s.jigs,
      usbs: s.usbs,
      addJig: s.addJig,
      updateJig: s.updateJig,
      deleteJig: s.deleteJig,
      addUsb: s.addUsb,
      updateUsb: s.updateUsb,
      deleteUsb: s.deleteUsb,
    }))
  );

export const useMachineState = () =>
  useStore(
    useShallow((s) => ({
      machines: s.machines,
      defaultMachineId: s.defaultMachineId,
      addMachine: s.addMachine,
      updateMachine: s.updateMachine,
      deleteMachine: s.deleteMachine,
      setDefaultMachineId: s.setDefaultMachineId,
      addCalibrationProfile: s.addCalibrationProfile,
      deleteCalibrationProfile: s.deleteCalibrationProfile,
      setActiveCalibrationProfile: s.setActiveCalibrationProfile,
    }))
  );

export const useWheelState = () =>
  useStore(
    useShallow((s) => ({
      wheels: s.wheels,
      addWheel: s.addWheel,
      updateWheel: s.updateWheel,
      deleteWheel: s.deleteWheel,
      setWheels: s.setWheels,
    }))
  );

export const usePresetState = () =>
  useStore(
    useShallow((s) => ({
      sessionPresets: s.sessionPresets,
      savePreset: s.savePreset,
      deletePreset: s.deletePreset,
      renamePreset: s.renamePreset,
      loadPreset: s.loadPreset,
    }))
  );

export const useSettingsState = () =>
  useStore(
    useShallow((s) => ({
      heightMode: s.heightMode,
      calibSnapshots: s.calibSnapshots,
      calibAppliedIds: s.calibAppliedIds,
      setHeightMode: s.setHeightMode,
      addCalibSnapshot: s.addCalibSnapshot,
      deleteCalibSnapshot: s.deleteCalibSnapshot,
      applyCalibSnapshot: s.applyCalibSnapshot,
    }))
  );
