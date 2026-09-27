with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

# 1. Update ContextBar right slot
old_right_slot = """      <ContextBar.Slot name="right">
        {step === 'measuring' && (
          <ContextBar.Button
            variant="primary"
            disabled={!canProceed()}
            onClick={() => window.dispatchEvent(new CustomEvent('wizard-next'))}
          >
            {measIndex >= INITIAL_COUNT - 1 ? 'Analyse →' : 'Next →'}
          </ContextBar.Button>
        )}
        {step === 'intro' && ("""
new_right_slot = """      <ContextBar.Slot name="right">
        {step === 'measuring' && (
          <ContextBar.Button
            variant="primary"
            disabled={!canProceed()}
            onClick={() => window.dispatchEvent(new CustomEvent('wizard-next'))}
          >
            {measIndex >= INITIAL_COUNT - 1 ? 'Analyse →' : 'Next →'}
          </ContextBar.Button>
        )}
        {step === 'results' && (
          <ContextBar.Button
            variant="primary"
            onClick={handleSave}
          >
            Save Profile ✓
          </ContextBar.Button>
        )}
        {step === 'intro' && ("""
text = text.replace(old_right_slot, new_right_slot)

# 2. Results Header Text
old_header = """          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Geometry Solved</h3>
            <p className="text-xs text-white/60">Compare the mathematical engines below. True Least Squares is heavily recommended for maximum precision.</p>
          </div>"""
new_header = """          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Geometry Solved</h3>
            <p className="text-xs text-white/60">Your machine geometry has been successfully calculated and mathematically optimized for precision.</p>
          </div>"""
text = text.replace(old_header, new_header)

# 3. Precision Cards
old_precision = """          {/* Potential Improvement Banner */}
          {(() => {
            const worstError = Math.max(rearResult?.angleErrorDeg ?? 0, frontResult?.angleErrorDeg ?? 0);
            if (worstError > 0.015) {
              const diff = worstError - 0.015;
              return (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-[var(--ui-radius-core)] p-4 flex gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="text-xl leading-none">💡</span>
                  <div className="flex flex-col gap-1">
                    <strong className="text-sm text-amber-400 font-bold tracking-tight">Precision Check</strong>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      Your mapping has a {worstError.toFixed(3)}° worst-case error. The mathematical limit for your calipers is ≈ 0.015°, meaning you have <strong>{diff.toFixed(3)}° of potential improvement</strong> left.
                      You can save this best-effort result now, and run a fresh calibration later to perfect it.
                    </p>
                  </div>
                </div>
              );
            }
            return (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[var(--ui-radius-core)] p-4 flex gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-xl leading-none">🏆</span>
                <div className="flex flex-col gap-1">
                  <strong className="text-sm text-emerald-400 font-bold tracking-tight">Caliper Limit Reached</strong>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    Your mapping error is {(worstError || 0).toFixed(3)}°, which is at or below the theoretical limit of your calipers. Flawless mapping achieved!
                  </p>
                </div>
              </div>
            );
          })()}"""
new_precision = """          {/* Potential Improvement Banner */}
          {(() => {
            const worstError = Math.max(rearResult?.angleErrorDeg ?? 0, frontResult?.angleErrorDeg ?? 0);
            if (worstError > 0.015) {
              const diff = worstError - 0.015;
              return (
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-900/10 border border-amber-500/20 rounded-[var(--ui-radius-core)] p-5 flex gap-4 shadow-[0_4px_20px_rgba(245,158,11,0.05)] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                  <div className="relative z-10 text-2xl leading-none pt-0.5 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">💡</div>
                  <div className="relative z-10 flex flex-col gap-1.5">
                    <strong className="text-[13px] text-amber-400 font-extrabold tracking-tight">Precision Check</strong>
                    <p className="text-xs text-amber-100/80 leading-relaxed font-medium">
                      Your mapping has a {worstError.toFixed(3)}° worst-case error. The physical limit of your calipers is ≈ 0.015°, meaning you have <strong className="text-amber-300">{diff.toFixed(3)}° of potential improvement</strong> left.
                    </p>
                  </div>
                </div>
              );
            }
            return (
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 border border-emerald-500/20 rounded-[var(--ui-radius-core)] p-5 flex gap-4 shadow-[0_4px_20px_rgba(16,185,129,0.05)] animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                <div className="relative z-10 text-2xl leading-none pt-0.5 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">🏆</div>
                <div className="relative z-10 flex flex-col gap-1.5">
                  <strong className="text-[13px] text-emerald-400 font-extrabold tracking-tight">Flawless Mapping</strong>
                  <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                    Your mapping error is {(worstError || 0).toFixed(3)}°, which is perfectly inside the physical noise floor of your calipers.
                  </p>
                </div>
              </div>
            );
          })()}"""
