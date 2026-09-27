with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

text = text.replace(
    'variant="neu" intent="default" size="sm"\n                          onClick={(e) => { e.stopPropagation(); onSetDefaultMachine(m.id); }}',
    'variant="neu" intent="default" size="md"\n                          onClick={(e) => { e.stopPropagation(); onSetDefaultMachine(m.id); }}'
)

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)
