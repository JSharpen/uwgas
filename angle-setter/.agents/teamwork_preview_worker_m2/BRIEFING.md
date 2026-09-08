# BRIEFING — 2026-09-07T11:50:18Z

## Mission
Execute Milestone 2 (Sacred Math Engine Isolation & Headless Test Suite): isolate Tier 1 pure math core in `src/math/tormek.ts` & `src/math/types.ts`, extract Tier 2 application calculation service in `src/services/calculationService.ts`, configure ESLint import restrictions, implement headless Golden Master unit tests in `src/math/tormek.test.ts`, and reconcile `docs/MATH_REFERENCE.md`.

## 🔒 My Identity
- Archetype: teamwork_preview_worker_m2
- Roles: implementer, qa, specialist
- Working directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_worker_m2/
- Original parent: 5621ad4c-fe00-4ed4-9024-37aac2add112
- Milestone: M2: Settings Views & Managers
- Current parent: 6fedca73-ef37-4988-8c06-9f6566f6a92f
- Current Milestone: Milestone 2 (Sacred Math Engine Isolation & Headless Test Suite)

## 🔒 Key Constraints
- Exclusive write ownership for M2 (only edit the 7 assigned files):
  1. src/components/settings/SettingsRootView.tsx
  2. src/components/settings/MeasurementSettingsView.tsx
  3. src/components/settings/HardwareManagerView.tsx
  4. src/components/settings/MachineManagerView.tsx
  5. src/components/wheels/WheelManagerView.tsx
  6. src/components/wheels/WheelFormFields.tsx
  7. src/components/ImportExportPanel.tsx
