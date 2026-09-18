const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const introStart = "{/* Step 1: Intro / Setup */}";
const target = "{step === 'intro' && (\n        <div className=\"relative z-10 flex flex-col gap-5 w-full\">";

const replacement = `{step === 'intro' && (
        <div className="relative z-10 flex flex-col gap-5 w-full">
          {/* Welcome / Context Banner */}
          <div className="p-4 sm:p-5 bg-amber-400/10 border border-amber-400/20 rounded-2xl flex flex-col gap-3 shadow-sm">
            <h3 className="text-sm sm:text-base font-bold text-amber-400 flex items-center gap-2">
              <span className="text-lg">📏</span> What is Geometry Mapping?
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              To calculate perfect sharpening angles, the pure math engine needs to know your specific machine's manufacturing tolerances. 
              You will need a <strong>digital caliper</strong>.
            </p>
            <div className="bg-black/30 rounded-xl p-3 flex flex-col gap-2 border border-white/5">
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">The Process</span>
              <ul className="text-xs text-white/70 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">1.</span>
                  <span>Set your USB to a random height and lock it.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">2.</span>
                  <span>Measure the height from the machine casing to the top of the USB bar (<strong className="text-white">hₙ</strong>).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">3.</span>
                  <span>Measure the height from the top of the drive axle to the top of the USB bar (<strong className="text-white">CAₒ</strong>).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">4.</span>
                  <span>Repeat for {calibCount} different heights.</span>
                </li>
              </ul>
            </div>
          </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched Step 1!");
