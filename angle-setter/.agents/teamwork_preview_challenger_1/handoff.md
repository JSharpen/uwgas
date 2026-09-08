# Empirical Challenge Report & Handoff — Challenger 1 (Math & Calculation Engine)

**Agent Identity**: `teamwork_preview_challenger_1`  
**Role**: Empirical Challenger (critic, specialist)  
**Target Scope**: Tier 1 Sacred Pure Math Engine (`src/math/tormek.ts`, `src/math/types.ts`) & Tier 2 Calculation Adapter Service (`src/services/calculationService.ts`)  
**Verdict**: **APPROVE** (Tier 1 Math Engine & Tier 2 Adapter pass all mathematical, numerical, immutability, and boundary constraints)

---

## 1. Observation

### 1.1 Source Code and Architecture Inspection
1. **Purity of `src/math/`**:
   - Files inspected: `src/math/tormek.ts` (428 lines), `src/math/types.ts` (87 lines), `src/math/tormek.test.ts` (326 lines).
   - In `src/math/tormek.ts` lines 18–28:
     ```typescript
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
     ```
   - Automated grep pattern search `(react|zustand)` across `src/math/` yielded `0 matches`.
   - Production files in `src/math/` contain zero imports of `react`, `react-dom`, `zustand`, UI components, hooks, or external application state.
   - `eslint.config.js` lines 27–58 enforce a strict `no-restricted-imports` rule on `src/math/**/*.{ts,tsx}`, forbidding `react`, `react-dom`, `zustand`, `zustand/shallow`, `zustand/react/shallow`, `../types/core`, and relative patterns to `components`, `hooks`, `state`, `ui`, `views`, `calculators`, and `services`.
   - Running `./node_modules/.bin/eslint src/math/ src/services/` returned **0 errors, 0 warnings**.

2. **Validation Guards in `src/math/tormek.ts`**:
   - `validateTonInput` (lines 42–59):
     - `D <= 0 || !Number.isFinite(D)` throws `RangeError("Invalid wheel diameter: ...")`
     - `Ds <= 0 || !Number.isFinite(Ds)` throws `RangeError("Invalid USB diameter: ...")`
     - `Dj < 0 || !Number.isFinite(Dj)` throws `RangeError("Invalid jig diameter: ...")`
     - `A <= Ds / 2 || !Number.isFinite(A)` throws `RangeError("Projection A (...) must be > Ds/2 (...)")`
     - `totalBeta <= 0 || totalBeta >= 90 || !Number.isFinite(totalBeta)` throws `RangeError("Target angle (...) must be between 0° and 90°")`
   - `validateProjectionInput` (lines 65–82):
     - Validates $D > 0$, $D_s > 0$, $D_j \ge 0$, $fixedUsb.value > 0$, and $0^\circ < totalBeta < 90^\circ$, throwing `RangeError` on violation.
   - Inverse reachability guard (lines 184–196):
     - When `termUnderRoot < 0` or `jg <= 0`, gracefully returns `Object.freeze({ A: null, jg: null, CA, isReachable: false })`.

3. **Dev Mode Immutability (`Object.freeze`)**:
   - `computeTonHeights` returns `Object.freeze({ hn, hr, CA, y, phiRad, betaEffDeg })` (line 139).
   - `computeRequiredProjection` returns `Object.freeze({ A, jg, CA, isReachable })` for both reachable and unreachable cases (lines 187, 192, 196).
   - `calibrateBase` returns `Object.freeze({ hc, o, diagnostics: Object.freeze({ residuals: [...residuals], maxAbsResidualMm }) })` (lines 294–301).

4. **Tier 2 Stop-Collar Turn Calculations (`src/services/calculationService.ts`)**:
   - Lines 150–162:
     ```typescript
     if (
       global.useProtrusionMode &&
       global.protrusion !== undefined &&
       activeJig?.isAdjustableLength &&
       activeJig?.length
     ) {
       const requiredJigLength = projOutput.A - global.protrusion;
       requiredJigAdjustmentMm = requiredJigLength - activeJig.length;
       if (activeJig.threadPitch) {
         requiredJigTurns = requiredJigAdjustmentMm / activeJig.threadPitch;
       }
     }
     ```
   - Gracefully leaves `requiredJigAdjustmentMm = null` and `requiredJigTurns = null` when protrusion mode is disabled or jig is not adjustable.

