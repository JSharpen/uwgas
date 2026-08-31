import type {
  JigConfig,
  UsbConfig,
  BaseSide,
  CalibrationDiagnostics,
  CalibrationMeasurement,
  CalibrationResult,
  GlobalState,
  MachineConfig,
  MachineConstants,
  ProjectionInput,
  ProjectionOutput,
  TonInput,
  TonOutput,
  Wheel,
  SessionStep,
  WheelResult,
} from '../types/core';
import { _nz } from '../utils/numbers';

export function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

export function rad2deg(r: number): number {
  return (r * 180) / Math.PI;
}

export function computeTonHeights(input: TonInput): TonOutput {
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

  // jg: apex ↔ jig centre along the tangent line
  const jg = A - Ds / 2;

  // CJ: jig centre ↔ USB centre (perpendicular)
  // = jig radius + USB radius
  const CJ = Dj / 2 + Ds / 2;

  // CG: apex ↔ USB centre
  const CG = Math.sqrt(jg * jg + CJ * CJ);

  // f: angle between tangent and CG
  const phi = Math.atan(CJ / jg);
  // Total effective β
  const betaTotalDeg = betaDeg + angleOffsetDeg;
  const betaRad = deg2rad(betaTotalDeg);

  // Ton F9: CA = distance wheel centre ↔ USB centre
  const CA = Math.sqrt(CG * CG + R * R + 2 * CG * R * Math.sin(betaRad - phi));

  // hr: wheel ↔ USB top, always referenced to rear wheel centre
  const hr = (CA - R) + Ds / 2;

  // Base offsets
  const baseConst = base === 'rear' ? constants.rear : constants.front;
  const O = baseConst.o;
  const hc = baseConst.hc;

  // Vertical coordinate of USB centre relative to axle
  const y = Math.sqrt(Math.max(CA * CA - O * O, 0));

  const hn = y - hc + Ds / 2;

  // Inverse: effective β from geometry (for diagnostics)
  const arg = (CA * CA - CG * CG - R * R) / (2 * CG * R);
  const clamped = Math.max(-1, Math.min(1, arg));
  const betaEffRad = Math.asin(clamped) + phi;
  const betaEffDeg = rad2deg(betaEffRad);

  return { hr, hn, betaEffDeg };
}

/**
 * Exact closed-form inverse Dutchman solver for projection A.
 * Solves for the required knife projection A given a fixed USB bar position (hn or hr).
 */
export function computeRequiredProjection(input: ProjectionInput): ProjectionOutput {
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
    return { A: null, jg: null, CA, isReachable: false };
  }

  const jg = -R * Math.sin(betaRad) + Math.sqrt(termUnderRoot);
  if (jg <= 0 || !Number.isFinite(jg)) {
    return { A: null, jg: null, CA, isReachable: false };
  }

  const A = jg + Ds / 2;
  return { A, jg, CA, isReachable: true };
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
  mode: 'hn' | 'hr' = 'hn'
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

