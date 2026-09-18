const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const regex = /\{\/\* Step 3: Results \*\/\}\n\s*\{step === 'results' && \([\s\S]*?^\s*<\/section>/m;

const newStep3 = `{/* Step 3: Results */}
      {step === 'results' && (
        <div className="relative z-10 flex flex-col gap-6 w-full pb-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Geometry Solved</h3>
            <p className="text-xs text-white/60">Compare the mathematical engines below. True Least Squares is heavily recommended for maximum precision.</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
              Select Solver Engine to Save
            </span>
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                className={\`flex-1 py-2 text-xs font-bold rounded-lg transition-colors \${solverMode === 'least-squares' ? 'bg-amber-400 text-black shadow-sm' : 'text-white/50 hover:text-white/80'}\`}
                onClick={() => setSolverMode('least-squares')}
              >
                True Least Squares
              </button>
              <button
                type="button"
                className={\`flex-1 py-2 text-xs font-bold rounded-lg transition-colors \${solverMode === 'legacy' ? 'bg-amber-400 text-black shadow-sm' : 'text-white/50 hover:text-white/80'}\`}
                onClick={() => setSolverMode('legacy')}
              >
                Legacy Algebraic
              </button>
            </div>
          </div>

          {/* Rear Base Result Card */}
          {(rearResult.ls || rearResult.legacy) && (
            <div className="bg-black/25 border border-white/5 border-l-4 border-l-blue-500 rounded-3xl p-5 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-blue-400">Rear Base</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-bold uppercase">Edge Leading</span>
                </div>
                {renderDiagnosticBadge(solverMode === 'least-squares' ? rearResult.ls?.angleErrorDeg ?? null : rearResult.legacy?.angleErrorDeg ?? null)}
              </div>
              <table className="w-full text-left text-xs text-white/70">
                <thead>
                  <tr>
                    <th className="pb-2 uppercase text-[9px] text-white/40 tracking-wider">Metric</th>
                    <th className={\`pb-2 text-right uppercase text-[9px] tracking-wider \${solverMode === 'least-squares' ? 'text-amber-400' : 'text-white/40'}\`}>Least Sq</th>
                    <th className={\`pb-2 text-right uppercase text-[9px] tracking-wider \${solverMode === 'legacy' ? 'text-amber-400' : 'text-white/40'}\`}>Legacy</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-t border-white/10">
                    <td className="py-2">h_c</td>
                    <td className={\`py-2 text-right \${solverMode === 'least-squares' ? 'font-bold text-white' : 'text-white/40'}\`}>{rearResult.ls?.hc.toFixed(4) ?? '-'}</td>
                    <td className={\`py-2 text-right \${solverMode === 'legacy' ? 'font-bold text-white' : 'text-white/40'}\`}>{rearResult.legacy?.hc.toFixed(4) ?? '-'}</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2">o</td>
                    <td className={\`py-2 text-right \${solverMode === 'least-squares' ? 'font-bold text-white' : 'text-white/40'}\`}>{rearResult.ls?.o.toFixed(4) ?? '-'}</td>
                    <td className={\`py-2 text-right \${solverMode === 'legacy' ? 'font-bold text-white' : 'text-white/40'}\`}>{rearResult.legacy?.o.toFixed(4) ?? '-'}</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2 text-[10px] text-white/40">Max ε</td>
                    <td className="py-2 text-right text-[10px]">{rearResult.ls?.diagnostics?.maxAbsResidualMm?.toFixed(3) ?? '-'}</td>
                    <td className="py-2 text-right text-[10px]">{rearResult.legacy?.diagnostics?.maxAbsResidualMm?.toFixed(3) ?? '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Front Base Result Card */}
          {(frontResult.ls || frontResult.legacy) && (
            <div className="bg-black/25 border border-white/5 border-l-4 border-l-emerald-500 rounded-3xl p-5 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-emerald-400">Front Base</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold uppercase">Edge Trailing</span>
                </div>
                {renderDiagnosticBadge(solverMode === 'least-squares' ? frontResult.ls?.angleErrorDeg ?? null : frontResult.legacy?.angleErrorDeg ?? null)}
              </div>
              <table className="w-full text-left text-xs text-white/70">
                <thead>
                  <tr>
                    <th className="pb-2 uppercase text-[9px] text-white/40 tracking-wider">Metric</th>
                    <th className={\`pb-2 text-right uppercase text-[9px] tracking-wider \${solverMode === 'least-squares' ? 'text-amber-400' : 'text-white/40'}\`}>Least Sq</th>
                    <th className={\`pb-2 text-right uppercase text-[9px] tracking-wider \${solverMode === 'legacy' ? 'text-amber-400' : 'text-white/40'}\`}>Legacy</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-t border-white/10">
                    <td className="py-2">h_c</td>
                    <td className={\`py-2 text-right \${solverMode === 'least-squares' ? 'font-bold text-white' : 'text-white/40'}\`}>{frontResult.ls?.hc.toFixed(4) ?? '-'}</td>
                    <td className={\`py-2 text-right \${solverMode === 'legacy' ? 'font-bold text-white' : 'text-white/40'}\`}>{frontResult.legacy?.hc.toFixed(4) ?? '-'}</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2">o</td>
                    <td className={\`py-2 text-right \${solverMode === 'least-squares' ? 'font-bold text-white' : 'text-white/40'}\`}>{frontResult.ls?.o.toFixed(4) ?? '-'}</td>
                    <td className={\`py-2 text-right \${solverMode === 'legacy' ? 'font-bold text-white' : 'text-white/40'}\`}>{frontResult.legacy?.o.toFixed(4) ?? '-'}</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2 text-[10px] text-white/40">Max ε</td>
                    <td className="py-2 text-right text-[10px]">{frontResult.ls?.diagnostics?.maxAbsResidualMm?.toFixed(3) ?? '-'}</td>
                    <td className="py-2 text-right text-[10px]">{frontResult.legacy?.diagnostics?.maxAbsResidualMm?.toFixed(3) ?? '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
            <button
              type="button"
              className="h-12 px-5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold text-xs transition flex items-center justify-center cursor-pointer"
              onClick={() => setStep('measuring')}
            >
              ← Edit
            </button>
            <button
              type="button"
              className="h-12 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-950/30 transition flex items-center justify-center cursor-pointer"
              onClick={handleSave}
            >
              Save Profile ✓
            </button>
          </div>
        </div>
      )}
    </section>`;

code = code.replace(regex, newStep3);
fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched Step 3!");
