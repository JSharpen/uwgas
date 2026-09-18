const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const regex = /\{\/\* Buttons \*\/\}\n\s*<div className="flex items-center justify-between pt-3 border-t border-white\/5">[\s\S]*?<\/div>/;

if (code.match(regex)) {
   code = code.replace(regex, "");
   fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
   console.log("Removed bottom buttons!");
} else {
   console.log("Regex missed!");
}
