import re

with open('src/components/layout/ContextBar.tsx', 'r') as f:
    content = f.read()

old_normal = "className=\"sticky top-3 sm:top-4 z-50 flex items-center justify-between mb-4 px-2 py-2 bg-[#262626]/90 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl transition-all duration-300 min-h-[60px] mx-auto max-w-[576px] w-full relative\""
new_normal = "className=\"sticky top-3 sm:top-4 z-50 flex items-center justify-between mb-4 px-2 py-2 bg-[#1a1510]/90 backdrop-blur-2xl border border-amber-500/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20 rounded-3xl transition-all duration-300 min-h-[60px] mx-auto max-w-[576px] w-full relative\""

content = content.replace(old_normal, new_normal)

# For the confirmation bar, we can use the same dark bg but keep the red border and shadow
old_confirm = "className=\"sticky top-3 sm:top-4 z-50 flex items-center justify-between mb-4 px-2 py-2 bg-[#262626]/95 backdrop-blur-xl border border-red-500/30 rounded-3xl shadow-2xl transition-all duration-300 min-h-[60px] mx-auto max-w-[576px] w-full\""
new_confirm = "className=\"sticky top-3 sm:top-4 z-50 flex items-center justify-between mb-4 px-2 py-2 bg-[#1a1510]/95 backdrop-blur-2xl border border-red-500/30 rounded-3xl shadow-[0_8px_32px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20 transition-all duration-300 min-h-[60px] mx-auto max-w-[576px] w-full\""

content = content.replace(old_confirm, new_confirm)

with open('src/components/layout/ContextBar.tsx', 'w') as f:
    f.write(content)

print("Context Bar Styled")
