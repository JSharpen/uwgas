with open('src/components/CalibrationWizard.tsx', 'r') as f:
    lines = f.readlines()

# Rear Base (lines 670-720 and 840-860 roughly) -> change blue to amber
# Front Base (lines 720-780 and 870-890 roughly) -> change emerald to blue

for i in range(len(lines)):
    # Rear Base Inputs
    if 660 <= i <= 720:
        lines[i] = lines[i].replace('blue-500', 'amber-500')
        lines[i] = lines[i].replace('blue-400', 'amber-400')
        lines[i] = lines[i].replace('blue-300', 'amber-300')
    
    # Front Base Inputs
    if 720 <= i <= 780:
        if 'emerald-400' in lines[i] and 'maxErr <=' not in lines[i]:
            lines[i] = lines[i].replace('emerald-400', 'blue-400')
        lines[i] = lines[i].replace('emerald-500', 'blue-500')
        lines[i] = lines[i].replace('emerald-300', 'blue-300')

    # Rear Base Results
    if 840 <= i <= 870:
        lines[i] = lines[i].replace('blue-500', 'amber-500')
        lines[i] = lines[i].replace('blue-400', 'amber-400')
        lines[i] = lines[i].replace('blue-300', 'amber-300')

    # Front Base Results
    if 870 <= i <= 890:
        lines[i] = lines[i].replace('emerald-500', 'blue-500')
        lines[i] = lines[i].replace('emerald-400', 'blue-400')
        lines[i] = lines[i].replace('emerald-300', 'blue-300')

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.writelines(lines)
