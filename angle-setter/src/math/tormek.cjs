"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deg2rad = deg2rad;
exports.rad2deg = rad2deg;
exports.computeTonHeights = computeTonHeights;
exports.computeRequiredProjection = computeRequiredProjection;
exports.computeSuggestedFrontUsbHeight = computeSuggestedFrontUsbHeight;
exports.computeWheelResults = computeWheelResults;
exports.calibrateBase = calibrateBase;
exports.estimateMaxAngleErrorDeg = estimateMaxAngleErrorDeg;
exports.solveBetaForFixedSetup = solveBetaForFixedSetup;
var numbers_1 = require("../utils/numbers");
function deg2rad(d) {
    return (d * Math.PI) / 180;
}
function rad2deg(r) {
    return (r * 180) / Math.PI;
}
function computeTonHeights(input) {
    var base = input.base, D = input.D, A = input.A, betaDeg = input.betaDeg, Dj = input.Dj, Ds = input.Ds, constants = input.constants, _a = input.angleOffsetDeg, angleOffsetDeg = _a === void 0 ? 0 : _a;
    var R = D / 2; // wheel radius
    // jg: apex ↔ jig centre along the tangent line
    var jg = A - Ds / 2;
    // CJ: jig centre ↔ USB centre (perpendicular)
    // = jig radius + USB radius
    var CJ = Dj / 2 + Ds / 2;
    // CG: apex ↔ USB centre
    var CG = Math.sqrt(jg * jg + CJ * CJ);
    // f: angle between tangent and CG
    var phi = Math.atan(CJ / jg);
    // Total effective β
    var betaTotalDeg = betaDeg + angleOffsetDeg;
    var betaRad = deg2rad(betaTotalDeg);
    // Ton F9: CA = distance wheel centre ↔ USB centre
    var CA = Math.sqrt(CG * CG + R * R + 2 * CG * R * Math.sin(betaRad - phi));
    // hr: wheel ↔ USB top, always referenced to rear wheel centre
    var hr = (CA - R) + Ds / 2;
    // Base offsets
    var baseConst = base === 'rear' ? constants.rear : constants.front;
    var O = baseConst.o;
    var hc = baseConst.hc;
    // Vertical coordinate of USB centre relative to axle
    var y = Math.sqrt(Math.max(CA * CA - O * O, 0));
    var hn = y - hc + Ds / 2;
    // Inverse: effective β from geometry (for diagnostics)
    var arg = (CA * CA - CG * CG - R * R) / (2 * CG * R);
    var clamped = Math.max(-1, Math.min(1, arg));
    var betaEffRad = Math.asin(clamped) + phi;
    var betaEffDeg = rad2deg(betaEffRad);
    return { hr: hr, hn: hn, betaEffDeg: betaEffDeg };
}
/**
 * Exact closed-form inverse Dutchman solver for projection A.
 * Solves for the required knife projection A given a fixed USB bar position (hn or hr).
 */
function computeRequiredProjection(input) {
    var base = input.base, D = input.D, targetBetaDeg = input.targetBetaDeg, Dj = input.Dj, Ds = input.Ds, constants = input.constants, fixedUsb = input.fixedUsb, _a = input.angleOffsetDeg, angleOffsetDeg = _a === void 0 ? 0 : _a;
    var R = D / 2;
    var betaTotalDeg = targetBetaDeg + angleOffsetDeg;
    var betaRad = deg2rad(betaTotalDeg);
    var CJ = Dj / 2 + Ds / 2;
    var CA = 0;
    if (fixedUsb.mode === 'hn') {
        var baseConst = base === 'rear' ? constants.rear : constants.front;
        var O = baseConst.o;
        var hc = baseConst.hc;
        var y = fixedUsb.value + hc - Ds / 2;
        CA = Math.sqrt(Math.max(y * y + O * O, 0));
    }
    else {
        // hr mode: distance from wheel surface to USB top
        CA = fixedUsb.value + R - Ds / 2;
    }
    var diff = R * Math.cos(betaRad) - CJ;
    var termUnderRoot = CA * CA - diff * diff;
    if (termUnderRoot < 0 || !Number.isFinite(termUnderRoot)) {
        return { A: null, jg: null, CA: CA, isReachable: false };
    }
    var jg = -R * Math.sin(betaRad) + Math.sqrt(termUnderRoot);
    if (jg <= 0 || !Number.isFinite(jg)) {
        return { A: null, jg: null, CA: CA, isReachable: false };
    }
    var A = jg + Ds / 2;
    return { A: A, jg: jg, CA: CA, isReachable: true };
}
/**
 * Calculates suggested front USB height to match the rear USB wheel distance (CA).
 * When front and rear share the same wheel diameter and target angle, setting the
 * front base to this height gives the exact same required projection A.
 */
