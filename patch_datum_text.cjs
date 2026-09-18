const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const target = `<div className="flex flex-col gap-1">
                <strong className="text-white">hₙ (Casing Datum)</strong>
                <p>Rest the bottom of your calipers on the flat machine casing right next to the USB sleeve. Extend the top jaw to the top of the USB bar.</p>
              </div>`;

const replacement = `<div className="flex flex-col gap-1.5">
                <strong className="text-white">hₙ (Datum Height)</strong>
                <p>Rest the bottom of your calipers on your chosen datum (usually the flat machine casing next to the USB sleeve) and extend the top jaw to the top of the USB bar.</p>
                <div className="mt-0.5 bg-amber-400/10 border border-amber-400/20 rounded-lg p-2 text-[10.5px] text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-400 block mb-0.5">💡 Datum-Agnostic Solver</strong>
                  You can select ANY flat, consistent horizontal surface as your zero-reference point. This makes the tool compatible with entirely custom builds or non-standard machines. Just ensure you measure from this exact same datum when setting your target heights later!
                </div>
              </div>`;

code = code.replace(target, replacement);

// Let's also make sure we update any other labels where it says "hₙ (Casing Datum)" or "hₙ (Casing)"
code = code.replace(/hₙ \(Casing\)/g, 'hₙ (Datum)');

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched datum text!");
