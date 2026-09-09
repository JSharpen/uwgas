import type { StateCreator } from 'zustand';
import type { CalibrationSnapshot } from '../../types/core';
import type { RootStoreState } from '../store';

export interface SettingsSlice {
  heightMode: 'hn' | 'hr';
  calibSnapshots: CalibrationSnapshot[];
  calibAppliedIds: { rear: string; front: string };
  setHeightMode: (heightMode: 'hn' | 'hr') => void;
  addCalibSnapshot: (snapshot: CalibrationSnapshot) => void;
  deleteCalibSnapshot: (id: string) => void;
  applyCalibSnapshot: (base: 'rear' | 'front', snapshotId: string) => void;
}

export const createSettingsSlice: StateCreator<
  RootStoreState,
  [],
  [],
  SettingsSlice
> = (set) => ({
  heightMode: 'hn',
  calibSnapshots: [],
  calibAppliedIds: { rear: '', front: '' },
  setHeightMode: (heightMode) => set({ heightMode }),
  addCalibSnapshot: (snapshot) =>
    set((state) => ({
      calibSnapshots: [...state.calibSnapshots, snapshot],
    })),
  deleteCalibSnapshot: (id) =>
    set((state) => ({
      calibSnapshots: state.calibSnapshots.filter((s) => s.id !== id),
      calibAppliedIds: {
        rear: state.calibAppliedIds.rear === id ? '' : state.calibAppliedIds.rear,
        front: state.calibAppliedIds.front === id ? '' : state.calibAppliedIds.front,
      },
    })),
  applyCalibSnapshot: (base, snapshotId) =>
    set((state) => ({
      calibAppliedIds: {
        ...state.calibAppliedIds,
        [base]: snapshotId,
      },
    })),
});
