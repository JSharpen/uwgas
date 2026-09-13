import re

with open('src/state/devStore.ts', 'r') as f:
    content = f.read()

# Add types
old_types = """  uiRadius: number;
  debugLayoutMode: DebugLayoutMode;
  setUiScale: (scale: number) => void;"""

new_types = """  uiRadius: number;
  maskTopFade: number;
  maskBottomFade: number;
  debugLayoutMode: DebugLayoutMode;
  setUiScale: (scale: number) => void;
  setMaskTopFade: (fade: number) => void;
  setMaskBottomFade: (fade: number) => void;"""

content = content.replace(old_types, new_types)

# Add defaults
old_defaults = """      uiRadius: 24, // 1.5rem
      debugLayoutMode: 'none',
      setUiScale: (uiScale) => set({ uiScale }),"""

new_defaults = """      uiRadius: 24, // 1.5rem
      maskTopFade: 16,
      maskBottomFade: 100,
      debugLayoutMode: 'none',
      setUiScale: (uiScale) => set({ uiScale }),
      setMaskTopFade: (maskTopFade) => set({ maskTopFade }),
      setMaskBottomFade: (maskBottomFade) => set({ maskBottomFade }),"""

content = content.replace(old_defaults, new_defaults)

with open('src/state/devStore.ts', 'w') as f:
    f.write(content)

print("devStore updated")
