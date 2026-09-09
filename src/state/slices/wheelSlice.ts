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
      wheels: [...state.wheels, normalizeWheel({ ...wheel, id: generateId() })],
    })),
  updateWheel: (id, patch) =>
    set((state) => ({
      wheels: state.wheels.map((w) => (w.id === id ? normalizeWheel({ ...w, ...patch }) : w)),
    })),
  deleteWheel: (id) =>
    set((state) => ({
      wheels: state.wheels.filter((w) => w.id !== id),
    })),
  setWheels: (wheels) => set({ wheels: wheels.map(normalizeWheel) }),
});
