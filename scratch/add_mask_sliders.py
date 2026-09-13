import re

with open('src/components/settings/DevUIThemeView.tsx', 'r') as f:
    content = f.read()

# Add to destructuring
old_destruct = """    setStepCardHeight,
    cardStackGap,
    setCardStackGap,"""

new_destruct = """    setStepCardHeight,
    cardStackGap,
    setCardStackGap,
    maskTopFade,
    setMaskTopFade,
    maskBottomFade,
    setMaskBottomFade,"""

content = content.replace(old_destruct, new_destruct)

# Add sliders before Top Bar Thickness
old_sliders = """        {/* Top Bar Thickness */}
        <div className="flex flex-col gap-2 p-4 neu-convex rounded-2xl">"""

new_sliders = """        {/* Mask Fades */}
        <div className="flex flex-col gap-2 p-4 neu-convex rounded-2xl">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-bold text-white/80">Scroll Mask Fades</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">Top Fade</span>
              <span className="text-xs font-mono text-amber-400">{maskTopFade}px</span>
            </div>
            <input 
              type="range" 
              min="0" max="200" step="1"
              value={maskTopFade}
              onChange={(e) => setMaskTopFade(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400"
            />
          </div>

          <div className="flex flex-col gap-1 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">Bottom Fade</span>
              <span className="text-xs font-mono text-amber-400">{maskBottomFade}px</span>
            </div>
            <input 
              type="range" 
              min="0" max="300" step="1"
              value={maskBottomFade}
              onChange={(e) => setMaskBottomFade(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400"
            />
          </div>
        </div>

        {/* Top Bar Thickness */}
        <div className="flex flex-col gap-2 p-4 neu-convex rounded-2xl">"""

content = content.replace(old_sliders, new_sliders)

with open('src/components/settings/DevUIThemeView.tsx', 'w') as f:
    f.write(content)

print("Sliders added")
