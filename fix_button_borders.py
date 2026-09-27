with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

text = text.replace('rounded-[calc(var(--ui-radius-core)-12px)] neu-convex border border-white/5', 'rounded-lg neu-convex border border-black/40')

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)
