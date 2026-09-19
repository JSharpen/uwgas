import type { StateCreator } from 'zustand';
import type { SessionStep } from '../../types/core';
import { generateId } from '../../utils/id';
import type { RootStoreState } from '../store';

export interface ProgressionSlice {
  sessionSteps: SessionStep[];
  addStep: (wheelId?: string) => string;
  deleteStep: (id: string) => void;
  updateStep: (id: string, patch: Partial<SessionStep>) => void;
  moveStep: (index: number, direction: -1 | 1) => void;
  setSessionSteps: (steps: SessionStep[]) => void;
  clearSessionSteps: () => void;
  loadDefaultProgression: () => void;
}

export const createProgressionSlice: StateCreator<
  RootStoreState,
  [],
  [],
  ProgressionSlice
> = (set) => ({
  sessionSteps: [],
  addStep: (wheelId) => {
    const id = generateId();
    set((state) => {
      const targetWheel = wheelId
        ? state.wheels.find((w) => w.id === wheelId)
        : state.wheels[0];
      const targetWheelId = targetWheel?.id ?? (wheelId || '');
      const newStep: SessionStep = {
        id,
        wheelId: targetWheelId,
        base: targetWheel?.baseForHn || 'rear',
        angleOffset: 0,
      };
      return { sessionSteps: [...state.sessionSteps, newStep] };
    });
    return id;
  },
  deleteStep: (id) =>
    set((state) => ({
      sessionSteps: state.sessionSteps.filter((s) => s.id !== id),
    })),
  updateStep: (id, patch) =>
    set((state) => ({
      sessionSteps: state.sessionSteps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })),
  moveStep: (index, direction) =>
    set((state) => {
      const next = [...state.sessionSteps];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return state;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return { sessionSteps: next };
    }),
  setSessionSteps: (sessionSteps) => set({ sessionSteps }),
  clearSessionSteps: () => set({ sessionSteps: [] }),
  loadDefaultProgression: () =>
    set((state) => {
      const grindWheel = state.wheels.find((w) => !w.isHoning) || state.wheels[0];
      const honeWheel = state.wheels.find((w) => w.isHoning);
      const steps: SessionStep[] = [];
      if (grindWheel) {
        steps.push({
          id: generateId(),
          wheelId: grindWheel.id,
          base: grindWheel.baseForHn || 'rear',
          angleOffset: 0,
        });
      }
      if (honeWheel) {
        steps.push({
          id: generateId(),
          wheelId: honeWheel.id,
          base: honeWheel.baseForHn || 'front',
          angleOffset: 0.2,
        });
      }
      return { sessionSteps: steps };
    }),
});
