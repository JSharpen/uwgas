const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const target = `{/* Rear Base Card */}`;

const replacement = `{/* Measurement Guide Accordion */}
          <details className="group bg-black/20 border border-white/5 rounded-xl transition-all">
            <summary className="text-[10px] uppercase tracking-widest font-bold text-amber-400/80 hover:text-amber-400 cursor-pointer select-none flex items-center justify-between p-3">
              <span>How do I measure these?</span>
              <span className="text-lg leading-none transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="p-3 pt-0 text-xs text-white/70 flex flex-col gap-3 border-t border-white/5 mt-2">
              <div className="flex flex-col gap-1">
                <strong className="text-white">hₙ (Casing Datum)</strong>
                <p>Rest the bottom of your calipers on the flat machine casing right next to the USB sleeve. Extend the top jaw to the top of the USB bar.</p>
              </div>
              <div className="flex flex-col gap-1">
                <strong className="text-white">CAₒ (Axle Top)</strong>
                <p>Rest the bottom of your calipers on the very top curve of the main drive axle (where the wheel mounts). Extend the top jaw to the top of the USB bar.</p>
              </div>
            </div>
          </details>

          {/* Rear Base Card */}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched Step 2!");