---

### 1.2 Adversarial Test Harness Execution Results
We implemented and executed an exhaustive adversarial challenge test suite in `scratch/adversarial_challenge.ts`.
Command:
```bash
./node_modules/.bin/jiti scratch/adversarial_challenge.ts
```
Execution Output:
```text
================================================================
  U W G A S   A D V E R S A R I A L   C H A L L E N G E   S U I T E  
================================================================

--- [TEST 1] Round-Trip Identities across 250 Randomized Parameter Sets ---
[PASS] 250/250 Randomized Round-Trip Identities Verified: Max Delta(hn)=1.1369e-13 mm, Max Delta(hr)=5.6843e-14 mm (all < 1e-10 mm, requirement satisfied by factor of 1000)
--- [TEST 2] Boundary & Singular Inputs Guard Verification ---
[PASS] computeTonHeights guards: 32/32 boundary/singular inputs correctly rejected with RangeError
[PASS] computeRequiredProjection guards: 14/14 boundary/singular inputs correctly rejected with RangeError
[PASS] computeRequiredProjection: physically unreachable USB position gracefully returns frozen { isReachable: false, A: null, jg: null }
--- [TEST 3] Dev Mode Immutability (Object.freeze) ---
[PASS] computeTonHeights: Object.isFrozen confirmed; mutations on all 6 properties throw TypeError
[PASS] computeRequiredProjection (reachable): Object.isFrozen confirmed; mutations on all 4 properties throw TypeError
[PASS] computeRequiredProjection (unreachable): Object.isFrozen confirmed; mutations on all 4 properties throw TypeError
[PASS] calibrateBase: Object.isFrozen confirmed for root result and diagnostics child
--- [TEST 4] Worn Wheels (D=200mm to 250mm) and Micro-Bevel Offsets ---
[PASS] Worn wheels D=200..250mm: Strict monotonic height reduction and angle invariance confirmed across 6 wear diameters
[PASS] Micro-bevel offsets -1.0° to +3.0°: 41 micro-step offsets tested with precision < 1e-9°
--- [TEST 5] Front USB Height Matching Solver Precision ---
[PASS] Front USB Height Matching Precision: Max |CA_rear - CA_front| = 2.8422e-14 mm, Max |A_rear - A_front| = 2.8422e-14 mm (all < 1e-10 mm, machine precision)
--- [TEST 6] Stop-Collar Turn Calculations in Tier 2 Adapter ---
[PASS] Stop-collar turn calculations: +turns, -turns, thread pitch scaling, and null guards verified
--- [TEST 7] Direct Swap Solver (solveBetaForFixedSetup) ---
[PASS] Direct Swap Solver: 5/5 angles solved with precision < 1e-6°; out-of-bounds safely return null
--- [TEST 8] Architectural Purity & Import Isolation ---
[PASS] Architectural Purity: 0 forbidden imports detected across all production files in src/math/

================================================================
  FINAL RESULT: 14 PASSED, 0 FAILED  
================================================================

ALL EMPIRICAL CHALLENGES PASSED PERFECTLY.
```

### 1.3 Built-in Golden Master Test Suite
Command:
```bash
npm test
```
Result:
```text
▶ Sacred Math Engine - Golden Master Test Suite
  ✔ Trigonometric Degree/Radian Converters (0.982037ms)
  ✔ Golden Master Case 1: Standard Kitchen Knife 15° Bevel (Rear Base) (0.335481ms)
  ✔ Golden Master Case 2: Worn Wheel at 220mm (Rear Base) (0.160341ms)
  ✔ Golden Master Case 3: Leather Honing Wheel (Front Base +0.2° Micro-Bump) (0.155513ms)
  ✔ Inverse Closed-Form Round-Trip Identity: Rear Base (hn mode) (0.385285ms)
  ✔ Inverse Closed-Form Round-Trip Identity: Rear Base (hr mode) (0.168687ms)
  ✔ Inverse Closed-Form Round-Trip Identity: Front Base Honing with Offset (0.25549ms)
  ✔ Direct Swap Solver (solveBetaForFixedSetup) (0.48409ms)
  ✔ Suggested Front USB Height Matches Rear Projection Exactly (0.287991ms)
  ✔ Calibration Solver (calibrateBase) (0.480013ms)
  ✔ Runtime Input Validation Guards (0.358635ms)
  ✔ Dev Mode Immutability (Object.freeze) (0.129594ms)
  ✔ Angle Error from Residuals (computeMaxAngleErrorFromResiduals) (0.178616ms)
✔ Sacred Math Engine - Golden Master Test Suite (5.810359ms)
ℹ tests 13, suites 1, pass 13, fail 0
```

