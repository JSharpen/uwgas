const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove 'themelab' from union type
code = code.replace(/ \| 'themelab'/g, '');

// Remove the block
const regex = /\{\s*settingsView === 'themelab' && \(\s*<>\s*\{\/\*[\s\S]*?Back\s*<\/button>\s*<\/div>\s*\)\}\s*<\/>\s*\)\}/;
code = code.replace(regex, '');

fs.writeFileSync('src/App.tsx', code);
