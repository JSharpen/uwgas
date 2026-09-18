const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

code = code.replace(/Array\(4\)\.fill\(\{ hn: '', CAo: '' \}\)/g, "Array(5).fill({ hn: '', CAo: '' })");

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched Array(4) to Array(5)!");
