with open('src/components/ui/ExpandableCard.tsx', 'r') as f:
    text = f.read()

# 1. Restore the body to bg-black/20
text = text.replace(
    'className="overflow-hidden shadow-[inset_0_16px_16px_-16px_rgba(0,0,0,1)] bg-[#18181b] rounded-t-[var(--ui-radius-mid)]"',
    'className="overflow-hidden shadow-[inset_0_16px_16px_-16px_rgba(0,0,0,0.8)] bg-black/20 rounded-t-[var(--ui-radius-mid)]"'
)

# 2. Replace the single massive highlight layer with the 3-part precision layer
old_highlight = '{/* Extended Highlight Layer to cover nested corner gaps */}\n        <div className="absolute top-0 left-0 right-0 -bottom-8 pointer-events-none transition-colors group-hover/header:bg-white/5 group-active/header:bg-white/10 z-[-1]" />'

new_highlight = """{/* Precision Highlight Layers (Header + 2 Corner Extensions) to prevent bleeding into transparent body */}
        <div className="absolute inset-0 pointer-events-none transition-colors group-hover/header:bg-white/5 group-active/header:bg-white/10 z-[-1]" />
        {isExpanded && (
          <>
            <div className="absolute -bottom-6 left-0 w-6 h-6 pointer-events-none transition-colors group-hover/header:bg-white/5 group-active/header:bg-white/10 z-[-1]" />
            <div className="absolute -bottom-6 right-0 w-6 h-6 pointer-events-none transition-colors group-hover/header:bg-white/5 group-active/header:bg-white/10 z-[-1]" />
          </>
        )}"""

text = text.replace(old_highlight, new_highlight)

with open('src/components/ui/ExpandableCard.tsx', 'w') as f:
    f.write(text)
