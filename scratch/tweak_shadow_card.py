import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# Modify the button
old_button = "className={`relative z-10 pointer-events-auto w-full shrink-0 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 touch-none transition-all group overflow-hidden ${isSetupPanelOpen ? 'neu-convex-pressed' : 'bg-[#1a1510]/90 backdrop-blur-2xl border border-amber-500/30 ring-1 ring-amber-500/20'}`}\n              style={!isSetupPanelOpen ? { boxShadow: maskBottomFade > 0 ? `0 8px 32px rgba(245,158,11,0.15), 0 -24px ${maskBottomFade * 1.5}px ${maskBottomFade / 2}px #09090b` : '0 8px 32px rgba(245,158,11,0.15)' } : undefined}"
new_button = "className={`relative z-10 pointer-events-auto w-full shrink-0 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 touch-none transition-all group overflow-hidden ${isSetupPanelOpen ? 'neu-convex-pressed' : 'bg-[#09090b] border border-amber-500/30 ring-1 ring-amber-500/20'}`}\n              style={!isSetupPanelOpen ? { boxShadow: maskBottomFade > 0 ? `0 8px 32px rgba(245,158,11,0.15), 0 0px ${maskBottomFade}px ${maskBottomFade / 2}px #09090b` : '0 8px 32px rgba(245,158,11,0.15)' } : undefined}"
content = content.replace(old_button, new_button)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("GlobalSetupCard shadows tweaked")