export function computeWheelResults(
  wheels: Wheel[],
  sessionSteps: SessionStep[] | null,
  global: GlobalState,
  machines: MachineConfig[],
  jigs: JigConfig[],
  usbs: UsbConfig[],
  defaultMachineId?: string
): WheelResult[] {
  const A = _nz(global.projection);
  const activeJig = jigs.find(j => j.id === global.activeJigId) || jigs[0];
  const Dj = _nz(activeJig?.Dj ?? 12);
  const activeGlobalUsb = usbs.find(u => u.id === global.activeUsbId) || usbs[0];
  const globalDs = _nz(activeGlobalUsb?.Ds ?? 12);
  const beta = _nz(global.targetAngle);
  const isProjectionMode = global.calcMode === 'projection';
  const fixedUsbMode = global.fixedUsbMode === 'hr' ? 'hr' : 'hn';
  const rearFixedHeight = _nz(global.fixedUsbRear, _nz(global.fixedUsbHeight, 150.0));

  const items: { step?: SessionStep; wheel: Wheel }[] = [];

  if (sessionSteps && sessionSteps.length) {
    for (const step of sessionSteps) {
      const w = wheels.find(wh => wh.id === step.wheelId);
      if (!w) continue;
      items.push({ step, wheel: w });
    }
  } else {
    // No progression → no wheel results
    return [];
  }

  const results: WheelResult[] = [];
  for (let i = 0; i < items.length; i++) {
    const { step, wheel } = items[i];
    const machineId = step?.machineId || defaultMachineId;
    const machine = machines.find(m => m.id === machineId) || machines[0];
    if (!machine) continue; // fallback

    const stepUsb = usbs.find(u => u.id === step?.usbId); const Ds = stepUsb ? _nz(stepUsb.Ds) : globalDs;
    const suggestedFrontHeight = computeSuggestedFrontUsbHeight(
      rearFixedHeight,
      machine.constants,
      Ds,
      fixedUsbMode
    );
    const frontFixedHeight = global.useCustomFrontUsb
      ? _nz(global.fixedUsbFront, suggestedFrontHeight)
      : suggestedFrontHeight;

    const baseForHn: BaseSide = wheel.isHoning
      ? 'front'
      : step?.base ?? wheel.baseForHn;
    const angleOffset = _nz(step?.angleOffset ?? wheel.angleOffset);

    const orientationLabel = baseForHn === 'rear'
      ? 'Edge leading (rear base)'
      : 'Edge trailing (front base)';

    if (isProjectionMode) {
      const baseFixedHeight = baseForHn === 'rear' ? rearFixedHeight : frontFixedHeight;

      const projOutput = computeRequiredProjection({
        base: baseForHn,
        D: _nz(wheel.D),
        targetBetaDeg: beta,
        Dj,
        Ds,
        constants: machine.constants,
        fixedUsb: { mode: fixedUsbMode, value: baseFixedHeight },
        angleOffsetDeg: angleOffset,
      });

      if (!projOutput.isReachable || projOutput.A === null) {
        results.push({
          wheel,
          baseForHn,
          orientationLabel,
          betaEffDeg: beta + angleOffset,
          hrWheel: fixedUsbMode === 'hr' ? baseFixedHeight : 0,
          hnBase: fixedUsbMode === 'hn' ? baseFixedHeight : 0,
          requiredProjectionA: null,
          isReachable: false,
        step,
        unadjustedBetaDeg: null,
      });
      continue;
    }

      // Compute exact Ton heights corresponding to this solved projection
      const common: TonInput = {
        base: baseForHn,
        D: _nz(wheel.D),
        A: projOutput.A,
        betaDeg: beta,
        Dj,
        Ds,
        constants: machine.constants,
        angleOffsetDeg: angleOffset,
      };

      const hrRear = computeTonHeights({ ...common, base: 'rear' });
      const hBase = computeTonHeights(common);

      results.push({
        wheel,
        baseForHn,
        orientationLabel,
        betaEffDeg: hBase.betaEffDeg,
        hrWheel: hrRear.hr,
        hnBase: hBase.hn,
        requiredProjectionA: projOutput.A,
        isReachable: true,
        step,
        unadjustedBetaDeg: null,
      });
      continue;
    }

    // Height mode (default)
    const common: TonInput = {
      base: baseForHn,
      D: _nz(wheel.D),
      A,
      betaDeg: beta,
      Dj,
      Ds,
      constants: machine.constants,
      angleOffsetDeg: angleOffset,
    };

    const hrRear = computeTonHeights({ ...common, base: 'rear' });
    const hBase = computeTonHeights(common);

    results.push({
      wheel,
      baseForHn,
      orientationLabel,
      betaEffDeg: hBase.betaEffDeg,
      hrWheel: hrRear.hr,
      hnBase: hBase.hn,
      requiredProjectionA: A,
      isReachable: true,
      step,
      unadjustedBetaDeg: null,
    });
  }

  // Calculate unadjusted carry-over angles
  for (let i = 1; i < results.length; i++) {
    const curr = results[i];
    const prev = results[i-1];
    if (curr.isReachable === false || prev.isReachable === false) continue;

    const prevA = prev.requiredProjectionA;
    if (prevA == null) continue;

    const machineId = curr.step?.machineId || defaultMachineId;
    const machine = machines.find(m => m.id === machineId) || machines[0];
    const currUsb = usbs.find(u => u.id === curr.step?.usbId); const Ds = currUsb ? _nz(currUsb.Ds) : globalDs;
    const fixedUsbMode = global.fixedUsbMode === 'hr' ? 'hr' : 'hn';

    if (global.calcMode === 'projection') {
      const baseFixedHeight = curr.baseForHn === 'rear' ? (fixedUsbMode === 'hr' ? curr.hrWheel : curr.hnBase) : (fixedUsbMode === 'hr' ? curr.hrWheel : curr.hnBase);
      const unadj = solveBetaForFixedSetup(
        curr.baseForHn, _nz(curr.wheel.D), prevA, Dj, Ds,
        machine.constants, baseFixedHeight, fixedUsbMode
      );
      if (unadj != null) curr.unadjustedBetaDeg = unadj + _nz(curr.step?.angleOffset ?? curr.wheel.angleOffset);
    } else {
      const unadj = solveBetaForFixedSetup(
        curr.baseForHn, _nz(curr.wheel.D), _nz(global.projection), Dj, Ds,
        machine.constants, fixedUsbMode === 'hn' ? prev.hnBase : prev.hrWheel, fixedUsbMode
      );
      if (unadj != null) curr.unadjustedBetaDeg = unadj + _nz(curr.step?.angleOffset ?? curr.wheel.angleOffset);
    }
  }

  return results;
}

