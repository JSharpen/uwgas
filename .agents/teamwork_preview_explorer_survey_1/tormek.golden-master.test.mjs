import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Pure implementations matching src/math/tormek.ts
function deg2rad(d) {
  return (d * Math.PI) / 180;
}

function rad2deg(r) {
  return (r * 180) / Math.PI;
}

function validateTonInput(input) {
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
    throw new RangeError(`Target angle (${totalBeta}) must be 0-90°`);
  }
}

function computeTonHeights(input) {
  validateTonInput(input);
  const { base, D, A, betaDeg, Dj, Ds, constants, angleOffsetDeg = 0 } = input;
  const R = D / 2;
  const jg = A - Ds / 2;
  const CJ = Dj / 2 + Ds / 2;
  const CG = Math.sqrt(jg * jg + CJ * CJ);
  const phi = Math.atan(CJ / jg);
  const betaTotalDeg = betaDeg + angleOffsetDeg;
  const betaRad = deg2rad(betaTotalDeg);
  const CA = Math.sqrt(CG * CG + R * R + 2 * CG * R * Math.sin(betaRad - phi));
  const hr = (CA - R) + Ds / 2;
  const baseConst = base === 'rear' ? constants.rear : constants.front;
  const O = baseConst.o;
  const hc = baseConst.hc;
  const y = Math.sqrt(Math.max(CA * CA - O * O, 0));
  const hn = y - hc + Ds / 2;
  const arg = (CA * CA - CG * CG - R * R) / (2 * CG * R);
  const clamped = Math.max(-1, Math.min(1, arg));
  const betaEffRad = Math.asin(clamped) + phi;
  const betaEffDeg = rad2deg(betaEffRad);
  return Object.freeze({ hr, hn, betaEffDeg });
}

