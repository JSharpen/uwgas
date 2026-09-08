import type { StateCreator } from 'zustand';
import type { MachineConfig, CalibrationProfile } from '../../types/core';
import { DEFAULT_CONSTANTS } from '../defaults';
import type { RootStoreState } from '../store';

export interface MachineSlice {
  machines: MachineConfig[];
  defaultMachineId?: string;
  addMachine: (machine: MachineConfig) => void;
  updateMachine: (id: string, patch: Partial<MachineConfig>) => void;
  deleteMachine: (id: string) => void;
  setDefaultMachineId: (id: string) => void;
  addCalibrationProfile: (machineId: string, profile: CalibrationProfile) => void;
  deleteCalibrationProfile: (machineId: string, profileId: string) => void;
  setActiveCalibrationProfile: (machineId: string, profileId?: string) => void;
}

export const createMachineSlice: StateCreator<
  RootStoreState,
  [],
  [],
  MachineSlice
> = (set) => ({
  machines: [
    {
      id: 'default-machine',
      name: 'Primary Grinder',
      constants: DEFAULT_CONSTANTS,
      isDefault: true,
    },
  ],
  defaultMachineId: 'default-machine',
  addMachine: (machine) =>
    set((state) => ({ machines: [...state.machines, machine] })),
  updateMachine: (id, patch) =>
    set((state) => ({
      machines: state.machines.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  deleteMachine: (id) =>
    set((state) => {
      const filtered = state.machines.filter((m) => m.id !== id);
      const nextDefault =
        state.defaultMachineId === id
          ? (filtered[0]?.id ?? undefined)
          : state.defaultMachineId;
      return { machines: filtered, defaultMachineId: nextDefault };
    }),
  setDefaultMachineId: (defaultMachineId) => set({ defaultMachineId }),
  addCalibrationProfile: (machineId, profile) =>
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId
          ? {
              ...m,
              calibrationProfiles: [...(m.calibrationProfiles || []), profile],
              activeCalibrationId: profile.id,
            }
          : m
      ),
    })),
  deleteCalibrationProfile: (machineId, profileId) =>
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId
          ? {
              ...m,
              calibrationProfiles: (m.calibrationProfiles || []).filter((p) => p.id !== profileId),
              activeCalibrationId:
                m.activeCalibrationId === profileId ? undefined : m.activeCalibrationId,
            }
          : m
      ),
    })),
  setActiveCalibrationProfile: (machineId, profileId) =>
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId ? { ...m, activeCalibrationId: profileId } : m
      ),
    })),
});
