with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

start_modal = "{/* Add Modal */}"
end_modal = "{/* Create Machine Modal */}"
start_idx_modal = text.find(start_modal)
end_idx_modal = text.find(end_modal)

if start_idx_modal != -1 and end_idx_modal != -1:
    text = text[:start_idx_modal] + text[end_idx_modal:]

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)
