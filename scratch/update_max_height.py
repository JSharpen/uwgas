import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

old_style = "maxHeight: 'calc(100dvh - 145px - var(--pill-bottom, 72px))'"
new_style = "maxHeight: 'calc(100dvh - 155px - var(--pill-bottom, 72px))'"

content = content.replace(old_style, new_style)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Max height updated to 155px offset")
