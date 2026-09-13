with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
found_import = False
for line in lines:
    if "import { useDevStore }" in line:
        if found_import:
            continue
        found_import = True
    new_lines.append(line)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.writelines(new_lines)
