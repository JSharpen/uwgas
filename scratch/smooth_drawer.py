import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# Replace the wrapper around the drawer
old_wrapper_start = """        <div id="global-setup-card" className="relative w-full flex flex-col justify-end pointer-events-none max-h-[calc(100dvh-var(--progression-header-bottom,66px)-92px)] min-h-0">
                              {/* === DRAWER BODY (Expands upwards from behind the pill) === */}
          <div 
            className={`w-full neu-convex border border-black/40 shadow-2xl rounded-t-3xl rounded-b-none pb-6 transition-all duration-300 ease-in-out relative overflow-hidden flex flex-col z-0 -mb-6 pt-2 min-h-0 ${isSetupPanelOpen ? 'max-h-[100dvh] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none border-transparent pt-0 pb-0'}`}
          >"""

new_wrapper_start = """        <div id="global-setup-card" className="relative w-full pointer-events-none">
          {/* === DRAWER WRAPPER (Overflow hidden for slide animation) === */}
          <div 
            className={`absolute bottom-[calc(100%-24px)] left-0 right-0 overflow-hidden pointer-events-none rounded-t-3xl flex flex-col z-0 transition-opacity duration-300 ${isSetupPanelOpen ? 'opacity-100' : 'opacity-0 delay-150'}`}
            style={{ 
              maxHeight: 'calc(100dvh - var(--progression-header-bottom, 66px) - 92px - var(--pill-bottom, 72px))'
            }}
          >
            {/* === DRAWER BODY (Slides up using transform) === */}
            <div 
              className={`w-full neu-convex border border-black/40 shadow-2xl rounded-t-3xl rounded-b-none pb-8 pt-2 transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.2,1)] relative flex flex-col min-h-0 ${isSetupPanelOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-full pointer-events-none'}`}
            >"""

content = content.replace(old_wrapper_start, new_wrapper_start)

# Also need to fix the input area opacity transition
# We had: className={`px-4 sm:px-5 pb-0 pt-2 flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto overscroll-contain transition-opacity duration-300 relative z-10 ${isSetupPanelOpen ? 'opacity-100 delay-150' : 'opacity-0'}`}
# We can just remove the opacity transition from the inputs area since the whole wrapper slides.
old_inputs_area = """            {/* INPUTS AREA */}
            <div 
              className={`px-4 sm:px-5 pb-0 pt-2 flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto overscroll-contain transition-opacity duration-300 relative z-10 ${isSetupPanelOpen ? 'opacity-100 delay-150' : 'opacity-0'}`}
              style={{ maskImage: 'linear-gradient(to bottom, transparent, black 12px, black 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12px, black 100%)' }}
            >"""

new_inputs_area = """            {/* INPUTS AREA */}
            <div 
              className="px-4 sm:px-5 pb-0 pt-2 flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto overscroll-contain relative z-10"
              style={{ maskImage: 'linear-gradient(to bottom, transparent, black 12px, black 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12px, black 100%)' }}
            >"""

content = content.replace(old_inputs_area, new_inputs_area)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Smooth drawer applied")
