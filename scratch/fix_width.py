import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

old_wrapper = "className=\"fixed left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-30 mx-auto pointer-events-none flex flex-col justify-end\""
new_wrapper = "className=\"fixed left-3 right-3 sm:left-0 sm:right-0 sm:max-w-[576px] z-30 mx-auto pointer-events-none flex flex-col justify-end\""

content = content.replace(old_wrapper, new_wrapper)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("GlobalSetupCard width fixed")
