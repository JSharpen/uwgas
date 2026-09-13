import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Revert App wrapper
old_outer = 'className="h-[100dvh] overflow-hidden bg-[#09090b] text-white pt-3 sm:pt-4 flex flex-col max-w-[576px] mx-auto selection:bg-amber-400/30 selection:text-white"'
new_outer = 'className="min-h-dvh bg-[#09090b] text-white px-3 py-3 sm:px-0 sm:py-4 pb-[140px] flex flex-col gap-4 max-w-[576px] mx-auto selection:bg-amber-400/30 selection:text-white"'
content = content.replace(old_outer, new_outer)

# Revert ContextBar wrapper
old_cb = """      {/* Global Context Bar */}
      <div className="px-3 sm:px-0 shrink-0 w-full relative z-50">
        <ContextBar />
      </div>"""
new_cb = """      {/* Global Context Bar */}
      <ContextBar />"""
content = content.replace(old_cb, new_cb)

# Revert main
old_main = """      <main 
        className="flex-1 w-full overflow-y-auto overscroll-y-contain px-3 sm:px-0 pb-[160px] relative z-0"
        style={{ 
          maskImage: `linear-gradient(to bottom, transparent, black ${devState.maskTopFade}px, black calc(100% - ${devState.maskBottomFade}px), transparent)`, 
          WebkitMaskImage: `linear-gradient(to bottom, transparent, black ${devState.maskTopFade}px, black calc(100% - ${devState.maskBottomFade}px), transparent)` 
        }}
      >"""
new_main = """      <main className="flex-1 w-full">"""
content = content.replace(old_main, new_main)

# Remove mask vars from state hook
old_state = """    uiRadius: state.uiRadius,
    maskTopFade: state.maskTopFade,
    maskBottomFade: state.maskBottomFade,
    debugLayoutMode: state.debugLayoutMode
  }), shallow);"""
new_state = """    uiRadius: state.uiRadius,
    debugLayoutMode: state.debugLayoutMode
  }), shallow);"""
content = content.replace(old_state, new_state)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App.tsx reverted")
