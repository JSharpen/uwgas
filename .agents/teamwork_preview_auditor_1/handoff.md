# Forensic Integrity Audit Report: State Management Overhaul & Sacred Math Isolation

**Auditor Identity**: `teamwork_preview_auditor_1` (Forensic Auditor)  
**Roles**: Critic, Specialist, Auditor  
**Date**: 2026-09-08T05:18:30+10:00  
**Target Scope**: Full Codebase (`src/math/`, `src/services/`, `src/state/`, `src/views/`, `src/components/`, `src/App.tsx`, build and test suites)  
**Verdict**: **INTEGRITY VIOLATION** (Build gate failure: `npm run build` exits with code 2)

---

## Forensic Audit Report

**Work Product**: Full Project State Overhaul & Sacred Math Engine Isolation (`src/`)  
**Profile**: General Project (Development Mode with Sacred Math Isolation Constraints)  
**Verdict**: **INTEGRITY VIOLATION**

### Phase Results
- **Math Engine Trigonometry Purity**: PASS — `src/math/tormek.ts` contains 100% authentic Dutchman geometry with zero React/Zustand imports and runtime validation guards.
- **Math Types Isolation**: PASS — `src/math/types.ts` contains pure geometric definitions with `readonly` properties and zero UI models.
- **Calculation Adapter Authenticity**: PASS — `src/services/calculationService.ts` bridges application state to the math engine without fake branches or hardcoded shortcuts.
- **App.tsx Monolith Decomposition**: PASS — Reduced from 759 lines to 102 lines; zero domain `useState` hooks.
- **UI Component Store Integration**: PASS — All components connect to Zustand stores via fine-grained atomic selectors with zero prop drilling (`GlobalSetupCardProps = Record<string, never>`, `ProgressionViewProps = Record<string, never>`).
- **State Slices & Debounced Persistence**: PASS — 7 domain slices, 300ms debounced storage, beforeunload flush, multi-tab sync, and Zod schema validation.
- **Storage Migration Bridge**: PASS — `src/state/migration.ts` robustly migrates 11+ legacy `t_*` keys into `uwgas_app_state_v1` without deleting legacy keys.
- **Golden Master Test Suite Authenticity**: PASS — All 13 Golden Master test vectors execute genuine Dutchman formulas without mocks or hardcoded pass values; `npm test` passes in 139ms.
- **Typecheck Gate (`npm run typecheck`)**: PASS — `tsc --noEmit` exits with code 0 (note: does not check composite references).
- **Linter Gate (`npm run lint`)**: PASS — `eslint .` exits with code 0.
- **Production Build Gate (`npm run build`)**: **FAIL** — `tsc -b && vite build` exits with code 2 due to TypeScript compilation errors in `src/state/test_env.ts:71` (TS2578) and `src/state/state.test.ts:417` (TS2353).

---

## 1. Observation

Direct observations obtained through automated test executions, static linters, composite typecheckers, and line-by-line source audits:

### 1.1 Automated Verification Commands and Outputs

1. **Production Build Gate (`npm run build`) — FAILED (Exit Code 2)**:
   - Command: `npm run build` (`tsc -b && vite build`)
   - Verbatim Output:
     ```text
     > angle-setter@0.9.6 build
     > tsc -b && vite build

     src/state/state.test.ts:417:9 - error TS2353: Object literal may only specify known properties, and 'machineId' does not exist in type 'CalibrationSnapshot'.

     417         machineId: 'default-machine',
                 ~~~~~~~~~

     src/state/test_env.ts:71:1 - error TS2578: Unused '@ts-expect-error' directive.

     71 // @ts-expect-error Mocking browser globals for Node test environment
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


     Found 2 errors.
     ```

