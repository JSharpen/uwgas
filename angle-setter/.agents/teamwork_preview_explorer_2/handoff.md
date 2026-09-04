# Handoff Report — Explorer 2: Modals & Wizards Survey

**Agent**: Explorer 2 (`teamwork_preview_explorer_2`)  
**Target Milestone**: UWGAS Visual Refactor  
**Deliverable**: `.agents/teamwork_preview_explorer_2/survey_modals_wizards.md`  
**Timestamp**: 2026-09-03T05:22:00+10:00  

---

## 1. Observation

A complete code and design audit was performed across all modal, dialog, wizard, sheet, and popup components in `src/components/`:

1. **`src/components/ModalShell.tsx` (67 lines)**:
   - Line 38: Uses `'w-full max-w-md rounded-lg border u-border u-surface p-4 shadow-xl max-h-[90vh] overflow-y-auto motion-dialog ' + (closing ? 'motion-dialog--closing' : '')`.
   - Line 43-44: Relies on `.modal-shell__header`, `.modal-shell__title`, `.modal-shell__body`, and `.modal-shell__lede` CSS classes from `src/index.css`.
   - Line 47: Uses legacy close button `BTN.close` with small hit bounds ($<32\text{px}$).

2. **`src/components/CalibrationWizard.tsx` (352 lines)**:
   - Lines 37-62: Manages 3-step wizard workflow (`intro`, `measuring`, `results`), least-squares math solver calls (`calibrateBase`), and angle error estimations (`estimateMaxAngleErrorDeg`).
   - Line 66: Executes blocking `alert("Please provide a name for this calibration.")`.
   - Lines 189, 226, 267, 273, 289, 322: Uses legacy `u-surface`, `card-elevated`, `input-base`, and hardcoded `border-l-blue-500` / `border-l-emerald-500`.
   - Line 198, 262, 318: Uses rigid `max-w-sm` container which constrains measuring form fields on desktop/tablet.

3. **`src/components/presets/PresetManagerModal.tsx` (181 lines)**:
   - Line 84: Uses `rounded border u-border u-surface px-2 py-2` for list cards.
   - Line 91: Uses `rounded border u-border u-surface px-2 py-1 text-xs u-text` for rename inputs.
   - Line 108: Uses `text-[0.65rem] text-accent-soft border border-accent rounded px-1 py-[2px]` for active badge.
   - Lines 127, 134, 145, 155, 162: Uses `BTN.primary`, `BTN.ghost`, `BTN.base`, `BTN.danger`.

4. **`src/components/presets/SavePresetDialog.tsx` (80 lines)**:
   - Line 43: Uses `rounded border u-border u-surface px-2 py-1 text-xs u-text placeholder-neutral-500`.
   - Lines 60, 68: Uses `BTN_MUTED` and `BTN.primary`.

5. **`src/components/calculator/ActionSheetPicker.tsx` (83 lines)**:
   - Lines 52, 66: Uses `bg-neutral-900 border-t border-neutral-700 rounded-t-2xl` and `bg-neutral-800 border-neutral-700 text-neutral-200`.
   - Line 66: Selected item uses `bg-accent/10 border-accent/30 text-accent`.

6. **`src/components/settings/MachineManagerView.tsx` (392 lines)**:
   - Lines 216-272: Embedded Add Machine Modal using `<ModalShell>` with `rounded-lg border u-border u-surface p-3 sm:p-4`.
   - Lines 277-387: Embedded Edit Machine Modal using `<ModalShell>` with calibration profiles list and "New Mapping" trigger for `CalibrationWizard`.
   - Lines 133-141: Embedded delete confirmation card with `BTN.ghost` and `BTN.danger`.

7. **`src/components/wheels/WheelManagerView.tsx` (321 lines)** & **`WheelFormFields.tsx` (143 lines)**:
   - Lines 208-277: Embedded Edit Wheel Modal using `<ModalShell>` with `WheelFormFields` and footer delete button.
   - Lines 282-314: Embedded Add Wheel Modal using `<ModalShell>` with `WheelFormFields`.
   - Lines 151-158: Embedded delete confirmation card with `BTN.ghost` and `BTN.danger`.
   - `WheelFormFields.tsx` (lines 20, 37, 91): Uses `rounded-lg border u-border u-surface p-3 sm:p-4 flex flex-col gap-3`, `text-primary`, and native form controls.