function computeSuggestedFrontUsbHeight(fixedUsbRear, constants, Ds, mode) {
    if (mode === void 0) { mode = 'hn'; }
    if (mode === 'hr') {
        return fixedUsbRear;
    }
    var yRear = fixedUsbRear + constants.rear.hc - Ds / 2;
    var CA2 = yRear * yRear + constants.rear.o * constants.rear.o;
    var yFront2 = CA2 - constants.front.o * constants.front.o;
    var yFront = Math.sqrt(Math.max(0, yFront2));
    return yFront - constants.front.hc + Ds / 2;
}
function computeWheelResults(wheels, sessionSteps, global, machines, defaultMachineId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var A = (0, numbers_1._nz)(global.projection);
    var Dj = (0, numbers_1._nz)(global.jig.Dj);
    var beta = (0, numbers_1._nz)(global.targetAngle);
    var isProjectionMode = global.calcMode === 'projection';
    var fixedUsbMode = global.fixedUsbMode === 'hr' ? 'hr' : 'hn';
    var rearFixedHeight = (0, numbers_1._nz)(global.fixedUsbRear, (0, numbers_1._nz)(global.fixedUsbHeight, 150.0));
    var items = [];
    if (sessionSteps && sessionSteps.length) {
        var _loop_1 = function (step) {
            var w = wheels.find(function (wh) { return wh.id === step.wheelId; });
            if (!w)
                return "continue";
            items.push({ step: step, wheel: w });
        };
        for (var _i = 0, sessionSteps_1 = sessionSteps; _i < sessionSteps_1.length; _i++) {
            var step = sessionSteps_1[_i];
            _loop_1(step);
        }
    }
    else {
        // No progression → no wheel results
        return [];
    }
    var results = [];
    var _loop_2 = function (i) {
        var _l = items[i], step = _l.step, wheel = _l.wheel;
        var machineId = (step === null || step === void 0 ? void 0 : step.machineId) || defaultMachineId;
        var machine = machines.find(function (m) { return m.id === machineId; }) || machines[0];
        if (!machine)
            return "continue"; // fallback
        var Ds = (_a = step === null || step === void 0 ? void 0 : step.usbOverride) !== null && _a !== void 0 ? _a : (0, numbers_1._nz)(global.usbDiameter);
        var suggestedFrontHeight = computeSuggestedFrontUsbHeight(rearFixedHeight, machine.constants, Ds, fixedUsbMode);
        var frontFixedHeight = global.useCustomFrontUsb
            ? (0, numbers_1._nz)(global.fixedUsbFront, suggestedFrontHeight)
            : suggestedFrontHeight;
        var baseForHn = wheel.isHoning
            ? 'front'
            : (_b = step === null || step === void 0 ? void 0 : step.base) !== null && _b !== void 0 ? _b : wheel.baseForHn;
        var angleOffset = (0, numbers_1._nz)((_c = step === null || step === void 0 ? void 0 : step.angleOffset) !== null && _c !== void 0 ? _c : wheel.angleOffset);
        var orientationLabel = baseForHn === 'rear'
            ? 'Edge leading (rear base)'
            : 'Edge trailing (front base)';
        if (isProjectionMode) {
            var baseFixedHeight = baseForHn === 'rear' ? rearFixedHeight : frontFixedHeight;
            var projOutput = computeRequiredProjection({
                base: baseForHn,
                D: (0, numbers_1._nz)(wheel.D),
                targetBetaDeg: beta,
                Dj: Dj,
                Ds: Ds,
                constants: machine.constants,
                fixedUsb: { mode: fixedUsbMode, value: baseFixedHeight },
                angleOffsetDeg: angleOffset,
            });
            if (!projOutput.isReachable || projOutput.A === null) {
                results.push({
                    wheel: wheel,
                    baseForHn: baseForHn,
                    orientationLabel: orientationLabel,
                    betaEffDeg: beta + angleOffset,
                    hrWheel: fixedUsbMode === 'hr' ? baseFixedHeight : 0,
                    hnBase: fixedUsbMode === 'hn' ? baseFixedHeight : 0,
                    requiredProjectionA: null,
                    isReachable: false,
                    step: step,
                    unadjustedBetaDeg: null,
                });
                return "continue";
            }
            // Compute exact Ton heights corresponding to this solved projection
            var common_1 = {
                base: baseForHn,
                D: (0, numbers_1._nz)(wheel.D),
                A: projOutput.A,
                betaDeg: beta,
                Dj: Dj,
                Ds: Ds,
                constants: machine.constants,
                angleOffsetDeg: angleOffset,
            };
            var hrRear_1 = computeTonHeights(__assign(__assign({}, common_1), { base: 'rear' }));
            var hBase_1 = computeTonHeights(common_1);
            results.push({
                wheel: wheel,
                baseForHn: baseForHn,
                orientationLabel: orientationLabel,
                betaEffDeg: hBase_1.betaEffDeg,
                hrWheel: hrRear_1.hr,
                hnBase: hBase_1.hn,
                requiredProjectionA: projOutput.A,
                isReachable: true,
                step: step,
                unadjustedBetaDeg: null,
            });
        }
        // Height mode (default)
        var common = {
            base: baseForHn,
            D: (0, numbers_1._nz)(wheel.D),
            A: A,
            betaDeg: beta,
            Dj: Dj,
            Ds: Ds,
            constants: machine.constants,
            angleOffsetDeg: angleOffset,
        };
        var hrRear = computeTonHeights(__assign(__assign({}, common), { base: 'rear' }));
        var hBase = computeTonHeights(common);
        results.push({
            wheel: wheel,
            baseForHn: baseForHn,
            orientationLabel: orientationLabel,
            betaEffDeg: hBase.betaEffDeg,
            hrWheel: hrRear.hr,
            hnBase: hBase.hn,
            requiredProjectionA: A,
            isReachable: true,
            step: step,
            unadjustedBetaDeg: null,
        });
    };
    for (var i = 0; i < items.length; i++) {
        _loop_2(i);
    }
    var _loop_3 = function (i) {
        var curr = results[i];
        var prev = results[i - 1];
        if (curr.isReachable === false || prev.isReachable === false)
            return "continue";
        var prevA = prev.requiredProjectionA;
        if (prevA == null)
            return "continue";
        var machineId = ((_d = curr.step) === null || _d === void 0 ? void 0 : _d.machineId) || defaultMachineId;
        var machine = machines.find(function (m) { return m.id === machineId; }) || machines[0];
        var Ds = (_f = (_e = curr.step) === null || _e === void 0 ? void 0 : _e.usbOverride) !== null && _f !== void 0 ? _f : (0, numbers_1._nz)(global.usbDiameter);
        var fixedUsbMode_1 = global.fixedUsbMode === 'hr' ? 'hr' : 'hn';
        if (global.calcMode === 'projection') {
            var baseFixedHeight = curr.baseForHn === 'rear' ? (fixedUsbMode_1 === 'hr' ? curr.hrWheel : curr.hnBase) : (fixedUsbMode_1 === 'hr' ? curr.hrWheel : curr.hnBase);
            var unadj = solveBetaForFixedSetup(curr.baseForHn, (0, numbers_1._nz)(curr.wheel.D), prevA, (0, numbers_1._nz)(global.jig.Dj), Ds, machine.constants, baseFixedHeight, fixedUsbMode_1);
            if (unadj != null)
                curr.unadjustedBetaDeg = unadj + (0, numbers_1._nz)((_h = (_g = curr.step) === null || _g === void 0 ? void 0 : _g.angleOffset) !== null && _h !== void 0 ? _h : curr.wheel.angleOffset);
        }
        else {
            var unadj = solveBetaForFixedSetup(curr.baseForHn, (0, numbers_1._nz)(curr.wheel.D), (0, numbers_1._nz)(global.projection), (0, numbers_1._nz)(global.jig.Dj), Ds, machine.constants, fixedUsbMode_1 === 'hn' ? prev.hnBase : prev.hrWheel, fixedUsbMode_1);
            if (unadj != null)
                curr.unadjustedBetaDeg = unadj + (0, numbers_1._nz)((_k = (_j = curr.step) === null || _j === void 0 ? void 0 : _j.angleOffset) !== null && _k !== void 0 ? _k : curr.wheel.angleOffset);
        }
    };
    // Calculate unadjusted carry-over angles
    for (var i = 1; i < results.length; i++) {
        _loop_3(i);
    }
    return results;
}
/**
 * Calibrate one base (rear or front) from 3-5 measurements.
 * Uses only axle↔USB geometry, no wheel, no angle.
 */
