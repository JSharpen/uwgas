const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const hookStr = `  const computeResults = () => {`;

const eventHooks = `  React.useEffect(() => {
    if (step !== 'measuring') return;
    const handleNext = () => nextMeasurement();
    const handleBack = () => prevMeasurement();
    window.addEventListener('wizard-next', handleNext);
    window.addEventListener('wizard-back', handleBack);
    return () => {
      window.removeEventListener('wizard-next', handleNext);
      window.removeEventListener('wizard-back', handleBack);
    };
  }, [step, measIndex, calibCount]);

  const computeResults = () => {`;

code = code.replace(hookStr, eventHooks);
fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched wizard with event listeners!");
