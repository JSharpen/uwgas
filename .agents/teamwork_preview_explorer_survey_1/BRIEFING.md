# BRIEFING — 2026-09-07T21:48:25+10:00

## Mission
Investigate math engine isolation (The Vault), pure Tier 1 math core vs Tier 2 calculationService, ESLint isolation boundary, Vitest testing setup, and Golden Master test vectors.

## 🔒 My Identity
- Archetype: explorer
- Roles: math-isolation-and-test-suite-survey
- Working directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_1
- Original parent: 6fedca73-ef37-4988-8c06-9f6566f6a92f
- Milestone: survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Math Purity: All trigonometric calculations belong in src/math/tormek.ts. Never alter formulas without verifying against docs/MATH_REFERENCE.md.
- Write only to your folder (.agents/teamwork_preview_explorer_survey_1)

## Current Parent
- Conversation ID: 6fedca73-ef37-4988-8c06-9f6566f6a92f
- Updated: 2026-09-07T21:48:25+10:00

## Investigation State
- **Explored paths**: `src/math/tormek.ts`, `src/types/core.ts`, `src/App.tsx`, `eslint.config.js`, `package.json`, `docs/MATH_REFERENCE.md`, `ARCHITECTURE_AUDIT_REPORT.md`
- **Key findings**:
  1. `src/math/tormek.ts` contains UI/domain couplings: `computeWheelResults` and `estimateMaxAngleErrorDeg` import and process `GlobalState`, `Wheel`, `SessionStep`, `MachineConfig`, `JigConfig`, `UsbConfig`, and generate UI presentation strings ('Edge leading (rear base)').
  2. Pure Tier 1 core (`computeTonHeights`, `computeRequiredProjection`, `computeSuggestedFrontUsbHeight`, `calibrateBase`, `solveBetaForFixedSetup`) can be cleanly isolated in `src/math/` with zero UI types and local `Readonly<T>` interfaces.
  3. `docs/MATH_REFERENCE.md` manual table has legacy drifted numbers ($CA = 227.14\text{ mm}, h_n = 198.57\text{ mm}$), whereas the mathematical formulas in `tormek.ts` and the Inverse Golden Master table ($h_n = 168.4836\text{ mm} \leftrightarrow A = 139.00\text{ mm}$) are mathematically exact with machine-epsilon precision.
  4. Vitest is not yet installed in `package.json` (`"test": "echo ..."`). Node 22 native `node --test` executes all 11 prototype test vectors in 5.9ms.
  5. ESLint rule using `no-restricted-imports` can be added to `eslint.config.js` targeting `src/math/**/*.{ts,tsx}` to permanently prevent React, Zustand, UI, hooks, state, and component imports.
- **Unexplored areas**: None. All objectives surveyed.

## Key Decisions Made
- Confirmed mathematical veracity of `tormek.ts` over `docs/MATH_REFERENCE.md` manual table.
- Verified prototype test suite passes 11/11 tests in 5.9ms.
- Structured Tier 1 vs Tier 2 architecture specification.

## Artifact Index
- DISPATCH.md — incoming dispatch instructions
- BRIEFING.md — persistent situational awareness
- progress.md — liveness heartbeat
- tormek.golden-master.test.mjs — executable prototype test suite (11 passing tests)
- handoff.md — comprehensive final handoff report