function calibrateBase(rows, Da, Ds) {
    var Ra = Da / 2;
    var Rs = Ds / 2;
    // Build numeric arrays, only keeping rows with both values present
    var CA = [];
    var hn = [];
    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
        var row = rows_1[_i];
        var hn_i = (0, numbers_1._nz)(row.hn, NaN);
        var CAo_i = (0, numbers_1._nz)(row.CAo, NaN);
        if (!Number.isFinite(hn_i) || !Number.isFinite(CAo_i))
            continue;
        var CA_i = CAo_i - Ra - Rs; // centre-to-centre distance axle ↔ USB (outer-to-outer span |O______O|)
        CA.push(CA_i);
        hn.push(hn_i);
    }
    var N = CA.length;
    if (N < 2)
        return null;
    // 1) Estimate t = hc - Ds/2 using pairwise linear equations
    var hn1 = hn[0];
    var CA1 = CA[0];
    var tValues = [];
    for (var i = 1; i < N; i++) {
        var hni = hn[i];
        var CAi = CA[i];
        if (Math.abs(hni - hn1) < 1e-9)
            continue; // avoid divide-by-zero
        var num = (CA1 * CA1 - CAi * CAi) - (hn1 * hn1 - hni * hni);
        var den = 2 * (hn1 - hni);
        tValues.push(num / den);
    }
    if (!tValues.length)
        return null;
    var t = tValues.reduce(function (sum, v) { return sum + v; }, 0) / tValues.length;
    // 2) Recover hc
    var hc = t + Rs; // Rs = Ds/2
    // 3) Estimate O using all points
    var O2Values = [];
    for (var i = 0; i < N; i++) {
        var y = hn[i] + t;
        var O2_i = CA[i] * CA[i] - y * y;
        if (O2_i > 0)
            O2Values.push(O2_i);
    }
    if (!O2Values.length)
        return null;
    var O2mean = O2Values.reduce(function (sum, v) { return sum + v; }, 0) / O2Values.length;
    var o = Math.sqrt(O2mean);
    // 4) Diagnostics: residuals in hn (mm)
    var residuals = [];
    for (var i = 0; i < N; i++) {
        var y = Math.sqrt(Math.max(CA[i] * CA[i] - o * o, 0));
        var predHn = y - hc + Rs;
        residuals.push(hn[i] - predHn); // measured - predicted
    }
    var maxAbsResidualMm = residuals.reduce(function (m, r) { return Math.max(m, Math.abs(r)); }, 0);
    return { hc: hc, o: o, diagnostics: { residuals: residuals, maxAbsResidualMm: maxAbsResidualMm } };
}
/**
 * Estimate worst-case angle error (deg) implied by a height residual, over
 * the user's wheels, for a given base. Uses numeric ∂hn/∂β via Ton core.
 */
