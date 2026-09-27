with open('src/components/ui/ExpandableCard.tsx', 'r') as f:
    text = f.read()

text = text.replace(
    "        className={`${headerClassName} cursor-pointer transition-colors relative z-10 hover:bg-white/5 active:bg-white/10`}",
    "        className={`${headerClassName} cursor-pointer transition-colors relative z-10 hover:bg-white/5 active:bg-white/10 ${isExpanded ? 'rounded-bl-[1.5rem]' : ''}`}"
)

text = text.replace(
    '<div ref={contentRef} className="overflow-hidden shadow-[inset_0_16px_16px_-16px_rgba(0,0,0,0.8)] bg-black/20">',
    '<div ref={contentRef} className="overflow-hidden shadow-[inset_0_16px_16px_-16px_rgba(0,0,0,0.8)] bg-black/20 rounded-tr-[1.5rem]">'
)

with open('src/components/ui/ExpandableCard.tsx', 'w') as f:
    f.write(text)
