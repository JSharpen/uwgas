# UWGAS Visual Refactor — Survey & Catalog: Modals, Dialogs, Wizards & Popups

**Author**: Explorer 2 (Teamwork Explorer Agent)  
**Target Milestone**: UWGAS Visual Refactor — Modern Sleek Dark Theme Alignment  
**Reference Source of Truth**: `src/components/ProgressionView.tsx`  
**Date**: 2026-09-03  

---

## 1. Executive Summary & Design System Baseline

This survey provides a comprehensive architectural and visual analysis of every modal, dialog, wizard, drawer, sheet, and popup component in the UWGAS codebase. The objective of this refactor is to eliminate legacy styles (e.g. `u-surface`, `u-border`, `panel-card`, `rounded-lg`, small input heights, and hardcoded neutral shades) and align all overlays and interaction surfaces with the **Modern Sleek Dark Theme** established in `src/components/ProgressionView.tsx`.

### The `ProgressionView.tsx` Design System Source of Truth

All modal, dialog, and wizard surfaces MUST adhere to the following unified design tokens:

| Element | Modern Token / Class | Reference Rationale |
| :--- | :--- | :--- |
| **Card / Modal Surface** | `bg-[#262626] rounded-3xl border border-white/10 shadow-2xl relative flex flex-col` | Sleek zinc card background with subtle light border and 24px border radius. |
| **Surface Subtle Highlight** | `<div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />` | Soft depth illumination across top edge. |
| **Section / Field Sub-card** | `bg-black/20 border border-white/5 rounded-2xl p-4` | Inner grouping containers for form fields and list items. |
| **Micro-Headers / Badges** | `text-[10px] text-white/40 uppercase tracking-widest font-bold` | High-legibility technical metadata headers. |
| **Modal Header Titles** | `text-xl sm:text-2xl font-bold text-white tracking-tight` | Modern massive typography. |
| **Hero Numeric Readouts** | `text-3xl sm:text-4xl font-extrabold text-white tracking-tighter` | Massive typography for primary dimensions and calculated constants. |
| **Primary Action Buttons** | `h-12 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-950/30 transition` | Touch-first workshop ergonomics ($>44\text{px}$ touch target) with vibrant amber brand color. |
| **Secondary Action Buttons** | `h-12 px-5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold text-sm transition` | High-contrast secondary touch targets. |
| **Danger / Delete Buttons** | `h-12 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-500 font-bold text-sm transition` | Clear destructive action cues. |
| **Icon Close Buttons** | `w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition shrink-0` | Dedicated circular touch target with minimum 44px hit area. |
| **Form Inputs** | `h-12 bg-black/30 border border-white/10 focus:border-amber-400/60 rounded-2xl px-4 text-base text-white placeholder-white/30 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition` | $\ge 16\text{px}$ text prevents iOS auto-zoom; large touch-friendly hit areas. |

---

## 2. Master Component Inventory

| Component File | Location | Line Count | Component Type | Status & Usage |
| :--- | :--- | :---: | :--- | :--- |
| **`ModalShell.tsx`** | `src/components/ModalShell.tsx` | 67 | Base Modal Shell | Core base wrapper for all standard modals. |
| **`CalibrationWizard.tsx`** | `src/components/CalibrationWizard.tsx` | 352 | Multi-Step Wizard | Full calibration solver (Intro $\rightarrow$ Measuring $\rightarrow$ Results). |
| **`PresetManagerModal.tsx`** | `src/components/presets/PresetManagerModal.tsx` | 181 | Modal Dialog | List, load, rename, and delete progression presets. |
| **`SavePresetDialog.tsx`** | `src/components/presets/SavePresetDialog.tsx` | 80 | Modal Dialog | Name input prompt for saving current session as preset. |
| **`ActionSheetPicker.tsx`** | `src/components/calculator/ActionSheetPicker.tsx` | 83 | Bottom Action Sheet | iOS-style bottom drawer picker for hardware & presets. |
| **`MachineManagerView.tsx`** | `src/components/settings/MachineManagerView.tsx` | 392 | View + 2 Modals + 1 Dialog | Embedded Add Machine Modal, Edit Machine Modal, Delete Dialog. |
| **`WheelManagerView.tsx`** | `src/components/wheels/WheelManagerView.tsx` | 321 | View + 2 Modals + 1 Dialog | Embedded Add Wheel Modal, Edit Wheel Modal, Delete Dialog. |
| **`WheelFormFields.tsx`** | `src/components/wheels/WheelFormFields.tsx` | 143 | Form Sub-component | Sub-component rendered inside Add/Edit Wheel modals. |
| **`HardwareManagerView.tsx`** | `src/components/settings/HardwareManagerView.tsx` | 281 | View + Inline Dialog | Embedded inline delete confirmation dialogs & item forms. |
| **`ImportExportPanel.tsx`** | `src/components/ImportExportPanel.tsx` | 333 | Settings Panels | Collapsible Import & Export cards with modal-like controls. |
| **`GlobalSetupCard.tsx`** | `src/components/calculator/GlobalSetupCard.tsx` | 482 | Animated Bottom Drawer | Animated drawer + 4 Action Sheet Picker instances. |
| **`MiniSelect.tsx`** | `src/components/MiniSelect.tsx` | 240 | Floating Popup / Menu | Custom dropdown menu with DOM z-index hoisting. |
| **`WheelWearCompModal.tsx`** | *Roadmap JOB-010* | — | Proposed Modal | Wheel wear & trueing compensation modal blueprint. |
| **`ProjectionChartModal.tsx`** | *Roadmap JOB-015* | — | Proposed Modal | Direct swap / projection matrix chart modal blueprint. |
| **`QuickReferenceModal.tsx`** | *Roadmap JOB-008* | — | Proposed Modal | High-contrast Workshop HUD mode modal blueprint. |

