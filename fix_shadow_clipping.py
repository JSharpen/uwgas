with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

# Fix Modal clipping
old_container = '<div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1 -mr-1 pb-1">'
new_container = '<div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto px-2 -mx-2 py-2 -my-2">'
text = text.replace(old_container, new_container)

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)

with open('docs/DESIGN_LANGUAGE.md', 'a') as f:
    f.write('''
## 11. Neumorphic Shadow Clipping (Overflow Strategy)
- **The Clipping Problem:** Because neumorphic components (like `.neu-button`, `.neu-convex`, `.neu-concave`) heavily rely on drop-shadows and outer glows, placing them flush inside an `overflow-hidden` or `overflow-y-auto` container will cause their shadows to be abruptly cut off at the boundary.
- **The Padding Fix:** To prevent shadow clipping in scrollable containers, always apply padding that exceeds the maximum shadow blur radius (usually `p-2` or `px-2`) directly to the scroll container.
- **The Negative Margin Correction:** To ensure the container still visually aligns with its parent boundary without shrinking the layout, offset the applied padding with a matching negative margin (e.g., `<div className="overflow-y-auto px-2 -mx-2 py-2 -my-2">`).
''')
