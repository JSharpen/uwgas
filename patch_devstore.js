const fs = require('fs');
const content = fs.readFileSync('src/state/devStore.ts', 'utf8');

const newContent = content.replace(
  /export const useDevStore = create<DevState>\(\)\(\n  persist\(\n    \(set\) => \(\{\n      uiScale: 0\.85,\n      stepCardHeight: 92,\n      cardStackGap: 12,\n      topBarThickness: 44,\n      uiRadius: 24,\n      debugLayoutMode: 'none', maskTopFade: 16, maskBottomFade: 100,/,
  `export const initialState = {
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
      ...initialState,`
).replace(
  /resetToDefaults: \(\) => set\(\{ \n        uiScale: 0\.85, \n        stepCardHeight: 92, \n        cardStackGap: 12, \n        topBarThickness: 44,\n        uiRadius: 24,\n        debugLayoutMode: 'none', maskTopFade: 16, maskBottomFade: 100,\}\),/,
  `resetToDefaults: () => set(initialState),`
);

fs.writeFileSync('src/state/devStore.ts', newContent);
