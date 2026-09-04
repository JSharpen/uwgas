// Direct verification of tormek math formulas against docs/MATH_REFERENCE.md

function _nz(v, fallback = 0) {
  return Number.isFinite(v) ? Number(v) : fallback;
}

function deg2rad(d) {
  return (d * Math.PI) / 180;
}

function rad2deg(r) {
  return (r * 180) / Math.PI;
}

function computeTonHeights(input) {
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

  return { hr, hn, betaEffDeg, CA, y, jg, CJ, CG, phi };
}

function computeRequiredProjection(input) {
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

function calibrateBase(rows, Da, Ds) {
  const Ra = Da / 2;
  const Rs = Ds / 2;
  const CA = [];
  const hn = [];

  for (const row of rows) {
    const hn_i = _nz(row.hn, NaN);
    const CAo_i = _nz(row.CAo, NaN);
    if (!Number.isFinite(hn_i) || !Number.isFinite(CAo_i)) continue;
    const CA_i = CAo_i - Ra - Rs;
    CA.push(CA_i);
    hn.push(hn_i);
  }

  const N = CA.length;
  if (N < 2) return null;

  const hn1 = hn[0];
  const CA1 = CA[0];
  const tValues = [];

  for (let i = 1; i < N; i++) {
    const hni = hn[i];
    const CAi = CA[i];
    if (Math.abs(hni - hn1) < 1e-9) continue;

    const num = (CA1 * CA1 - CAi * CAi) - (hn1 * hn1 - hni * hni);
    const den = 2 * (hn1 - hni);
    tValues.push(num / den);
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

  const O2mean = O2Values.reduce((sum, v) => sum + v, 0) / O2Values.length;
  const o = Math.sqrt(O2mean);

  const residuals = [];
  for (let i = 0; i < N; i++) {
    const y = Math.sqrt(Math.max(CA[i] * CA[i] - o * o, 0));
    const predHn = y - hc + Rs;
    residuals.push(hn[i] - predHn);
  }
  const maxAbsResidualMm = residuals.reduce(
    (m, r) => Math.max(m, Math.abs(r)),
    0
  );

  return { hc, o, diagnostics: { residuals, maxAbsResidualMm } };
}

// Running test cases from MATH_REFERENCE.md
console.log("=== Golden Master Case 1: Standard Kitchen Knife 15 deg Bevel (Rear Base) ===");
const c1 = computeTonHeights({
  base: "rear",
  D: 250,
  A: 139,
  betaDeg: 15,
  Dj: 12,
  Ds: 12,
  constants: { rear: { hc: 29.00, o: 50.00 }, front: { hc: 51.30, o: 131.70 } }
});
console.log(`hr: ${c1.hr.toFixed(2)} (Expected: 108.14) -> ${Math.abs(c1.hr - 108.14) < 0.01 ? "PASS" : "FAIL"}`);
console.log(`y:  ${c1.y.toFixed(3)} (Expected: 221.570) -> ${Math.abs(c1.y - 221.570) < 0.01 ? "PASS" : "FAIL"}`);
console.log(`hn: ${c1.hn.toFixed(2)} (Expected: 198.57) -> ${Math.abs(c1.hn - 198.57) < 0.01 ? "PASS" : "FAIL"}`);

console.log("\n=== Golden Master Case 2: Worn Wheel at 220mm (Rear Base) ===");
const c2 = computeTonHeights({
  base: "rear",
  D: 220,
  A: 139,
  betaDeg: 15,
  Dj: 12,
  Ds: 12,
  constants: { rear: { hc: 29.00, o: 50.00 }, front: { hc: 51.30, o: 131.70 } }
});
console.log(`hr: ${c2.hr.toFixed(2)} (Expected: 106.66) -> ${Math.abs(c2.hr - 106.66) < 0.01 ? "PASS" : "FAIL"}`);
console.log(`CA: ${c2.CA.toFixed(3)} (Expected: 210.662) -> ${Math.abs(c2.CA - 210.662) < 0.01 ? "PASS" : "FAIL"}`);
console.log(`hn: ${c2.hn.toFixed(2)} (Expected: 181.65) -> ${Math.abs(c2.hn - 181.65) < 0.01 ? "PASS" : "FAIL"}`);

console.log("\n=== Golden Master Case 3: Leather Honing Wheel (Front Base +0.2 deg) ===");
const c3 = computeTonHeights({
  base: "front",
  D: 215,
  A: 139,
  betaDeg: 15,
  angleOffsetDeg: 0.20,
  Dj: 12,
  Ds: 12,
  constants: { rear: { hc: 29.00, o: 50.00 }, front: { hc: 51.30, o: 131.70 } }
});
console.log(`hr: ${c3.hr.toFixed(2)} (Expected: 104.91) -> ${Math.abs(c3.hr - 104.91) < 0.01 ? "PASS" : "FAIL"}`);
console.log(`CA: ${c3.CA.toFixed(3)} (Expected: 206.411) -> ${Math.abs(c3.CA - 206.411) < 0.01 ? "PASS" : "FAIL"}`);
console.log(`y:  ${c3.y.toFixed(3)} (Expected: 158.850) -> ${Math.abs(c3.y - 158.850) < 0.01 ? "PASS" : "FAIL"}`);
console.log(`hn: ${c3.hn.toFixed(2)} (Expected: 113.55) -> ${Math.abs(c3.hn - 113.55) < 0.01 ? "PASS" : "FAIL"}`);

console.log("\n=== Inverse Solver Round-Trip Verification ===");
const inv1 = computeRequiredProjection({
  base: "rear",
  D: 250,
  targetBetaDeg: 15,
  Dj: 12,
  Ds: 12,
  constants: { rear: { hc: 29.00, o: 50.00 }, front: { hc: 51.30, o: 131.70 } },
  fixedUsb: { mode: "hn", value: c1.hn }
});
console.log(`A: ${inv1.A.toFixed(2)} (Expected: 139.00) -> ${Math.abs(inv1.A - 139) < 0.01 ? "PASS" : "FAIL"}`);

console.log("\n=== Calibration Verification ===");
// Synthesize exact points for rear base (hc=29, o=50, Da=12, Ds=12)
const testHns = [50, 100, 150, 200];
const calRows = testHns.map(hn => {
  const y = hn + 29 - 6;
  const CA = Math.sqrt(y * y + 50 * 50);
  const CAo = CA + 6 + 6;
  return { hn, CAo };
});
const calResult = calibrateBase(calRows, 12, 12);
console.log(`Calibrated hc: ${calResult.hc.toFixed(2)} (Expected: 29.00) -> ${Math.abs(calResult.hc - 29) < 0.01 ? "PASS" : "FAIL"}`);
console.log(`Calibrated o:  ${calResult.o.toFixed(2)} (Expected: 50.00) -> ${Math.abs(calResult.o - 50) < 0.01 ? "PASS" : "FAIL"}`);
console.log(`Residual max:  ${calResult.diagnostics.maxAbsResidualMm.toExponential(2)} -> ${calResult.diagnostics.maxAbsResidualMm < 1e-4 ? "PASS" : "FAIL"}`);
