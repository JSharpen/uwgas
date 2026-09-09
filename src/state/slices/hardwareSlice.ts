import type { StateCreator } from 'zustand';
import type { JigConfig, UsbConfig } from '../../types/core';
import { DEFAULT_JIGS, DEFAULT_USBS } from '../defaults';
import type { RootStoreState } from '../store';

export interface HardwareSlice {
  jigs: JigConfig[];
  usbs: UsbConfig[];
  addJig: (jig: JigConfig) => void;
  updateJig: (id: string, patch: Partial<JigConfig>) => void;
  deleteJig: (id: string) => void;
  addUsb: (usb: UsbConfig) => void;
  updateUsb: (id: string, patch: Partial<UsbConfig>) => void;
  deleteUsb: (id: string) => void;
}

export const createHardwareSlice: StateCreator<
  RootStoreState,
  [],
  [],
  HardwareSlice
> = (set) => ({
  jigs: DEFAULT_JIGS,
  usbs: DEFAULT_USBS,
  addJig: (jig) => set((state) => ({ jigs: [...state.jigs, jig] })),
  updateJig: (id, patch) =>
    set((state) => ({
      jigs: state.jigs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    })),
  deleteJig: (id) =>
    set((state) => ({
      jigs: state.jigs.filter((j) => j.id !== id),
    })),
  addUsb: (usb) => set((state) => ({ usbs: [...state.usbs, usb] })),
  updateUsb: (id, patch) =>
    set((state) => ({
      usbs: state.usbs.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    })),
  deleteUsb: (id) =>
    set((state) => ({
      usbs: state.usbs.filter((u) => u.id !== id),
    })),
});
