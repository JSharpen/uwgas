## 2026-09-07T12:02:00Z
You are Worker M4 (UI Component Refactoring & App.tsx Shell Decomposition).
Identity: teamwork_preview_worker_m4
Working Directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_worker_m4
Original User Request: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/ORIGINAL_REQUEST.md
Survey Report: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_3/handoff.md
Project Plan: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_orchestrator_3/PROJECT.md

Exclusive Write Ownership:
- `src/views/CalculatorView.tsx`
- `src/views/SettingsView.tsx`
- `src/components/calculator/GlobalSetupCard.tsx`
- `src/components/ProgressionView.tsx`
- `src/components/wheels/WheelManagerView.tsx`
- `src/components/settings/MachineManagerView.tsx`
- `src/components/settings/HardwareManagerView.tsx`
- `src/components/settings/MeasurementSettingsView.tsx`
- `src/components/settings/SettingsRootView.tsx`
- `src/components/CalibrationWizard.tsx`
- `src/components/ImportExportPanel.tsx`
- `src/components/presets/PresetManagerModal.tsx`
- `src/components/presets/SavePresetDialog.tsx`
- `src/App.tsx`
DO NOT modify `src/math/` or `src/state/`.

Objective:
Execute R1 (Dismantle the God Component) and R2 (Eradicate Prop Drilling):
1. Extract Views:
   - Create `src/views/CalculatorView.tsx`: Render `<GlobalSetupCard />` and `<ProgressionView />`. Encapsulate sticky header measurement and click-outside dismissal for `isSetupPanelOpen`.
   - Create `src/views/SettingsView.tsx`: Sub-router reading `settingsView` from `useUIStore`, rendering `SettingsRootView`, `MeasurementSettingsView`, `HardwareManagerView`, `MachineManagerView`, `ImportExportPanel`, or `GlossaryPage`.
2. Eradicate Prop Drilling with Atomic Selector Hygiene across all UI components:
   - `GlobalSetupCard`: 0 props. Direct store subscriptions using atomic primitive selectors (`useStore(s => s.global.targetAngle)`, `useStore(s => s.global.projection)`, `useStore(useShallow(s => s.machines))`, `useUIStore(s => s.isSetupPanelOpen)`).
   - `ProgressionView`: 0 props. Subscribes to `useWheelResults()` from `src/services/calculationService` and `useStore` actions. In `StepCard`, eliminate unnecessary props and subscribe directly to `useStore` / `useUIStore` actions.
   - `WheelManagerView`: 0 props. Subscribes to `useWheelState()`.
   - `MachineManagerView`: 0 props. Subscribes to `useMachineState()`.
   - `HardwareManagerView`: 0 props. Subscribes to `useHardwareState()`.
   - `MeasurementSettingsView`: 0 props. Subscribes to `useStore`.
   - `SettingsRootView`: 0 props. Connect to `useUIStore.setSettingsView`.
   - `CalibrationWizard`: Update import of `estimateMaxAngleErrorDeg` to `src/services/calculationService`. Remove unused `jigs` prop.
   - `ImportExportPanel`: 0 props. Use `useStore.getState()`, `useStore(s => s.importState)`, and `useUIStore()`.
   - `PresetManagerModal`: 0 props. Connect to `useUIStore(s => s.isPresetManagerOpen)` and `usePresetState()`.
   - `SavePresetDialog`: 0 props. Connect to `useUIStore(s => s.isPresetDialogOpen)` and `usePresetState()`.
3. Dismantle `src/App.tsx`:
   - Replace 759-line God Component with ~60-line structural layout shell and bottom navigation router following Explorer 3's blueprint (lines 290-368 in `handoff.md`).
   - Zero `useState` hooks managing domain data!
4. Verification:
   - Run `npm test` (all 13 tests must pass).
   - Run `npm run typecheck` (0 errors).
   - Run `npm run lint` (0 errors).
   - Run `npm run build` (0 errors).