---

## 3. Deep Dive Catalog for Every Component

### 3.1 `ModalShell.tsx`

- **File Path**: `src/components/ModalShell.tsx` (67 lines)
- **Component Purpose**: Serves as the global backdrop overlay and dialog container for all centered modals. Controls backdrop blur, keyboard shifting, safe-area bottom insets, header title, close button, body, and footer.
- **Current Inconsistencies & Legacy Code**:
  - Uses `u-border` and `u-surface` classes.
  - Dialog container uses `rounded-lg` (8px radius) instead of `rounded-3xl` (24px radius).
  - Uses legacy `modal-shell__header`, `modal-shell__title`, `modal-shell__body`, and `modal-shell__lede` CSS classes defined in `index.css`.
  - Close button uses `BTN.close` (`u-btn-close`) with a small 28px hit target.
  - Padding is constrained to `p-4` instead of generous `p-6`.
- **Strict Invariants (DO NOT TOUCH)**:
  - `title: string`, `subtitle?: string`, `onClose: () => void`, `children: React.ReactNode`, `footer?: React.ReactNode`, `overlayStyle?: React.CSSProperties`, `dialogStyle?: React.CSSProperties`, `closing?: boolean`.
  - Closing transition timing and layout calculation hooks (`useModalLayout`).
- **Mobile Responsiveness Issues**:
  - `pt-12 sm:pt-16` can force modal content down too far on short screens in landscape or on phones with large notches.
  - On viewports $<380\text{px}$, `px-4` padding with tight margins needs fluid max-width constraints.
- **Recommended Refactoring Plan**:
  - Overlay: `fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6 pb-[calc(env(safe-area-inset-bottom)+16px)] min-h-[100dvh] motion-overlay`
  - Dialog Card: `w-full max-w-lg bg-[#262626] rounded-3xl border border-white/10 shadow-2xl p-6 relative flex flex-col max-h-[90vh] overflow-y-auto motion-dialog`
  - Subtle edge highlight layer: `<div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />`
  - Header: `flex items-start justify-between gap-4 pb-4 border-b border-white/10 mb-5 relative z-10`
  - Title: `text-xl sm:text-2xl font-bold text-white tracking-tight`
  - Subtitle / Lede: `text-xs sm:text-sm text-white/50 leading-relaxed mt-1 font-normal`
  - Close Button: `w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition shrink-0`

---

### 3.2 `CalibrationWizard.tsx`

- **File Path**: `src/components/CalibrationWizard.tsx` (352 lines)
- **Component Purpose**: Multi-step interactive calibration solver that calculates machine constants ($h_c, o$) for rear and front bases using least-squares non-linear regression (`calibrateBase`) and computes angular error estimates (`estimateMaxAngleErrorDeg`).
- **Wizard Steps**:
  1. `intro`: Setup calibration name, scope (`both` | `rear` | `front`), measurement count (3, 4, 5), and axle/USB diameters ($D_a, D_s$).
  2. `measuring`: Iterative height measurement entry with contextual instructions for low/medium/high settings and dual-base inputs ($h_n$ and $CA_o$).
  3. `results`: Displays calculated $h_c$, $o$, max residual $\varepsilon$, diagnostic accuracy badges, and save action.
- **Current Inconsistencies & Legacy Code**:
  - Container uses `p-4 md:p-6 u-surface rounded shadow`.
  - Inner step wrappers use `max-w-sm` (384px), severely cramping input fields.
  - Hardcoded browser popup `alert("Please provide a name for this calibration.")`.
  - Step cards use `card-elevated`, `input-base`, and `u-text`.
  - Legacy button classes `BTN.primary`, `BTN.ghost`.
  - Result cards use legacy border colors `border-l-2 border-l-blue-500` / `border-l-emerald-500`.
- **Strict Invariants (DO NOT TOUCH)**:
  - State: `step`, `scope`, `calibName`, `calibCount`, `calibDa`, `calibDs`, `measIndex`, `rearRows`, `frontRows`, `rearResult`, `frontResult`, `errorMsg`.
  - Core Math Calls: `calibrateBase(rearRows, calibDa, calibDs)`, `calibrateBase(frontRows, calibDa, calibDs)`, `estimateMaxAngleErrorDeg(...)`.
  - Callbacks: `onSaveProfile`, `onCancel`.