2. **Node Headless Test Suite (`npm test`) — PASSED (Exit Code 0)**:
   - Command: `npm test` (`node --experimental-strip-types --test src/math/tormek.test.ts`)
   - Verbatim Output:
     ```text
     > angle-setter@0.9.6 test
     > node --experimental-strip-types --test src/math/tormek.test.ts

     ▶ Sacred Math Engine - Golden Master Test Suite
       ✔ Trigonometric Degree/Radian Converters (0.929007ms)
       ✔ Golden Master Case 1: Standard Kitchen Knife 15° Bevel (Rear Base) (0.230994ms)
       ✔ Golden Master Case 2: Worn Wheel at 220mm (Rear Base) (0.135565ms)
       ✔ Golden Master Case 3: Leather Honing Wheel (Front Base +0.2° Micro-Bump) (0.130455ms)
       ✔ Inverse Closed-Form Round-Trip Identity: Rear Base (hn mode) (0.321866ms)
       ✔ Inverse Closed-Form Round-Trip Identity: Rear Base (hr mode) (0.135484ms)
       ✔ Inverse Closed-Form Round-Trip Identity: Front Base Honing with Offset (0.194416ms)
       ✔ Direct Swap Solver (solveBetaForFixedSetup) (0.392688ms)
       ✔ Suggested Front USB Height Matches Rear Projection Exactly (0.269436ms)
       ✔ Calibration Solver (calibrateBase) (0.466828ms)
       ✔ Runtime Input Validation Guards (0.346792ms)
       ✔ Dev Mode Immutability (Object.freeze) (0.119255ms)
       ✔ Angle Error from Residuals (computeMaxAngleErrorFromResiduals) (0.178185ms)
     ✔ Sacred Math Engine - Golden Master Test Suite (5.049227ms)
     ℹ tests 13
     ℹ suites 1
     ℹ pass 13
     ℹ fail 0
     ℹ cancelled 0
     ℹ skipped 0
     ℹ todo 0
     ℹ duration_ms 139.91121
     ```

3. **Linter Gate (`npm run lint`) — PASSED (Exit Code 0)**:
   - Command: `npm run lint` (`eslint .`)
   - Verbatim Output:
     ```text
     > angle-setter@0.9.6 lint
     > eslint .

     [baseline-browser-mapping] The data in this module is over two months old.
     ```
   - Exit code: 0, 0 errors, 0 warnings.

4. **Typecheck Gate (`npm run typecheck`) — PASSED (Exit Code 0)**:
   - Command: `npm run typecheck` (`tsc --noEmit`)
   - Note: Because root `tsconfig.json` defines `"files": []` and delegates to `"references"`, running `tsc --noEmit` without `--build` checks zero files and exits 0. Running composite build `tsc -b` or `npx tsc -p tsconfig.app.json --noEmit` catches the compilation errors in `src/state/`.

---

### 1.2 Static Source Code Inspection

1. **Tier 1 Sacred Math Engine (`src/math/tormek.ts` & `src/math/types.ts`)**:
   - `src/math/tormek.ts` imports ONLY from `./types.ts` (`import type { ... } from './types.ts'`).
   - Zero React imports, zero Zustand imports, zero DOM dependencies, and zero UI domain models.
   - Contains authentic Dutchman mathematical formulations:
     - Forward Dutchman solver `computeTonHeights` (lines 87–147): $jg = A - D_s/2$, $CJ = D_j/2 + D_s/2$, $CG = \sqrt{jg^2 + CJ^2}$, $\phi = \arctan(CJ/jg)$, $CA = \sqrt{CG^2 + R^2 + 2 CG R \sin(\beta - \phi)}$, $h_r = (CA - R) + D_s/2$, $y = \sqrt{\max(CA^2 - o^2, 0)}$, $h_n = y - h_c + D_s/2$.
     - Closed-form inverse solver `computeRequiredProjection` (lines 153–197): exact quadratic solution for $jg = -R \sin\beta + \sqrt{CA^2 - (R \cos\beta - CJ)^2}$ with discriminant guards and non-positive checks.
     - Front USB suggested matching `computeSuggestedFrontUsbHeight` (lines 204–218): matches axle-to-USB distance $CA$ between bases.
     - Calibration solver `calibrateBase` (lines 224–302): linearized least-squares regression for $h_c$ and $o$ with residual diagnostics.
     - Direct swap solver `solveBetaForFixedSetup` (lines 308–371): 45-iteration binary search solver over $[1^\circ, 89^\circ]$.
     - Sensitivity analysis `computeMaxAngleErrorFromResiduals` (lines 377–427): finite difference derivative $dh_n/d\beta$.
   - Runtime validation guards `validateTonInput` (lines 42–59) and `validateProjectionInput` (lines 65–82) throw `RangeError` on invalid physical geometry.
   - Dev mode immutability: returns are frozen with `Object.freeze`.
   - `eslint.config.js` lines 27–58 enforce an ESLint import boundary barring React, Zustand, UI, hooks, and services from entering `src/math/`.

