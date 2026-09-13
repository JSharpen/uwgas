import re

with open('src/components/settings/DevUIThemeView.tsx', 'r') as f:
    content = f.read()

old_sliders = """          {/* Top Bar Thickness */}
          <div className="flex flex-col gap-3">"""

new_sliders = """          {/* Scroll Mask Fades */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-white/90">
                Scroll Mask Fades <span className="text-white/40 font-normal ml-1">(px)</span>
              </label>
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
          <div className="flex flex-col gap-3">"""

content = content.replace(old_sliders, new_sliders)

with open('src/components/settings/DevUIThemeView.tsx', 'w') as f:
    f.write(content)

print("Sliders fixed")
