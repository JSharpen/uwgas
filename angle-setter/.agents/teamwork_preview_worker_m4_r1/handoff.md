# Milestone M4_r1 Handoff Report: UI Component Refactoring & App.tsx Shell Decomposition

**Agent**: `teamwork_preview_worker_m4_r1`  
**Milestone**: M4_r1 — UI Component Refactoring & App.tsx Shell Decomposition (R1 God Component Dismantling & R2 Prop Drilling Eradication)  
**Date**: 2026-09-08T05:10:00+10:00  
**Working Directory**: `/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_worker_m4_r1`  
**Parent Agent**: `teamwork_preview_orchestrator_2` (`6fedca73-ef37-4988-8c06-9f6566f6a92f`)

---

## 1. Observation

### 1.1 Baseline State
At the start of this assignment:
1. `src/App.tsx` was a 759-line God Component managing 23 distinct `useState` hooks, 18 unmemoized handlers, an imperative `ResizeObserver`, global click-outside listeners using brute-force DOM querying (`target.closest(...)`), and passing up to 22 drilled props down to child components.
2. Baseline `npm test` exited with code 0 (13/13 passing tests in `src/math/tormek.test.ts`).
3. Baseline `npm run lint` failed with 1 error:
   ```text
   /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/src/components/settings/MachineManagerView.tsx
     26:9  error  'jigsProp' is assigned a value but never used  @typescript-eslint/no-unused-vars
   ✖ 1 problem (1 error, 0 warnings)
   ```
4. Baseline `npm run build` failed with 2 errors:
   ```text
   src/App.tsx:1:10 - error TS2305: Module '"./math/tormek"' has no exported member 'computeWheelResults'.
   src/components/settings/MachineManagerView.tsx:26:9 - error TS6133: 'jigsProp' is declared but its value is never read.
   ```

### 1.2 Delivered Artifacts and Changes
All changes were executed strictly within exclusive write ownership:
1. `src/views/CalculatorView.tsx` (172 lines created):
   - Encapsulates `<GlobalSetupCard />` and `<ProgressionView />`.
   - Encapsulates progression sticky header and its `ResizeObserver` setup computing `--progression-header-bottom`.
   - Encapsulates progression empty-state CTA actions ("Load Standard Progression" and "Add Blank Step").
   - Encapsulates pointerdown event listener for click-outside dismissal of `isSetupPanelOpen`.
   - Encapsulates `"collapseAll"` custom event dispatch when setup panel is opened.
2. `src/views/SettingsView.tsx` (43 lines created):
   - Sub-router reading `settingsView` from `useUIStore`.
   - Renders `SettingsRootView`, `MeasurementSettingsView`, `HardwareManagerView`, `MachineManagerView`, `ImportExportPanel`, or `GlossaryPage`.
   - Provides consistent "Back to Settings" navigation header for sub-views.
3. `src/components/calculator/GlobalSetupCard.tsx`:
   - Converted to 0 props (`export function GlobalSetupCard()`).
   - Replaced drilled props and local fallbacks with direct atomic primitive store subscriptions (`useStore(s => s.global.targetAngle)`, `useStore(s => s.global.projection)`, `useStore(useShallow(s => s.machines))`, `useUIStore(s => s.isSetupPanelOpen)`).
   - Removed unused type imports (`SessionStep`, `GlobalState`, `MachineConstants`, etc.).
4. `src/components/ProgressionView.tsx`:
   - Converted `ProgressionView` to 0 props (`export function ProgressionView()`).
   - Subscribes to `useWheelResults()` from `src/services/calculationService` and domain actions from `src/state/store`.
   - Eradicated all 12 drilled props into `StepCard` (`machines`, `usbs`, `jigs`, `globalJigId`, `globalUsbId`, `heightMode`, `isProjectionMode`, `showAdvancedStepOverrides`, `onUpdateStep`, `onUpdateWheel`, `onDeleteStep`, `onMoveStep`); `StepCard` now subscribes directly to store slices with atomic selectors.
   - Cleaned unused type imports (`MachineConfig`, `UsbConfig`, `Wheel`, `SessionStep`, `JigConfig`, `CalcMode`).
5. `src/components/wheels/WheelManagerView.tsx`:
   - Converted to 0 props (`export function WheelManagerView()`).
   - Subscribes directly to `useWheelState()`.
6. `src/components/settings/MachineManagerView.tsx`:
   - Converted to 0 props (`export default function MachineManagerView()`).
   - Subscribes directly to `useMachineState()`, `useStore`, and `useUIStore`.
   - Removed unused `jigsProp` and cleaned type imports (`UsbConfig`, `GlobalState`, `Wheel`).
7. `src/components/settings/HardwareManagerView.tsx`:
   - Converted to 0 props (`export default function HardwareManagerView()`).
   - Subscribes directly to `useHardwareState()` and `useUIStore(s => s.setSettingsView)`.
8. `src/components/settings/MeasurementSettingsView.tsx`:
   - Converted to 0 props (`export default function MeasurementSettingsView()`).
   - Subscribes directly to atomic primitive selectors (`useStore(s => s.heightMode)`, `useStore(s => s.global.calcMode)`, `useStore(s => s.global.useProtrusionMode)`, `useStore(s => s.global.showAdvancedStepOverrides)`).
