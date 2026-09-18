const fs = require('fs');
let code = fs.readFileSync('src/components/settings/MachineManagerView.tsx', 'utf8');

const svgRegex = /<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white\/40 shrink-0 ml-2">\n\s*<path d="m6 9 6 6 6-6"\/>\n\s*<\/svg>/;

code = code.replace(svgRegex, '');
fs.writeFileSync('src/components/settings/MachineManagerView.tsx', code);
