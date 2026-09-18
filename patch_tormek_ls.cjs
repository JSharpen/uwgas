const fs = require('fs');
let code = fs.readFileSync('src/math/tormek.ts', 'utf8');

const newFunction = `
/**
 * True Linear Least Squares Calibration Solver.
 * Uses 2x2 matrix ordinary least squares (OLS) pseudo-inverse.
 * Mathematically minimizes the squared error globally across all points.
 */
export function calibrateBaseTrueLeastSquares(
  rows: readonly ReadonlyCalibrationMeasurement[],
  Da: number,
  Ds: number
): CalibrationResultOutput | null {
  const Ra = Da / 2;
  const Rs = Ds / 2;

  // Build numeric arrays, only keeping rows with both values present
  const CA: number[] = [];
  const hn: number[] = [];

  for (const row of rows) {
    const hn_i = typeof row.hn === 'number' ? row.hn : parseFloat(row.hn);
    const CAo_i = typeof row.CAo === 'number' ? row.CAo : parseFloat(row.CAo);
    if (!Number.isFinite(hn_i) || !Number.isFinite(CAo_i)) continue;
    const CA_i = CAo_i - Ra - Rs; // centre-to-centre distance axle <-> USB
    CA.push(CA_i);
    hn.push(hn_i);
  }

  const N = CA.length;
  if (N < 2) return null;

  let Sh = 0;
  let Sh2 = 0;
  let Sb = 0;
  let Sbh = 0;

  for (let i = 0; i < N; i++) {
    const h = hn[i];
    const b = CA[i] * CA[i] - h * h;
    Sh += h;
    Sh2 += h * h;
    Sb += b;
    Sbh += h * b;
  }

  const D = N * Sh2 - Sh * Sh;
  if (Math.abs(D) < 1e-9) return null; // Ill-conditioned or identical points

  const t = (N * Sbh - Sh * Sb) / (2 * D);
  const K = (Sh2 * Sb - Sh * Sbh) / D;

  const o2 = K - t * t;
  if (o2 <= 0) return null; // Physically impossible geometry due to extreme noise

  const o = Math.sqrt(o2);
  const hc = t + Rs;

  // Diagnostics: residuals in hn (mm)
  const residuals: number[] = [];
  for (let i = 0; i < N; i++) {
    const y = Math.sqrt(Math.max(CA[i] * CA[i] - o * o, 0));
    const predHn = y - hc + Rs;
    residuals.push(hn[i] - predHn); // measured - predicted
  }
  const maxAbsResidualMm = residuals.reduce(
    (m, r) => Math.max(m, Math.abs(r)),
    0
  );

  return Object.freeze({
    hc,
    o,
    diagnostics: Object.freeze({
      residuals: [...residuals],
      maxAbsResidualMm,
    }),
  });
}
`;

const insertIndex = code.indexOf('export function solveBetaForFixedSetup');
if (insertIndex === -1) {
    console.error("Could not find solveBetaForFixedSetup");
    process.exit(1);
}

// Insert before the doc block of solveBetaForFixedSetup
const docIndex = code.lastIndexOf('/**', insertIndex);
const finalCode = code.substring(0, docIndex) + newFunction + '\n' + code.substring(docIndex);

fs.writeFileSync('src/math/tormek.ts', finalCode);
console.log("Patched tormek.ts!");
