/**
 * Tier 1: Sacred Pure Math Engine Core ("The Vault")
 *
 * Contains ONLY pure trigonometric and geometric formulas for Dutchman angle setting:
 * - deg2rad, rad2deg
 * - validateTonInput, validateProjectionInput
 * - computeTonHeights (forward Dutchman solver)
 * - computeRequiredProjection (closed-form inverse Dutchman solver)
 * - computeSuggestedFrontUsbHeight (equal projection matching)
 * - calibrateBase (least-squares calibration solver)
 * - solveBetaForFixedSetup (binary search inverse solver)
 * - computeMaxAngleErrorFromResiduals (pure sensitivity analysis)
 *
 * ZERO UI / Application domain models.
 * ZERO React / Zustand dependencies.
 */

import type {
  BaseSide,
  FixedUsbReference,
  MachineConstants,
  ReadonlyTonInput,
  ReadonlyTonOutput,
  ReadonlyProjectionInput,
  ReadonlyProjectionOutput,
  ReadonlyCalibrationMeasurement,
  CalibrationResultOutput,
} from './types.ts';

export function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

export function rad2deg(r: number): number {
  return (r * 180) / Math.PI;
}

/**
 * Runtime validation guard for Ton forward height inputs.
 * Throws RangeError on invalid physical geometry.
 */
export function validateTonInput(input: ReadonlyTonInput): void {
  if (!Number.isFinite(input.D) || input.D <= 0) {
    throw new RangeError(`Invalid wheel diameter: ${input.D}`);
  }
  if (!Number.isFinite(input.Ds) || input.Ds <= 0) {
    throw new RangeError(`Invalid USB diameter: ${input.Ds}`);
  }
  if (!Number.isFinite(input.Dj) || input.Dj < 0) {
    throw new RangeError(`Invalid jig diameter: ${input.Dj}`);
  }
  if (!Number.isFinite(input.A) || input.A <= input.Ds / 2) {
    throw new RangeError(`Projection A (${input.A}) must be > Ds/2 (${input.Ds / 2})`);
  }
  const totalBeta = input.betaDeg + (input.angleOffsetDeg ?? 0);
  if (!Number.isFinite(totalBeta) || totalBeta <= 0 || totalBeta >= 90) {
    throw new RangeError(`Target angle (${totalBeta}) must be between 0° and 90°`);
  }
}

/**
 * Runtime validation guard for inverse projection inputs.
 * Throws RangeError on invalid physical geometry.
 */
export function validateProjectionInput(input: ReadonlyProjectionInput): void {
  if (!Number.isFinite(input.D) || input.D <= 0) {
    throw new RangeError(`Invalid wheel diameter: ${input.D}`);
  }
  if (!Number.isFinite(input.Ds) || input.Ds <= 0) {
    throw new RangeError(`Invalid USB diameter: ${input.Ds}`);
  }
  if (!Number.isFinite(input.Dj) || input.Dj < 0) {
    throw new RangeError(`Invalid jig diameter: ${input.Dj}`);
  }
  if (!Number.isFinite(input.fixedUsb.value) || input.fixedUsb.value <= 0) {
    throw new RangeError(`Invalid fixed USB height value: ${input.fixedUsb.value}`);
  }
  const totalBeta = input.targetBetaDeg + (input.angleOffsetDeg ?? 0);
  if (!Number.isFinite(totalBeta) || totalBeta <= 0 || totalBeta >= 90) {
    throw new RangeError(`Target angle (${totalBeta}) must be between 0° and 90°`);
  }
}

/**
 * Pure Dutchman forward solver for USB height and contact geometry.
 */
