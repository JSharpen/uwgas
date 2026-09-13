import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# Replace pill styling
old_pill = """            {/* === SUMMARY PILL (Front Layer, Static) === */}
          <div className="relative w-full shrink-0">
            {maskBottomFade > 0 && (
              <div 
                className="absolute inset-x-0 bottom-[-200px] pointer-events-none -z-10 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent rounded-3xl"
                style={{ top: `-${maskBottomFade}px` }}
              />
            )}
            <button 
              type="button"
              className={`relative z-10 pointer-events-auto w-full shrink-0 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 touch-none transition-all group overflow-hidden ${isSetupPanelOpen ? 'neu-convex-pressed' : 'neu-convex shadow-xl border border-white/5'}`}"""

new_pill = """            {/* === SUMMARY PILL (Front Layer, Static) === */}
          <div className="relative w-full shrink-0">
            {maskBottomFade > 0 && (
              <div 
                className="absolute inset-x-0 bottom-[-200px] pointer-events-none -z-10 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent rounded-3xl"
                style={{ top: `-${maskBottomFade}px` }}
              />
            )}
            <button 
              type="button"
              className={`relative z-10 pointer-events-auto w-full shrink-0 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 touch-none transition-all group overflow-hidden ${isSetupPanelOpen ? 'neu-convex-pressed' : 'bg-[#1a1510]/90 backdrop-blur-2xl border border-amber-500/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20'}`}"""

content = content.replace(old_pill, new_pill)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Pill styling restored")
