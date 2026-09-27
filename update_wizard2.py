with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

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
        computeResults(); // Early exit!
        return;
      }
    }

    if (measIndex < INITIAL_COUNT - 1) {
      setMeasIndex(measIndex + 1);
    } else {
      computeResults();
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

if old_next in text:
    text = text.replace(old_next, new_next)
else:
    print("WARNING: nextMeasurement not matched!")

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