/**
 * Calibrate one base (rear or front) from 3-5 measurements.
 * Uses only axle↔USB geometry, no wheel, no angle.
 */
export function calibrateBase(
  rows: CalibrationMeasurement[],
  Da: number,
  Ds: number
): CalibrationResult | null {
  const Ra = Da / 2;
  const Rs = Ds / 2;

  // Build numeric arrays, only keeping rows with both values present
  const CA: number[] = [];
  const hn: number[] = [];

  for (const row of rows) {
    const hn_i = _nz(row.hn, NaN);
    const CAo_i = _nz(row.CAo, NaN);
    if (!Number.isFinite(hn_i) || !Number.isFinite(CAo_i)) continue;
    const CA_i = CAo_i - Ra - Rs; // centre-to-centre distance axle ↔ USB (outer-to-outer span |O______O|)
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

  const t =
    tValues.reduce((sum, v) => sum + v, 0) / tValues.length;

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

  const O2mean =
    O2Values.reduce((sum, v) => sum + v, 0) / O2Values.length;
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

  return { hc, o, diagnostics: { residuals, maxAbsResidualMm } };
}

/**
 * Estimate worst-case angle error (deg) implied by a height residual, over
 * the user's wheels, for a given base. Uses numeric ∂hn/∂β via Ton core.
 */
export function estimateMaxAngleErrorDeg(
  diagnostics: CalibrationDiagnostics,
  base: BaseSide,
  global: GlobalState,
  machineLike: MachineConfig,
  wheels: Wheel[],
  jigs: JigConfig[],
  usbs: UsbConfig[]
): number | null {
  const maxRes = diagnostics.maxAbsResidualMm;
  if (!Number.isFinite(maxRes) || maxRes <= 0) return null;

  const A = _nz(global.projection);
  const beta = _nz(global.targetAngle);
  const activeJig = jigs.find(j => j.id === global.activeJigId) || jigs[0];
  const Dj = _nz(activeJig?.Dj ?? 12);
  const activeGlobalUsb = usbs.find(u => u.id === global.activeUsbId) || usbs[0];
  const Ds = _nz(activeGlobalUsb?.Ds ?? 12);

  const candidateDs =
    wheels.length > 0 ? wheels.map(w => _nz(w.D)) : [250, 215, 200];

  let maxAngle = 0;

  for (const D of candidateDs) {
    if (!Number.isFinite(D) || D <= 0) continue;

    const delta = 0.05; // small angle step in degrees
    const baseInput: TonInput = {
      base,
      D,
      A,
      betaDeg: beta,
      Dj,
      Ds,
      constants: machineLike.constants,
    };

    const hnPlus = computeTonHeights({
      ...baseInput,
      betaDeg: beta + delta,
    }).hn;
    const hnMinus = computeTonHeights({
      ...baseInput,
      betaDeg: beta - delta,
    }).hn;

    const dHn_dBeta = (hnPlus - hnMinus) / (2 * delta);
    if (Math.abs(dHn_dBeta) < 1e-6) continue;

    const angleErr = Math.abs(maxRes / dHn_dBeta);
    if (angleErr > maxAngle) maxAngle = angleErr;
  }

  if (maxAngle === 0) return null;
  return maxAngle;
}

/**

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
  mode: 'hn' | 'hr'
): number | null {
  // We want to find beta in [1, 89] such that computeTonHeights(...).hn === targetHn
  let low = 1;
  let high = 89;
  
  const getVal = (b: number) => {
    const res = computeTonHeights({
      base, D, A, betaDeg: b, Dj, Ds, constants, angleOffsetDeg: 0
    });
    return mode === 'hn' ? res.hn : res.hr;
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

  // Binary search (approx 40 iterations is more than enough for 6 decimal places)
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
