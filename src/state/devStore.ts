import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DebugLayoutMode = 'none' | 'semantic' | 'universal' | 'touch' | 'wireframe';

export interface DevState {
  uiScale: number;
  stepCardHeight: number;
  cardStackGap: number;
  pillBottom: number;
  topBarThickness: number;
  uiRadius: number;
  debugLayoutMode: DebugLayoutMode;
  setUiScale: (scale: number) => void;
  setStepCardHeight: (height: number) => void;
  setCardStackGap: (gap: number) => void;
  setPillBottom: (bottom: number) => void;
  setTopBarThickness: (thickness: number) => void;
  setUiRadius: (radius: number) => void;
  setDebugLayoutMode: (mode: DebugLayoutMode) => void;
  resetToDefaults: () => void;
}

export const useDevStore = create<DevState>()(
  persist(
    (set) => ({
      uiScale: 1.0,
      stepCardHeight: 88, // 5.5rem in px roughly
      cardStackGap: 12, // 0.75rem in px roughly
      pillBottom: 72,
      topBarThickness: 60,
      uiRadius: 24, // 1.5rem default for 3xl
      debugLayoutMode: 'none',

      setUiScale: (uiScale) => set({ uiScale }),
      setStepCardHeight: (stepCardHeight) => set({ stepCardHeight }),
      setCardStackGap: (cardStackGap) => set({ cardStackGap }),
      setPillBottom: (pillBottom) => set({ pillBottom }),
      setTopBarThickness: (topBarThickness) => set({ topBarThickness }),
      setUiRadius: (uiRadius) => set({ uiRadius }),
      setDebugLayoutMode: (debugLayoutMode) => set({ debugLayoutMode }),
      resetToDefaults: () => set({ 
        uiScale: 1.0, 
        stepCardHeight: 88, 
        cardStackGap: 12, 
        pillBottom: 72,
        topBarThickness: 60,
        uiRadius: 24,
        debugLayoutMode: 'none' 
      }),
    }),
    {
      name: 'uwgas-dev-settings',
    }
  )
);