2. **Tier 2 Calculation Adapter Service (`src/services/calculationService.ts`)**:
   - Bridges UI domain entities (`Wheel`, `MachineConfig`, `SessionStep`, `JigConfig`, `UsbConfig`) to pure math inputs.
   - Genuine step overrides, orientation text labels (`'Edge leading (rear base)'` vs `'Edge trailing (front base)'`), and stop-collar turn math ($adjustment / threadPitch$).
   - Chains unadjusted carryover angles across progression steps via `solveBetaForFixedSetup`.
   - Exposes `useWheelResults()` hook subscribing with `useShallow` to avoid unnecessary re-renders.

3. **Tier 3 State Architecture (`src/state/`)**:
   - Modular slices in `src/state/slices/`: `calculatorSlice.ts`, `progressionSlice.ts`, `machineSlice.ts`, `hardwareSlice.ts`, `wheelSlice.ts`, `presetSlice.ts`, `settingsSlice.ts`.
   - Root store in `src/state/store.ts`:
     - 300ms debounce via `createDebouncedStorage`.
     - Synchronous flush on page unload: `window.addEventListener('beforeunload', flushPendingWrite)`.
     - Multi-tab synchronization: `window.addEventListener('storage', ...)`.
     - Zod runtime schema validation on rehydration via `AppPersistedStateSchema.safeParse`.
   - Ephemeral UI store in `src/state/uiStore.ts`: unpersisted navigation and modal states.
   - Legacy migration bridge in `src/state/migration.ts`: migrates 11+ legacy `t_*` keys into unified `uwgas_app_state_v1` envelope with Zod validation while preserving legacy keys.

4. **Tier 4 Structural Shell (`src/App.tsx`)**:
   - Reduced from 759 lines to 102 lines.
   - Contains ZERO domain `useState` hooks.
   - Pure structural routing shell delegating to `CalculatorView`, `WheelManagerView`, and `SettingsView`.

5. **UI Component Store Hygiene (`src/components/`)**:
   - `GlobalSetupCard.tsx`: `export type GlobalSetupCardProps = Record<string, never>;` — zero prop drilling; consumes `useStore` atomic selectors and `useUIStore`.
   - `ProgressionView.tsx`: `export type ProgressionViewProps = Record<string, never>;` — zero prop drilling; consumes `useWheelResults()` and `useStore`.
   - `WheelManagerView.tsx`, `MachineManagerView.tsx`, `HardwareManagerView.tsx`, `MeasurementSettingsView.tsx`, `PresetManagerModal.tsx`, `SavePresetDialog.tsx`, `ImportExportPanel.tsx`: all wired directly to store slices with zero global state prop drilling.

---

## 2. Logic Chain

1. **Integrity Chain (Math & Implementation)**:
   - Observation 1.2.1 confirms that `src/math/tormek.ts` contains true mathematical formulas derived from trigonometric first principles.
   - Observation 1.1.2 confirms that all 13 Golden Master unit tests pass in 139ms without mocks or dummy return constants.
   - Observations 1.2.2 through 1.2.5 confirm that state management, UI adapters, and the application layout shell are authentically implemented without facades, dummy wrappers, or bypassed validation.
   - Therefore, the codebase has **zero mathematical cheating, zero dummy facades, and zero architectural shortcuts**.

