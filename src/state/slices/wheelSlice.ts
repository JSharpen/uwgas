import type { StateCreator } from 'zustand';
import type { Wheel } from '../../types/core';
import { generateId } from '../../utils/id';
import { DEFAULT_WHEELS } from '../defaults';
import { normalizeWheel } from '../../utils/normalizers';
import type { RootStoreState } from '../store';

export interface WheelSlice {
  wheels: Wheel[];
  addWheel: (wheel: Omit<Wheel, 'id'>) => void;
  updateWheel: (id: string, patch: Partial<Wheel>) => void;
  deleteWheel: (id: string) => void;
  setWheels: (wheels: Wheel[]) => void;
}

export const createWheelSlice: StateCreator<
  RootStoreState,
  [],
  [],
  WheelSlice
> = (set) => ({
  wheels: DEFAULT_WHEELS,
  addWheel: (wheel) =>
    set((state) => ({
      wheels: [...state.wheels, normalizeWheel({ ...wheel, id: generateId(), measuredAt: Date.now() })],
    })),
  updateWheel: (id, patch) =>
    set((state) => {
      // If diameter is modified, automatically update the measurement timestamp
      const updatedPatch = { ...patch };
      if ('D' in updatedPatch || 'DText' in updatedPatch) {
        updatedPatch.measuredAt = Date.now();
      }
      return {
        wheels: state.wheels.map((w) => (w.id === id ? normalizeWheel({ ...w, ...updatedPatch }) : w)),
      };
    }),
  deleteWheel: (id) =>
    set((state) => ({
      wheels: state.wheels.filter((w) => w.id !== id),
    })),
  setWheels: (wheels) => set({ wheels: wheels.map(normalizeWheel) }),
});
