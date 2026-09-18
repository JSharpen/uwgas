const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const oldFn = `  const computeResults = () => {
    setErrorMsg(null);
    let rRes = null;
    let fRes = null;

    if (scope === 'both' || scope === 'rear') {
      rRes = calibrateBase(rearRows, calibDa, calibDs);
      if (!rRes) {
        setErrorMsg('Failed to calibrate rear base. Check your height and axle measurements.');
        return;
      }
    }
    if (scope === 'both' || scope === 'front') {
      fRes = calibrateBase(frontRows, calibDa, calibDs);
      if (!fRes) {
        setErrorMsg('Failed to calibrate front base. Check your height and axle measurements.');
        return;
      }
    }

    // Estimate angle errors
    let rAngleError = null;
    let fAngleError = null;

    if (rRes) {
      const dummyMachine: MachineConfig = {
        ...activeMachine,
        constants: { ...activeMachine.constants, rear: { hc: rRes.hc, o: rRes.o } },
      };
      rAngleError = estimateMaxAngleErrorDeg(rRes.diagnostics, 'rear', global, dummyMachine, wheels, jigs, usbs);
    }
    if (fRes) {
      const dummyMachine: MachineConfig = {
        ...activeMachine,
        constants: { ...activeMachine.constants, front: { hc: fRes.hc, o: fRes.o } },
      };
      fAngleError = estimateMaxAngleErrorDeg(fRes.diagnostics, 'front', global, dummyMachine, wheels, jigs, usbs);
    }

    if (rRes) setRearResult({ hc: rRes.hc, o: rRes.o, diagnostics: rRes.diagnostics, angleErrorDeg: rAngleError });
    if (fRes) setFrontResult({ hc: fRes.hc, o: fRes.o, diagnostics: fRes.diagnostics, angleErrorDeg: fAngleError });

    setStep('results');
  };`;

const newFn = `  const computeResults = () => {
    setErrorMsg(null);
    
    let rResLeg = null;
    let rResLS = null;
    let fResLeg = null;
    let fResLS = null;

    if (scope === 'both' || scope === 'rear') {
      rResLeg = calibrateBase(rearRows, calibDa, calibDs);
      rResLS = calibrateBaseTrueLeastSquares(rearRows, calibDa, calibDs);
      if (!rResLeg || !rResLS) {
        setErrorMsg('Failed to calibrate rear base. Check your height and axle measurements.');
        return;
      }
    }
    
    if (scope === 'both' || scope === 'front') {
      fResLeg = calibrateBase(frontRows, calibDa, calibDs);
      fResLS = calibrateBaseTrueLeastSquares(frontRows, calibDa, calibDs);
      if (!fResLeg || !fResLS) {
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

    setRearResult({
      legacy: rResLeg ? { hc: rResLeg.hc, o: rResLeg.o, diagnostics: rResLeg.diagnostics, angleErrorDeg: calcError(rResLeg, 'rear') } : null,
      ls: rResLS ? { hc: rResLS.hc, o: rResLS.o, diagnostics: rResLS.diagnostics, angleErrorDeg: calcError(rResLS, 'rear') } : null,
    });

    setFrontResult({
      legacy: fResLeg ? { hc: fResLeg.hc, o: fResLeg.o, diagnostics: fResLeg.diagnostics, angleErrorDeg: calcError(fResLeg, 'front') } : null,
      ls: fResLS ? { hc: fResLS.hc, o: fResLS.o, diagnostics: fResLS.diagnostics, angleErrorDeg: calcError(fResLS, 'front') } : null,
    });

    setStep('results');
  };`;

code = code.replace(oldFn, newFn);
fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched computeResults!");