- **Mobile Responsiveness Issues**:
  - Dual measurement grid (`grid-cols-2 gap-2` for $h_n$ and $CA_o$) on screens $<380\text{px}$ squeezes inputs, causing numbers to clip.
  - Small number inputs lack touch stepper ergonomics.
- **Recommended Refactoring Plan**:
  - Wrap container in `bg-[#262626] rounded-3xl border border-white/10 p-6 shadow-2xl max-w-xl mx-auto flex flex-col gap-6`.
  - Header: Step breadcrumb indicator pills (`1. Setup` $\rightarrow$ `2. Measure (Step X of Y)` $\rightarrow$ `3. Results`).
  - Replace `alert()` with an inline animated warning badge (`bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl p-3`).
  - Inputs: Large touch-friendly fields (`h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-base font-mono font-bold text-white focus:border-amber-400 focus:outline-none`).
  - Measurement Cards: `bg-black/25 border border-white/10 rounded-2xl p-5 flex flex-col gap-4`.
  - Results Card: Massive numerical outputs for constants ($h_c$ and $o$ displayed in `text-3xl font-mono font-bold text-white`) with colored chip ratings (Excellent: `bg-emerald-500/20 text-emerald-400`, Good: `bg-amber-500/20 text-amber-400`, Poor: `bg-red-500/20 text-red-400`).

---

### 3.3 `PresetManagerModal.tsx`

- **File Path**: `src/components/presets/PresetManagerModal.tsx` (181 lines)
- **Component Purpose**: Modal for managing saved session progressions. Allows the user to view all presets, see the number of steps, activate/load a preset, delete presets, and rename presets inline.
- **Current Inconsistencies & Legacy Code**:
  - List items use `rounded border u-border u-surface px-2 py-2`.
  - Active badge uses `text-[0.65rem] text-accent-soft border border-accent rounded px-1 py-[2px]`.
  - Input field for rename uses `rounded border u-border u-surface px-2 py-1 text-xs u-text`.
  - Buttons use `BTN.primary`, `BTN.ghost`, `BTN.base`, `BTN.danger`.
  - Container uses `max-h-64 overflow-y-auto`, artificially constraining vertical scroll space.
- **Strict Invariants (DO NOT TOUCH)**:
  - Props: `isOpen`, `isClosing`, `onClose`, `sessionPresets`, `selectedPresetId`, `onLoadPreset`, `onDeletePreset`, `onRenamePreset`, `overlayStyle`, `dialogStyle`.
  - State: `presetRenameId`, `presetRenameValue`.
  - Handlers: `handleBeginRename`, `handleCancelRename`, `handleCommitRename`, Enter/Escape key handlers.
- **Mobile Responsiveness Issues**:
  - Action buttons ("Load", "Rename", "Delete") wrap unpredictably into multiple lines on $<380\text{px}$ viewports.
  - Buttons have small touch targets ($\approx 28\text{px}$).
- **Recommended Refactoring Plan**:
  - Wrap in updated `ModalShell`.
  - Preset List Items: `bg-black/25 hover:bg-black/35 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors`.
  - Preset Name: `text-base font-semibold text-white tracking-wide truncate`.
  - Active Badge: `bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full`.
  - Action Button Group: Touch-first pills with minimum 40px height:
    - Load: `h-10 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-sm transition`
    - Rename: `h-10 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition`
    - Delete: `h-10 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs transition`
  - Inline Rename Input: `h-11 bg-black/40 border border-amber-400/60 rounded-xl px-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/20 w-full`.

---

### 3.4 `SavePresetDialog.tsx`

- **File Path**: `src/components/presets/SavePresetDialog.tsx` (80 lines)
- **Component Purpose**: Prompt dialog asking for a name when saving the active sharpening progression steps as a new session preset.
- **Current Inconsistencies & Legacy Code**:
  - Input uses `rounded border u-border u-surface px-2 py-1 text-xs u-text placeholder-neutral-500`.
  - Action buttons use `BTN_MUTED` and `BTN.primary`.
- **Strict Invariants (DO NOT TOUCH)**:
  - Props: `isOpen`, `isClosing`, `onClose`, `presetNameDraft`, `setPresetNameDraft`, `onSave`, `canSave`, `overlayStyle`, `dialogStyle`.
  - Enter key submission handler (`blurOnEnter`, `if (e.key === 'Enter' && canSave) onSave()`).
- **Mobile Responsiveness Issues**:
  - Small text font size (`text-xs`) triggers iOS zoom if mobile viewport tags are constrained.
  - Buttons are small and placed with standard spacing.
