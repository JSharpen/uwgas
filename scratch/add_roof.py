import re

with open('src/components/layout/ContextBar.tsx', 'r') as f:
    content = f.read()

# For the non-confirmation header
old_non_conf = 'className="sticky top-3 sm:top-4 z-50 flex items-center justify-between mb-4 px-2 py-2 bg-[#1a1510]/90 backdrop-blur-2xl border border-amber-500/30 ring-1 ring-amber-500/20 rounded-3xl transition-all duration-300 min-h-[60px] mx-auto max-w-[576px] w-full relative" style={{ boxShadow: maskTopFade > 0 ? `0 8px 32px rgba(245,158,11,0.15), 0 24px ${maskTopFade * 1.5}px ${maskTopFade / 2}px #09090b` : \'0 8px 32px rgba(245,158,11,0.15)\' }}'
new_non_conf = 'className="sticky top-3 sm:top-4 z-50 flex items-center justify-between mb-4 px-2 py-2 bg-[#1a1510]/90 backdrop-blur-2xl border border-amber-500/30 ring-1 ring-amber-500/20 rounded-3xl transition-all duration-300 min-h-[60px] mx-auto max-w-[576px] w-full relative" style={{ boxShadow: maskTopFade > 0 ? `0 8px 32px rgba(245,158,11,0.15), 0 24px ${maskTopFade * 1.5}px ${maskTopFade / 2}px #09090b, 0 -24px 24px 12px #09090b` : \'0 8px 32px rgba(245,158,11,0.15)\' }}'
content = content.replace(old_non_conf, new_non_conf)

# For the confirmation header
old_conf = 'className="sticky top-3 sm:top-4 z-50 flex items-center justify-between mb-4 px-2 py-2 bg-[#1a1510]/95 backdrop-blur-2xl border border-red-500/30 rounded-3xl ring-1 ring-red-500/20 transition-all duration-300 min-h-[60px] mx-auto max-w-[576px] w-full" style={{ boxShadow: maskTopFade > 0 ? `0 8px 32px rgba(239,68,68,0.15), 0 24px ${maskTopFade * 1.5}px ${maskTopFade / 2}px #09090b` : \'0 8px 32px rgba(239,68,68,0.15)\' }}'
new_conf = 'className="sticky top-3 sm:top-4 z-50 flex items-center justify-between mb-4 px-2 py-2 bg-[#1a1510]/95 backdrop-blur-2xl border border-red-500/30 rounded-3xl ring-1 ring-red-500/20 transition-all duration-300 min-h-[60px] mx-auto max-w-[576px] w-full" style={{ boxShadow: maskTopFade > 0 ? `0 8px 32px rgba(239,68,68,0.15), 0 24px ${maskTopFade * 1.5}px ${maskTopFade / 2}px #09090b, 0 -24px 24px 12px #09090b` : \'0 8px 32px rgba(239,68,68,0.15)\' }}'
content = content.replace(old_conf, new_conf)

with open('src/components/layout/ContextBar.tsx', 'w') as f:
    f.write(content)

print("Upward shadow added to ContextBar")
