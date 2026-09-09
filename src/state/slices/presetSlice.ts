import type { StateCreator } from 'zustand';
import type { SessionPreset, SessionStep } from '../../types/core';
import { generateId } from '../../utils/id';
import type { RootStoreState } from '../store';

export interface PresetSlice {
  sessionPresets: SessionPreset[];
  savePreset: (name: string) => void;
  deletePreset: (id: string) => void;
  renamePreset: (id: string, newName: string) => void;
  loadPreset: (id: string) => void;
}

export const createPresetSlice: StateCreator<
  RootStoreState,
  [],
  [],
  PresetSlice
> = (set) => ({
  sessionPresets: [],
  savePreset: (name) =>
    set((state) => {
      const trimmed = name.trim();
      if (!trimmed || state.sessionSteps.length === 0) return state;
      const newPreset: SessionPreset = {
        id: generateId(),
        name: trimmed,
        createdAt: new Date().toISOString(),
        version: 1,
        steps: state.sessionSteps.map((s) => {
          const w = state.wheels.find((wx) => wx.id === s.wheelId);
          return {
            wheelId: s.wheelId,
            wheelName: w ? w.name : 'Unknown Wheel',
            base: s.base,
            angleOffset: s.angleOffset,
            machineId: s.machineId,
            usbId: s.usbId,
          };
        }),
      };
      return { sessionPresets: [...state.sessionPresets, newPreset] };
    }),
  deletePreset: (id) =>
    set((state) => ({
      sessionPresets: state.sessionPresets.filter((p) => p.id !== id),
    })),
  renamePreset: (id, newName) =>
    set((state) => ({
      sessionPresets: state.sessionPresets.map((p) =>
        p.id === id ? { ...p, name: newName.trim() } : p
      ),
    })),
  loadPreset: (id) =>
    set((state) => {
      const preset = state.sessionPresets.find((p) => p.id === id);
      if (!preset) return state;
      const steps: SessionStep[] = preset.steps.map((s) => ({
        id: generateId(),
        wheelId: s.wheelId,
        base: s.base,
        angleOffset: s.angleOffset,
        machineId: s.machineId,
        usbId: s.usbId,
      }));
      return { sessionSteps: steps };
    }),
});