- **Recommended Refactoring Plan**:
  - Input: `w-full h-12 bg-black/30 border border-white/10 focus:border-amber-400/60 rounded-2xl px-4 text-base text-white placeholder-white/30 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition`.
  - Footer Action Buttons:
    - Cancel: `h-12 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-semibold text-sm transition`
    - Save: `h-12 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-30 disabled:hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-950/30 transition`

---

### 3.5 `ActionSheetPicker.tsx`

- **File Path**: `src/components/calculator/ActionSheetPicker.tsx` (83 lines)
- **Component Purpose**: Slide-up bottom action sheet for mobile-first selection of Machines, Support Bars (USBs), Jigs, and Presets.
- **Current Inconsistencies & Legacy Code**:
  - Uses `bg-neutral-900`, `border-neutral-700`, `rounded-t-2xl` instead of `bg-[#262626]`, `border-white/10`, `rounded-t-3xl`.
  - Options use `bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700`.
  - Selected state uses `bg-accent/10 border-accent/30 text-accent`.
  - Pull handle uses `bg-neutral-700`.
- **Strict Invariants (DO NOT TOUCH)**:
  - Props: `isOpen`, `onClose`, `title`, `options`, `value`, `onChange`.
  - State: `isClosing` and 250ms delayed close transition.
  - Handlers: `handleClose`, `handleSelect`.
- **Mobile Responsiveness Issues**:
  - Sheet container needs `pb-[calc(env(safe-area-inset-bottom)+24px)]` to avoid home indicator collisions on iOS devices.
- **Recommended Refactoring Plan**:
  - Backdrop: `absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-250`
  - Sheet Container: `relative w-full max-w-lg mx-auto bg-[#262626] border-t border-x border-white/10 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] transition-transform duration-250 ease-out pb-[calc(env(safe-area-inset-bottom)+16px)]`
  - Pull Handle: `w-12 h-1.5 bg-white/20 rounded-full mb-3`
  - Title: `text-lg font-bold text-white tracking-tight mb-2`
  - Options: `flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${isSelected ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 shadow-sm' : 'bg-black/30 border-white/5 text-white/90 hover:bg-white/5 active:bg-white/10'}`
  - Option Typography: `font-semibold text-sm sm:text-base text-left text-white` with meta labels in `text-xs text-white/40 font-mono font-medium`.

---

### 3.6 `MachineManagerView.tsx` (Embedded Modals & Delete Dialog)

- **File Path**: `src/components/settings/MachineManagerView.tsx` (392 lines)
- **Component Purpose**: Settings sub-view managing grinder machines. Contains two embedded modal dialogs (Add Machine, Edit Machine), an inline delete confirmation card, and triggers the full-screen `CalibrationWizard`.
- **Modal Components Embedded**:
  1. **Add Machine Modal** (`isAddModalOpen` $\rightarrow$ `<ModalShell title="Add Machine">`): Fields for Machine Name and Axle Diameter ($D_a$).
  2. **Edit Machine Modal** (`isEditModalOpen` $\rightarrow$ `<ModalShell title="Edit Machine">`): Fields for Machine Name, Axle Diameter, list of saved Calibration Profiles with activation buttons, and a trigger for "New Mapping" (`CalibrationWizard`).
  3. **Inline Delete Confirmation Dialog** (`deletingMachineId === m.id`): Embedded confirmation in machine card.
- **Current Inconsistencies & Legacy Code**:
  - Modal contents use `rounded-lg border u-border u-surface p-3 sm:p-4 flex flex-col gap-3`.
  - Sub-headings use `text-[11px] font-semibold text-primary uppercase tracking-wider`.
  - Inputs use `rounded border u-border bg-black/5 dark:bg-white/5 px-3 py-2 text-sm`.
  - Profile cards use `border-neutral-200 dark:border-neutral-800`.
  - Action buttons use `BTN.primary`, `BTN.ghost`, `BTN.danger`, `BTN.primaryFlat`.
- **Strict Invariants (DO NOT TOUCH)**:
  - State: `isAddModalOpen`, `isEditModalOpen`, `editingMachineId`, `deletingMachineId`, `draftName`, `draftAxleDiameter`, `draftConstants`, `calibratingMachineId`.
  - Callbacks: `onAddMachine`, `onUpdateMachine`, `onDeleteMachine`, `onSetDefaultMachine`.
  - Profile selection logic: `getBestProfile`, `activeMachineBestProfileId`.
- **Mobile Responsiveness Issues**:
  - Delete dialog inside card can cause vertical overflow on mobile cards.
  - Number inputs lack unit labels or touch padding.
- **Recommended Refactoring Plan**:
  - Sub-cards inside Add/Edit modals: `bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3`.
  - Micro-headers: `text-[10px] text-white/40 uppercase tracking-widest font-bold`.
  - Input fields: `h-12 bg-black/30 border border-white/10 rounded-xl px-4 text-base text-white focus:border-amber-400 focus:outline-none transition`.
  - Calibration profile rows: `bg-black/30 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-2`.
  - Modal Footer Buttons: Cancel (`h-12 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm`), Save (`h-12 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm shadow-md shadow-amber-950/20`).

