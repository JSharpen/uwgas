const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const regex = /\{\/\* Step 2: Measuring \*\/\}\n\s*\{step === 'measuring' && \([\s\S]*?\}\n\s*\)\}\n\n\s*\{\/\* Step 3: Results \*\/\}/;

const newMeasuringStep = `{/* Step 2: Measuring */}
      {step === 'measuring' && (
        <div className="relative z-10 flex flex-col gap-3 w-full">
          {/* Instructions Banner */}
          <div className="px-3 py-2 bg-black/40 border border-amber-400/20 rounded-xl text-[11px] text-white/90 leading-tight flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[9px] block mb-0.5">
                Point {measIndex + 1} of {calibCount}
              </span>
              <p>
                Set USB to a <strong className="text-white underline decoration-amber-400">{measIndex === 0 ? 'low' : measIndex === calibCount - 1 ? 'high' : 'medium'}</strong> height and lock collar.
                {scope === 'both' && ' Do not alter height between bases.'}
              </p>
            </div>
          </div>

          {/* Rear Base Card */}
          {(scope === 'both' || scope === 'rear') && (
            <div className="bg-black/25 border border-white/5 border-l-2 border-l-blue-500 rounded-xl p-3 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-blue-400 tracking-wide flex items-center gap-2">
                  <span>Rear Base</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold uppercase">
                    Edge Leading
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold pl-1 truncate">
                    hₙ (Casing)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="h-10 bg-black/30 border border-white/5 focus:border-blue-400/60 rounded-lg pl-3 pr-8 text-sm font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition w-full"
                      placeholder="mm"
                      value={rearRows[measIndex]?.hn}
                      onChange={e => updateRear('hn', e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/30 pointer-events-none">
                      mm
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold pl-1 truncate">
                    CAₒ (Axle Top)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="h-10 bg-black/30 border border-white/5 focus:border-blue-400/60 rounded-lg pl-3 pr-8 text-sm font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition w-full"
                      placeholder="mm"
                      value={rearRows[measIndex]?.CAo}
                      onChange={e => updateRear('CAo', e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/30 pointer-events-none">
                      mm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Front Base Card */}
          {(scope === 'both' || scope === 'front') && (
            <div className="bg-black/25 border border-white/5 border-l-2 border-l-emerald-500 rounded-xl p-3 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-400 tracking-wide flex items-center gap-2">
                  <span>Front Base</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold uppercase">
                    Edge Trailing
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold pl-1 truncate">
                    hₙ (Casing)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="h-10 bg-black/30 border border-white/5 focus:border-emerald-400/60 rounded-lg pl-3 pr-8 text-sm font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition w-full"
                      placeholder="mm"
                      value={frontRows[measIndex]?.hn}
                      onChange={e => updateFront('hn', e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/30 pointer-events-none">
                      mm
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold pl-1 truncate">
                    CAₒ (Axle Top)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="h-10 bg-black/30 border border-white/5 focus:border-emerald-400/60 rounded-lg pl-3 pr-8 text-sm font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition w-full"
                      placeholder="mm"
                      value={frontRows[measIndex]?.CAo}
                      onChange={e => updateFront('CAo', e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/30 pointer-events-none">
                      mm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[11px] text-red-400 font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Results */}`;

code = code.replace(regex, newMeasuringStep);
fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Compacted measuring layout!");