export function computeTonHeights(input: ReadonlyTonInput): ReadonlyTonOutput {
  validateTonInput(input);
  const {
    base,
    D,
    A,
    betaDeg,
    Dj,
    Ds,
    constants,
    angleOffsetDeg = 0,
  } = input;

  const R = D / 2; // wheel radius

  // jg: apex <-> jig centre along the tangent line
  const jg = A - Ds / 2;

  // CJ: jig centre <-> USB centre (perpendicular) = jig radius + USB radius
  const CJ = Dj / 2 + Ds / 2;

  // CG: apex <-> USB centre
  const CG = Math.sqrt(jg * jg + CJ * CJ);

  // phi: angle between tangent and CG
  const phi = Math.atan(CJ / jg);
  // Total effective beta
  const betaTotalDeg = betaDeg + angleOffsetDeg;
  const betaRad = deg2rad(betaTotalDeg);

  // Ton F9: CA = distance wheel centre <-> USB centre
  const CA = Math.sqrt(CG * CG + R * R + 2 * CG * R * Math.sin(betaRad - phi));

  // hr: wheel <-> USB top, always referenced to rear wheel centre
  const hr = (CA - R) + Ds / 2;

  // Base offsets
  const baseConst = base === 'rear' ? constants.rear : constants.front;
  const O = baseConst.o;
  const hc = baseConst.hc;

  // Vertical coordinate of USB centre relative to axle
  const y = Math.sqrt(Math.max(CA * CA - O * O, 0));

  const hn = y - hc + Ds / 2;

  // Inverse: effective beta from geometry (for diagnostics)
  const arg = (CA * CA - CG * CG - R * R) / (2 * CG * R);
  const clamped = Math.max(-1, Math.min(1, arg));
  const betaEffRad = Math.asin(clamped) + phi;
  const betaEffDeg = rad2deg(betaEffRad);

  return Object.freeze({
    hn,
    hr,
    CA,
    y,
    phiRad: phi,
    betaEffDeg,
  });
}

/**
 * Exact closed-form inverse Dutchman solver for projection A.
 * Solves for the required knife projection A given a fixed USB bar position (hn or hr).
 */
export function computeRequiredProjection(input: ReadonlyProjectionInput): ReadonlyProjectionOutput {
  validateProjectionInput(input);
  const {
    base,
    D,
    targetBetaDeg,
    Dj,
    Ds,
    constants,
    fixedUsb,
    angleOffsetDeg = 0,
  } = input;

  const R = D / 2;
  const betaTotalDeg = targetBetaDeg + angleOffsetDeg;
  const betaRad = deg2rad(betaTotalDeg);
  const CJ = Dj / 2 + Ds / 2;

  let CA = 0;
  if (fixedUsb.mode === 'hn') {
    const baseConst = base === 'rear' ? constants.rear : constants.front;
    const O = baseConst.o;
    const hc = baseConst.hc;
    const y = fixedUsb.value + hc - Ds / 2;
    CA = Math.sqrt(Math.max(y * y + O * O, 0));
  } else {
    // hr mode: distance from wheel surface to USB top
    CA = fixedUsb.value + R - Ds / 2;
  }

  const diff = R * Math.cos(betaRad) - CJ;
  const termUnderRoot = CA * CA - diff * diff;

  if (termUnderRoot < 0 || !Number.isFinite(termUnderRoot)) {
    return Object.freeze({ A: null, jg: null, CA, isReachable: false });
  }

  const jg = -R * Math.sin(betaRad) + Math.sqrt(termUnderRoot);
  if (jg <= 0 || !Number.isFinite(jg)) {
    return Object.freeze({ A: null, jg: null, CA, isReachable: false });
  }

  const A = jg + Ds / 2;
  return Object.freeze({ A, jg, CA, isReachable: true });
}

/**
 * Calculates suggested front USB height to match the rear USB wheel distance (CA).
 * When front and rear share the same wheel diameter and target angle, setting the
 * front base to this height gives the exact same required projection A.
 */
export function computeSuggestedFrontUsbHeight(
  fixedUsbRear: number,
  constants: MachineConstants,
  Ds: number,
  mode: FixedUsbReference = 'hn'
): number {
  if (mode === 'hr') {
    return fixedUsbRear;
  }
  const yRear = fixedUsbRear + constants.rear.hc - Ds / 2;
  const CA2 = yRear * yRear + constants.rear.o * constants.rear.o;
  const yFront2 = CA2 - constants.front.o * constants.front.o;
  const yFront = Math.sqrt(Math.max(0, yFront2));
  return yFront - constants.front.hc + Ds / 2;
}

/**
 * Calibrate one base (rear or front) from 3-5 measurements.
 * Uses only axle <-> USB geometry, no wheel, no angle.
 */