---

### 3.7 `WheelManagerView.tsx` (Embedded Modals & Delete Dialog)

- **File Path**: `src/components/wheels/WheelManagerView.tsx` (321 lines)
- **Component Purpose**: Wheel manager view. Contains two embedded modal dialogs (Add Wheel, Edit Wheel) and an inline delete confirmation dialog.
- **Modal Components Embedded**:
  1. **Add Wheel Modal** (`isAddWheelModalVisible` $\rightarrow$ `<ModalShell title="Add wheel">`): Uses `WheelFormFields` with `newWheelDraft`.
  2. **Edit Wheel Modal** (`isEditWheelModalVisible` $\rightarrow$ `<ModalShell title="Edit wheel">`): Uses `WheelFormFields` with `editingWheelDraft` and includes a destructive "Delete wheel" action in footer.
  3. **Inline Delete Confirmation Dialog** (`deletingWheelId === w.id`): Confirmation card embedded in the wheel list.
- **Current Inconsistencies & Legacy Code**:
  - Uses `panel-card panel-card--strong motion-panel`, `card-elevated wheel-card`.
  - Action buttons use `BTN.primaryFlat`, `BTN.primary`, `BTN.ghost`, `BTN.danger`.
  - Modal headers and footers use old `p-3` spacing.
- **Strict Invariants (DO NOT TOUCH)**:
  - State: `deletingWheelId`, `isAddWheelModalVisible`, `isAddWheelModalClosing`, `editingWheelId`, `editingWheelDraft`, `isEditWheelModalVisible`, `isEditWheelModalClosing`, `newWheelDraft`.
  - Props & callbacks: `wheels`, `onAddWheel`, `onUpdateWheel`, `onDeleteWheel`.
  - Save button validation: `isAddWheelSaveDisabled` and `saveDisabled` logic comparing draft with baseline.
- **Mobile Responsiveness Issues**:
  - Modal dialog styling depends on `ModalShell`, but inner button row in Edit Modal (Delete, Cancel, Save) wraps on $<380\text{px}$ viewports unless flex wrapping is handled cleanly.
- **Recommended Refactoring Plan**:
  - Add Modal Footer: `flex justify-end gap-3 mt-4`.
  - Edit Modal Footer: `flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 mt-6 pt-4 border-t border-white/10` with Delete button on left and Cancel/Save on right.
  - Delete Button: `h-11 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 font-bold text-xs transition`.
  - Cancel Button: `h-11 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-semibold text-xs transition`.
  - Save Button: `h-11 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-30 disabled:hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-950/20 transition`.

---

### 3.8 `WheelFormFields.tsx`

- **File Path**: `src/components/wheels/WheelFormFields.tsx` (143 lines)
- **Component Purpose**: Sub-component providing form fields for creating and editing wheels. Includes sections for Identity (Name), Geometry (Diameter $D$, Angle Offset $\Delta\beta$), and Hardware (Honing wheel toggle, Default base selection).
- **Current Inconsistencies & Legacy Code**:
  - Uses `rounded-lg border u-border u-surface p-3 sm:p-4 flex flex-col gap-3`.
  - Section headers use `text-[11px] font-semibold text-primary uppercase tracking-wider`.
  - Inputs use `rounded border u-border bg-black/5 dark:bg-white/5 px-3 py-2 text-sm u-focus-ring`.
  - Checkbox uses `rounded border-gray-400 text-primary focus:ring-primary/50`.
  - Radio buttons use `text-primary focus:ring-primary/50`.
- **Strict Invariants (DO NOT TOUCH)**:
  - Props: `value: WheelFormValue`, `onChange: (patch: Partial<WheelFormValue>) => void`, `autoFocusName?: boolean`.
  - Comma-to-dot decimal parsing and float rounding logic in `onChange` for Diameter ($D$).
  - `blurOnEnter` behavior.
- **Mobile Responsiveness Issues**:
  - 2-column grid (`grid grid-cols-2 gap-4`) for Diameter and Angle Offset can cause text clipping on narrow mobile screens ($<380\text{px}$).
- **Recommended Refactoring Plan**:
  - Section Cards: `bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3`.
  - Micro-Headers: `text-[10px] text-white/40 uppercase tracking-widest font-bold`.
  - Inputs: `h-12 bg-black/30 border border-white/10 focus:border-amber-400/60 rounded-xl px-3.5 text-base font-mono font-medium text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition`.
  - Honing Checkbox: Modern styled switch or checkbox with touch padding (`p-2.5 -mx-1 rounded-xl bg-black/20 hover:bg-black/30 border border-white/5 flex items-center gap-3 cursor-pointer`).
  - Base Radio Controls: Modern segmented pill switch (`flex bg-black/40 p-1 rounded-xl border border-white/5`) instead of raw native radio buttons.

---

### 3.9 `HardwareManagerView.tsx`

