with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

# 1. Imports
text = text.replace("import { calculateOptimalMeasurementTargets, solveWithSmartPruning } from '../math/tormek';", 
                    "import { calculateOptimalMeasurementTargets, calculateNextOptimalTarget, solveWithSmartPruning } from '../math/tormek';")

# 2. Add Tracking State
state_block = """const [measIndex, setMeasIndex] = React.useState(0);
  const [noImprovementCount, setNoImprovementCount] = React.useState(0);
  const [bestError, setBestError] = React.useState<number | null>(null);"""
text = text.replace("const [measIndex, setMeasIndex] = React.useState(0);", state_block)

# 3. nextMeasurement logic
old_next = """  const nextMeasurement = React.useCallback(() => {
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
        computeResults(true); // Early exit!
        return;
      }
    }

    if (measIndex < INITIAL_COUNT - 1) {
      setMeasIndex(measIndex + 1);
    } else {
      computeResults(true);
    }
  }, [measIndex, computeResults, scope, rearRows, frontRows, calibDa, calibDs]);"""

new_next = """  const nextMeasurement = React.useCallback(() => {
    // Shared solver eval helper
    const evalCurrentError = (): number | null => {
      let rErr = 0; let fErr = 0;
      if (scope === 'both' || scope === 'rear') {
        const rRows = rearRows.slice(0, measIndex + 1).filter(r => r.hn !== '' && r.CAo !== '');
        const rRes = solveWithSmartPruning(rRows, calibDa, calibDs, 0.02);
        if (rRes) {
          const dummyMachine: MachineConfig = { ...activeMachine, constants: { ...activeMachine.constants, rear: { hc: rRes.hc, o: rRes.o } } };
          rErr = estimateMaxAngleErrorDeg(rRes.diagnostics, 'rear', global, dummyMachine, wheels, jigs, usbs) || 0;
        } else { return null; }
      }
      if (scope === 'both' || scope === 'front') {
        const fRows = frontRows.slice(0, measIndex + 1).filter(r => r.hn !== '' && r.CAo !== '');
        const fRes = solveWithSmartPruning(fRows, calibDa, calibDs, 0.02);
        if (fRes) {
          const dummyMachine: MachineConfig = { ...activeMachine, constants: { ...activeMachine.constants, front: { hc: fRes.hc, o: fRes.o } } };
          fErr = estimateMaxAngleErrorDeg(fRes.diagnostics, 'front', global, dummyMachine, wheels, jigs, usbs) || 0;
        } else { return null; }
      }
      return Math.max(rErr, fErr);
    };

    if (measIndex === 3) {
      // Early exit check at N=4
      const currentError = evalCurrentError();
      if (currentError !== null && currentError <= 0.015) {
        computeResults();
        return;
      }
    }

    if (measIndex >= 4) {
      // Endless loop stop conditions
      const currentError = evalCurrentError();
      if (currentError !== null) {
        if (currentError <= 0.015) {
          computeResults();
          return;
        }
        
        let newCount = noImprovementCount;
        let newBest = bestError;
        
        const IMPROVEMENT_EPSILON_DEG = 0.002;
        if (bestError === null || currentError < bestError - IMPROVEMENT_EPSILON_DEG) {
          newCount = 0;
          newBest = currentError;
        } else {
          newCount += 1;
        }
        
        setNoImprovementCount(newCount);
        setBestError(newBest);
        
        if (newCount >= 2) {
          // Ceiling hit.
          computeResults();
          return;
        }
      }
    }

    // Continue to next step
    if (measIndex + 1 >= rearRows.length) {
      setRearRows(prev => [...prev, { hn: '', CAo: '' }]);
      setFrontRows(prev => [...prev, { hn: '', CAo: '' }]);
    }
    setMeasIndex(measIndex + 1);
  }, [measIndex, computeResults, scope, rearRows, frontRows, calibDa, calibDs, activeMachine, global, wheels, jigs, usbs, noImprovementCount, bestError]);"""
text = text.replace(old_next, new_next)

# 4. Update the title/desc in measuring step
old_meas_body = """        if (measIndex === 0) {
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
            </div>"""

new_meas_body = """        if (measIndex === 0) {
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
        } else {
          title = 'Refining...';
          const validHns = (scope === 'both' || scope === 'rear') 
            ? rearRows.slice(0, measIndex).map(r => parseFloat(String(r.hn))) 
            : frontRows.slice(0, measIndex).map(r => parseFloat(String(r.hn)));
          targetHint = hasRearEnvelope ? calculateNextOptimalTarget(validHns, rearMin, rearMax) : 0;
          desc = `Let's refine this further to eliminate variance. Set USB near ≈ ${targetHint.toFixed(1)} mm.`;
        }

        return (
          <div className="relative z-10 flex flex-col gap-4 w-full pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
                Reading {measIndex + 1} {measIndex < INITIAL_COUNT ? `of ${INITIAL_COUNT}` : ''} · {title}
              </h3>
            </div>"""
text = text.replace(old_meas_body, new_meas_body)


with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)

print("Updated")
