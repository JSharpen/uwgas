# Milestone 4 & 5 Quality & Adversarial Review Report

**Reviewer**: Reviewer 2 (`teamwork_preview_reviewer_2`)  
**Roles**: Reviewer, Critic  
**Date**: 2026-09-08T05:16:00+10:00  
**Working Directory**: `/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_reviewer_2`  
**Parent Agent**: `teamwork_preview_orchestrator_3` (`6fedca73-ef37-4988-8c06-9f6566f6a92f`)  
**Verdict**: **REQUEST_CHANGES**

---

## 1. Observation

### 1.1 Test Suite & Build Verification
The test and build commands were executed independently from the repo root:
```bash
npm test && npm run lint && npm run typecheck && npm run build
```
- `npm test`: Passed 13/13 unit tests in `src/math/tormek.test.ts` (<145ms duration).
- `npm run lint`: Passed with 0 errors and 0 warnings.
- `npm run typecheck`: Passed with 0 errors (`tsc --noEmit`).
- `npm run build`: Vite v7.3.6 production build passed cleanly in 1.15s (`dist/assets/index-LUSsZL15.js` 447.72 kB, `dist/assets/index-AyEar7jF.css` 95.42 kB).

### 1.2 `src/App.tsx` Inspection
- **Line Count**: Exactly 102 lines (reduced from 759 lines; within the ~100 lines target).
- **`useState` Hooks**: Verified 0 `useState` hooks. No domain data state hooks exist in `App.tsx`.
- **Role**: Pure structural layout shell and top-level tab router. Subscribes only to `useUIStore((s) => s.view)` and `useUIStore((s) => s.setView)`.
- **Child Component Props**:
  - `<CalculatorView />`: 0 props.
  - `<WheelManagerView />`: 0 props.
  - `<SettingsView />`: 0 props.
  - `<PresetManagerModal />`: 0 props.
  - `<SavePresetDialog />`: 0 props.

### 1.3 View Decompositions (`CalculatorView.tsx` & `SettingsView.tsx`)
- `src/views/CalculatorView.tsx` (171 lines):
  - Encapsulates `<GlobalSetupCard />` (0 props) and `<ProgressionView />` (0 props).
  - Encapsulates progression sticky header and its `ResizeObserver` setup calculating `--progression-header-bottom`.
  - Encapsulates pointerdown event listener for click-outside dismissal of `isSetupPanelOpen`.
  - Encapsulates `"collapseAll"` custom event trigger on setup drawer opening.
  - Conforms to the Safari flex gap math rule on line 167: `<div className="h-px shrink-0 w-full" />`.
- `src/views/SettingsView.tsx` (42 lines):
  - Sub-router reading `settingsView` from `useUIStore`.
  - Routes to `SettingsRootView`, `MeasurementSettingsView`, `HardwareManagerView`, `MachineManagerView`, `ImportExportPanel`, and `GlossaryPage`.
  - Conforms to workshop ergonomics with `min-h-[44px]` on the Back to Settings button.
  - Conforms to the Safari flex gap scroll spacer on line 38: `<div className="h-px shrink-0 w-full" />`.

### 1.4 UI Components Prop-Drilling & Selector Hygiene Audit
The 12 UI components were audited for 0-prop global state consumption and selector hygiene:

1. **`GlobalSetupCard` (`src/components/calculator/GlobalSetupCard.tsx`)**:
   - Props: `export type GlobalSetupCardProps = Record<string, never>;` (0 props).
   - Selector hygiene: Uses atomic selectors (`useStore((s) => s.global)`, `useStore((s) => s.defaultMachineId)`, `useUIStore((s) => s.isSetupPanelOpen)`) and `useShallow` for collections (`machines`, `jigs`, `usbs`, `sessionPresets`).
2. **`ProgressionView` (`src/components/ProgressionView.tsx`)**:
   - Props: `export type ProgressionViewProps = Record<string, never>;` (0 props).
   - Subscribes to Tier 2 service `useWheelResults()` and store actions (`useStore((s) => s.updateStep)`).
3. **`StepCard` (`src/components/ProgressionView.tsx`)**:
   - Props: Receives only local step context (`r`, `index`, `totalSteps`, `prevR`, `isExpanded`, `onToggleExpand`, `setSheetConfig`).
   - Zero global state variables passed via props.
   - Subscribes directly to `useStore` with atomic primitive selectors (`s.heightMode`, `s.global.calcMode === 'projection'`, `s.global.showAdvancedStepOverrides`, `s.global.activeUsbId`, `s.global.activeJigId`, `s.defaultMachineId`) and `useShallow` (`machines`, `usbs`, `jigs`).
4. **`WheelManagerView` (`src/components/wheels/WheelManagerView.tsx`)**:
   - Props: `export type WheelManagerViewProps = Record<string, never>;` (0 props).
   - Subscribes via `useWheelState()` convenience hook.
