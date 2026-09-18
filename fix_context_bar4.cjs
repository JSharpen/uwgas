const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');

const regex = /\);\n\s*else if \(settingsView === 'hardware'\) \{[\s\S]*?\+ Add\n\s*<\/button>\n\s*<\/div>\n\s*\);\n\s*\}/;
code = code.replace(regex, ');');

// Also remove 'machine' and 'hardware' from titleMap to be clean
code = code.replace(/'machine': 'Machines',\n\s*'hardware': 'Hardware',\n\s*/, '');

fs.writeFileSync('src/components/layout/ContextBar.tsx', code);
console.log("Fixed dangling else!");
