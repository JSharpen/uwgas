import type { StateCreator } from 'zustand';
import type { GlobalState, CalcMode } from '../../types/core';
import { DEFAULT_GLOBAL } from '../defaults';
import type { RootStoreState } from '../store';

export interface CalculatorSlice {
  global: GlobalState;
  setGlobal: (patch: Partial<GlobalState> | ((prev: GlobalState) => GlobalState)) => void;
  setTargetAngle: (targetAngle: number) => void;
  setProjection: (projection: number) => void;
  setCalcMode: (calcMode: CalcMode) => void;
  setActiveUsbId: (activeUsbId: string) => void;
  setActiveJigId: (activeJigId: string) => void;
  setFixedUsbHeight: (fixedUsbHeight: number) => void;
  setFixedUsbRear: (fixedUsbRear: number) => void;
  setFixedUsbFront: (fixedUsbFront: number) => void;
  setFixedUsbMode: (fixedUsbMode: 'hn' | 'hr') => void;
  setUseCustomFrontUsb: (useCustomFrontUsb: boolean) => void;
  setProtrusionMode: (useProtrusionMode: boolean) => void;
  setProtrusion: (protrusion: number) => void;
  setShowAdvancedStepOverrides: (show: boolean) => void;
  resetGlobal: () => void;
}

export const createCalculatorSlice: StateCreator<
  RootStoreState,
  [],
  [],
  CalculatorSlice
> = (set) => ({
  global: DEFAULT_GLOBAL,
  setGlobal: (patch) =>
    set((state) => {
      const nextGlobal = typeof patch === 'function' ? patch(state.global) : { ...state.global, ...patch };
      
      // If we are in projection mode, enforce that the active jig is adjustable
      if (nextGlobal.calcMode === 'projection') {
        const activeJig = state.jigs.find(j => j.id === nextGlobal.activeJigId);
        if (activeJig && !activeJig.isAdjustableLength) {
          // Find the first adjustable jig
          const fallbackJig = state.jigs.find(j => j.isAdjustableLength);
          if (fallbackJig) {
            nextGlobal.activeJigId = fallbackJig.id;
          }
        }
      }
      
      return { global: nextGlobal };
    }),
  setTargetAngle: (targetAngle) =>
    set((state) => ({ global: { ...state.global, targetAngle } })),
  setProjection: (projection) =>
    set((state) => ({ global: { ...state.global, projection } })),
  setCalcMode: (calcMode) =>
    set((state) => {
      const nextGlobal = { ...state.global, calcMode };
      if (calcMode === 'projection') {
        const activeJig = state.jigs.find(j => j.id === nextGlobal.activeJigId);
        if (activeJig && !activeJig.isAdjustableLength) {
          const fallbackJig = state.jigs.find(j => j.isAdjustableLength);
          if (fallbackJig) {
            nextGlobal.activeJigId = fallbackJig.id;
          }
        }
      }
      return { global: nextGlobal };
    }),
  setActiveUsbId: (activeUsbId) =>
    set((state) => ({ global: { ...state.global, activeUsbId } })),
  setActiveJigId: (activeJigId) =>
    set((state) => {
      if (state.global.calcMode === 'projection') {
        const selectedJig = state.jigs.find(j => j.id === activeJigId);
        if (selectedJig && !selectedJig.isAdjustableLength) {
          // Reject the change if the jig is not adjustable and we are in projection mode
          return state;
        }
      }
      return { global: { ...state.global, activeJigId } };
    }),
  setFixedUsbHeight: (fixedUsbHeight) =>
    set((state) => ({ global: { ...state.global, fixedUsbHeight } })),
  setFixedUsbRear: (fixedUsbRear) =>
    set((state) => ({ global: { ...state.global, fixedUsbRear } })),
  setFixedUsbFront: (fixedUsbFront) =>
    set((state) => ({ global: { ...state.global, fixedUsbFront } })),
  setFixedUsbMode: (fixedUsbMode) =>
    set((state) => ({ global: { ...state.global, fixedUsbMode } })),
  setUseCustomFrontUsb: (useCustomFrontUsb) =>
    set((state) => ({ global: { ...state.global, useCustomFrontUsb } })),
  setProtrusionMode: (useProtrusionMode) =>
    set((state) => ({ global: { ...state.global, useProtrusionMode } })),
  setProtrusion: (protrusion) =>
    set((state) => ({ global: { ...state.global, protrusion } })),
  setShowAdvancedStepOverrides: (showAdvancedStepOverrides) =>
    set((state) => ({ global: { ...state.global, showAdvancedStepOverrides } })),
  resetGlobal: () => set({ global: DEFAULT_GLOBAL }),
});