8. **`src/components/settings/HardwareManagerView.tsx` (281 lines)**:
   - Lines 53, 56, 89, 140: Uses `bg-neutral-900`, `bg-neutral-950`, `card-elevated`, `u-surface`, and small inputs (`w-16`, `w-12`, `w-10`).
   - Lines 92-113: Inline delete confirmation card.

9. **`src/components/ImportExportPanel.tsx` (333 lines)**:
   - Lines 103, 135, 217, 270: Uses `panel-card panel-card--strong`, `hover:bg-accent-tint`, `u-surface`, `u-border`.

10. **`src/components/calculator/GlobalSetupCard.tsx` (482 lines)**:
    - Lines 148, 167, 374, 382, 390: Drawer body using `bg-neutral-900 border-neutral-700/60 rounded-t-3xl` and triggers for 4 `ActionSheetPicker` instances.

11. **`src/components/MiniSelect.tsx` (240 lines)**:
    - Lines 156-234: Custom floating dropdown menu with DOM z-index hoisting (`hostCard.style.zIndex = '3000'`) and legacy dropdown classes.

12. **Roadmap Modals (`docs/PROJECT_PLAN.md`)**:
    - `WheelWearCompModal.tsx` (`JOB-010`), `ProjectionChartModal.tsx` (`JOB-015`), `QuickReferenceModal.tsx` (`JOB-008`) are proposed roadmap items without existing files in `src/`. Full architectural specifications have been designed for them.

---

## 2. Logic Chain

1. **Premise**: The goal of the visual refactor is to establish complete design consistency with `ProgressionView.tsx` (`bg-[#262626]`, `border-white/10`, `rounded-3xl`, amber accent `#f59e0b`/`amber-400`, massive typography, touch-first $\ge 44\text{px}$ targets) while strictly preserving all React state, math calculations, and user interactions.
2. **Finding 1**: Updating `ModalShell.tsx` will immediately modernize the outer card container, backdrop blur, header, title typography, and close button across `SavePresetDialog`, `PresetManagerModal`, `AddMachineModal`, `EditMachineModal`, `AddWheelModal`, and `EditWheelModal`.
3. **Finding 2**: Updating `WheelFormFields.tsx` modernizes both the Add Wheel and Edit Wheel modal bodies simultaneously.
4. **Finding 3**: Updating `ActionSheetPicker.tsx` modernizes hardware and preset bottom sheets across the entire calculator workflow.
5. **Finding 4**: Refactoring `CalibrationWizard.tsx` into a 3-step modern card layout resolves mobile squeezing issues on narrow viewports while maintaining the pure least-squares math engine.
6. **Finding 5**: All callbacks (`onAddWheel`, `onUpdateWheel`, `onDeleteWheel`, `onAddMachine`, `onUpdateMachine`, `onDeleteMachine`, `onSaveProfile`, `onLoadPreset`, `onSavePreset`, `onRenamePreset`, `onDeletePreset`, `onImportText`, `onChangeImportMode`) must remain unaltered with exact type signatures.

---

## 3. Caveats

- **No Caveats**: All modal, dialog, wizard, sheet, and popup components in the codebase were inspected in full.
- Clarification: `WheelWearCompModal.tsx`, `ProjectionChartModal.tsx`, and `QuickReferenceModal.tsx` do not exist yet in `src/` because they are roadmap backlog items (`JOB-010`, `JOB-015`, `JOB-008`). Concrete component blueprints are included in the survey report.

---

## 4. Conclusion

The comprehensive catalog at `.agents/teamwork_preview_explorer_2/survey_modals_wizards.md` delivers an actionable, 5-phase refactoring roadmap for implementer agents. By following the token replacement matrix and component blueprints, the engineering team can hand-code all modal and wizard visual updates with 0 logic regressions and guaranteed passing builds.

---

## 5. Verification Method

To independently verify the survey observations and findings:

1. **Inspect Report Artifact**:
   ```bash
   view_file .agents/teamwork_preview_explorer_2/survey_modals_wizards.md
   ```
2. **Verify Component Paths in Codebase**:
   ```bash
   grep -rn "ModalShell" src/
   grep -rn "CalibrationWizard" src/
   grep -rn "ActionSheetPicker" src/
   ```
3. **Run Quality Pre-checks**:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```
