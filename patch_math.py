with open('src/math/tormek.ts', 'r') as f:
    text = f.read()

new_func = """export function calculateNextOptimalTarget(currentHnValues: number[], minHn: number, maxHn: number): number {
  const valid = currentHnValues.filter(h => !isNaN(h) && h >= minHn && h <= maxHn);
  const sorted = [minHn, ...valid, maxHn].sort((a, b) => a - b);
  let maxGap = 0;
  let optimalHn = minHn + (maxHn - minHn) * 0.5;

  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1] - sorted[i];
    if (gap > maxGap) {
      maxGap = gap;
      optimalHn = sorted[i] + gap / 2;
    }
  }
  return optimalHn;
}
"""

if "export function calculateNextOptimalTarget" not in text:
    text = text.replace("export function calculateOptimalMeasurementTargets(minHn: number, maxHn: number): number[] {", new_func + "\nexport function calculateOptimalMeasurementTargets(minHn: number, maxHn: number): number[] {")
    with open('src/math/tormek.ts', 'w') as f:
        f.write(text)
