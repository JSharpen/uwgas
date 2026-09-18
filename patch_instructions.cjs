const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// Patch Step 1
code = code.replace(
  /<span>Set the USB to any height and lock it\.<\/span>/,
  '<span>Set the USB to a stable height (avoid extreme limits) and lock it.</span>'
);

code = code.replace(
  /<span>Repeat for \{calibCount\} different heights\.<\/span>/,
  '<span>Repeat for {calibCount} widely spaced, stable heights.</span>'
);

// Patch Step 2
const oldStep2P = /<p>\s*Set USB to a <strong className="text-white underline decoration-amber-400">\{measIndex === 0 \? 'low' : measIndex === calibCount - 1 \? 'high' : 'medium'\}<\/strong> height and lock collar\.\s*\{scope === 'both' && ' Do not alter height between bases\.'\}\s*<\/p>/;

const newStep2P = `<p>
                Set USB to a <strong className="text-white underline decoration-amber-400">{measIndex === 0 ? 'low' : measIndex === calibCount - 1 ? 'high' : 'medium'}</strong> stable height and lock collar. Avoid limits where the bar has play.
                {scope === 'both' && ' Do not alter height between bases.'}
              </p>`;

code = code.replace(oldStep2P, newStep2P);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched instructions!");
