with open('src/math/tormek.ts', 'r') as f:
    text = f.read()

old_logic = """  // 1. Try all 5 points first
  const fullRes = calibrateBase(rows, Da, Ds);
  if (!fullRes) return null;

  // If the full pool is already better than the noise floor, keep it all!
  if (fullRes.diagnostics.maxAbsResidualMm <= targetResidualMm) {
    return fullRes;
  }"""

new_logic = """  // 1. Try all points first
  const fullRes = calibrateBase(rows, Da, Ds);

  // If the full pool is already better than the noise floor, keep it all!
  if (fullRes && fullRes.diagnostics.maxAbsResidualMm <= targetResidualMm) {
    return fullRes;
  }"""

if old_logic in text:
    text = text.replace(old_logic, new_logic)
else:
    print("Could not find logic")

with open('src/math/tormek.ts', 'w') as f:
    f.write(text)
