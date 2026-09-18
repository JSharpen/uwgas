const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');

// 1. Fix 'dir' implicitly any
code = code.replace(/const handleMove = \(dir\) => \{/, 'const handleMove = (dir: 1 | -1) => {');

// 2. Remove 'view === "wheels"' block entirely
const wheelsRegex = /\s*\} else if \(view === 'wheels'\) \{[\s\S]*?\+ Add Wheel\n\s*<\/button>\n\s*<\/div>\n\s*\);/;
code = code.replace(wheelsRegex, '');

// 3. Remove 'settingsView === "machine"' and "hardware" blocks
const settingsRegex = /\s*if \(settingsView === 'machine'\) \{[\s\S]*?\+ Add\n\s*<\/button>\n\s*<\/div>\n\s*\);\n\s*\}/;
code = code.replace(settingsRegex, '');

fs.writeFileSync('src/components/layout/ContextBar.tsx', code);
console.log("Fixed old ContextBar errors!");
