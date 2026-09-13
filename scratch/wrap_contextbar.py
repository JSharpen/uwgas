import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_cb = "{/* Global Context Bar */}\n      <ContextBar />"
new_cb = "{/* Global Context Bar */}\n      <div className=\"px-3 sm:px-0 shrink-0 w-full relative z-50\">\n        <ContextBar />\n      </div>"

content = content.replace(old_cb, new_cb)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("ContextBar wrapped")
