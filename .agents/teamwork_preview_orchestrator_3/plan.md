# Execution Plan: UWGAS State Overhaul & Math Engine Isolation

## Objective
Execute Phase 1 and Phase 2 of ARCHITECTURE_AUDIT_REPORT.md:
- Completely dismantle God Component in App.tsx (remove all useState domain state).
- Eradicate prop-drilling across all UI components with atomic Zustand selectors.
- Implement 2-Tier Sacred Math Engine Isolation (Tier 1 Pure Core + Tier 2 Adapter).
- Establish modern debounced Zod storage with legacy multi-key fallback migration.
- Clean up dead code, add automated tests, verify with 0 errors across typecheck, lint, build.

## Phase Strategy & Team Topology
1. **Survey (0. Survey)**:
   - Spawn 3 parallel Explorers:
     - Explorer 1 (Math Isolation & Vitest): Investigate `src/math/tormek.ts`, `docs/MATH_REFERENCE.md`, Vitest setup, ESLint config.
     - Explorer 2 (State Architecture & Storage): Investigate `src/state/storage.ts`, existing `src/state/store.ts` / `src/state/uiStore.ts` (if any), Zod schemas, legacy storage migration.
     - Explorer 3 (App.tsx & UI Prop Drilling): Investigate `src/App.tsx`, `GlobalSetupCard.tsx`, `ProgressionView.tsx`, `SettingsRootView.tsx`, `ImportExportPanel.tsx`, and map every single state/prop drilling pathway.
2. **Decomposition & Milestones**:
   - Synthesize explorer reports into `PROJECT.md`.
   - Milestone 1: Sacred Math Engine Purification & Headless Test Suite (Tier 1 in `src/math/tormek.ts`, Tier 2 in `src/services/calculationService.ts`, `src/math/tormek.test.ts`, ESLint barrier).
   - Milestone 2: Sliced Zustand Store & Migration Bridge (`src/state/slices/`, `src/state/store.ts`, `src/state/uiStore.ts`, `src/state/migration.ts`).
   - Milestone 3: Housekeeping & Dead Code Purge (remove leftover transpiled files, dead components, unused CSS).
   - Milestone 4: UI Component Refactoring (Connect `GlobalSetupCard`, `ProgressionView`, `SettingsRootView`, etc. directly to stores).
   - Milestone 5: App.tsx Decomposition (convert to ~60-line structural layout shell).
   - Milestone 6: Verification & Quality Gate (Reviewers, Challengers, Forensic Auditor).
