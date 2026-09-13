import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

old_inline_class = "className={`relative z-10 pointer-events-auto w-full ${isSetupPanelOpen ? 'neu-convex-pressed' : 'neu-convex neu-convex-active'} shrink-0 border border-black/20 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 transition-all overflow-hidden`}"
new_inline_class = "className=\"relative z-10 pointer-events-auto w-full shrink-0 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 transition-all overflow-hidden bg-black/85 backdrop-blur-2xl shadow-2xl shadow-black/80 ring-1 ring-white/10 border border-white/5\""

old_drawer_class = "className={`relative z-10 pointer-events-auto w-full ${isSetupPanelOpen ? 'neu-convex-pressed' : 'neu-convex neu-convex-active'} shrink-0 border border-black/20 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 touch-none transition-all group overflow-hidden`}"
new_drawer_class = "className=\"relative z-10 pointer-events-auto w-full shrink-0 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 touch-none transition-all group overflow-hidden bg-black/85 backdrop-blur-2xl shadow-2xl shadow-black/80 ring-1 ring-white/10 border border-white/5\""

content = content.replace(old_inline_class, new_inline_class)
content = content.replace(old_drawer_class, new_drawer_class)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Pill styled!")
