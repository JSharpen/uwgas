with open('src/components/ui/ExpandableCard.tsx', 'r') as f:
    text = f.read()

text = text.replace(
    'className="overflow-hidden shadow-[inset_0_16px_16px_-16px_rgba(0,0,0,0.8)] bg-black/20 rounded-t-[var(--ui-radius-mid)]"',
    'className="overflow-hidden shadow-[inset_0_16px_16px_-16px_rgba(0,0,0,1)] bg-[#18181b] rounded-t-[var(--ui-radius-mid)]"'
)

with open('src/components/ui/ExpandableCard.tsx', 'w') as f:
    f.write(text)
