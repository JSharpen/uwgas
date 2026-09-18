import type { StateCreator } from 'zustand';
import type { SessionPreset, SessionStep, PresetContext } from '../../types/core';
import { generateId } from '../../utils/id';
import type { RootStoreState } from '../store';

export interface PresetSlice {
  sessionPresets: SessionPreset[];
  savePreset: (name: string, options?: { saveTargetAngle?: boolean; saveMachine?: boolean; saveUsb?: boolean }) => void;
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
  savePreset: (name, options = {}) =>
    set((state) => {
      const { saveTargetAngle, saveMachine, saveUsb } = options;
      const trimmed = name.trim();
      if (!trimmed || state.sessionSteps.length === 0) return state;
      
      const includeHardware = !!(
        saveMachine || 
        saveUsb || 
        state.sessionSteps.some(s => s.machineId || s.usbId)
      );
      
      const newSteps = state.sessionSteps.map((s) => {
        const w = state.wheels.find((wx) => wx.id === s.wheelId);
        return {
          wheelId: s.wheelId,
          wheelName: w ? w.name : 'Unknown Wheel',
          base: s.base,
          angleOffset: s.angleOffset,
          machineId: s.machineId,
          usbId: s.usbId,
        };
      });

      const contextObj: PresetContext = {};
      let hasContext = false;
      if (saveTargetAngle) {
        contextObj.targetAngle = state.global.targetAngle;
        hasContext = true;
      }
      if (saveMachine && state.global.activeMachineId) {
        contextObj.machineId = state.global.activeMachineId;
        hasContext = true;
      }
      if (saveUsb && state.global.activeUsbId) {
        contextObj.usbId = state.global.activeUsbId;
        hasContext = true;
      }

      const existingIndex = state.sessionPresets.findIndex(
        p => p.name.toLowerCase() === trimmed.toLowerCase()
      );

      if (existingIndex !== -1) {
        const updatedPresets = [...state.sessionPresets];
        updatedPresets[existingIndex] = {
          ...updatedPresets[existingIndex],
          name: trimmed,
          version: 2,
          includeHardware,
          steps: newSteps,
          context: hasContext ? contextObj : undefined,
        };
        return { sessionPresets: updatedPresets };
      }

      const newPreset: SessionPreset = {
        id: generateId(),
        name: trimmed,
        createdAt: new Date().toISOString(),
        version: 2,
        includeHardware,
        steps: newSteps,
        context: hasContext ? contextObj : undefined,
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
      
      const hasComplexHardware = preset.steps.some((s) => s.machineId || s.usbId);
      
      const steps: SessionStep[] = preset.steps.map((s) => ({
        id: generateId(),
        wheelId: s.wheelId,
        base: s.base,
        angleOffset: s.angleOffset,
        machineId: s.machineId,
        usbId: s.usbId,
      }));
      
      let nextGlobal = state.global;
      
      // Apply hardware from context if available
      if (preset.context?.machineId || preset.context?.usbId) {
        nextGlobal = {
          ...nextGlobal,
          activeMachineId: preset.context.machineId ?? nextGlobal.activeMachineId,
          activeUsbId: preset.context.usbId ?? nextGlobal.activeUsbId,
        };
      }
      
      // Independently enable advanced step overrides if the preset relies on them
      if (hasComplexHardware && !state.global.showAdvancedStepOverrides) {
        nextGlobal = { ...nextGlobal, showAdvancedStepOverrides: true };
      }
      
      // Apply angle from context if available
      if (preset.context?.targetAngle !== undefined) {
        nextGlobal = {
          ...nextGlobal,
          targetAngle: preset.context.targetAngle,
        };
      }
      
      return { 
        sessionSteps: steps,
        global: nextGlobal
      };
    }),
});
