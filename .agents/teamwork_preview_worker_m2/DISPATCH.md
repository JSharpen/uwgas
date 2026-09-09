## Mission for Worker M2 (Sacred Math Engine Isolation)
Implement Tier 1 Pure Math Core in `src/math/tormek.ts` & `src/math/types.ts`.
Extract Tier 2 Application Calculation Service into `src/services/calculationService.ts`.
Add file-scoped ESLint import restrictions in `eslint.config.js`.
Add headless Golden Master unit test suite `src/math/tormek.test.ts` / test runner script in `package.json`.
Verify all 11 test vectors pass in <50ms and 0 lint errors exist in `src/math/`.

## 2026-09-07T11:50:18Z
You are Worker M2 (Sacred Math Engine Isolation & Headless Test Suite).
Identity: teamwork_preview_worker_m2
Working Directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_worker_m2
Original User Request: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/ORIGINAL_REQUEST.md
Survey Report: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_1/handoff.md
Project Plan: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_orchestrator_3/PROJECT.md

Exclusive Write Ownership:
- `src/math/types.ts`
- `src/math/tormek.ts`
- `src/services/calculationService.ts`
- `src/math/tormek.test.ts` (and/or test runner files)
- `eslint.config.js`
- `package.json` (for test script addition only)
- `docs/MATH_REFERENCE.md` (for reconciling drifted table values)
DO NOT modify any files in `src/state/`, `src/components/`, or `src/App.tsx`.

Objective:
Execute R3 (Enforce Math Engine Isolation) and Phase 2 of ARCHITECTURE_AUDIT_REPORT.md according to the specifications in Explorer 1's report:
1. Create `src/math/types.ts` containing pure geometric interfaces (`ReadonlyTonInput`, `ReadonlyTonOutput`, `ReadonlyProjectionInput`, `ReadonlyProjectionOutput`, `ReadonlyCalibrationMeasurement`, `CalibrationResultOutput`, `MachineConstants`, etc.). Zero UI types.
2. Refactor `src/math/tormek.ts` into Tier 1 Sacred Pure Math Core:
   - Contains ONLY pure trigonometric formulas: `deg2rad`, `rad2deg`, `computeTonHeights`, `computeRequiredProjection`, `computeSuggestedFrontUsbHeight`, `calibrateBase`, `solveBetaForFixedSetup`, `computeMaxAngleErrorFromResiduals`.
   - Use `readonly` input parameter types.
   - Implement runtime validation guards `validateTonInput` and `validateProjectionInput` throwing `RangeError` on invalid physical geometry.
   - Freeze outputs with `Object.freeze` in dev mode.
   - Remove all UI models (`Wheel`, `SessionStep`, `GlobalState`, `MachineConfig`, `JigConfig`, `UsbConfig`, `WheelResult`).
   - Remove `computeWheelResults` and UI adapter `estimateMaxAngleErrorDeg` from `tormek.ts`.
3. Create Tier 2 Application Calculation Service `src/services/calculationService.ts`:
   - Contains `computeWheelResults` and `estimateMaxAngleErrorDeg`.
   - Handles entity lookups (`wheels.find`, `machines.find`, `usbs.find`, `jigs.find`).
   - Formats human-readable orientation labels (`'Edge leading (rear base)'`, `'Edge trailing (front base)'`).
   - Calculates stop-collar turns based on thread pitch.
   - Chains unadjusted carryover angles across steps.
   - Also implement `useWheelResults()` hook subscribing via `useShallow` to `useStore` so UI components can consume calculation results cleanly.
4. Update `eslint.config.js`:
   - Add a file-scoped rule for `src/math/**/*.{ts,tsx}` with `no-restricted-imports` barring React, ReactDOM, Zustand, and imports from UI/state/components.
5. Create headless automated Golden Master unit test suite `src/math/tormek.test.ts` (or `.test.mjs` / Node 22 test runner / Vitest) covering all 11 test vectors from Explorer 1's report. Update `package.json` so `npm test` runs these tests and passes in <50ms.
6. Reconcile `docs/MATH_REFERENCE.md:86-90` with the mathematically verified values ($CA = 197.904 mm, hn = 168.4836 mm$).
7. Verify with `npm test`, `npm run lint`, `npm run typecheck`.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When finished, write your report to `/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_worker_m2/handoff.md` and send a completion message back to the orchestrator.