function estimateMaxAngleErrorDeg(diagnostics, base, global, machineLike, wheels) {
    var maxRes = diagnostics.maxAbsResidualMm;
    if (!Number.isFinite(maxRes) || maxRes <= 0)
        return null;
    var A = (0, numbers_1._nz)(global.projection);
    var beta = (0, numbers_1._nz)(global.targetAngle);
    var Dj = global.jig.Dj;
    var Ds = global.usbDiameter;
    var candidateDs = wheels.length > 0 ? wheels.map(function (w) { return (0, numbers_1._nz)(w.D); }) : [250, 215, 200];
    var maxAngle = 0;
    for (var _i = 0, candidateDs_1 = candidateDs; _i < candidateDs_1.length; _i++) {
        var D = candidateDs_1[_i];
        if (!Number.isFinite(D) || D <= 0)
            continue;
        var delta = 0.05; // small angle step in degrees
        var baseInput = {
            base: base,
            D: D,
            A: A,
            betaDeg: beta,
            Dj: Dj,
            Ds: Ds,
            constants: machineLike.constants,
        };
        var hnPlus = computeTonHeights(__assign(__assign({}, baseInput), { betaDeg: beta + delta })).hn;
        var hnMinus = computeTonHeights(__assign(__assign({}, baseInput), { betaDeg: beta - delta })).hn;
        var dHn_dBeta = (hnPlus - hnMinus) / (2 * delta);
        if (Math.abs(dHn_dBeta) < 1e-6)
            continue;
        var angleErr = Math.abs(maxRes / dHn_dBeta);
        if (angleErr > maxAngle)
            maxAngle = angleErr;
    }
    if (maxAngle === 0)
        return null;
    return maxAngle;
}
/**

/**
 * Numerically solves for the angle (beta) that corresponds to a given physical setup.
 * Used for "Direct Swap" feature.
 */