- Strictly preserve all React hooks, state, props interfaces, and event handlers verbatim.
- Zero hardcoded light-mode colors (e.g., bg-white, bg-black/5).
- Card surfaces: bg-[#262626], rounded-3xl, border border-white/10, subtle top edge highlight.
- Inner wells / cards: bg-black/30 or bg-black/20, rounded-2xl, border border-white/5.
- Steppers & buttons: rounded-xl / rounded-2xl, >= 44x44px touch envelopes.
- Verification gate: npm run typecheck, npm run lint, npm run build must pass with 0 errors.
- Milestone 2 Exclusive Write Ownership:
  1. `src/math/types.ts`
  2. `src/math/tormek.ts`
  3. `src/services/calculationService.ts`
  4. `src/math/tormek.test.ts` (and/or test runner files)
  5. `eslint.config.js`
  6. `package.json` (for test script addition only)
  7. `docs/MATH_REFERENCE.md` (for reconciling drifted table values)
- DO NOT modify any files in `src/state/`, `src/components/`, or `src/App.tsx`.
- Tier 1 Pure Math Core (`src/math/tormek.ts`): contains ONLY pure trigonometric formulas (`deg2rad`, `rad2deg`, `computeTonHeights`, `computeRequiredProjection`, `computeSuggestedFrontUsbHeight`, `calibrateBase`, `solveBetaForFixedSetup`, `computeMaxAngleErrorFromResiduals`).
- Remove all UI models (`Wheel`, `SessionStep`, `GlobalState`, `MachineConfig`, `JigConfig`, `UsbConfig`, `WheelResult`) and remove `computeWheelResults` and `estimateMaxAngleErrorDeg` from `src/math/tormek.ts`.
- Pure input types using `readonly`.
- Runtime validation guards `validateTonInput` and `validateProjectionInput` throwing `RangeError` on invalid physical geometry.
- Return frozen objects (`Object.freeze`).
- Tier 2 Calculation Adapter Service (`src/services/calculationService.ts`): contains `computeWheelResults`, `estimateMaxAngleErrorDeg`, and `useWheelResults()` hook subscribing via `useShallow` to `useStore`.
- ESLint rule: `src/math/**/*.{ts,tsx}` with `no-restricted-imports` barring React, ReactDOM, Zustand, and imports from UI/state/components/services.
- Headless Golden Master unit test suite: runs all 11 test vectors in <50ms with 0 errors.
- Integrity: DO NOT CHEAT. All implementations must be genuine.

## Current Parent
- Conversation ID: 6fedca73-ef37-4988-8c06-9f6566f6a92f
- Updated: 2026-09-07T11:50:18Z

## Task Summary
- **What to build**: Pure geometric types (`src/math/types.ts`), purified pure math engine (`src/math/tormek.ts`), calculation adapter service (`src/services/calculationService.ts`), ESLint sacred boundary guard (`eslint.config.js`), headless unit tests (`src/math/tormek.test.ts`), `package.json` test script, and `docs/MATH_REFERENCE.md` reconciliation.
- **Success criteria**: All 11 Golden Master test vectors pass in <50ms, 0 ESLint errors in `src/math/`, pure mathematical precision preserved.
- **Interface contracts**: `/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_orchestrator_3/PROJECT.md`
- **Code layout**: `PROJECT.md` § Code Layout

## Key Decisions Made
- Use native Node 22 test runner with `--experimental-strip-types` for zero-dependency, ultra-fast (<10ms) execution of `src/math/tormek.test.ts`.
- Retain exact trigonometric formulas for forward and inverse Dutchman solvers, validating geometry at runtime with `RangeError`.
- Keep `src/math/tormek.ts` completely free of external dependencies (pure math only).

## Artifact Index
- `.agents/teamwork_preview_worker_m2/DISPATCH.md` — Assignment instructions
- `.agents/teamwork_preview_worker_m2/BRIEFING.md` — Persistent working memory
- `.agents/teamwork_preview_worker_m2/progress.md` — Progress tracker & liveness heartbeat
- `.agents/teamwork_preview_worker_m2/handoff.md` — Final handoff report
- `src/math/types.ts` — Pure geometric type contracts
- `src/math/tormek.ts` — Pure trigonometric math core
- `src/services/calculationService.ts` — Tier 2 calculation service & hook
- `src/math/tormek.test.ts` — Golden Master unit tests
- `docs/MATH_REFERENCE.md` — Reconciled mathematical reference documentation

## Change Tracker
- **Files modified**:
  1. `src/math/types.ts` — Created pure geometric interfaces (ReadonlyTonInput, ReadonlyTonOutput, MachineConstants, etc.). Zero UI types.
  2. `src/math/tormek.ts` — Refactored to Tier 1 Sacred Pure Math Core with runtime validation guards, Object.freeze, and pure trigonometric formulas.
  3. `src/services/calculationService.ts` — Created Tier 2 Calculation Adapter Service with computeWheelResults, estimateMaxAngleErrorDeg, and useWheelResults() hook.
  4. `eslint.config.js` — Added no-restricted-imports barrier barring React, Zustand, and UI/state imports in src/math/**/*.{ts,tsx}.
  5. `src/math/tormek.test.ts` — Created headless Golden Master unit test suite with 13 test vectors running via Node 22 native test runner.
  6. `package.json` — Updated test script to run node --experimental-strip-types --test src/math/tormek.test.ts.
  7. `docs/MATH_REFERENCE.md` — Reconciled Reference Cases 1-3 with verified Dutchman calculations.
- **Build status**: PASS (npm test passes in ~6ms, npm run lint passes with 0 errors, npm run typecheck passes with 0 errors).
- **Pending issues**: None within M2 scope. Note: App.tsx and CalibrationWizard.tsx imports of computeWheelResults and estimateMaxAngleErrorDeg are ready to be migrated to src/services/calculationService by Worker M4 and Worker M5.

## Quality Status
- **Build/test result**: PASS (13/13 tests pass in 6.04ms)
- **Lint status**: 0 errors across all files
- **Tests added/modified**: 13 Golden Master unit tests in `src/math/tormek.test.ts` covering forward Dutchman, worn wheel, honing micro-bump, inverse projection round-trips, direct swap solver, front USB height matching, calibration recovery, validation guards, immutability, and angle sensitivity.

## Loaded Skills
- **Source**: N/A
- **Local copy**: N/A
- **Core methodology**: Pure mathematical precision, strict architectural boundary enforcement, comprehensive test vector coverage