- **File Path**: `src/components/settings/HardwareManagerView.tsx` (281 lines)
- **Component Purpose**: Settings view for managing custom Jigs ($D_j$, length, adjustable collar, thread pitch) and Support Bars ($D_s$, thread pitch, micro-adjust marks). Includes inline delete confirmations.
- **Current Inconsistencies & Legacy Code**:
  - Container uses `bg-neutral-900 overflow-hidden`.
  - Tabs use `bg-neutral-950 p-1 rounded-lg border border-neutral-800`.
  - Item cards use `card-elevated flex flex-col min-h-[5.5rem]`, `card-elevated__header`, `card-elevated__body`, `u-surface`.
  - Small number inputs (`w-16`, `w-12`, `w-10`) with `bg-neutral-950 border-neutral-700`.
- **Strict Invariants (DO NOT TOUCH)**:
  - State: `activeTab: 'jigs' | 'usbs'`, `deleteConfirmId: string | null`.
  - Callbacks: `onUpdateJig`, `onAddJig`, `onDeleteJig`, `onUpdateUsb`, `onAddUsb`, `onDeleteUsb`, `onClose`.
  - Number parsing and field formatting logic.
- **Mobile Responsiveness Issues**:
  - Inline input widths (`w-10`, `w-12`) make tapping and entering decimals challenging on touchscreens.
- **Recommended Refactoring Plan**:
  - Container: `bg-[#262626] rounded-3xl border border-white/10 p-6 shadow-2xl flex flex-col gap-5`.
  - Tab Switcher: `flex bg-black/40 p-1.5 rounded-2xl border border-white/5` with `rounded-xl font-bold py-2.5 text-xs transition`.
  - Item Cards: `bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3.5`.
  - Inputs: Touch-friendly heights (`h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-sm font-mono text-white`).
  - Bottom Bar: `pt-4 border-t border-white/10 flex items-center justify-between` with Add Button (`h-12 px-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm`) and Done Button (`h-12 px-7 bg-amber-400 hover:bg-amber-300 text-black rounded-2xl font-bold text-sm shadow-md`).

---

### 3.10 `ImportExportPanel.tsx`

- **File Path**: `src/components/ImportExportPanel.tsx` (333 lines)
- **Component Purpose**: Backup and restore manager for JSON state files. Contains collapsible Import and Export sub-panels with section check/uncheck toggles and mode selectors (merge vs overwrite).
- **Current Inconsistencies & Legacy Code**:
  - Uses `panel-card panel-card--strong motion-panel`, `btn-toggle`, `u-surface`, `u-border`, `u-text`, `hover:bg-accent-tint`.
  - Radio buttons and checkboxes use browser accents (`accent-accent`, `accent-amber-500`).
  - Textarea uses `u-surface u-border`.
  - Action buttons use `BTN.base`, `BTN.primary`.
- **Strict Invariants (DO NOT TOUCH)**:
  - Props: `exportText`, `onImportText`, `exportSections`, `onToggleExportSection`, `importSections`, `importModes`, `onToggleImportSection`, `onChangeImportMode`.
  - File reading and JSON Blob download mechanisms.
- **Mobile Responsiveness Issues**:
  - Grid for import sections (`grid-cols-1 sm:grid-cols-2 gap-1`) has small click areas for toggling merge vs overwrite.
- **Recommended Refactoring Plan**:
  - Panels: `bg-[#262626] rounded-3xl border border-white/10 p-6 shadow-xl flex flex-col gap-4`.
  - Section Rows: `bg-black/20 hover:bg-black/30 border border-white/5 rounded-2xl p-3 flex flex-col gap-2 transition-colors`.
  - Checkboxes & Radios: Amber accented high-contrast selectors with generous hit targets.
  - JSON Textarea: `w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-xs text-white/80 focus:border-amber-400 focus:outline-none`.
  - Action Buttons: `h-12 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm shadow-md shadow-amber-950/20`.

---

### 3.11 `GlobalSetupCard.tsx` (Bottom Drawer & Action Sheets)

- **File Path**: `src/components/calculator/GlobalSetupCard.tsx` (482 lines)
- **Component Purpose**: Bottom pinned Global Setup drawer and summary pill. Houses the primary inputs for Angle ($\theta / \beta$), Projection ($A$), Caliper stick-out ($P_b$), fixed USB heights, and triggers four separate `ActionSheetPicker` dialogs.
- **Current Inconsistencies & Legacy Code**:
  - Drawer uses `bg-neutral-900 border-neutral-700/60 rounded-t-3xl`.
  - Preset and Hardware triggers use `bg-neutral-800/40 hover:bg-neutral-800 rounded-2xl border border-neutral-700/50`.
  - Summary pill is styled with `bg-[#262626] border border-neutral-600 rounded-3xl`.
