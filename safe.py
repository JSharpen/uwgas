with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

def replace_between(start_str, end_str, replacement):
    global text
    idx1 = text.find(start_str)
    if idx1 == -1: raise Exception(f"Start not found: {start_str[:30]}")
    idx2 = text.find(end_str, idx1)
    if idx2 == -1: raise Exception(f"End not found: {end_str[:30]}")
    text = text[:idx1] + replacement + text[idx2:]

# 1. Imports
text = text.replace(
    "import { calibrateBase, computeTonHeights, estimateMaxAngleErrorDeg } from '../math/tormek';",
    "import { calibrateBase, computeTonHeights, calculateOptimalMeasurementTargets, solveWithSmartPruning, estimateMaxAngleErrorDeg } from '../math/tormek';"
)
text = text.replace(
    "import { calibrateBase } from '../math/tormek';",
    "import { calculateOptimalMeasurementTargets, solveWithSmartPruning } from '../math/tormek';"
)

# 2. constants
text = text.replace('const INITIAL_COUNT = 3;', 'const INITIAL_COUNT = 5;')

# 3. Remove zone labels
replace_between('const IMPROVEMENT_EPSILON_DEG', 'const [measIndex, setMeasIndex]', '')

# 4. Remove adaptive state
replace_between('const [adaptiveState, setAdaptiveState]', 'const computeResults = React.useCallback', '')

# 5. computeResults
compute_results = """const computeResults = React.useCallback((forceResults = false, preventNavigation = false) => {
    setErrorMsg(null);
    let rRes = null;
    let fRes = null;

    if (scope === 'both' || scope === 'rear') {
      rRes = solveWithSmartPruning(rearRows.filter(r => r.hn !== '' && r.CAo !== ''), calibDa, calibDs, 0.02);
      if (!rRes) {
        setErrorMsg('Failed to calibrate rear base. Check your height and axle measurements.');
        return;
      }
    }

    if (scope === 'both' || scope === 'front') {
      fRes = solveWithSmartPruning(frontRows.filter(r => r.hn !== '' && r.CAo !== ''), calibDa, calibDs, 0.02);
      if (!fRes) {
        setErrorMsg('Failed to calibrate front base. Check your height and axle measurements.');
        return;
      }
    }

    const calcError = (res: any, side: 'rear' | 'front') => {
      if (!res) return null;
      const dummyMachine: MachineConfig = {
        ...activeMachine,
        constants: { ...activeMachine.constants, [side]: { hc: res.hc, o: res.o } },
      };
      return estimateMaxAngleErrorDeg(res.diagnostics, side, global, dummyMachine, wheels, jigs, usbs);
    };

    setRearResult(rRes ? { hc: rRes.hc, o: rRes.o, diagnostics: rRes.diagnostics, angleErrorDeg: calcError(rRes, 'rear') } : null);
    setFrontResult(fRes ? { hc: fRes.hc, o: fRes.o, diagnostics: fRes.diagnostics, angleErrorDeg: calcError(fRes, 'front') } : null);

    if (preventNavigation) return;
    setStep('results');
  }, [scope, rearRows, frontRows, calibDa, calibDs, activeMachine, global, wheels, jigs, usbs, setStep]);

  """
replace_between('const computeResults = React.useCallback(', 'const startMeasuring = React.useCallback(', compute_results)

# 6. nextMeasurement
next_meas = """const nextMeasurement = React.useCallback(() => {
    if (measIndex === 3) {
      let rPass = true;
      let fPass = true;
      if (scope === 'both' || scope === 'rear') {
        const rRows = rearRows.slice(0, 4).filter(r => r.hn !== '' && r.CAo !== '');
        const rRes = rRows.length === 4 ? solveWithSmartPruning(rRows, calibDa, calibDs, 0.02) : null;
        rPass = !!rRes && rRes.diagnostics.maxAbsResidualMm <= 0.02;
      }
      if (scope === 'both' || scope === 'front') {
        const fRows = frontRows.slice(0, 4).filter(r => r.hn !== '' && r.CAo !== '');
        const fRes = fRows.length === 4 ? solveWithSmartPruning(fRows, calibDa, calibDs, 0.02) : null;
        fPass = !!fRes && fRes.diagnostics.maxAbsResidualMm <= 0.02;
      }
      if (rPass && fPass) {
        computeResults(); // Early exit!
        return;
      }
    }

    if (measIndex < INITIAL_COUNT - 1) {
      setMeasIndex(measIndex + 1);
    } else {
      computeResults();
    }
  }, [measIndex, computeResults, scope, rearRows, frontRows, calibDa, calibDs]);

  """
replace_between('const nextMeasurement = React.useCallback(() => {', 'const prevMeasurement = React.useCallback(() => {', next_meas)

# 7. Remove useEffects for pendingFinalCompute
replace_between('// Editing an existing profile:', '// ── Measuring step helpers', '')

# 8. Adaptive Helpers
replace_between('// ── Adaptive improvement helpers ──', '// ── Diagnostic badge renderer ──', '')

