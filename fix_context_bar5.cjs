const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');

const regex = /\);\s*else if \(settingsView === 'hardware'\) \{[\s\S]*?\+ Add\n\s*<\/button>\n\s*<\/div>\n\s*\);\n\s*\}/;
code = code.replace(regex, ');');

fs.writeFileSync('src/components/layout/ContextBar.tsx', code);
console.log("Fixed dangling else for real!");
