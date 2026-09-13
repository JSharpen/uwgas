import re

with open('src/state/devStore.ts', 'r') as f:
    content = f.read()

# remove setupInteractionStyle
content = re.sub(r"export type SetupInteractionStyle = 'drawer' \| 'inline' \| 'sheet' \| 'modal';\n", "", content)
content = re.sub(r"\s*setupInteractionStyle:\s*SetupInteractionStyle;", "", content)
content = re.sub(r"\s*setSetupInteractionStyle:\s*\(style:\s*SetupInteractionStyle\)\s*=>\s*void;", "", content)
content = re.sub(r"\s*setupInteractionStyle:\s*'drawer',", "", content)
content = re.sub(r"\s*setSetupInteractionStyle:\s*\(setupInteractionStyle\)\s*=>\s*set\(\{\s*setupInteractionStyle\s*\}\),", "", content)
content = re.sub(r"\s*setupInteractionStyle:\s*'drawer'\s*", "", content)

with open('src/state/devStore.ts', 'w') as f:
    f.write(content)

print("devStore cleaned")
