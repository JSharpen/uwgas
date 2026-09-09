## 2026-09-07T11:50:18Z

You are Worker M3 (Sliced Zustand Stores & Storage Migration Bridge).
Identity: teamwork_preview_worker_m3
Working Directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_worker_m3
Original User Request: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/ORIGINAL_REQUEST.md
Survey Report: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_2/handoff.md
Project Plan: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_orchestrator_3/PROJECT.md

Exclusive Write Ownership:
- `src/state/slices/calculatorSlice.ts`
- `src/state/slices/progressionSlice.ts`
- `src/state/slices/machineSlice.ts`
- `src/state/slices/hardwareSlice.ts`
- `src/state/slices/wheelSlice.ts`
- `src/state/slices/presetSlice.ts`
- `src/state/slices/settingsSlice.ts`
- `src/state/store.ts`
- `src/state/uiStore.ts`
- `src/state/migration.ts`
DO NOT modify any files in `src/math/`, `src/components/`, or `src/App.tsx`.

Objective:
Execute R4 (Storage Modernization Integration) and the Zustand store architecture per Explorer 2's report:
1. Create `src/state/slices/`:
   - `calculatorSlice.ts` (global settings, calcMode, fixedUsb, protrusion, etc.)
   - `progressionSlice.ts` (steps CRUD, ordering, default progression loader)
   - `machineSlice.ts` (machines CRUD, calibration profiles)
   - `hardwareSlice.ts` (jigs & USBs CRUD)
   - `wheelSlice.ts` (wheels CRUD, normalization)
   - `presetSlice.ts` (presets CRUD, save/rename/delete/load)
   - `settingsSlice.ts` (heightMode 'hn'|'hr', calibration snapshots & applied IDs)
2. Implement root store `src/state/store.ts`:
   - Compose all 7 slices.
   - Implement debounced storage wrapper (300ms) with `beforeunload` flush handler and window `storage` event listener for multi-tab sync.
   - Configure `persist` middleware saving to unified key `uwgas_app_state_v1`.
   - Validate persisted state on load using `AppPersistedStateSchema.safeParse`.
   - Implement `importState` action handling atomic JSON merging/overwriting.
   - Export atomic selector hooks (`useCalculatorSettings`, `useProgressionState`, `useHardwareState`, `useMachineState`, `useWheelState`, `usePresetState`).
   - Fix existing build/lint errors TS6133 (`get` unused) and `@typescript-eslint/no-explicit-any`.
3. Implement `src/state/uiStore.ts`:
   - Ephemeral UI store for `view`, `settingsView`, `isSetupPanelOpen`, `selectedPresetId`, `isPresetDialogOpen`, `isPresetManagerOpen`, etc.
4. Implement `src/state/migration.ts`:
   - `migrateLegacyStorageIfNeeded()` function that detects any of the 11+ legacy `t_*` keys when `uwgas_app_state_v1` is missing, parses/normalizes them, validates with Zod, and initializes `uwgas_app_state_v1` without deleting legacy keys.
5. Verify with `npm run typecheck` and `npm run lint`.
