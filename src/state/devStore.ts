import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DebugLayoutMode = 'none' | 'semantic' | 'universal' | 'touch' | 'wireframe';

export interface DevState {
  uiScale: number;
  stepCardHeight: number;
  cardStackGap: number;
  topBarThickness: number;
  uiRadius: number;
  maskTopFade: number;
  maskBottomFade: number;
  debugLayoutMode: DebugLayoutMode;
  setUiScale: (scale: number) => void;
  setMaskTopFade: (fade: number) => void;
  setMaskBottomFade: (fade: number) => void;
  setStepCardHeight: (height: number) => void;
  setCardStackGap: (gap: number) => void;
  setTopBarThickness: (thickness: number) => void;
  setUiRadius: (radius: number) => void;
  setDebugLayoutMode: (mode: DebugLayoutMode) => void;
  resetToDefaults: () => void;
}

export const initialState = {
  uiScale: 1.0,
  stepCardHeight: 92,
  cardStackGap: 12,
  topBarThickness: 48,
  uiRadius: 24,
  debugLayoutMode: 'none' as const,
  maskTopFade: 16,
  maskBottomFade: 100,
};

export const useDevStore = create<DevState>()(
  persist(
    (set) => ({
      ...initialState,
      setUiScale: (uiScale) => set({ uiScale }),
      setStepCardHeight: (stepCardHeight) => set({ stepCardHeight }),
      setCardStackGap: (cardStackGap) => set({ cardStackGap }),
      setTopBarThickness: (topBarThickness) => set({ topBarThickness }),
      setUiRadius: (uiRadius) => set({ uiRadius }), setMaskTopFade: (maskTopFade) => set({ maskTopFade }), setMaskBottomFade: (maskBottomFade) => set({ maskBottomFade }),
      setDebugLayoutMode: (debugLayoutMode) => set({ debugLayoutMode }),
      resetToDefaults: () => set(initialState),
    }),
    {
      name: 'uwgas-dev-settings',
      version: 1,
      migrate: (persistedState: unknown) => {
        return { ...initialState, ...(persistedState as Partial<DevState>) } as DevState;
      },
    }
  )
);