### 1.4 Peer Workspace Finding (Unrelated to Math Engine)
When executing the global repository lint check `npm run lint`:
```text
/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/src/state/state.test.ts
    30:3   error  'SessionStep' is defined but never used                @typescript-eslint/no-unused-vars
  1074:13  error  'initialJigsCount' is assigned a value but never used  @typescript-eslint/no-unused-vars
  1075:13  error  'initialUsbsCount' is assigned a value but never used  @typescript-eslint/no-unused-vars
```
A peer agent working on the state test suite introduced 3 unused variables in `src/state/state.test.ts`. Per review-only rules, Challenger 1 did not touch this file, but flags it for the peer/orchestrator to fix.

---

## 2. Logic Chain

1. **Round-Trip Identity Precision**:
   - The test generated 250 randomized parameter sets covering both rear and front bases, wheel diameters $180\text{mm} \le D \le 260\text{mm}$, projections $50\text{mm} \le A \le 220\text{mm}$, bevel angles $8^\circ \le \beta \le 42^\circ$, micro-bevel offsets $-1.5^\circ \le \Delta\beta \le +3.5^\circ$, and varied jig/USB diameters ($D_j \in [9, 16]\text{mm}$, $D_s \in [10, 14]\text{mm}$).
   - For every setup, forward Dutchman heights ($h_n, h_r$) were computed, then inverse Dutchman projection $A_{\text{inv}}$ was computed using both `hn` and `hr` fixed modes.
   - The observed maximum discrepancy across all 250 trials was:
     - $\Delta_{\max}(h_n) = 1.1369 \times 10^{-13}\text{ mm}$
     - $\Delta_{\max}(h_r) = 5.6843 \times 10^{-14}\text{ mm}$
   - Both are well below the required threshold of $10^{-10}\text{ mm}$ by nearly three orders of magnitude, operating at the limit of IEEE 754 double precision.

2. **Validation & Singularity Defense**:
   - 32 singular cases were tested against `computeTonHeights` ($D \le 0, \text{NaN}, \pm\infty$; $D_s \le 0, \text{NaN}, \infty$; $D_j < 0, \text{NaN}$; $A \le D_s/2, 0, -10, \text{NaN}, \infty$; $\beta \le 0^\circ, \ge 90^\circ, \text{NaN}, \infty$; and offset combinations causing effective $\beta \le 0^\circ$ or $\ge 90^\circ$). All 32 correctly raised `RangeError`.
   - 14 singular cases were tested against `computeRequiredProjection` ($D \le 0$; $D_s \le 0$; $D_j < 0$; $fixedUsb.value \le 0, \text{NaN}, \infty$; $\beta \le 0^\circ, \ge 90^\circ$). All 14 correctly raised `RangeError`.
   - When given geometrically unreachable inputs (e.g. USB height far below physical reach), `computeRequiredProjection` returned `{ A: null, jg: null, CA, isReachable: false }` without throwing.

3. **Dev Mode Immutability**:
   - All output objects returned by `computeTonHeights`, `computeRequiredProjection` (both reachable and unreachable states), and `calibrateBase` (including its nested `diagnostics` object) have `Object.isFrozen(res) === true`.
   - In strict mode, every property assignment attempt threw `TypeError`, ensuring external callers (such as UI components or state stores) cannot mutate cached or returned calculation records.

