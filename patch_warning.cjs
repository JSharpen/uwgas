const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const anchor = '{/* Rear Base Result Card */}';

const warningBanner = `
          {/* Outlier Warning */}
          {(
            (rearResult.ls?.diagnostics?.maxAbsResidualMm ?? 0) > 0.5 ||
            (frontResult.ls?.diagnostics?.maxAbsResidualMm ?? 0) > 0.5
          ) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-xl leading-none">⚠️</span>
              <div className="flex flex-col gap-1">
                <strong className="text-sm text-red-400 font-bold tracking-tight">Measurement Outlier Detected</strong>
                <p className="text-xs text-red-300/80 leading-relaxed">
                  The solver detected a high residual error (deviation &gt; 0.5mm). This typically means a measurement was misread, or the calipers were not seated perfectly flush. We strongly recommend going back to verify your measurements.
                </p>
              </div>
            </div>
          )}

          `;

code = code.replace(anchor, warningBanner + anchor);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Added outlier warning banner!");
