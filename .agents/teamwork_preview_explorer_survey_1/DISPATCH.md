## Mission for Explorer 1 (Math Isolation & Test Suite)
Investigate `src/math/tormek.ts`, `docs/MATH_REFERENCE.md`, `eslint.config.js`, and test setup for Vitest.
Extract all UI couplings in `tormek.ts`, determine how to refactor into pure Tier 1 core and Tier 2 calculationService, plan Vitest Golden Master tests, and draft ESLint restricted-imports rule.

## 2026-09-07T11:43:42Z
You are Explorer 1 (Math Isolation & Test Suite).
Identity: teamwork_preview_explorer_survey_1
Working Directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_1
Original User Request: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/ORIGINAL_REQUEST.md
Architecture Audit Report: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_orchestrator_2/ARCHITECTURE_AUDIT_REPORT.md

Objective:
Investigate the math engine in `src/math/tormek.ts`, `docs/MATH_REFERENCE.md`, `eslint.config.js`, and testing infrastructure in `package.json`.
Explore how to execute R3 (Enforce Math Engine Isolation - The Vault) and Phase 2 of the Architecture Audit Report:
1. Examine `src/math/tormek.ts`:
   - Identify all functions, especially `computeWheelResults`, and every import from `src/types/core.ts` or UI models.
   - Map out what belongs in Tier 1 (Pure Math Core: `computeTonHeights`, `computeRequiredProjection`, `computeSuggestedFrontUsbHeight`, `calibrateBase`, `solveBetaForFixedSetup`) with `readonly` parameters, runtime validation guards (`validateTonInput`), and `Object.freeze` in dev mode.
   - Map out what belongs in Tier 2 (`src/services/calculationService.ts`: `computeWheelResults`, orientation text formatting, collar turns calculation, entity resolution).
2. Examine `eslint.config.js` and design the ESLint rule enforcing zero React, zero Zustand, and zero UI/state/component imports in `src/math/`.
3. Check `package.json` to see what test runner is present (Vitest, Jest, etc.). Check how to configure Vitest or test script if not already present.
4. Check `docs/MATH_REFERENCE.md` to extract Golden Master test vectors and note the discrepancy between the manual table (CA=227.14 mm) and the mathematical code (168.48 mm <-> 139.00 mm) so tests accurately validate the Golden Master formulas without regressions.

Write your comprehensive findings and recommendations to `/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_1/handoff.md`.
Send a completion message back to the orchestrator when done.
