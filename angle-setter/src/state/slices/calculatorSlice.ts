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
    set((state) => ({
      global: typeof patch === 'function' ? patch(state.global) : { ...state.global, ...patch },
    })),
  setTargetAngle: (targetAngle) =>
    set((state) => ({ global: { ...state.global, targetAngle } })),
  setProjection: (projection) =>
    set((state) => ({ global: { ...state.global, projection } })),
  setCalcMode: (calcMode) =>
    set((state) => ({ global: { ...state.global, calcMode } })),
  setActiveUsbId: (activeUsbId) =>
    set((state) => ({ global: { ...state.global, activeUsbId } })),
  setActiveJigId: (activeJigId) =>
    set((state) => ({ global: { ...state.global, activeJigId } })),
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
