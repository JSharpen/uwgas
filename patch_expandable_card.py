with open('src/components/ui/ExpandableCard.tsx', 'r') as f:
    text = f.read()

# Replace the inner div of the grid expander
text = text.replace(
    '<div ref={contentRef} className="overflow-hidden">',
    '<div ref={contentRef} className="overflow-hidden shadow-[inset_0_16px_16px_-16px_rgba(0,0,0,0.8)] bg-black/20">'
)

with open('src/components/ui/ExpandableCard.tsx', 'w') as f:
    f.write(text)
