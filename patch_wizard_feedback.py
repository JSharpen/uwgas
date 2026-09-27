with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

# I want to inject the live feedback block right below the description `<p className="text-xs text-white/50 leading-snug"> {desc} </p>`

old_desc_block = """            <p className="text-xs text-white/50 leading-snug">
              {desc}
            </p>"""

new_desc_block = """            <p className="text-xs text-white/50 leading-snug">
              {desc}
            </p>

            {/* Live Diagnostics Feedback (Requires >= 3 completed points) */}
            {measIndex >= 3 && (() => {
              // Calculate live error from previously completed rows
              let rErr: number | null = null;
              let fErr: number | null = null;
              let rPruned = -1;
              let fPruned = -1;

              if (scope === 'both' || scope === 'rear') {
                const rRows = rearRows.slice(0, measIndex).filter(r => r.hn !== '' && r.CAo !== '');
                if (rRows.length >= 3) {
                  const rRes = solveWithSmartPruning(rRows, calibDa, calibDs, 0.02);
                  if (rRes) {
                    const dummyMachine: MachineConfig = { ...activeMachine, constants: { ...activeMachine.constants, rear: { hc: rRes.hc, o: rRes.o } } };
                    rErr = estimateMaxAngleErrorDeg(rRes.diagnostics, 'rear', global, dummyMachine, wheels, jigs, usbs);
                    rPruned = rRes.diagnostics.prunedIndex ?? -1;
                  }
                }
              }

              if (scope === 'both' || scope === 'front') {
                const fRows = frontRows.slice(0, measIndex).filter(r => r.hn !== '' && r.CAo !== '');
                if (fRows.length >= 3) {
                  const fRes = solveWithSmartPruning(fRows, calibDa, calibDs, 0.02);
                  if (fRes) {
                    const dummyMachine: MachineConfig = { ...activeMachine, constants: { ...activeMachine.constants, front: { hc: fRes.hc, o: fRes.o } } };
                    fErr = estimateMaxAngleErrorDeg(fRes.diagnostics, 'front', global, dummyMachine, wheels, jigs, usbs);
                    fPruned = fRes.diagnostics.prunedIndex ?? -1;
                  }
                }
              }

              const maxErr = Math.max(rErr ?? 0, fErr ?? 0);
              const wasPruned = (rPruned === measIndex - 1) || (fPruned === measIndex - 1);

              if (maxErr === 0) return null;

              return (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-lg p-3">
                    <div className="flex-1 flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Current Precision</span>
                      <span className={`text-sm font-mono font-bold ${maxErr <= 0.015 ? 'text-emerald-400' : maxErr <= 0.05 ? 'text-amber-400' : 'text-red-400'}`}>
                        ±{maxErr.toFixed(3)}°
                      </span>
                    </div>
                    {maxErr <= 0.015 ? (
                      <Tag intent="success" appearance="solid">Flawless</Tag>
                    ) : (
                      <Tag intent="warning" appearance="outline">Refining...</Tag>
                    )}
                  </div>
                  
                  {wasPruned && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                      <span className="text-[12px] leading-none mt-0.5">⚠️</span>
                      <p className="text-[10px] text-red-200/90 font-medium leading-relaxed">
                        Your last measurement was detected as a statistical outlier and discarded by the solver. Please ensure the calipers are perfectly seated and try again.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}"""

if old_desc_block in text:
    text = text.replace(old_desc_block, new_desc_block)
else:
    print("Could not find desc block")

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
