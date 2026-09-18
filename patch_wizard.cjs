const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// 1. Remove Start button UI
const startBtnRegex = /<div className="flex flex-col gap-2 pt-2 border-t border-white\/5 mt-2">\s*<button\s*type="button"\s*className="h-12 px-7 rounded-2xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-950\/30 transition flex items-center justify-center cursor-pointer"\s*onClick=\{startMeasuring\}\s*>\s*Start Measurements →\s*<\/button>\s*<\/div>/;
code = code.replace(startBtnRegex, '');

// 2. Add Event Listener
const eventListenersRegex = /(const handleNext = \(\) => nextMeasurement\(\);\n\s*const handleBack = \(\) => prevMeasurement\(\);)/;
code = code.replace(eventListenersRegex, `$1\n    const handleStart = () => startMeasuring();`);

const addListenerRegex = /(window\.addEventListener\('wizard-next', handleNext\);\n\s*window\.addEventListener\('wizard-back', handleBack\);)/;
code = code.replace(addListenerRegex, `$1\n    window.addEventListener('wizard-start', handleStart);`);

const removeListenerRegex = /(window\.removeEventListener\('wizard-next', handleNext\);\n\s*window\.removeEventListener\('wizard-back', handleBack\);)/;
code = code.replace(removeListenerRegex, `$1\n      window.removeEventListener('wizard-start', handleStart);`);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched CalibrationWizard!");
