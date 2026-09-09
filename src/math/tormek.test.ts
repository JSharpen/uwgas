/// <reference types="node" />
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  deg2rad,
  rad2deg,
  computeTonHeights,
  computeRequiredProjection,
  computeSuggestedFrontUsbHeight,
  calibrateBase,
  solveBetaForFixedSetup,
  computeMaxAngleErrorFromResiduals,
} from './tormek.ts';
import type { MachineConstants } from './types.ts';

const t8: MachineConstants = Object.freeze({
  rear: Object.freeze({ hc: 29.0, o: 50.0 }),
  front: Object.freeze({ hc: 51.3, o: 131.7 }),
});

describe('Sacred Math Engine - Golden Master Test Suite', () => {
  it('Trigonometric Degree/Radian Converters', () => {
    assert.ok(Math.abs(deg2rad(180) - Math.PI) < 1e-12);
    assert.ok(Math.abs(rad2deg(Math.PI) - 180) < 1e-12);
    assert.ok(Math.abs(rad2deg(deg2rad(45)) - 45) < 1e-12);
  });

  it('Golden Master Case 1: Standard Kitchen Knife 15° Bevel (Rear Base)', () => {
    const res = computeTonHeights({
      base: 'rear',
      D: 250,
      A: 139,
      betaDeg: 15,
      Dj: 12,
      Ds: 12,
      constants: t8,
    });
    // Mathematically verified from Dutchman formulas
    assert.ok(
      Math.abs(res.hn - 168.4836) < 0.001,
      `hn expected ~168.4836, got ${res.hn}`
    );
    assert.ok(
      Math.abs(res.hr - 78.9039) < 0.001,
      `hr expected ~78.9039, got ${res.hr}`
    );
    assert.ok(
      Math.abs(res.betaEffDeg - 15.0) < 0.0001,
      `beta expected 15.0, got ${res.betaEffDeg}`
    );
    assert.ok(
      Math.abs(res.CA - 197.9039) < 0.001,
      `CA expected ~197.9039, got ${res.CA}`
    );
  });

  it('Golden Master Case 2: Worn Wheel at 220mm (Rear Base)', () => {
    const res = computeTonHeights({
      base: 'rear',
      D: 220,
      A: 139,
      betaDeg: 15,
      Dj: 12,
      Ds: 12,
      constants: t8,
    });
    assert.ok(
      Math.abs(res.hn - 157.1555) < 0.001,
      `hn expected ~157.1555, got ${res.hn}`
    );
    assert.ok(
      Math.abs(res.hr - 82.9652) < 0.001,
      `hr expected ~82.9652, got ${res.hr}`
    );
    assert.ok(Math.abs(res.betaEffDeg - 15.0) < 0.0001);
  });

  it('Golden Master Case 3: Leather Honing Wheel (Front Base +0.2° Micro-Bump)', () => {
    const res = computeTonHeights({
      base: 'front',
      D: 215,
      A: 139,
      betaDeg: 15,
      angleOffsetDeg: 0.2,
      Dj: 12,
      Ds: 12,
      constants: t8,
    });
    assert.ok(
      Math.abs(res.hn - 85.283) < 0.001,
      `hn expected ~85.2830, got ${res.hn}`
    );
    assert.ok(
      Math.abs(res.hr - 83.9638) < 0.001,
      `hr expected ~83.9638, got ${res.hr}`
    );
    assert.ok(Math.abs(res.betaEffDeg - 15.2) < 0.0001);
  });

  it('Inverse Closed-Form Round-Trip Identity: Rear Base (hn mode)', () => {
    const forward = computeTonHeights({
      base: 'rear',
      D: 250,
      A: 139,
      betaDeg: 15,
      Dj: 12,
      Ds: 12,
      constants: t8,
    });
    const inv = computeRequiredProjection({
      base: 'rear',
      D: 250,
      targetBetaDeg: 15,
      Dj: 12,
      Ds: 12,
      constants: t8,
      fixedUsb: { mode: 'hn', value: forward.hn },
    });
    assert.strictEqual(inv.isReachable, true);
    assert.ok(inv.A !== null);
    assert.ok(
      Math.abs(inv.A! - 139.0) < 1e-9,
      `Expected A=139.0, got ${inv.A}`
    );
  });

  it('Inverse Closed-Form Round-Trip Identity: Rear Base (hr mode)', () => {
    const forward = computeTonHeights({
      base: 'rear',
      D: 250,
      A: 139,
      betaDeg: 15,
      Dj: 12,
      Ds: 12,
      constants: t8,
    });
    const inv = computeRequiredProjection({
      base: 'rear',
      D: 250,
      targetBetaDeg: 15,
      Dj: 12,
      Ds: 12,
      constants: t8,
      fixedUsb: { mode: 'hr', value: forward.hr },
    });
    assert.strictEqual(inv.isReachable, true);
    assert.ok(inv.A !== null);
    assert.ok(
      Math.abs(inv.A! - 139.0) < 1e-9,
      `Expected A=139.0, got ${inv.A}`
    );
  });

  it('Inverse Closed-Form Round-Trip Identity: Front Base Honing with Offset', () => {
    const forward = computeTonHeights({
      base: 'front',
      D: 215,
      A: 139,
      betaDeg: 15,
      angleOffsetDeg: 0.2,
      Dj: 12,
      Ds: 12,
      constants: t8,
    });
    const inv = computeRequiredProjection({
      base: 'front',
      D: 215,
      targetBetaDeg: 15,
      angleOffsetDeg: 0.2,
      Dj: 12,
      Ds: 12,
      constants: t8,
      fixedUsb: { mode: 'hn', value: forward.hn },
    });
    assert.strictEqual(inv.isReachable, true);
    assert.ok(inv.A !== null);
    assert.ok(
      Math.abs(inv.A! - 139.0) < 1e-9,
      `Expected A=139.0, got ${inv.A}`
    );
  });

  it('Direct Swap Solver (solveBetaForFixedSetup)', () => {
    const forward = computeTonHeights({
      base: 'rear',
      D: 250,
      A: 139,
      betaDeg: 15,
      Dj: 12,
      Ds: 12,
      constants: t8,
    });
    const solvedBeta = solveBetaForFixedSetup(
      'rear',
      250,
      139,
      12,
      12,
      t8,
      forward.hn,
      'hn'
    );
    assert.ok(solvedBeta !== null);
    assert.ok(
      Math.abs(solvedBeta! - 15.0) < 1e-6,
      `Expected beta=15.0, got ${solvedBeta}`
    );
  });

  it('Suggested Front USB Height Matches Rear Projection Exactly', () => {
    const rearHn = 168.483565;
    const suggestedFrontHn = computeSuggestedFrontUsbHeight(
      rearHn,
      t8,
      12,
      'hn'
    );
    assert.ok(Math.abs(suggestedFrontHn - 102.4196) < 0.001);
    const frontProj = computeRequiredProjection({
      base: 'front',
      D: 250,
      targetBetaDeg: 15,
      Dj: 12,
      Ds: 12,
      constants: t8,
      fixedUsb: { mode: 'hn', value: suggestedFrontHn },
    });
    assert.strictEqual(frontProj.isReachable, true);
    assert.ok(frontProj.A !== null);
    assert.ok(Math.abs(frontProj.A! - 139.0) < 1e-6);
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
    assert.ok(
      Math.abs(calib!.hc - 29.0) < 0.05,
      `Expected hc ~29.0, got ${calib!.hc}`
    );
    assert.ok(
      Math.abs(calib!.o - 50.0) < 0.1,
      `Expected o ~50.0, got ${calib!.o}`
    );
    assert.ok(calib!.diagnostics.maxAbsResidualMm < 0.01);
  });

  it('Runtime Input Validation Guards', () => {
    assert.throws(
      () =>
        computeTonHeights({
          base: 'rear',
          D: -250,
          A: 139,
          betaDeg: 15,
          Dj: 12,
          Ds: 12,
          constants: t8,
        }),
      RangeError
    );
    assert.throws(
      () =>
        computeTonHeights({
          base: 'rear',
          D: 250,
          A: 5,
          betaDeg: 15,
          Dj: 12,
          Ds: 12,
          constants: t8,
        }),
      RangeError // A <= Ds/2 (5 <= 6)
    );
    assert.throws(
      () =>
        computeTonHeights({
          base: 'rear',
          D: 250,
          A: 139,
          betaDeg: 95,
          Dj: 12,
          Ds: 12,
          constants: t8,
        }),
      RangeError // beta >= 90
    );
  });

  it('Dev Mode Immutability (Object.freeze)', () => {
    const res = computeTonHeights({
      base: 'rear',
      D: 250,
      A: 139,
      betaDeg: 15,
      Dj: 12,
      Ds: 12,
      constants: t8,
    });
    assert.throws(() => {
      // @ts-expect-error - Testing runtime freeze enforcement
      res.hn = 999;
    }, TypeError);
  });

  it('Angle Error from Residuals (computeMaxAngleErrorFromResiduals)', () => {
    const err = computeMaxAngleErrorFromResiduals(
      0.05, // 0.05 mm residual
      'rear',
      [250, 220, 200],
      139,
      15,
      12,
      12,
      t8
    );
    assert.ok(err !== null);
    assert.ok(err! > 0 && err! < 1.0, `Expected reasonable angle error, got ${err}`);
  });
});