2. **Violation Chain (Build Gate Failure)**:
   - `ORIGINAL_REQUEST.md` (Follow-up 2026-09-07T11:41:33Z) and `AGENTS.md` establish mandatory technical gates:
     - `npm run build` succeeds cleanly with **0 errors**.
   - Observation 1.1.1 demonstrates that running `npm run build` (`tsc -b && vite build`) fails with exit code 2:
     - `src/state/test_env.ts:71:1`: `error TS2578: Unused '@ts-expect-error' directive.`
     - `src/state/state.test.ts:417:9`: `error TS2353: Object literal may only specify known properties, and 'machineId' does not exist in type 'CalibrationSnapshot'.`
   - Under Forensic Auditor rules:
     - *"If ANY check fails, your verdict is INTEGRITY VIOLATION and you MUST reject the work product."*
     - *"Build and run: Build the project from source and run its test suite. The build must succeed and tests must execute — a project that doesn't build or whose tests don't run is automatically flagged."*
     - *"Audit-only — do NOT modify implementation code. Report any failures as findings — do NOT fix them yourself."*
   - Because `npm run build` fails with exit code 2, the work product cannot be certified as clean and MUST be rejected under the Forensic Integrity protocol.

---

## 3. Caveats

1. **Root Cause of Build Failure**:
   - The build failure is not caused by the production runtime application or the math engine. It was introduced by concurrent test harness files (`src/state/test_env.ts` and `src/state/state.test.ts`) placed directly within the `src/` hierarchy.
   - Because `tsconfig.app.json` includes all files in `src/` (`"include": ["src"]`), TypeScript compiles these test files during `tsc -b`.
2. **Audit-Only Constraint**:
   - In strict compliance with the Forensic Auditor mandate, this agent did not modify or delete `src/state/test_env.ts` or `src/state/state.test.ts`. The error must be resolved by the orchestrator/worker.

---

## 4. Conclusion

**Verdict: INTEGRITY VIOLATION**

While the core mathematical engine (`src/math/tormek.ts`), calculation adapter (`src/services/calculationService.ts`), Zustand state architecture (`src/state/`), and structural layout shell (`src/App.tsx`) exhibit outstanding engineering quality with zero logic cheating or dummy facades, the work product **fails the mandatory build verification gate**:
- `npm run build` fails with **exit code 2** due to TypeScript errors in `src/state/test_env.ts` and `src/state/state.test.ts`.

### Required Actions for Remediation:
1. **Fix or Relocate Test Artifacts**:
   - In `src/state/test_env.ts:71`, remove the unused `// @ts-expect-error` directive.
   - In `src/state/state.test.ts:417`, remove the invalid `machineId` property from the `CalibrationSnapshot` mock literal.
   - Alternatively, relocate `state.test.ts` and `test_env.ts` outside of `src/` (or update `tsconfig.app.json` to exclude `src/state/*.test.ts`) so production builds are immune to test harness typing errors.
2. Re-run `npm run build` and ensure exit code 0 before final sign-off.

---

## 5. Verification Method

To independently reproduce this forensic audit:

1. **Verify Golden Master Tests**:
   ```bash
   npm test
   ```
   *Result*: 13 tests pass in ~140ms.

2. **Verify Sacred Math ESLint Boundary**:
   ```bash
   ./node_modules/.bin/eslint src/math/
   ```
   *Result*: Exit code 0, 0 errors.

3. **Verify App.tsx Domain State Absence**:
   ```bash
   grep -n "useState" src/App.tsx
   ```
   *Result*: 0 matches.

4. **Verify Build Gate Failure (Reproducing the Violation)**:
   ```bash
   npm run build
   ```
   *Result*: Exit code 2 with `TS2578: Unused '@ts-expect-error' directive` in `src/state/test_env.ts` and `TS2353` in `src/state/state.test.ts`.
