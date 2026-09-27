with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

text = text.replace("const [isGuideExpanded, setIsGuideExpanded] = React.useState(false);", "")
text = text.replace("const computeResults = React.useCallback((forceResults = false, preventNavigation = false) => {", "const computeResults = React.useCallback((_forceResults = false, preventNavigation = false) => {")
text = text.replace("const calcError = (res: any, side: 'rear' | 'front') => {", "const calcError = (res: SolverOutput, side: 'rear' | 'front') => {")

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