function computeRequiredProjection(input) {
  const { base, D, targetBetaDeg, Dj, Ds, constants, fixedUsb, angleOffsetDeg = 0 } = input;
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

function computeSuggestedFrontUsbHeight(fixedUsbRear, constants, Ds, mode = 'hn') {
  if (mode === 'hr') return fixedUsbRear;
  const yRear = fixedUsbRear + constants.rear.hc - Ds / 2;
  const CA2 = yRear * yRear + constants.rear.o * constants.rear.o;
  const yFront2 = CA2 - constants.front.o * constants.front.o;
  const yFront = Math.sqrt(Math.max(0, yFront2));
  return yFront - constants.front.hc + Ds / 2;
}

function solveBetaForFixedSetup(base, D, A, Dj, Ds, constants, targetValue, mode) {
  let low = 1, high = 89;
  const getVal = (b) => {
    const res = computeTonHeights({ base, D, A, betaDeg: b, Dj, Ds, constants, angleOffsetDeg: 0 });
    return mode === 'hn' ? res.hn : res.hr;
  };
  const valLow = getVal(low), valHigh = getVal(high);
  if (!Number.isFinite(valLow) || !Number.isFinite(valHigh)) return null;
  const isAscending = valHigh > valLow;
  if (isAscending) {
    if (targetValue < valLow || targetValue > valHigh) return null;
  } else {
    if (targetValue > valLow || targetValue < valHigh) return null;
  }
  let mid = (low + high) / 2;
  for (let i = 0; i < 45; i++) {
    mid = (low + high) / 2;
    const valMid = getVal(mid);
    if (isAscending) {
      if (valMid < targetValue) low = mid; else high = mid;
    } else {
      if (valMid < targetValue) high = mid; else low = mid;
    }
  }
  return mid;
}

function calibrateBase(rows, Da, Ds) {
  const Ra = Da / 2, Rs = Ds / 2;
  const CA = [], hn = [];
  for (const row of rows) {
    const hn_i = Number(row.hn);
    const CAo_i = Number(row.CAo);
    if (!Number.isFinite(hn_i) || !Number.isFinite(CAo_i)) continue;
    CA.push(CAo_i - Ra - Rs);
    hn.push(hn_i);
  }
  const N = CA.length;
  if (N < 2) return null;
  const hn1 = hn[0], CA1 = CA[0];
  const tValues = [];
  for (let i = 1; i < N; i++) {
    const hni = hn[i], CAi = CA[i];
    if (Math.abs(hni - hn1) < 1e-9) continue;
    tValues.push(((CA1 * CA1 - CAi * CAi) - (hn1 * hn1 - hni * hni)) / (2 * (hn1 - hni)));
  }
  if (!tValues.length) return null;
  const t = tValues.reduce((sum, v) => sum + v, 0) / tValues.length;
  const hc = t + Rs;
  const O2Values = [];
  for (let i = 0; i < N; i++) {
    const y = hn[i] + t;
    const O2_i = CA[i] * CA[i] - y * y;
    if (O2_i > 0) O2Values.push(O2_i);
  }
  if (!O2Values.length) return null;
  const o = Math.sqrt(O2Values.reduce((sum, v) => sum + v, 0) / O2Values.length);
  const residuals = [];
  for (let i = 0; i < N; i++) {
    const y = Math.sqrt(Math.max(CA[i] * CA[i] - o * o, 0));
    residuals.push(hn[i] - (y - hc + Rs));
  }
  const maxAbsResidualMm = residuals.reduce((m, r) => Math.max(m, Math.abs(r)), 0);
  return Object.freeze({ hc, o, diagnostics: Object.freeze({ residuals: Object.freeze(residuals), maxAbsResidualMm }) });
}

const t8 = Object.freeze({
  rear: Object.freeze({ hc: 29.00, o: 50.00 }),
  front: Object.freeze({ hc: 51.30, o: 131.70 }),
});

describe('Sacred Math Engine - Golden Master Test Suite', () => {
  it('Golden Master Case 1: Standard Kitchen Knife 15° Bevel (Rear Base)', () => {
    const res = computeTonHeights({
      base: 'rear', D: 250, A: 139, betaDeg: 15, Dj: 12, Ds: 12, constants: t8
    });
    // Mathematical truth from Dutchman equations:
    assert.ok(Math.abs(res.hn - 168.4836) < 0.001, `hn expected ~168.4836, got ${res.hn}`);
    assert.ok(Math.abs(res.hr - 78.9039) < 0.001, `hr expected ~78.9039, got ${res.hr}`);
    assert.ok(Math.abs(res.betaEffDeg - 15.0) < 0.0001, `beta expected 15.0, got ${res.betaEffDeg}`);
  });

  it('Golden Master Case 2: Worn Wheel at 220mm (Rear Base)', () => {
    const res = computeTonHeights({
      base: 'rear', D: 220, A: 139, betaDeg: 15, Dj: 12, Ds: 12, constants: t8
    });
    assert.ok(Math.abs(res.hn - 157.1555) < 0.001, `hn expected ~157.1555, got ${res.hn}`);
    assert.ok(Math.abs(res.hr - 82.9652) < 0.001, `hr expected ~82.9652, got ${res.hr}`);
    assert.ok(Math.abs(res.betaEffDeg - 15.0) < 0.0001);
  });

  it('Golden Master Case 3: Leather Honing Wheel (Front Base +0.2° Micro-Bump)', () => {
    const res = computeTonHeights({
      base: 'front', D: 215, A: 139, betaDeg: 15, angleOffsetDeg: 0.2, Dj: 12, Ds: 12, constants: t8
    });
    assert.ok(Math.abs(res.hn - 85.2830) < 0.001, `hn expected ~85.2830, got ${res.hn}`);
    assert.ok(Math.abs(res.hr - 83.9638) < 0.001, `hr expected ~83.9638, got ${res.hr}`);
    assert.ok(Math.abs(res.betaEffDeg - 15.2) < 0.0001);
  });

  it('Inverse Closed-Form Round-Trip Identity: Rear Base (hn mode)', () => {
    const forward = computeTonHeights({
      base: 'rear', D: 250, A: 139, betaDeg: 15, Dj: 12, Ds: 12, constants: t8
    });
    const inv = computeRequiredProjection({
      base: 'rear', D: 250, targetBetaDeg: 15, Dj: 12, Ds: 12, constants: t8,
      fixedUsb: { mode: 'hn', value: forward.hn }
    });
    assert.strictEqual(inv.isReachable, true);
    assert.ok(Math.abs(inv.A - 139.0) < 1e-9, `Expected A=139.0, got ${inv.A}`);
  });

  it('Inverse Closed-Form Round-Trip Identity: Rear Base (hr mode)', () => {
    const forward = computeTonHeights({
      base: 'rear', D: 250, A: 139, betaDeg: 15, Dj: 12, Ds: 12, constants: t8
    });
    const inv = computeRequiredProjection({
      base: 'rear', D: 250, targetBetaDeg: 15, Dj: 12, Ds: 12, constants: t8,
      fixedUsb: { mode: 'hr', value: forward.hr }
    });
    assert.strictEqual(inv.isReachable, true);
    assert.ok(Math.abs(inv.A - 139.0) < 1e-9, `Expected A=139.0, got ${inv.A}`);
  });

  it('Inverse Closed-Form Round-Trip Identity: Front Base Honing with Offset', () => {
    const forward = computeTonHeights({
      base: 'front', D: 215, A: 139, betaDeg: 15, angleOffsetDeg: 0.2, Dj: 12, Ds: 12, constants: t8
    });
    const inv = computeRequiredProjection({
      base: 'front', D: 215, targetBetaDeg: 15, angleOffsetDeg: 0.2, Dj: 12, Ds: 12, constants: t8,
      fixedUsb: { mode: 'hn', value: forward.hn }
    });
    assert.strictEqual(inv.isReachable, true);
    assert.ok(Math.abs(inv.A - 139.0) < 1e-9, `Expected A=139.0, got ${inv.A}`);
  });

  it('Direct Swap Solver (solveBetaForFixedSetup)', () => {
    const forward = computeTonHeights({
      base: 'rear', D: 250, A: 139, betaDeg: 15, Dj: 12, Ds: 12, constants: t8
    });
    const solvedBeta = solveBetaForFixedSetup('rear', 250, 139, 12, 12, t8, forward.hn, 'hn');
    assert.ok(Math.abs(solvedBeta - 15.0) < 1e-6, `Expected beta=15.0, got ${solvedBeta}`);
  });

  it('Suggested Front USB Height Matches Rear Projection Exactly', () => {
    const rearHn = 168.483565;
    const suggestedFrontHn = computeSuggestedFrontUsbHeight(rearHn, t8, 12, 'hn');
    assert.ok(Math.abs(suggestedFrontHn - 102.4196) < 0.001);
    const frontProj = computeRequiredProjection({
      base: 'front', D: 250, targetBetaDeg: 15, Dj: 12, Ds: 12, constants: t8,
      fixedUsb: { mode: 'hn', value: suggestedFrontHn }
    });
    assert.strictEqual(frontProj.isReachable, true);
    assert.ok(Math.abs(frontProj.A - 139.0) < 1e-6);
  });

  it('Calibration Solver (calibrateBase)', () => {
    const rows = [
      { hn: '100.00', CAo: '144.77' },
      { hn: '120.00', CAo: '163.49' },
      { hn: '150.00', CAo: '192.08' },
      { hn: '180.00', CAo: '221.07' },
    ];
    const calib = calibrateBase(rows, 12, 12);
    assert.ok(calib !== null);
    assert.ok(Math.abs(calib.hc - 29.0) < 0.05, `Expected hc ~29.0, got ${calib.hc}`);
    assert.ok(Math.abs(calib.o - 50.0) < 0.1, `Expected o ~50.0, got ${calib.o}`);
    assert.ok(calib.diagnostics.maxAbsResidualMm < 0.01);
  });

  it('Runtime Input Validation Guards', () => {
    assert.throws(() => computeTonHeights({
      base: 'rear', D: -250, A: 139, betaDeg: 15, Dj: 12, Ds: 12, constants: t8
    }), RangeError);
    assert.throws(() => computeTonHeights({
      base: 'rear', D: 250, A: 5, betaDeg: 15, Dj: 12, Ds: 12, constants: t8
    }), RangeError); // A <= Ds/2 (5 <= 6)
    assert.throws(() => computeTonHeights({
      base: 'rear', D: 250, A: 139, betaDeg: 95, Dj: 12, Ds: 12, constants: t8
    }), RangeError); // beta >= 90
  });

  it('Dev Mode Immutability (Object.freeze)', () => {
    const res = computeTonHeights({
      base: 'rear', D: 250, A: 139, betaDeg: 15, Dj: 12, Ds: 12, constants: t8
    });
    assert.throws(() => {
      res.hn = 999;
    }, TypeError);
  });
});
