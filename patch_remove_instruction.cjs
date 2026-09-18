const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const oldText = `{scope === 'both' && ' Do not alter height between bases.'}`;
code = code.replace(oldText, '');

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Removed ambiguity text!");
