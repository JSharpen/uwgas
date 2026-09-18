const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// The bad block:
//  React.useEffect(() => {
//    if (step !== 'measuring') return;
//    const handleNext = () => nextMeasurement();
//    const handleBack = () => prevMeasurement();
//    const handleStart = () => startMeasuring();
//    window.addEventListener('wizard-next', handleNext);
//    window.addEventListener('wizard-back', handleBack);
//    window.addEventListener('wizard-start', handleStart);
//    return () => {
//      window.removeEventListener('wizard-next', handleNext);
//      window.removeEventListener('wizard-back', handleBack);
//      window.removeEventListener('wizard-start', handleStart);
//    };
//  }, [step, measIndex, calibCount]);

// We need to split them or move the check into the handlers.
const badRegex = /React\.useEffect\(\(\) => \{\n\s*if \(step !== 'measuring'\) return;\n\s*const handleNext = \(\) => nextMeasurement\(\);\n\s*const handleBack = \(\) => prevMeasurement\(\);\n\s*const handleStart = \(\) => startMeasuring\(\);\n\s*window\.addEventListener\('wizard-next', handleNext\);\n\s*window\.addEventListener\('wizard-back', handleBack\);\n\s*window\.addEventListener\('wizard-start', handleStart\);\n\s*return \(\) => \{\n\s*window\.removeEventListener\('wizard-next', handleNext\);\n\s*window\.removeEventListener\('wizard-back', handleBack\);\n\s*window\.removeEventListener\('wizard-start', handleStart\);\n\s*\};\n\s*\}, \[[^\]]+\]\);/;

const replacement = `React.useEffect(() => {
    const handleNext = () => { if (step === 'measuring') nextMeasurement(); };
    const handleBack = () => { if (step === 'measuring') prevMeasurement(); };
    const handleStart = () => { if (step === 'setup') startMeasuring(); };
    
    window.addEventListener('wizard-next', handleNext);
    window.addEventListener('wizard-back', handleBack);
    window.addEventListener('wizard-start', handleStart);
    
    return () => {
      window.removeEventListener('wizard-next', handleNext);
      window.removeEventListener('wizard-back', handleBack);
      window.removeEventListener('wizard-start', handleStart);
    };
  }, [step, measIndex, calibName]); // removed calibCount from dependencies since it's hardcoded, added calibName for startMeasuring`;

code = code.replace(badRegex, replacement);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched useEffect dependencies!");
