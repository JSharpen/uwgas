with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

text = text.replace("setCalibratingMachineId(m.id, null, 'intro', 'rear');", "setMappingSelectionBase({machineId: m.id, base: 'rear'});")
text = text.replace("+ Map Rear", "Rear Mappings")

text = text.replace("setCalibratingMachineId(m.id, null, 'intro', 'front');", "setMappingSelectionBase({machineId: m.id, base: 'front'});")
text = text.replace("+ Map Front", "Front Mappings")

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)
