with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

# 1. Remeasure button logic
old_remeasure = "onClick={() => { setStep('measuring'); setMeasIndex(0); }}"
new_remeasure = """onClick={() => {
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
if old_remeasure in text:
    text = text.replace(old_remeasure, new_remeasure)
else:
    print("Could not find remeasure button")

# 2. key={measIndex} on the inputs wrapper. 
# Look for `<div className="flex flex-col gap-6 w-full">` inside step === 'measuring'
old_inputs_wrapper = """          <div className="flex flex-col gap-6 w-full">
            {(scope === 'both' || scope === 'rear') && (
              <div className="flex flex-col gap-3">"""
new_inputs_wrapper = """          <div key={measIndex} className="flex flex-col gap-6 w-full">
            {(scope === 'both' || scope === 'rear') && (
              <div className="flex flex-col gap-3">"""
if old_inputs_wrapper in text:
    text = text.replace(old_inputs_wrapper, new_inputs_wrapper)
else:
    print("Could not find inputs wrapper")

# 3. Enter to trigger nextMeasurement
# Look for CAo input in rear
old_rear_cao = """                        value={rearRows[measIndex]?.CAo}
                        onChange={e => updateRear('CAo', e.target.value)}
                      />"""
new_rear_cao = """                        value={rearRows[measIndex]?.CAo}
                        onChange={e => updateRear('CAo', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') window.dispatchEvent(new CustomEvent('wizard-next')); }}
                      />"""
if old_rear_cao in text:
    text = text.replace(old_rear_cao, new_rear_cao)
else:
    print("Could not find rear CAo input")

# Front CAo input
old_front_cao = """                        value={frontRows[measIndex]?.CAo}
                        onChange={e => updateFront('CAo', e.target.value)}
                      />"""
new_front_cao = """                        value={frontRows[measIndex]?.CAo}
                        onChange={e => updateFront('CAo', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') window.dispatchEvent(new CustomEvent('wizard-next')); }}
                      />"""
if old_front_cao in text:
    text = text.replace(old_front_cao, new_front_cao)
else:
    print("Could not find front CAo input")

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
