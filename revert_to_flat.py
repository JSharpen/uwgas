with open('src/components/ui/ExpandableCard.tsx', 'r') as f:
    text = f.read()

# 1. Remove the precision highlight layers
old_highlight = """{/* Precision Highlight Layers (Header + 2 Corner Extensions) to prevent bleeding into transparent body */}
        <div className="absolute inset-0 pointer-events-none transition-colors group-hover/header:bg-white/5 group-active/header:bg-white/10 z-[-1]" />
        {isExpanded && (
          <>
            <div className="absolute -bottom-6 left-0 w-6 h-6 pointer-events-none transition-colors group-hover/header:bg-white/5 group-active/header:bg-white/10 z-[-1]" />
            <div className="absolute -bottom-6 right-0 w-6 h-6 pointer-events-none transition-colors group-hover/header:bg-white/5 group-active/header:bg-white/10 z-[-1]" />
          </>
        )}"""
text = text.replace(old_highlight, "")

# 2. Put hover states back on the header directly
text = text.replace(
    'className={`${headerClassName} cursor-pointer relative z-0 group/header`}',
    'className={`${headerClassName} cursor-pointer transition-colors relative z-10 hover:bg-white/5 active:bg-white/10`}'
)

# 3. Remove rounded-t from the body
text = text.replace(
    'className="overflow-hidden shadow-[inset_0_16px_16px_-16px_rgba(0,0,0,0.8)] bg-black/20 rounded-t-[var(--ui-radius-mid)]"',
    'className="overflow-hidden shadow-[inset_0_16px_16px_-16px_rgba(0,0,0,0.8)] bg-black/20"'
)

with open('src/components/ui/ExpandableCard.tsx', 'w') as f:
    f.write(text)