text = text.replace(old_precision, new_precision)

# 4. Rear Base Card
old_rear_table = """              <table className="w-full text-left text-xs text-white/70">
                <thead>
                  <tr>
                    <th className="pb-2 uppercase text-[9px] text-white/40 tracking-wider">Metric</th>
                    <th className="pb-2 text-right uppercase text-[9px] tracking-wider text-white">Result</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-t border-white/10">
                    <td className="py-2">h_c</td>
                    <td className="py-2 text-right font-bold text-white">{rearResult.hc.toFixed(4)}</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2">o</td>
                    <td className="py-2 text-right font-bold text-white">{rearResult.o.toFixed(4)}</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2 text-[10px] text-white/40">Max ε</td>
                    <td className="py-2 text-right text-[10px]">{rearResult.diagnostics.maxAbsResidualMm.toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>"""
new_rear_table = """              <div className="flex flex-col mt-2">
                <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">h_c</span>
                  <span className="text-xs font-mono font-bold text-white">{rearResult.hc.toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">o</span>
                  <span className="text-xs font-mono font-bold text-white">{rearResult.o.toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Max ε</span>
                  <span className="text-xs font-mono text-white/70">{rearResult.diagnostics.maxAbsResidualMm.toFixed(3)} mm</span>
                </div>
              </div>"""
text = text.replace(old_rear_table, new_rear_table)

# 5. Front Base Card
old_front_table = """              <table className="w-full text-left text-xs text-white/70">
                <thead>
                  <tr>
                    <th className="pb-2 uppercase text-[9px] text-white/40 tracking-wider">Metric</th>
                    <th className="pb-2 text-right uppercase text-[9px] tracking-wider text-white">Result</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-t border-white/10">
                    <td className="py-2">h_c</td>
                    <td className="py-2 text-right font-bold text-white">{frontResult.hc.toFixed(4)}</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2">o</td>
                    <td className="py-2 text-right font-bold text-white">{frontResult.o.toFixed(4)}</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2 text-[10px] text-white/40">Max ε</td>
                    <td className="py-2 text-right text-[10px]">{frontResult.diagnostics.maxAbsResidualMm.toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>"""
new_front_table = """              <div className="flex flex-col mt-2">
                <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">h_c</span>
                  <span className="text-xs font-mono font-bold text-white">{frontResult.hc.toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">o</span>
                  <span className="text-xs font-mono font-bold text-white">{frontResult.o.toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Max ε</span>
                  <span className="text-xs font-mono text-white/70">{frontResult.diagnostics.maxAbsResidualMm.toFixed(3)} mm</span>
                </div>
              </div>"""
text = text.replace(old_front_table, new_front_table)

# 6. Action Buttons at bottom
old_actions = """          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
            <button
              type="button"
              className="h-12 px-5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold text-xs transition flex items-center justify-center cursor-pointer"
              onClick={() => {
                setRearRows(Array(INITIAL_COUNT).fill({ hn: '', CAo: '' }));
                setFrontRows(Array(INITIAL_COUNT).fill({ hn: '', CAo: '' }));
                setMeasIndex(0);
                setNoImprovementCount(0);
                setBestError(null);
                setStep('measuring');
              }}
            >
              ← Re-measure
            </button>
            <button
              type="button"
              className="h-12 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-950/30 transition flex items-center justify-center cursor-pointer"
              onClick={handleSave}
            >
              Save Profile ✓
            </button>
          </div>"""
new_actions = """          {/* Action Buttons */}
          <div className="flex justify-center pt-6 pb-2">
            <button
              type="button"
              className="px-6 py-2 rounded-full hover:bg-white/5 active:bg-white/10 text-white/40 hover:text-white/80 font-bold text-[10px] uppercase tracking-wider transition cursor-pointer"
              onClick={() => {
                setRearRows(Array(INITIAL_COUNT).fill({ hn: '', CAo: '' }));
                setFrontRows(Array(INITIAL_COUNT).fill({ hn: '', CAo: '' }));
                setMeasIndex(0);
                setNoImprovementCount(0);
                setBestError(null);
                setStep('measuring');
              }}
            >
              ← Re-measure Entire Envelope
            </button>
          </div>"""
text = text.replace(old_actions, new_actions)

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
