import os
import re

directories = ['src/components']
pattern = re.compile(r'className=\{`([^`]*?)\s*\$\{(.*?)\s*\?\s*\'grid-rows-\[1fr\]\'\s*:\s*\'grid-rows-\[0fr\]\'\}\s*`\}')

for root_dir, dirs, files in os.walk(directories[0]):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root_dir, file)
            with open(path, 'r') as f:
                content = f.read()

            if "grid-rows-[1fr]" in content or "grid-rows-[0fr]" in content:
                new_content, count = pattern.subn(lambda m: f'className="{m.group(1).strip()}" style={{{{ gridTemplateRows: {m.group(2).strip()} ? "1fr" : "0fr" }}}}', content)
                if count > 0:
                    with open(path, 'w') as f:
                        f.write(new_content)
                    print(f"Fixed {count} instances in {path}")
                else:
                    print(f"Regex didn't match in {path}")