# 9. Save logic
save_logic = """const profile: CalibrationProfile = {
      id: initialProfile?.id ?? generateId(),
      name: profileName,
      createdAt: initialProfile?.createdAt ?? new Date().toISOString(),
      scope,
      Da: calibDa,
      Ds: calibDs,
    };

    const getEnvelope = (rows: CalibrationMeasurement[]) => {
      if (rows.length < 2) return undefined;
      const h0 = parseFloat(String(rows[0].hn));
      const h1 = parseFloat(String(rows[1].hn));
      if (!Number.isFinite(h0) || !Number.isFinite(h1)) return undefined;
      return { minHn: Math.min(h0, h1), maxHn: Math.max(h0, h1) };
    };

    const rearToSave = rearResult;
    if (rearToSave) {
      profile.rear = {
        hc: rearToSave.hc,
        o: rearToSave.o,
        diagnostics: rearToSave.diagnostics,
        angleErrorDeg: rearToSave.angleErrorDeg,
        measurements: rearRows.filter(r => r.hn !== '' && r.CAo !== ''),
        physicalEnvelope: getEnvelope(rearRows),
      };
    }

    const frontToSave = frontResult;
    if (frontToSave) {
      profile.front = {
        hc: frontToSave.hc,
        o: frontToSave.o,
        diagnostics: frontToSave.diagnostics,
        angleErrorDeg: frontToSave.angleErrorDeg,
        measurements: frontRows.filter(r => r.hn !== '' && r.CAo !== ''),
        physicalEnvelope: getEnvelope(frontRows),
      };
    }

    """
replace_between('const profile: CalibrationProfile = {', 'onSaveProfile(profile);', save_logic)

# 10. Main Body - Measuring Step
meas_body = """{/* Step 2: Measuring */}
      {step === 'measuring' && (() => {
        let title = '';
        let desc = '';
        let targetHint: number | null = null;
        
        const rH0 = parseFloat(String(rearRows[0]?.hn));
        const rH1 = parseFloat(String(rearRows[1]?.hn));
        const hasRearEnvelope = Number.isFinite(rH0) && Number.isFinite(rH1);
        const rearMin = hasRearEnvelope ? Math.min(rH0, rH1) : 0;
        const rearMax = hasRearEnvelope ? Math.max(rH0, rH1) : 0;
        
        const hints = hasRearEnvelope ? calculateOptimalMeasurementTargets(rearMin, rearMax) : [0,0,0];

        if (measIndex === 0) {
          title = 'Low Travel';
          desc = 'Drop USB to a low position, a few turns from the bottom. Lock collar, then measure.';
        } else if (measIndex === 1) {
          title = 'High Travel';
          desc = 'Set USB high, near the top of its stable travel. Ensure the bar is firmly supported without wobble, then lock collar.';
        } else if (measIndex === 2) {
          title = 'Midpoint';
          targetHint = hints[0];
          desc = `Set USB near ≈ ${targetHint.toFixed(1)} mm (midway along your travel). Lock collar, then measure.`;
        } else if (measIndex === 3) {
          title = 'Lower-Mid';
          targetHint = hints[1];
          desc = `Set USB near ≈ ${targetHint.toFixed(1)} mm. Lock collar, then measure.`;
        } else if (measIndex === 4) {
          title = 'Upper-Mid';
          targetHint = hints[2];
          desc = `Set USB near ≈ ${targetHint.toFixed(1)} mm. Lock collar, then measure.`;
        }

        return (
          <div className="relative z-10 flex flex-col gap-4 w-full pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
                Reading {measIndex + 1} of {INITIAL_COUNT} · {title}
              </h3>
            </div>

            <p className="text-xs text-white/50 leading-snug">
              {desc}
            </p>

            {/* Rear Base Card */}
            {(scope === 'both' || scope === 'rear') && (
              <div className="bg-black/25 border border-white/5 border-l-2 border-l-blue-500 rounded-xl p-3 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-blue-400 tracking-wide flex items-center gap-2">
                    <span>Rear Base</span>
                    <Tag intent="primary" appearance="outline">
                      Edge Leading
                    </Tag>
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold pl-1 truncate">
                      hₙ (Datum)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        className="h-10 bg-black/30 border border-white/5 focus:border-blue-400/60 rounded-lg pl-3 pr-8 text-sm font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition w-full"
                        placeholder="mm"
                        value={rearRows[measIndex]?.hn}
                        onChange={e => updateRear('hn', e.target.value)}
                        autoFocus
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
                    <Tag intent="success" appearance="outline">
                      Edge Trailing
                    </Tag>
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold pl-1 truncate">
                      hₙ (Datum)
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
        );
      })()}

      """
replace_between('{/* Step 2: Measuring */}', '{/* Step 3: Review', meas_body)


# 11. Remove Review Body
replace_between('{/* Step 3: Review — Quality Gate / Adaptive Improvement Loop */}', '{/* Step 4: Results */}', '')


# 12. Add results improvement banner
idx1 = text.find('{/* Outlier Warning */}')
banner = """{/* Potential Improvement Banner */}
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
          })()}

          """
text = text[:idx1] + banner + text[idx1:]


# 13. Fix the review button
text = text.replace("onClick={() => setStep('review')}", "onClick={() => { setStep('measuring'); setMeasIndex(INITIAL_COUNT - 1); }}")

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)

print("Safe script completed.")