- **Strict Invariants (DO NOT TOUCH)**:
  - Props: `jigs`, `usbs`, `machines`, `defaultMachineId`, `setDefaultMachineId`, `sessionSteps`, `sessionPresets`, `selectedPresetId`, `onLoadPreset`, `onOpenSavePreset`, `onOpenManagePresets`, `global`, `setGlobal`, `isSetupPanelOpen`, `setIsSetupPanelOpen`, `heightMode`, `targetAngleSymbol`, `constants`.
  - Pure calculation hooks: `computeSuggestedFrontUsbHeight`.
  - Swipe gesture handlers: `handleTouchStart`, `handleTouchEnd`.
  - Stepper functions: `handleAngleStep`, `handleProjectionStep`, `handleFixedUsbRearStep`, `handleFixedUsbFrontStep`.
- **Mobile Responsiveness Issues**:
  - Inputs area needs scroll dampening and safe area padding on mobile.
  - Stepper $+/-$ buttons must maintain at least 44px hit heights.
- **Recommended Refactoring Plan**:
  - Drawer Body: `w-full bg-[#262626] border border-white/10 border-b-0 shadow-[0_-12px_40px_rgba(0,0,0,0.7)] rounded-t-3xl pb-12 transition-transform duration-500`.
  - Stepper Buttons: `h-12 bg-amber-400/10 hover:bg-amber-400/20 active:bg-amber-400/30 text-amber-400 rounded-2xl font-bold text-base transition-colors`.
  - Hardware Pickers: `bg-black/30 hover:bg-white/5 active:bg-white/10 border border-white/5 rounded-2xl p-3.5 flex flex-col items-center justify-center transition-colors`.

---

### 3.12 `MiniSelect.tsx`

- **File Path**: `src/components/MiniSelect.tsx` (240 lines)
- **Component Purpose**: Reusable floating select/dropdown popup used in `CalibrationWizard` and setup cards. Features automatic DOM z-index hoisting and pointer-down backdrop dismissal.
- **Current Inconsistencies & Legacy Code**:
  - Uses legacy classes: `dropdown`, `dropdown-trigger`, `dropdown-trigger--sm`, `dropdown-menu`, `dropdown-item`, `dropdown-item--active` from `index.css`.
  - Small border radii and non-standard dark styling.
- **Strict Invariants (DO NOT TOUCH)**:
  - Props: `value`, `options`, `onChange`, `ariaLabel`, `align`, `widthClass`, `menuWidthClass`, `emptyLabel`, `renderOption`, `renderLabel`, `liftOnOpen`.
  - DOM hoisting `zIndex = '3000'` mechanism.
  - Touch/mouse listener cleanup logic.
- **Mobile Responsiveness Issues**:
  - Menu items are $<36\text{px}$ high.
- **Recommended Refactoring Plan**:
  - Trigger Button: `min-h-[44px] bg-black/30 hover:bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold text-white flex items-center justify-between gap-2 transition`.
  - Popup Menu: `bg-[#262626] border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-md overflow-hidden`.
  - Menu Items: `min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition flex items-center justify-between`.
  - Active Menu Item: `bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold`.

---

## 4. Roadmap & Future Modals Specifications

The following components are proposed in [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md). To ensure full compatibility with the visual refactor when they are created, their blueprints and styling requirements are documented below:

### 4.1 `WheelWearCompModal.tsx` (`JOB-010`)
- **Purpose**: Track wheel diameter wear over time with trueing notes and apply quick $\Delta D$ adjustments.
- **Required Architecture**:
  - Wrapper: `<ModalShell title="Wheel Wear & Trueing" subtitle="Log trueing cuts and update wheel diameters.">`
  - Body: Wheel selector dropdown, current diameter readout (`text-4xl font-extrabold text-white font-mono`), $\Delta D$ stepper ($\pm 0.5\text{mm}$, $\pm 1.0\text{mm}$), and trueing cut log history table (`bg-black/20 rounded-2xl border border-white/5`).
  - Actions: Primary amber button `Save New Diameter`, Secondary `Cancel`.

### 4.2 `ProjectionChartModal.tsx` (`JOB-015`)
- **Purpose**: Direct Swap / Unadjusted Angle Calculator & Projection Matrix Modal displaying the exact hit angle when swapping wheels without moving the USB bar.
- **Required Architecture**:
  - Wrapper: `<ModalShell title="Wheel Swap Angle Chart" subtitle="Calculated bevel angles for fixed USB positions.">`
  - Body: High-contrast matrix table (`bg-black/30 rounded-2xl border border-white/10 p-4`) with sticky headers for wheel grit and calculated $\beta_{\text{eff}}^\circ$ readouts.

### 4.3 `QuickReferenceModal.tsx` / Workshop HUD (`JOB-008`)
- **Purpose**: Fullscreen high-contrast Workshop HUD view with massive $h_n / h_r$ readouts for viewing from 2 meters away at the grinder.
- **Required Architecture**:
  - Fullscreen overlay with dark high-contrast backdrop (`bg-black/95`).
  - Giant numerical readouts (`text-7xl sm:text-8xl font-black font-mono text-amber-400 tracking-tighter`).
  - Quick touch step navigation ($>64\text{px}$ touch targets for Next / Prev step).

