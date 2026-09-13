import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# Remove the ActionSheets and Modals
bad_block = """      {/* ANGLE: Action Sheet & Modal */}"""
end_marker = """      <ActionSheetPicker
        isOpen={activeSheet === 'preset'}"""

start_idx = content.find(bad_block)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Bad block removed!")
