const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// 1. Remove isAdvExpanded state
code = code.replace(/const \[isAdvExpanded, setIsAdvExpanded\] = React\.useState\(false\);\n?/, '');

// 2. Change calibCount to constant 5
code = code.replace(/const \[calibCount, setCalibCount\] = React\.useState\([0-9]+\);/, 'const calibCount = 5;');

// 3. Remove Advanced Settings accordion block completely
const advancedSettingsRegex = /\{\/\* Advanced Settings \*\/\}\s*<div className="bg-black\/20 border border-white\/5 rounded-2xl flex flex-col overflow-hidden transition-all duration-300">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
code = code.replace(advancedSettingsRegex, '');

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched to hardcode N=5 and removed accordion!");
