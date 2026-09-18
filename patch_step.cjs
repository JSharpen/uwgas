const fs = require('fs');
let wizard = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');
wizard = wizard.replace(/step === 'setup'/g, "step === 'intro'");
fs.writeFileSync('src/components/CalibrationWizard.tsx', wizard);

let ctxBar = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');
ctxBar = ctxBar.replace(/calibrationStep === 'setup'/g, "calibrationStep === 'intro'");
fs.writeFileSync('src/components/layout/ContextBar.tsx', ctxBar);

console.log("Patched step name from 'setup' to 'intro'!");