4. **Front USB Matching Precision & Geometric Boundary**:
   - For rear datum heights within the normal operational sharpening range ($110\text{mm} \le h_{n,\text{rear}} \le 200\text{mm}$), the suggested front height matches the rear wheel distance to $|CA_{\text{rear}} - CA_{\text{front}}| = 2.8422 \times 10^{-14}\text{ mm}$.
   - Evaluating `computeRequiredProjection` on the front base with this suggested height yields identical projection to $|A_{\text{rear}} - A_{\text{front}}| = 2.8422 \times 10^{-14}\text{ mm}$.
   - **Boundary Discovery**: Because the Tormek T-8 front USB mount has a fixed horizontal displacement $o_{\text{front}} = 131.7\text{ mm}$, the minimum achievable distance from axle to USB on the front base is $131.7\text{ mm}$ (at $y_{\text{front}} = 0$). Any rear setting below $h_{n,\text{rear}} \approx 98.84\text{ mm}$ implies $CA_{\text{rear}} < 131.7\text{ mm}$, which is geometrically unreachable on the front mount. `computeSuggestedFrontUsbHeight` properly handles this via `Math.max(0, yFront2)`, returning finite clamped values without generating `NaN` or crashing.

5. **Tier 2 Stop-Collar Calculations**:
   - For an adjustable jig ($D_j = 12\text{mm}$, length = $80\text{mm}$, thread pitch = $1.25\text{mm}$) with protrusion = $50\text{mm}$, a solved projection $A = 139.0\text{mm}$ produces required adjustment $+9.0\text{mm}$ and $+7.2$ turns.
   - When projection requires shortening the jig ($A = 125.0\text{mm}$), the adjustment is $-5.0\text{mm}$ and $-4.0$ turns.
   - When protrusion mode is disabled or jig is non-adjustable, both adjustment and turns are strictly `null`.

6. **Architectural Purity**:
   - The ESLint configuration enforces zero imports of React, Zustand, UI, or state stores into `src/math/`.
   - Inspection of `src/math/tormek.ts` and `src/math/types.ts` confirms 100% adherence to pure scalar/type declarations.

---

## 3. Caveats

1. **Non-Standard Machine Offsets**: We tested standard Tormek T-8 and T-4 geometries as well as randomized positive offset configurations. Extreme non-standard grinder designs with zero or negative horizontal offset ($o \le 0$) were not tested as they do not correspond to any known commercial wet grinders.
2. **Peer State Test Lint Issue**: `src/state/state.test.ts` currently fails `npm run lint` due to 3 unused variables (`SessionStep`, `initialJigsCount`, `initialUsbsCount`). This is entirely isolated from `src/math/` and `src/services/` (which lint cleanly with 0 errors).

---

## 4. Conclusion

**VERDICT: APPROVE**

The Tier 1 Sacred Pure Math Engine (`src/math/tormek.ts`, `src/math/types.ts`) and Tier 2 Calculation Adapter Service (`src/services/calculationService.ts`) are **empirically verified, mathematically sound, defensively guarded, and architecturally isolated**:
- Round-trip Dutchman identities hold across randomized trials to **$1.13 \times 10^{-13}\text{ mm}$** ($\approx$ machine precision).
- Runtime validation guards prevent invalid or corrupting geometric inputs, throwing `RangeError` across 46 distinct boundary conditions.
- Dev mode immutability is strictly enforced via `Object.freeze`.
- Worn wheels ($D=200\text{mm}$ to $250\text{mm}$) and micro-bevel offsets behave with strict monotonicity and high numerical stability.
- Front USB matching achieves sub-tenth-picometer parity with the rear wheel distance.
- Stop-collar turn calculations in the Tier 2 adapter correctly calculate directional adjustments and thread pitches while preserving null-safety.
- Zero React or Zustand imports exist within `src/math/`.

---

## 5. Verification Method

To independently reproduce and verify all findings:

1. **Execute the Empirical Adversarial Challenge Test Harness**:
   ```bash
   ./node_modules/.bin/jiti scratch/adversarial_challenge.ts
   ```
   *Expected Output*: `14 PASSED, 0 FAILED`, Max Delta(hn) $\approx 1.13 \times 10^{-13}\text{ mm}$, all singular guards passing with RangeError.

2. **Execute the Golden Master Test Suite**:
   ```bash
   npm test
   ```
   *Expected Output*: `pass 13, fail 0` in $\approx 5\text{ms}$.

3. **Verify Sacred Math ESLint Isolation Barrier**:
   ```bash
   ./node_modules/.bin/eslint src/math/ src/services/
   ```
   *Expected Output*: 0 errors, 0 warnings.

4. **Verify TypeScript Typechecking**:
   ```bash
   npm run typecheck
   ```
   *Expected Output*: Clean exit code 0.