5. **`MachineManagerView` (`src/components/settings/MachineManagerView.tsx`)**:
   - Props: `export type MachineManagerViewProps = Record<string, never>;` (0 props).
   - Subscribes via `useMachineState()`.
   - **Prop-Drilling Middleman**: Lines 23-25:
     ```tsx
     const global = useStore((s) => s.global);
     const wheels = useStore(useShallow((s) => s.wheels));
     const usbs = useStore(useShallow((s) => s.usbs));
     ```
     These three subscriptions are NOT used anywhere in `MachineManagerView` except to drill down to `<CalibrationWizard>` on lines 73-76:
     ```tsx
     <CalibrationWizard usbs={usbs}
       global={global}
       activeMachine={activeMachine}
       wheels={wheels}
     ```
6. **`HardwareManagerView` (`src/components/settings/HardwareManagerView.tsx`)**:
   - Props: `export type HardwareManagerViewProps = Record<string, never>;` (0 props).
   - Subscribes via `useHardwareState()` and `useUIStore`.
7. **`MeasurementSettingsView` (`src/components/settings/MeasurementSettingsView.tsx`)**:
   - Props: `export type MeasurementSettingsViewProps = Record<string, never>;` (0 props).
   - Subscribes directly with atomic selectors (`useStore((s) => s.heightMode)`, `useStore((s) => s.global.calcMode)`, etc.).
8. **`SettingsRootView` (`src/components/settings/SettingsRootView.tsx`)**:
   - Props: `export type SettingsRootViewProps = Record<string, never>;` (0 props).
   - Subscribes directly to `useUIStore((s) => s.setSettingsView)`.
9. **`CalibrationWizard` (`src/components/CalibrationWizard.tsx`)**:
   - Props definition (lines 19-26):
     ```typescript
     type CalibrationWizardProps = {
       usbs: UsbConfig[];
       global: GlobalState;
       activeMachine: MachineConfig;
       wheels: Wheel[];
       onSaveProfile: (profile: CalibrationProfile) => void;
       onCancel: () => void;
     };
     ```
   - **Prop-Drilling Inconsistency**: While `CalibrationWizard` directly subscribes to `jigs` from the store on line 39 (`const jigs = useStore(useShallow((s) => s.jigs));`), it receives `usbs`, `global`, and `wheels` as drilled props from `MachineManagerView`!
   - This directly violates Requirement 3: *"Verify all 11 components receive 0 global state variables via React props, fetching exclusively from useStore() and useUIStore()"*.
10. **`ImportExportPanel` (`src/components/ImportExportPanel.tsx`)**:
    - Props: `export type ImportExportPanelProps = Record<string, never>;` (0 props).
    - Subscribes via `useUIStore` and `useStore((s) => s.importState)`.
11. **`PresetManagerModal` (`src/components/presets/PresetManagerModal.tsx`)**:
    - Props: `export type PresetManagerModalProps = Record<string, never>;` (0 props).
    - Subscribes via `useUIStore` and `usePresetState()`.
12. **`SavePresetDialog` (`src/components/presets/SavePresetDialog.tsx`)**:
    - Props: `export type SavePresetDialogProps = Record<string, never>;` (0 props).
    - Subscribes via `useUIStore`, `usePresetState()`, and `useStore((s) => s.sessionSteps.length)`.

### 1.5 Dead Code Purge Verification
- `src/components/GrindDirToggle.tsx`: File absent. 0 matches across `src/`.
- `src/components/ExpandToggle.tsx`: File absent. 0 matches across `src/`.
- `src/state/useAppState.ts`: File absent. 0 matches across `src/`.
- `src/ui/buttons.ts`: File absent. 0 matches across `src/`.
- `src/math/tormek.cjs`: File absent. 0 matches across `src/`.
- `src/types/core.js`: File absent. 0 matches across `src/`.
- `.u-btn` CSS class: Purged from `src/primitives.css`. 0 references in `src/`.

### 1.6 Integrity & Facade Check
- No hardcoded test responses or facade bypasses exist in `src/math/tormek.ts` or `src/services/calculationService.ts`.
- All closed-form round trips and calibration solvers execute genuine mathematical formulas.
- ESLint configuration enforces Sacred Math Isolation (`no-restricted-imports` on `src/math/`).

---

## 2. Logic Chain

1. **Decomposition of `App.tsx`**:
   - `App.tsx` line count is 102 lines (down from 759 lines, an 86.5% reduction).
   - It contains 0 `useState` hooks managing domain data. It delegates entirely to `CalculatorView`, `WheelManagerView`, `SettingsView`, and the global modals.
   - This part of Milestones 4 and 5 is verified and complete.

