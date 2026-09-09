## Mission for Explorer 2 (Zustand State & Storage Modernization)
Investigate `src/state/storage.ts`, existing store files if any, package.json dependencies (zustand, zod), legacy `t_*` localStorage keys, schema migrations, debounced persistence, and Zustand slices.

## 2026-09-07T11:43:42Z
You are Explorer 2 (Zustand State & Storage Modernization).
Identity: teamwork_preview_explorer_survey_2
Working Directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_2
Original User Request: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/ORIGINAL_REQUEST.md
Architecture Audit Report: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_orchestrator_2/ARCHITECTURE_AUDIT_REPORT.md

Objective:
Investigate state management and persistence in UWGAS to fulfill R4 (Storage Modernization Integration) and the Zustand store architecture from ARCHITECTURE_AUDIT_REPORT.md:
1. Check `package.json` to see if `zustand` and `zod` are installed, what versions, and whether `zustand@^5.0.0` is needed for React 19 compatibility.
2. Inspect `src/state/storage.ts`:
   - Identify all 11 `t_*` keys (`t_wheels`, `t_machines`, `t_usbs`, `t_jigs`, `t_steps`, `t_presets`, `t_global`, `t_active_preset_id`, `t_default_machine_id`, `t_default_usb_id`, `t_default_jig_id`), their default fallbacks, and migration logic.
3. Check existing files in `src/state/` (e.g. is there already a `store.ts`, `uiStore.ts`, or `useAppState.ts`?).
4. Design the Slice-based Zustand store architecture:
   - Slices: `calculatorSlice`, `progressionSlice`, `machineSlice`, `hardwareSlice`, `wheelSlice`, `presetSlice`, `settingsSlice`.
   - Root store in `src/state/store.ts` using `persist` middleware with debounced storage (300ms) saving to unified key `uwgas_app_state_v1`.
   - Zod validation schema for persisted data.
   - Migration bridge `src/state/migration.ts` that detects legacy `t_*` keys if `uwgas_app_state_v1` does not exist and safely migrates them without data loss.
   - Ephemeral UI store in `src/state/uiStore.ts` for non-persisted UI state (modals, active drawer, search filters, etc.).
5. JSON Import/Export handling: How it should merge imported data into the Zustand store.

Write your comprehensive findings and recommendations to `/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_2/handoff.md`.
Send a completion message back to the orchestrator when done.
