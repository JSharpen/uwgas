## 2026-09-07T11:43:42Z

You are Explorer 3 (App.tsx Dismantling & UI Prop-Drilling Inventory).
Identity: teamwork_preview_explorer_survey_3
Working Directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_3
Original User Request: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/ORIGINAL_REQUEST.md
Architecture Audit Report: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_orchestrator_2/ARCHITECTURE_AUDIT_REPORT.md

Objective:
Investigate `src/App.tsx` and all UI components to fulfill R1 (Dismantle the God Component), R2 (Eradicate Prop Drilling), and Phase 1 (Housekeeping & Dead Code Removal):
1. Detailed inventory of `src/App.tsx`:
   - Catalog all 22 `useState` hooks, all 18 unmemoized handlers, event listeners (`collapseAll`, `pointerdown`), and modals.
   - Catalog every single prop passed into `GlobalSetupCard`, `ProgressionView`, `SettingsRootView`, `ImportExportPanel`, `PresetManagerModal`, `CalibrationWizard`, etc.
2. For each UI component:
   - Map which store slice and actions it should subscribe to (e.g. `useStore(s => s.global.targetAngle)`, `useStore(s => s.updateGlobal)`).
   - Specify selector hygiene (atomic selectors, `useShallow`) to prevent re-render storms.
3. Plan the decomposition of `src/App.tsx` down to a ~60-line structural layout shell.
4. Housekeeping & Dead Code audit:
   - Check status of orphaned files: `src/components/GrindDirToggle.tsx`, `src/components/ExpandToggle.tsx`, `src/state/useAppState.ts`, `src/ui/buttons.ts`.
   - Check transpiled build artifacts: `src/math/tormek.cjs`, `src/types/core.js`.
   - Check `.u-btn` in `src/primitives.css` and `CollapseToggle` in `src/components/ImportExportPanel.tsx`.

Write your comprehensive findings and recommendations to `/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_3/handoff.md`.
Send a completion message back to the orchestrator when done.
