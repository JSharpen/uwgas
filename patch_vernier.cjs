const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// Replace the old digital SVG
const oldSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 -rotate-45 shrink-0">
                <path d="M3 12h18" />
                <path d="M5 4v16" />
                <path d="M5 8h2" />
                <path d="M5 16h2" />
                <path d="M11 4v16" />
                <rect x="11" y="8" width="6" height="8" rx="1" />
                <path d="M13 12h2" />
              </svg>`;

const newSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 -rotate-45 shrink-0">
                <path d="M3 12h19" />
                <path d="M16 12v-1" />
                <path d="M18 12v-1" />
                <path d="M20 12v-1" />
                <path d="M6 12v7l-2 -2V5l2 2v5" />
                <path d="M12 12v7l2 -2V5l-2 2v5" />
                <rect x="14" y="10" width="3" height="4" rx="0.5" />
                <path d="M15.5 10v-2" />
              </svg>`;

code = code.replace(oldSvg, newSvg);

// Replace "digital caliper" text
code = code.replace(/<strong>digital caliper<\/strong>/, '<strong>pair of calipers</strong>');

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched to Vernier Calipers!");
