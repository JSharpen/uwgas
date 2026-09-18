const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const regex = /<span className="text-lg">📏<\/span>/g;
const replacement = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 -rotate-45 shrink-0">
                <path d="M3 12h18" />
                <path d="M5 4v16" />
                <path d="M5 8h2" />
                <path d="M5 16h2" />
                <path d="M11 4v16" />
                <rect x="11" y="8" width="6" height="8" rx="1" />
                <path d="M13 12h2" />
              </svg>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched ruler to caliper!");
