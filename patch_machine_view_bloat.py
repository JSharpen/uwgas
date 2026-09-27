import re

with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

# Add imports
if "import { Button }" not in text:
    text = text.replace("import { ModalSelector } from '../ui/ModalSelector';", "import { ModalSelector } from '../ui/ModalSelector';\nimport { Button, Surface } from '../ui';")

# 1. Replace the `.neu-concave` boxes with `<Surface variant="concave">`
text = text.replace(
    '<div className="neu-concave border border-black/40 shadow-inner rounded-[var(--ui-radius-core)] p-3 flex flex-col gap-3 justify-between">',
    '<Surface variant="concave" padding="md" className="flex flex-col gap-3 justify-between">'
)
text = text.replace('</Surface>\n                    </div>', '</Surface>') # if there was any mismatched div end. Let's rely on standard div replacement:
# Wait, actually since I replaced `<div className="neu-concave...">` with `<Surface...>`, I need to replace the closing `</div>` of those specific boxes with `</Surface>`.
# Since there are exactly 2 of these, let's just use regex substitution manually for the exact blocks.