---

## 5. CSS & Tailwind Token Replacement Matrix

| Context | Legacy Class / Value (TO BE REMOVED) | Modern Sleek Replacement (TO BE APPLIED) |
| :--- | :--- | :--- |
| **Backdrop Overlay** | `bg-black/60` | `bg-black/75 backdrop-blur-sm` |
| **Modal Container** | `rounded-lg border u-border u-surface p-4 shadow-xl` | `bg-[#262626] rounded-3xl border border-white/10 shadow-2xl p-6 relative` |
| **Sub-Card / Inset Box** | `rounded-lg border u-border u-surface p-3` | `bg-black/20 border border-white/5 rounded-2xl p-4` |
| **Modal Title** | `modal-shell__title` (`text-[0.95rem]`) | `text-xl sm:text-2xl font-bold text-white tracking-tight` |
| **Modal Subtitle** | `modal-shell__lede` (`text-[0.85rem] text-muted`) | `text-xs sm:text-sm text-white/50 leading-relaxed font-normal` |
| **Close Button** | `BTN.close` (`u-btn-close`) | `w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition shrink-0` |
| **Primary Action Button** | `BTN.primary` / `BTN.primaryFlat` | `h-12 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-950/30 transition` |
| **Secondary Button** | `BTN.ghost` / `BTN.base` | `h-12 px-5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold text-sm transition` |
| **Destructive Button** | `BTN.danger` | `h-12 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-500 font-bold text-sm transition` |
| **Text & Number Inputs** | `input-base`, `px-2 py-1 text-xs u-text` | `h-12 bg-black/30 border border-white/10 focus:border-amber-400/60 rounded-2xl px-4 text-base font-mono font-medium text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition` |
| **Metadata / Micro-Header** | `text-[11px] font-semibold text-primary uppercase` | `text-[10px] text-white/40 uppercase tracking-widest font-bold` |
| **Active Status Chip** | `text-accent-soft border border-accent rounded` | `bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full` |
| **Card Highlight Layer** | *(None)* | `<div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />` |

---

## 6. Mobile & Touch Ergonomics Audit

1. **Touch Target Sizing Gate**:
   - All clickable elements (buttons, close icons, stepper triggers, dropdown items, tabs) MUST have minimum dimensions of $44\text{px} \times 44\text{px}$ (or $40\text{px}$ with surrounding padding).
2. **Narrow Viewport ($<380\text{px}$) Guardrails**:
   - Avoid rigid `grid-cols-2` without `min-w-0` and responsive breakpoints.
   - Truncate long preset and machine names with `truncate max-w-[180px] sm:max-w-xs`.
   - Prevent modal body horizontal overflow by using `overflow-x-hidden` on dialog wrappers.
3. **Virtual Keyboard & Safe Area Insets**:
   - Preserve `useModalLayout` integration in all modals to dynamically adjust `maxHeight` and translate dialogs upward when the virtual keyboard appears on mobile devices.
   - Ensure all modal overlays include `pb-[calc(env(safe-area-inset-bottom)+16px)]`.
4. **Input Font Sizing**:
   - Input text MUST be $\ge 16\text{px}$ (`text-base`) or set with explicit touch metadata to prevent mobile Safari/Chrome from triggering automatic page zoom on focus.

---

## 7. Refactoring Sequence & Implementation Guidance

To ensure 0 regressions and maintain passing verification gates throughout the visual refactor, implement the component updates in the following exact sequence:

1. **Phase 1 — Base Shell & Reusable Primitives**:
   - Update `src/components/ModalShell.tsx`
   - Update `src/components/calculator/ActionSheetPicker.tsx`
   - Update `src/components/MiniSelect.tsx`
2. **Phase 2 — Preset & Small Form Modals**:
   - Update `src/components/presets/SavePresetDialog.tsx`
   - Update `src/components/presets/PresetManagerModal.tsx`
3. **Phase 3 — Wheel & Machine Management Modals**:
   - Update `src/components/wheels/WheelFormFields.tsx`
   - Update `src/components/wheels/WheelManagerView.tsx` (Add/Edit modals & delete cards)
   - Update `src/components/settings/MachineManagerView.tsx` (Add/Edit modals & delete cards)
4. **Phase 4 — Complex Wizard & Settings Panels**:
   - Update `src/components/CalibrationWizard.tsx` (Intro, Measuring, Results)
   - Update `src/components/settings/HardwareManagerView.tsx`
   - Update `src/components/ImportExportPanel.tsx`
   - Update `src/components/calculator/GlobalSetupCard.tsx`
5. **Phase 5 — Build & Quality Verification Gate**:
   - `npm run typecheck` $\rightarrow$ 0 errors
   - `npm run lint` $\rightarrow$ 0 errors
   - `npm run build` $\rightarrow$ successful build
