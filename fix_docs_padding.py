with open('docs/DESIGN_LANGUAGE.md', 'r') as f:
    text = f.read()

text = text.replace(
    "- **Standard Touch Targets**: Interactive buttons rely on `h-11 px-3 sm:px-4 rounded-2xl` to ensure a ~44px minimum touch target height.",
    "- **Standard Touch Targets**: Interactive buttons rely on strictly uniform padding (`p-3.5` with `rounded-2xl`). `p-3.5` provides exactly 14px of padding on all 4 sides, which mathematically sums with standard text to a perfect `44px` minimum touch target height without needing a rigid `h-11` constraint."
)

with open('docs/DESIGN_LANGUAGE.md', 'w') as f:
    f.write(text)
