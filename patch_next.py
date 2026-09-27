with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

# Add canProceed inside the component
# I'll put it right above nextMeasurement
can_proceed = """  const canProceed = React.useCallback(() => {
    const isRearValid = rearRows[measIndex]?.hn !== '' && rearRows[measIndex]?.CAo !== '';
    const isFrontValid = frontRows[measIndex]?.hn !== '' && frontRows[measIndex]?.CAo !== '';
    if (scope === 'rear') return isRearValid;
    if (scope === 'front') return isFrontValid;
    return isRearValid && isFrontValid;
  }, [measIndex, scope, rearRows, frontRows]);

  const nextMeasurement = React.useCallback(() => {"""
text = text.replace("  const nextMeasurement = React.useCallback(() => {", can_proceed)

# Protect nextMeasurement
next_start = """  const nextMeasurement = React.useCallback(() => {
    if (!canProceed()) return;"""
text = text.replace("  const nextMeasurement = React.useCallback(() => {", next_start)

# Disable the button
old_btn = """        {step === 'measuring' && (
          <ContextBar.Button
            variant="primary"
            onClick={() => window.dispatchEvent(new CustomEvent('wizard-next'))}
          >"""
new_btn = """        {step === 'measuring' && (
          <ContextBar.Button
            variant="primary"
            disabled={!canProceed()}
            onClick={() => window.dispatchEvent(new CustomEvent('wizard-next'))}
          >"""
text = text.replace(old_btn, new_btn)

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