9. `src/components/settings/SettingsRootView.tsx`:
   - Converted to 0 props (`export default function SettingsRootView()`).
   - Connects directly to `useUIStore((s) => s.setSettingsView)`.
10. `src/components/CalibrationWizard.tsx`:
    - Removed unused `jigs` prop from `CalibrationWizardProps` and props destructuring.
    - Verified import of `estimateMaxAngleErrorDeg` from `../services/calculationService`.
    - Subscribes directly to `useStore(useShallow(s => s.jigs))`.
11. `src/components/ImportExportPanel.tsx`:
    - Converted to 0 props (`function ImportExportPanel()`).
    - Uses `useStore.getState()` for JSON export serialization, `useStore(s => s.importState)` for atomic section imports, and `useUIStore()` for section selection and modal states.
12. `src/components/presets/PresetManagerModal.tsx`:
    - Converted to 0 props (`export function PresetManagerModal()`).
    - Connects directly to `useUIStore(s => s.isPresetManagerOpen)` and `usePresetState()`.
13. `src/components/presets/SavePresetDialog.tsx`:
    - Converted to 0 props (`export function SavePresetDialog()`).
    - Connects directly to `useUIStore(s => s.isPresetDialogOpen)` and `usePresetState()`.
14. `src/App.tsx`:
    - Completely dismantled from 759 lines down to 102 lines.
    - Contains zero `useState` hooks managing domain data.
    - Operates as a thin structural shell rendering `<CalculatorView />`, `<WheelManagerView />`, or `<SettingsView />` with global modals and workshop-compliant bottom navigation tabs.

---

## 2. Logic Chain

1. **Eradication of God Component Re-renders (R1)**:
   - In the previous monolithic `App.tsx`, changing any input (such as typing a single character into a preset name or toggling a drawer) forced `App.tsx` to re-evaluate all 23 hooks, reallocate 18 closure handlers, and re-render the entire component tree.
   - Moving all domain state to sliced Zustand stores (`src/state/store.ts`) and ephemeral UI flags to `useUIStore` (`src/state/uiStore.ts`) enabled decomposing `App.tsx` into a static layout shell that only subscribes to `view`.
   - Modals (`PresetManagerModal`, `SavePresetDialog`) self-govern their visibility via `useUIStore(s => s.isPresetManagerOpen)` and `useUIStore(s => s.isPresetDialogOpen)`.

2. **Atomic Selector Hygiene & Re-render Isolation (R2)**:
   - By subscribing components to atomic primitive selectors (`useStore(s => s.global.targetAngle)`) and shallow equality collections (`useStore(useShallow(s => s.machines))`), components only re-render when their specific subscribed data slice changes.
   - In `ProgressionView.tsx` and `StepCard`, removing the drilled arrays (`machines`, `usbs`, `jigs`) and replacing them with direct store selectors eliminates the cascading $O(\text{Steps} \times \text{Machines})$ re-render storms on every top-level angle tweak.

3. **0-Props Signature Pattern for Zero Lint/Type Errors**:
   - Defining 0-props components as `export function Foo() { ... }` or `export default function Bar() { ... }` prevents TypeScript's `no-empty-pattern` warning (from `({}: Props = {})`) and `no-unused-vars` warning (from `(_props: Props = {})`).
   - Combined with cleaning up unused type imports, this resulted in 0 ESLint errors across the entire codebase.

---

## 3. Caveats

- **Untouched State and Math Engines**: In strict compliance with instructions, no files in `src/math/` or `src/state/` were modified.
- **No Residual Code in `.agents/`**: All source code changes exist strictly in `src/` and `src/views/`. `.agents/` contains only coordination metadata.

---

## 4. Conclusion

Milestone M4_r1 is completely finished:
- `src/App.tsx` is successfully decomposed from 759 lines down to 102 lines with 0 domain `useState` hooks.
- Extracted `src/views/CalculatorView.tsx` and `src/views/SettingsView.tsx`.
- Eradicated prop drilling across all 11 target components with atomic selector hygiene.
- All 13 Golden Master unit tests pass (100%).
- `npm run typecheck`, `npm run lint`, and `npm run build` all pass with **0 errors and 0 warnings**.

---

## 5. Verification Method

To independently verify the implementation:

1. **Run Golden Master Test Suite**:
   ```bash
   npm test
   ```
   *Expected Result*: 13 passing tests, 0 failures, exit code 0.

2. **Run TypeScript Typecheck**:
   ```bash
   npm run typecheck
   ```
   *Expected Result*: 0 errors, exit code 0.

3. **Run ESLint Suite**:
   ```bash
   npm run lint
   ```
   *Expected Result*: 0 errors, 0 warnings, exit code 0.

4. **Run Vite Production Build**:
   ```bash
   npm run build
   ```
   *Expected Result*: Build completes with 0 errors, bundling `dist/assets/index-*.js` and `dist/assets/index-*.css`.

5. **Inspect `src/App.tsx` Line Count and State Hooks**:
   ```bash
   wc -l src/App.tsx
   grep -n "useState" src/App.tsx
   ```
   *Expected Result*: ~102 lines; 0 lines matching `useState`.