export function calibrateBase(
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

  // 1) Estimate t = hc - Ds/2 using pairwise linear equations
  const hn1 = hn[0];
  const CA1 = CA[0];
  const tValues: number[] = [];

  for (let i = 1; i < N; i++) {
    const hni = hn[i];
    const CAi = CA[i];
    if (Math.abs(hni - hn1) < 1e-9) continue; // avoid divide-by-zero

    const num = (CA1 * CA1 - CAi * CAi) - (hn1 * hn1 - hni * hni);
    const den = 2 * (hn1 - hni);
    tValues.push(num / den);
  }

  if (!tValues.length) return null;

  const t = tValues.reduce((sum, v) => sum + v, 0) / tValues.length;

  // 2) Recover hc
  const hc = t + Rs; // Rs = Ds/2

  // 3) Estimate O using all points
  const O2Values: number[] = [];
  for (let i = 0; i < N; i++) {
    const y = hn[i] + t;
    const O2_i = CA[i] * CA[i] - y * y;
    if (O2_i > 0) O2Values.push(O2_i);
  }
  if (!O2Values.length) return null;

  const O2mean = O2Values.reduce((sum, v) => sum + v, 0) / O2Values.length;
  const o = Math.sqrt(O2mean);

  // 4) Diagnostics: residuals in hn (mm)
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

/**
 * Numerically solves for the angle (beta) that corresponds to a given physical setup.
 * Used for "Direct Swap" feature.
 */
export function solveBetaForFixedSetup(
  base: BaseSide,
  D: number,
  A: number,
  Dj: number,
  Ds: number,
  constants: MachineConstants,
  targetValue: number,
  mode: FixedUsbReference
): number | null {
  // We want to find beta in [1, 89] such that computeTonHeights(...).hn === targetHn
  let low = 1;
  let high = 89;

  const getVal = (b: number) => {
    try {
      const res = computeTonHeights({
        base,
        D,
        A,
        betaDeg: b,
        Dj,
        Ds,
        constants,
        angleOffsetDeg: 0,
      });
      return mode === 'hn' ? res.hn : res.hr;
    } catch {
      return NaN;
    }
  };

  const valLow = getVal(low);
  const valHigh = getVal(high);

  if (!Number.isFinite(valLow) || !Number.isFinite(valHigh)) return null;

  // Determine monotonicity direction
  const isAscending = valHigh > valLow;

  // Check if target is out of bounds
  if (isAscending) {
    if (targetValue < valLow || targetValue > valHigh) return null;
  } else {
    if (targetValue > valLow || targetValue < valHigh) return null;
  }

  // Binary search (45 iterations yields <1e-6 precision)
  let mid = (low + high) / 2;
  for (let i = 0; i < 45; i++) {
    mid = (low + high) / 2;
    const valMid = getVal(mid);

    if (isAscending) {
      if (valMid < targetValue) low = mid;
      else high = mid;
    } else {
      if (valMid < targetValue) high = mid;
      else low = mid;
    }
  }

  return mid;
}

/**
 * Pure mathematical computation of worst-case angle error (deg) implied by a height residual,
 * evaluated across candidate wheel diameters for a given base.
 */
export function computeMaxAngleErrorFromResiduals(
  maxAbsResidualMm: number,
  base: BaseSide,
  candidateWheelDiameters: readonly number[],
  A: number,
  betaDeg: number,
  Dj: number,
  Ds: number,
  constants: MachineConstants
): number | null {
  if (!Number.isFinite(maxAbsResidualMm) || maxAbsResidualMm <= 0) return null;

  let maxAngle = 0;

  for (const D of candidateWheelDiameters) {
    if (!Number.isFinite(D) || D <= 0) continue;

    const delta = 0.05; // small angle step in degrees
    const baseInput: ReadonlyTonInput = {
      base,
      D,
      A,
      betaDeg,
      Dj,
      Ds,
      constants,
    };

    try {
      const hnPlus = computeTonHeights({
        ...baseInput,
        betaDeg: betaDeg + delta,
      }).hn;
      const hnMinus = computeTonHeights({
        ...baseInput,
        betaDeg: betaDeg - delta,
      }).hn;

      const dHn_dBeta = (hnPlus - hnMinus) / (2 * delta);
      if (Math.abs(dHn_dBeta) < 1e-6) continue;

      const angleErr = Math.abs(maxAbsResidualMm / dHn_dBeta);
      if (angleErr > maxAngle) maxAngle = angleErr;
    } catch {
      continue;
    }
  }

  if (maxAngle === 0) return null;
  return maxAngle;
}
