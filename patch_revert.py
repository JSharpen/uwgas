with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

old_remeasure = """onClick={() => {
                const hasRearBounds = rearRows[0]?.hn !== '' && rearRows[1]?.hn !== '';
                const hasFrontBounds = frontRows[0]?.hn !== '' && frontRows[1]?.hn !== '';
                const canSkipBounds = (scope === 'rear' && hasRearBounds) || 
                                      (scope === 'front' && hasFrontBounds) || 
                                      (scope === 'both' && hasRearBounds && hasFrontBounds);

                if (canSkipBounds) {
                  setRearRows(prev => [...prev.slice(0, 2), { hn: '', CAo: '' }]);
                  setFrontRows(prev => [...prev.slice(0, 2), { hn: '', CAo: '' }]);
                  setMeasIndex(2);
                } else {
                  setRearRows(Array(INITIAL_COUNT).fill({ hn: '', CAo: '' }));
                  setFrontRows(Array(INITIAL_COUNT).fill({ hn: '', CAo: '' }));
                  setMeasIndex(0);
                }
                
                setNoImprovementCount(0);
                setBestError(null);
                setStep('measuring');
              }}"""
new_remeasure = """onClick={() => {
                setRearRows(Array(INITIAL_COUNT).fill({ hn: '', CAo: '' }));
                setFrontRows(Array(INITIAL_COUNT).fill({ hn: '', CAo: '' }));
                setMeasIndex(0);
                setNoImprovementCount(0);
                setBestError(null);
                setStep('measuring');
              }}"""

if old_remeasure in text:
    text = text.replace(old_remeasure, new_remeasure)
else:
    print("Could not find remeasure button")

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