function solveBetaForFixedSetup(base, D, A, Dj, Ds, constants, targetValue, mode) {
    // We want to find beta in [1, 89] such that computeTonHeights(...).hn === targetHn
    var low = 1;
    var high = 89;
    var getVal = function (b) {
        var res = computeTonHeights({
            base: base,
            D: D,
            A: A,
            betaDeg: b,
            Dj: Dj,
            Ds: Ds,
            constants: constants,
            angleOffsetDeg: 0
        });
        return mode === 'hn' ? res.hn : res.hr;
    };
    var valLow = getVal(low);
    var valHigh = getVal(high);
    if (!Number.isFinite(valLow) || !Number.isFinite(valHigh))
        return null;
    // Determine monotonicity direction
    var isAscending = valHigh > valLow;
    // Check if target is out of bounds
    if (isAscending) {
        if (targetValue < valLow || targetValue > valHigh)
            return null;
    }
    else {
        if (targetValue > valLow || targetValue < valHigh)
            return null;
    }
    // Binary search (approx 40 iterations is more than enough for 6 decimal places)
    var mid = (low + high) / 2;
    for (var i = 0; i < 45; i++) {
        mid = (low + high) / 2;
        var valMid = getVal(mid);
        if (isAscending) {
            if (valMid < targetValue)
                low = mid;
            else
                high = mid;
        }
        else {
            if (valMid < targetValue)
                high = mid;
            else
                low = mid;
        }
    }
    return mid;
}
