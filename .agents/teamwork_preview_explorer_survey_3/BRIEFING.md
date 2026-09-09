# BRIEFING — 2026-09-07T21:48:30+10:00

## Mission
Investigate `src/App.tsx` and all UI components to fulfill R1 (Dismantle the God Component), R2 (Eradicate Prop Drilling), and Phase 1 (Housekeeping & Dead Code Removal). Produce a comprehensive inventory, store slice mapping, selector hygiene strategy, decomposition blueprint, and dead code cleanup checklist.

## 🔒 My Identity
- Archetype: explorer
- Roles: [investigator, synthesizer]
- Working directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_3
- Original parent: 6fedca73-ef37-4988-8c06-9f6566f6a92f
- Milestone: Teamwork Preview Architecture Refactor Survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source code files in `src/` or `docs/`.
- Produce structured analysis in `.agents/teamwork_preview_explorer_survey_3/handoff.md`.
- Keep BRIEFING.md concise (<100 lines) and maintain heartbeat in `progress.md`.
- Report completion to parent agent via `send_message`.

## Current Parent
- Conversation ID: 6fedca73-ef37-4988-8c06-9f6566f6a92f
- Updated: 2026-09-07T21:44:00+10:00

## Investigation State
- **Explored paths**: `src/App.tsx`, `src/components/calculator/GlobalSetupCard.tsx`, `src/components/ProgressionView.tsx`, `src/components/settings/SettingsRootView.tsx`, `src/components/settings/MeasurementSettingsView.tsx`, `src/components/settings/HardwareManagerView.tsx`, `src/components/settings/MachineManagerView.tsx`, `src/components/CalibrationWizard.tsx`, `src/components/wheels/WheelManagerView.tsx`, `src/components/presets/PresetManagerModal.tsx`, `src/components/presets/SavePresetDialog.tsx`, `src/components/ImportExportPanel.tsx`, `src/components/ModalShell.tsx`, `src/components/MiniSelect.tsx`, `src/components/calculator/ActionSheetPicker.tsx`, `src/primitives.css`, `src/ui/buttons.ts`.
- **Key findings**:
  - `src/App.tsx` has 23 `useState` hooks, 18 unmemoized handlers, an imperative `collapseAll` event bus, brute-force CSS pointerdown listener, and drills up to 22 props into leaf components.
  - 4 orphaned files identified for deletion: `GrindDirToggle.tsx` (74L), `ExpandToggle.tsx` (42L), `useAppState.ts` (249L), `buttons.ts` (17L).
  - 2 transpiled JS/CJS artifacts identified for deletion: `tormek.cjs` (431L), `core.js` (110L).
  - `.u-btn` CSS classes (lines 18-215 in `primitives.css`) are completely unused across all TSX components.
  - Decomposition blueprint reduces `App.tsx` from 759 lines down to ~60 lines.
- **Unexplored areas**: None. All survey objectives investigated.

## Key Decisions Made
- Map all UI views to atomic Zustand store selectors (`useStore`) and `useUIStore`.
- Recommend replacing `CustomEvent("collapseAll")` and pointerdown CSS sniffing with declarative state in `useUIStore`.

## Artifact Index
- DISPATCH.md — record of initial prompt/dispatch
- BRIEFING.md — working memory and situational awareness
- progress.md — liveness heartbeat
- handoff.md — final 5-component report
