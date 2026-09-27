import re
with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

# Fix calcError type
text = text.replace("const calcError = (res: SolverOutput, side: 'rear' | 'front') => {", "const calcError = (res: any, side: 'rear' | 'front') => {")

# Fix computeResults call
text = text.replace("computeResults(true, true);", "computeResults(true);")

# Fix Tag intent
text = text.replace('intent="primary"', 'intent="info"')

# Remove duplicate save block
# We have two `const rearToSave = rearResult;` blocks. I'll just regex replace from the first one to the end of handleSave.
save_pattern = re.compile(r'    const rearToSave = rearResult;.*?if \(frontToSave\) \{.*?\n    \}', re.DOTALL)
matches = save_pattern.findall(text)
if len(matches) > 1:
    # Replace the second one with empty string
    last_idx = text.rfind(matches[1])
    text = text[:last_idx] + text[last_idx:].replace(matches[1], "", 1)

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
