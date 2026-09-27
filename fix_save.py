import re
with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

save_new = """    const profile: CalibrationProfile = {
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
    }"""
text = re.sub(r'    const profile: CalibrationProfile = \{.*?\n    \}', save_new, text, flags=re.DOTALL)

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
