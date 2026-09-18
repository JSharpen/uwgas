const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const regex = /\{\/\* Header \*\/\}\n\s*<div className="relative z-10 flex items-center justify-between border-b border-white\/5 pb-4">[\s\S]*?<\/div>/;
code = code.replace(regex, '');

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched wizard header!");
