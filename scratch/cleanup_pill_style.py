import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

old_class = "className=\"relative z-10 pointer-events-auto w-full shrink-0 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 touch-none transition-all group overflow-hidden bg-black/85 backdrop-blur-2xl shadow-2xl shadow-black/80 ring-1 ring-white/10 border border-white/5\""
new_class = "className={`relative z-10 pointer-events-auto w-full shrink-0 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 touch-none transition-all group overflow-hidden ${isSetupPanelOpen ? 'neu-convex-pressed' : 'bg-[#1a1510]/90 backdrop-blur-2xl border border-amber-500/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20'}`}"

content = content.replace(old_class, new_class)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Pill restyled to amber glass")
