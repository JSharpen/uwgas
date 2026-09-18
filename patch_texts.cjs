const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// 1. Update Warning Banner
const oldWarning = `This typically means a measurement was misread, or the calipers were not seated perfectly flush. We strongly recommend going back to verify your measurements.`;
const newWarning = `This typically means a measurement was misread, the calipers were not seated flush, or they were tilted diagonally to reach a datum point instead of being perfectly vertical. We strongly recommend going back to verify your measurements.`;
code = code.replace(oldWarning, newWarning);

// 2. Update the Custom Datum text
const oldDatumText = `<p>Rest the bottom of your calipers on your chosen datum (usually the flat machine casing next to the USB sleeve) and extend the top jaw to the top of the USB bar.</p>
                <div className="mt-0.5 bg-amber-400/10 border border-amber-400/20 rounded-lg p-2 text-[10.5px] text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-400 block mb-0.5">💡 Datum-Agnostic Solver</strong>
                  You can select ANY flat, consistent horizontal surface as your zero-reference point. This makes the tool compatible with entirely custom builds or non-standard machines. Just ensure you measure from this exact same datum when setting your target heights later!
                </div>`;

const newDatumText = `<p>Rest the bottom of your calipers on your chosen datum (usually the flat machine casing right beneath the USB) and extend the top jaw to the top of the USB bar.</p>
                <div className="mt-0.5 bg-amber-400/10 border border-amber-400/20 rounded-lg p-2.5 text-[10px] text-amber-200/90 leading-relaxed flex flex-col gap-1.5">
                  <strong className="text-amber-400 text-[11px] block">💡 Choosing a Custom Datum</strong>
                  <p>Our math engine lets you use ANY flat, horizontal surface as your zero-point (perfect for custom builds), provided you follow two strict rules:</p>
                  <ul className="list-disc pl-3.5 space-y-1 text-amber-200/80">
                    <li>You must be able to hold your calipers <strong className="text-amber-300">perfectly vertical</strong> (straight up and down). <strong>Never tilt them diagonally</strong> to reach a spot off to the side, as this will corrupt the calibration math.</li>
                    <li>You must measure from this exact same surface whenever you set sharpening heights in the future.</li>
                  </ul>
                </div>`;

code = code.replace(oldDatumText, newDatumText);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched texts!");
