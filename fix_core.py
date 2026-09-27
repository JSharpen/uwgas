with open('src/types/core.ts', 'r') as f:
    text = f.read()

text = text.replace("measurements: CalibrationMeasurement[];", "measurements: CalibrationMeasurement[];\\n    physicalEnvelope?: { minHn: number; maxHn: number };")

with open('src/types/core.ts', 'w') as f:
    f.write(text)
