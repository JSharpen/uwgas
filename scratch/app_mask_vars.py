import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add to devState hook
old_state = """    uiRadius: state.uiRadius,
    debugLayoutMode: state.debugLayoutMode
  }), shallow);"""

new_state = """    uiRadius: state.uiRadius,
    maskTopFade: state.maskTopFade,
    maskBottomFade: state.maskBottomFade,
    debugLayoutMode: state.debugLayoutMode
  }), shallow);"""

content = content.replace(old_state, new_state)

# Replace the hardcoded mask with template literals using the variables
old_mask = """        className="flex-1 w-full overflow-y-auto overscroll-y-contain px-3 sm:px-0 pb-[160px] relative z-0"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 16px, black calc(100% - 100px), transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 16px, black calc(100% - 100px), transparent)' }}
      >"""

new_mask = """        className="flex-1 w-full overflow-y-auto overscroll-y-contain px-3 sm:px-0 pb-[160px] relative z-0"
        style={{ 
          maskImage: `linear-gradient(to bottom, transparent, black ${devState.maskTopFade}px, black calc(100% - ${devState.maskBottomFade}px), transparent)`, 
          WebkitMaskImage: `linear-gradient(to bottom, transparent, black ${devState.maskTopFade}px, black calc(100% - ${devState.maskBottomFade}px), transparent)` 
        }}
      >"""

content = content.replace(old_mask, new_mask)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App.tsx mask vars wired")