2. **Prop-Drilling Inconsistency & Blast Radius in `CalibrationWizard` / `MachineManagerView`**:
   - Requirement 3 explicitly states: *"Verify all 11 components receive 0 global state variables via React props, fetching exclusively from useStore() and useUIStore()"*.
   - In `src/components/CalibrationWizard.tsx`, lines 19-26 require `usbs`, `global`, and `wheels` as props.
   - In `src/components/settings/MachineManagerView.tsx`, lines 23-25 import and select `global`, `wheels`, and `usbs` from `useStore`.
   - Inspection of `MachineManagerView.tsx` confirms these three variables are never rendered or used in `MachineManagerView` itself; they exist solely to be passed as props into `<CalibrationWizard />`.
   - **Adversarial Failure Mode**: Because `MachineManagerView` subscribes to `const global = useStore((s) => s.global);`, any user modification to `targetAngle` or `projection` in the calculator drawer forces `MachineManagerView` to re-evaluate and re-render if mounted, completely defeating the goal of fine-grained re-render isolation.
   - Furthermore, `CalibrationWizard` already imports `useStore` and subscribes to `const jigs = useStore(useShallow((s) => s.jigs));` on line 39. Refactoring `CalibrationWizard` to also select `global`, `wheels`, and `usbs` directly from `useStore` would completely eliminate these props and remove the redundant subscriptions from `MachineManagerView`.

3. **Workshop Touch Target in Sticky Header**:
   - In `src/views/CalculatorView.tsx` lines 78, 92, 107, 123, the sticky header action buttons use `h-9` (36px).
   - Per `AGENTS.md` (Workshop Touch Ergonomics), buttons should adhere to minimum $44\text{px} \times 44\text{px}$ touch targets. Increasing from `h-9` to `h-11` (44px) ensures comfortable bench use with gloved or wet hands.

---

## 3. Caveats

- `CalibrationWizard` is only rendered when `calibratingMachineId` is non-null. The performance penalty of `MachineManagerView` re-rendering on `global` changes does not cause application crashes, but it is an architectural leak and an explicit violation of Requirement 3.
- Reviewer 2 is strictly review-only and did not modify implementation files.

---

## 4. Conclusion

**Verdict**: **REQUEST_CHANGES**

### Findings Summary

| ID | Severity | Location | Summary |
|---|---|---|---|
| **F-01** | **Major** | `src/components/CalibrationWizard.tsx:19-38` & `src/components/settings/MachineManagerView.tsx:23-25, 73-76` | **Incomplete Prop-Drilling Eradication**: `CalibrationWizard` receives `global`, `wheels`, and `usbs` via React props instead of `useStore`. `MachineManagerView` acts as a redundant middleman subscriber to `global`, creating unnecessary re-render overhead. |
| **F-02** | **Minor** | `src/views/CalculatorView.tsx:78, 92, 107, 123` | **Workshop Touch Target**: Sticky header pill buttons use `h-9` (36px) rather than the standard $44\text{px}$ touch target (`h-11`). |

### Required Fixes for Approval
1. **Refactor `CalibrationWizard` to fetch `global`, `wheels`, and `usbs` directly from `useStore`**:
   - In `src/components/CalibrationWizard.tsx`:
     - Remove `global`, `wheels`, and `usbs` from `CalibrationWizardProps`.
     - Subscribe directly inside `CalibrationWizard`:
       ```tsx
       const global = useStore((s) => s.global);
       const wheels = useStore(useShallow((s) => s.wheels));
       const usbs = useStore(useShallow((s) => s.usbs));
       const jigs = useStore(useShallow((s) => s.jigs));
       ```
   - In `src/components/settings/MachineManagerView.tsx`:
     - Remove `const global = useStore((s) => s.global);`, `const wheels = ...`, and `const usbs = ...`.
     - Update call site to:
       ```tsx
       <CalibrationWizard
         activeMachine={activeMachine}
         onSaveProfile={(profile) => { ... }}
         onCancel={() => setCalibratingMachineId(null)}
       />
       ```
2. (Recommended) Update sticky header buttons in `src/views/CalculatorView.tsx` from `h-9` to `h-11` for $44\text{px}$ touch target compliance.

---

## 5. Verification Method

To independently verify after changes are applied:

1. Check `CalibrationWizardProps` in `src/components/CalibrationWizard.tsx`:
   ```bash
   grep -A 10 "type CalibrationWizardProps" src/components/CalibrationWizard.tsx
   ```
   Verify `global`, `wheels`, and `usbs` are absent.
2. Check `MachineManagerView.tsx` for redundant store subscriptions:
   ```bash
   grep -n "useStore" src/components/settings/MachineManagerView.tsx
   ```
   Verify it does not select `global`, `wheels`, or `usbs`.
3. Run verification suite:
   ```bash
   npm test && npm run lint && npm run typecheck && npm run build
   ```
   All must exit with code 0.
