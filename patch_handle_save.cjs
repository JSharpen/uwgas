const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const oldFn = `  const handleSave = () => {
    let profileName = calibName.trim();
    if (!profileName) {
      setValidationError('Profile name is required');
      return;
    }
    setValidationError(null);

    const profile: CalibrationProfile = {
      id: \`calib-\${Date.now()}\`,
      name: profileName,
      createdAt: Date.now(),
      machineId: activeMachine.id,
      rear: undefined,
      front: undefined,
    };

    if (rearResult) {
      profile.rear = {
        hc: rearResult.hc,
        o: rearResult.o,
        diagnostics: rearResult.diagnostics,
        angleErrorDeg: rearResult.angleErrorDeg,
        measurements: rearRows,
      };
    }

    if (frontResult) {
      profile.front = {
        hc: frontResult.hc,
        o: frontResult.o,
        diagnostics: frontResult.diagnostics,
        angleErrorDeg: frontResult.angleErrorDeg,
        measurements: frontRows,
      };
    }

    onSaveProfile(profile);
  };`;

const newFn = `  const handleSave = () => {
    let profileName = calibName.trim();
    if (!profileName) {
      setValidationError('Profile name is required');
      return;
    }
    setValidationError(null);
    
    const tag = solverMode === 'least-squares' ? ' (Least Squares)' : ' (Legacy)';
    if (!profileName.includes(tag)) {
        profileName += tag;
    }

    const profile: CalibrationProfile = {
      id: \`calib-\${Date.now()}\`,
      name: profileName,
      createdAt: Date.now(),
      machineId: activeMachine.id,
      rear: undefined,
      front: undefined,
    };

    const rearToSave = solverMode === 'least-squares' ? rearResult.ls : rearResult.legacy;
    if (rearToSave) {
      profile.rear = {
        hc: rearToSave.hc,
        o: rearToSave.o,
        diagnostics: rearToSave.diagnostics,
        angleErrorDeg: rearToSave.angleErrorDeg,
        measurements: rearRows,
      };
    }

    const frontToSave = solverMode === 'least-squares' ? frontResult.ls : frontResult.legacy;
    if (frontToSave) {
      profile.front = {
        hc: frontToSave.hc,
        o: frontToSave.o,
        diagnostics: frontToSave.diagnostics,
        angleErrorDeg: frontToSave.angleErrorDeg,
        measurements: frontRows,
      };
    }

    onSaveProfile(profile);
  };`;

code = code.replace(oldFn, newFn);
fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched handleSave!");
