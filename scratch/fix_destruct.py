import re

with open('src/components/settings/DevUIThemeView.tsx', 'r') as f:
    content = f.read()

old_destruct = """    setPillBottom,
    setTopBarThickness,"""

new_destruct = """    setPillBottom,
    setTopBarThickness,
    maskTopFade,
    setMaskTopFade,
    maskBottomFade,
    setMaskBottomFade,"""

content = content.replace(old_destruct, new_destruct)

with open('src/components/settings/DevUIThemeView.tsx', 'w') as f:
    f.write(content)

print("Destructuring fixed")
