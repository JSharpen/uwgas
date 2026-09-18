import re

with open('src/views/PresetsView.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r'className=\{`grid transition-\[grid-template-rows\] duration-300 ease-in-out \$\{\s*isExpanded \? \'grid-rows-\[1fr\]\' : \'grid-rows-\[0fr\]\'\s*\}\s*`\}')
new_content = pattern.sub('className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}', content)

with open('src/views/PresetsView.tsx', 'w') as f:
    f.write(new_content)
