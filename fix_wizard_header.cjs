const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// I will just look for the orphaned </div> before {/* Step Indicator Pills */}
code = code.replace(/<\/div>\n\n\s*\{\/\* Step Indicator Pills \*\/\}/, '\n\n      {/* Step Indicator Pills */}');

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Fixed wizard header!");
