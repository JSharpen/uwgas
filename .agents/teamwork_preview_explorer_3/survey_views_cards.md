# UWGAS Visual Refactor Survey: Views, Cards, Navigation & Settings

> **Universal Wet Grinder Angle Setter (UWGAS)**  
> **Explorer 3 Comprehensive Catalog & Visual Refactoring Specification**  
> **Design Benchmark & Source of Truth:** `src/components/ProgressionView.tsx`  
> **Date:** 2026-09-02 / 2026-09-03 | **Target Release:** v1.0.0 Modern Sleek Dark Theme

---

## 1. Executive Summary & Design Benchmark

The UWGAS visual modernization establishes a unified, ultra-clean dark theme based on the reference standard established in `src/components/ProgressionView.tsx`. 

### Key Visual Tokens (Source of Truth: `ProgressionView.tsx`):
- **Card Containers:** `bg-[#262626]` with `rounded-3xl`, `border border-white/10`, and `shadow-lg`.
- **Edge Highlights:** Subtle top-down surface highlight overlay (`absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0`).
- **Inner Sub-containers / Input Wells:** `bg-black/30 border border-white/5 rounded-2xl` or `bg-black/20`.
- **Interactive Buttons / Controls:** `w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-bold transition` or `rounded-2xl`.
- **Massive Typography Readouts:** `text-3xl sm:text-4xl font-extrabold text-white tracking-tighter` with unit labels `text-lg text-white/50 font-medium ml-1`.
- **Accent Tokens:**
  - Amber Accent: `text-[var(--color-accent)]` / `bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]` / `border-[var(--color-accent)]/30`
  - Sky/Focus Accent: `text-[var(--color-focus)]` / `text-sky-300` / `bg-sky-500/20`
  - Danger / Delete Accent: `text-red-500` / `bg-red-500/10 hover:bg-red-500/20`
  - Muted Label Caps: `text-[10px] text-white/40 uppercase tracking-widest font-bold`
- **Workshop Ergonomics:** Touch targets $\ge 44\text{px} \times 44\text{px}$, responsive typography down to $<380\text{px}$ viewports, high contrast at 2 meters bench distance.

---

## 2. Component Inventory & Architecture Map

| Component | File Path | Lines | Category | Current Styling Paradigm | Refactor Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Root Shell & Toolbar** | `src/App.tsx` | 670 | Shell / Navigation | Mixed `u-bg` + `bg-neutral-950` bottom bar | **HIGH** |
| **Global Setup Card** | `src/components/calculator/GlobalSetupCard.tsx` | 482 | Card / Bottom Drawer | `bg-neutral-900` + `bg-[#262626]` pill | **HIGH** |
| **Action Sheet Picker** | `src/components/calculator/ActionSheetPicker.tsx` | 83 | Sheet / Selector | `bg-neutral-900` + `rounded-t-2xl` | **HIGH** |
| **Settings Root View** | `src/components/settings/SettingsRootView.tsx` | 51 | Settings Menu | Legacy `.panel-card--strong` | **HIGH** |
| **Measurement Settings** | `src/components/settings/MeasurementSettingsView.tsx` | 120 | Settings Subview | Legacy `.card-elevated` + neutral pills | **HIGH** |
| **Hardware Manager** | `src/components/settings/HardwareManagerView.tsx` | 281 | Settings Subview | `bg-neutral-900` + `.card-elevated` | **HIGH** |
| **Machine Manager** | `src/components/settings/MachineManagerView.tsx` | 392 | Settings Subview | Legacy `.card-elevated` + `${BTN.*}` | **HIGH** |
| **Wheel Manager** | `src/components/wheels/WheelManagerView.tsx` | 321 | View / Wheel Catalog | Legacy `.panel-card` + `.wheel-card` | **HIGH** |
| **Wheel Form Fields** | `src/components/wheels/WheelFormFields.tsx` | 143 | Form / Editor | Legacy `.rounded-lg` + `u-border` | **HIGH** |
| **Preset Manager Modal** | `src/components/presets/PresetManagerModal.tsx` | 181 | Modal / Presets | Legacy `u-border` list items | **MEDIUM** |
| **Save Preset Dialog** | `src/components/presets/SavePresetDialog.tsx` | 80 | Modal / Dialog | Legacy `u-surface` + `${BTN.*}` | **MEDIUM** |
| **Calibration Wizard** | `src/components/CalibrationWizard.tsx` | 352 | Wizard / Calibration | Mixed `.u-surface` + `.card-elevated` | **HIGH** |
| **Glossary Page** | `src/components/GlossaryPage.tsx` | 34 | Reference / Help | Legacy `.panel-card--strong` | **MEDIUM** |
| **Glossary Card** | `src/components/GlossaryCard.tsx` | 40 | Reference Card | `bg-neutral-950/60` + `border-neutral-700` | **MEDIUM** |
| **Import / Export Panel**| `src/components/ImportExportPanel.tsx` | 333 | Settings / Data | Legacy `.panel-card` + raw inputs | **MEDIUM** |
| **Grind Direction Toggle**| `src/components/GrindDirToggle.tsx` | 64 | UI Control | Legacy color-mix border classes | **HIGH** |
| **Mini Dropdown Select** | `src/components/MiniSelect.tsx` | 240 | UI Control | Legacy `.dropdown-menu` styles | **MEDIUM** |
| **Modal Shell Wrapper** | `src/components/ModalShell.tsx` | 67 | UI Layout | Legacy `rounded-lg` + `.u-border` | **HIGH** |
| **Expand Chevron Toggle**| `src/components/ExpandToggle.tsx` | 42 | UI Control | Legacy `.btn-toggle` (28px) | **MEDIUM** |

*Note on Historical / Architectural Mergers:*
- `AngleTargetCard.tsx` is permanently unified inside `GlobalSetupCard.tsx` (JOB-001, JOB-005, JOB-020).
- `GrindingWheelCard.tsx` is implemented as individual wheel cards within `WheelManagerView.tsx`.
- `ResultDisplayCard.tsx` is implemented as individual step cards within `ProgressionView.tsx`.
- `InteractiveDiagram.tsx` is represented by diagrammatic SVG icons (`IconEdgeLeading`, `IconEdgeTrailing`, `IconGrinder`, `IconDisc` in `src/icons.tsx`) and the placeholder in `GlossaryPage.tsx`.
- `NavigationHeader.tsx` and `BottomToolbar.tsx` are integrated directly in `src/App.tsx`.

---

## 3. Granular Component Survey & Refactoring Specifications

---

### 3.1 `src/App.tsx` (Application Shell & Fixed Bottom Tab Bar)

#### Purpose & Overview
Root layout orchestrator managing state persistence with `localStorage`, routing between active views (`calculator`, `wheels`, `settings`), rendering the fixed bottom tab bar, dev header, preset modals, and the main progression section.

#### Line Count
670 lines.

#### Current Styling & Deficiencies Relative to `ProgressionView.tsx`
- Container uses legacy class `u-bg` (`min-h-dvh u-bg p-3 sm:p-4 pb-[140px] flex flex-col gap-4 max-w-4xl mx-auto`).
- Fixed bottom tab bar uses raw zinc classes: `fixed bottom-0 left-0 right-0 h-16 bg-neutral-950 border-t border-neutral-800 flex items-center justify-around z-40 pb-safe`.
- Tab buttons toggle `text-accent` vs `text-neutral-500 hover:text-neutral-300` without pill background or smooth active indicators.
- Subview back buttons use plain text with negative margin: `text-neutral-400 hover:text-white p-2 -ml-2 self-start flex items-center gap-2`.
- "Clear All" button is a raw pill: `text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full hover:bg-red-500/20`.

#### Key State, Props, Callbacks & Math Integrations (DO NOT ALTER)
- State: `global`, `machines`, `defaultMachineId`, `jigs`, `usbs`, `wheels`, `sessionSteps`, `sessionPresets`, `heightMode`, `view`, `settingsView`, `isSetupPanelOpen`.
- Math Integration: `computeWheelResults(wheels, sessionSteps, global, machines, jigs, usbs, defaultMachineId)` via `useMemo`.
- Persistence: `writePersistedState` effect with schema version 5.
- Event Listeners: pointerdown outside listener triggering `setIsSetupPanelOpen(false)` and `window.dispatchEvent(new CustomEvent('collapseAll'))`.
- All handlers: `handleAddWheel`, `handleDeleteWheel`, `handleUpdateWheel`, `handleUpdateJig`, `handleAddJig`, `handleDeleteJig`, `handleUpdateUsb`, `handleAddUsb`, `handleDeleteUsb`, `handleAddStep`, `handleDeleteStep`, `handleUpdateStep`, `handleMoveStep`, `handleLoadDefaultProgression`, `handleLoadPreset`, `handleDeletePreset`, `handleRenamePreset`, `handleSavePreset`, `handleImportText`.

#### Mobile Responsiveness (<380px) & Touch Targets ($\ge 44\text{px}$)
- Bottom tab bar height is `h-16` (64px) with full-width button slots $\rightarrow$ touch height $\ge 44\text{px}$ compliant.
- Back button touch area needs explicit minimum $44\text{px}$ box.
- "Clear All" button touch target needs expanding from 28px height to $\ge 44\text{px}$ clickable area.

#### Specific Refactoring Plan
1. Update root container to `min-h-dvh bg-[#09090b] text-neutral-100 p-3 sm:p-4 pb-[140px] flex flex-col gap-4 max-w-4xl mx-auto`.
2. Refactor Bottom Tab Bar to modern frosted glass: `fixed bottom-0 left-0 right-0 h-16 bg-[#1a1a1a]/95 backdrop-blur-lg border-t border-white/10 flex items-center justify-around z-40 pb-safe shadow-2xl`.
3. Tab buttons: add subtle active pill indicator (`text-[var(--color-accent)]` with soft background `bg-white/5 rounded-2xl py-2 px-4` when active).
4. Subview back buttons: wrap in a sleek touch pill `flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition`.

---

### 3.2 `src/components/calculator/GlobalSetupCard.tsx` (Setup Drawer & Summary Pill)

#### Purpose & Overview
Mobile-first interactive control surface combining a floating Summary Pill (permanently docked above the bottom toolbar) and an expandable animated bottom drawer housing primary calculation inputs: Target Angle $\theta$, Projection $A$ / Protrusion $P_b$ / Fixed USB (Rear & Front), active preset changer, and hardware triggers.

#### Line Count
482 lines.

#### Current Styling & Deficiencies Relative to `ProgressionView.tsx`
- Drawer body uses `bg-neutral-900 border border-neutral-700/60 border-b-0 shadow-[0_-12px_40px_rgba(0,0,0,0.6)] rounded-t-3xl`.
- Inputs and stepper buttons use `bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-neutral-300`.
- Dividers use `h-px bg-neutral-800/80 w-full`.
- Hardware triggers use `bg-neutral-800/60 hover:bg-neutral-800 active:bg-neutral-700 rounded-2xl border border-neutral-700/50`.
- Summary Pill uses `bg-[#262626] border border-neutral-600 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-3xl`.
- Lacks the gradient edge highlight layer present in `ProgressionView.tsx`.

#### Key State, Props, Callbacks & Math Integrations (DO NOT ALTER)
- Props: `jigs`, `usbs`, `machines`, `defaultMachineId`, `setDefaultMachineId`, `sessionSteps`, `sessionPresets`, `selectedPresetId`, `onLoadPreset`, `onOpenSavePreset`, `onOpenManagePresets`, `global`, `setGlobal`, `isSetupPanelOpen`, `setIsSetupPanelOpen`, `heightMode`, `targetAngleSymbol`, `constants`.
- Math calls: `computeSuggestedFrontUsbHeight(rearVal, effectiveConsts, dsVal, heightMode === 'hr' ? 'hr' : 'hn')`.
- Stepper logic: `handleAngleStep`, `handleProjectionStep`, `handleFixedUsbRearStep`, `handleFixedUsbFrontStep`.
- Touch gesture tracking: `handleTouchStart`, `handleTouchEnd` (swipe up to open, swipe down to close).
- Modal sheet launcher: `setActiveSheet('none' | 'jig' | 'usb' | 'preset' | 'machine')`.

#### Mobile Responsiveness (<380px) & Touch Targets ($\ge 44\text{px}$)
- Stepper buttons: `py-3` full grid button width $\rightarrow 48\text{px}$ height $\rightarrow \ge 44\text{px}$ compliant.
- Giant numerical inputs: `text-5xl font-bold font-mono text-center` $\rightarrow$ highly legible across bench distances.
- Hardware selector buttons: 3-column flex layout (`flex-1`) on $<380\text{px}$ screens must maintain `text-[10px]` uppercase labels and text truncation (`truncate`).

#### Specific Refactoring Plan
1. Drawer Container: `w-full bg-[#262626] border border-white/10 border-b-0 shadow-[0_-16px_48px_rgba(0,0,0,0.8)] rounded-t-3xl pb-12 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]`.
2. Add subtle top-down edge gradient: `<div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-t-3xl z-0" />`.
3. Nib bar: `w-12 h-1.5 bg-white/20 rounded-full`.
4. Preset selection button: `bg-black/30 hover:bg-white/5 border border-white/5 rounded-2xl p-4 transition-colors`.
5. Stepper buttons: `bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 rounded-2xl py-3 text-sm font-bold text-white transition`.
6. Numerical inputs: `text-5xl font-extrabold font-mono text-white text-center focus:text-[var(--color-accent)]`.
7. Hardware trigger cards: `bg-black/30 hover:bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center transition`.
8. Summary Pill: `bg-[#262626] border border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] rounded-3xl pt-4 pb-4 active:scale-[0.98] transition-transform`.

---

### 3.3 `src/components/calculator/ActionSheetPicker.tsx` (Slide-up Picker)

#### Purpose & Overview
Mobile bottom-sheet selection picker for Machine configs, Support Bars (USBs), Jigs, and Progression Presets.

#### Line Count
83 lines.

#### Current Styling & Deficiencies Relative to `ProgressionView.tsx`
- Container uses `bg-neutral-900 border-t border-neutral-700 rounded-t-2xl shadow-2xl`.
- Backdrop uses `bg-black/60`.
- Option items use `bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700` and `bg-accent/10 border-accent/30 text-accent`.
- Nib uses `bg-neutral-700`.

#### Key State, Props, Callbacks & Math Integrations (DO NOT ALTER)
- Props: `isOpen`, `onClose`, `title`, `options` (`{ value, label, meta }`), `value`, `onChange`.
- Transition state: `isClosing` with 250ms delayed dismiss.

#### Mobile Responsiveness (<380px) & Touch Targets ($\ge 44\text{px}$)
- Option buttons: `p-4` with flex layout $\rightarrow 56\text{px}$ height $\rightarrow$ fully compliant.
- `overscroll-contain` and `max-h-[80vh]` ensures smooth scrolling on iOS/Android.

#### Specific Refactoring Plan
1. Sheet container: `w-full bg-[#262626] border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col max-h-[80vh] pb-safe`.
2. Header nib: `w-12 h-1.5 bg-white/20 rounded-full mb-3`. Title: `text-base font-bold text-white tracking-wide`.
3. Option item buttons: `flex items-center justify-between p-4 rounded-2xl border transition-all duration-150`.
   - Inactive: `bg-black/30 border-white/5 text-white/90 hover:bg-white/5 hover:border-white/10`.
   - Selected: `bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] border-[var(--color-accent)]/50 text-white font-bold shadow-sm`.
   - Meta label: `text-xs text-white/40 font-mono font-medium`.

---

### 3.4 `src/components/settings/SettingsRootView.tsx` (Settings Menu Root)

#### Purpose & Overview
Navigation dashboard for application settings with categorized rows (Machines, Hardware, Measurement, Import/Export, Glossary).

#### Line Count
51 lines.

#### Current Styling & Deficiencies Relative to `ProgressionView.tsx`
- Uses `.panel-card .panel-card--strong` legacy container with `.u-border border-neutral-800/50`.
- Typography relies on `.u-text` and `.text-neutral-500`.
- Lacks modern rounded card aesthetics (`rounded-3xl`, `bg-[#262626]`).

#### Key State, Props, Callbacks & Math Integrations (DO NOT ALTER)
- Props: `onSelectSection: (section: SettingsSection) => void`.
- Section IDs: `machine`, `hardware`, `measurement`, `import`, `glossary`.

#### Mobile Responsiveness (<380px) & Touch Targets ($\ge 44\text{px}$)
- Menu items: `p-4` $\rightarrow 64\text{px}$ height $\rightarrow \ge 44\text{px}$ compliant.

#### Specific Refactoring Plan
1. Container: `bg-[#262626] rounded-3xl border border-white/10 shadow-lg flex flex-col overflow-hidden relative`.
2. Surface highlight: `<div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />`.
3. Menu item rows: `flex items-center justify-between p-5 text-left hover:bg-white/5 active:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 relative z-10`.
4. Titles: `text-base font-semibold text-white tracking-wide`, subtext: `text-xs text-white/40 mt-0.5`.
5. Chevron icon: `w-5 h-5 text-white/30 group-hover:text-white transition-colors`.

---

### 3.5 `src/components/settings/MeasurementSettingsView.tsx` (Calculation Modes & Overrides)

#### Purpose & Overview
Settings submenu for toggling Calculation Solver Mode (Height $h_n/h_r$ vs Projection $A$), Projection Input Style ($A$ vs Caliper $P_b$), Height Reference Datum ($h_n$ vs $h_r$), and Per-Step Hardware Overrides.

#### Line Count
120 lines.

#### Current Styling & Deficiencies Relative to `ProgressionView.tsx`
- Sub-cards use `.card-elevated` legacy styling.
- Segmented pills use `bg-neutral-950 rounded-full border border-neutral-800/60` and `bg-neutral-800 text-neutral-200`.
- Toggle switch uses `bg-primary` / `bg-neutral-700`.

#### Key State, Props, Callbacks & Math Integrations (DO NOT ALTER)
- Props: `heightMode`, `setHeightMode`, `global`, `setGlobal`, `onBack`.
- Global settings patched: `calcMode`, `useProtrusionMode`, `heightMode`, `showAdvancedStepOverrides`.

#### Mobile Responsiveness (<380px) & Touch Targets ($\ge 44\text{px}$)
- Segmented control buttons: expand padding to `py-2.5` to ensure $\ge 44\text{px}$ touch target on mobile devices.
- Toggle switch container: ensure full $44\text{px} \times 44\text{px}$ interactive click area.

#### Specific Refactoring Plan
1. Section wrapper: `bg-[#262626] rounded-3xl border border-white/10 shadow-lg p-6 flex flex-col gap-6`.
2. Segmented controls: `bg-black/40 border border-white/5 rounded-2xl p-1 w-full sm:w-52`.
   - Selected: `bg-white/10 text-white font-bold py-2.5 px-3 rounded-xl shadow-sm text-xs uppercase tracking-wider`.
   - Inactive: `text-white/40 hover:text-white py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition`.
3. Toggle switch: `w-12 h-7 rounded-full transition-colors` with `bg-[var(--color-accent)]` when checked, `bg-white/10` when unchecked.

---

### 3.6 `src/components/settings/HardwareManagerView.tsx` (Jigs & USB Profiles)

#### Purpose & Overview
Manager panel for configuring custom sharpening jigs (collar adjustment, base length, thread pitch, diameter $D_j$) and Support Bars / USBs (diameter $D_s$, thread pitch, micro-adjust marks).

#### Line Count
281 lines.

#### Current Styling & Deficiencies Relative to `ProgressionView.tsx`
- Container uses `bg-neutral-900`.
- Segmented tab bar uses `bg-neutral-950 p-1 rounded-lg border border-neutral-800`.
- Profile cards use `.card-elevated` with tight inputs `bg-neutral-950 border border-neutral-700 px-2 py-1 text-xs`.
- Delete confirmation banner uses `bg-danger/10`.

#### Key State, Props, Callbacks & Math Integrations (DO NOT ALTER)
- Props: `jigs`, `usbs`, `onUpdateJig`, `onAddJig`, `onDeleteJig`, `onUpdateUsb`, `onAddUsb`, `onDeleteUsb`, `onClose`.
- Profile fields: `JigConfig` (`id`, `name`, `Dj`, `length`, `isAdjustableLength`, `threadPitch`), `UsbConfig` (`id`, `name`, `Ds`, `threadPitch`, `microAdjustMarks`).
- State: `activeTab: 'jigs' | 'usbs'`, `deleteConfirmId`.

#### Mobile Responsiveness (<380px) & Touch Targets ($\ge 44\text{px}$)
- Numeric inputs: upgrade to `py-2 px-3 text-sm font-mono` to prevent accidental mis-taps.
- Delete and Edit icon buttons: upgrade to `w-10 h-10 rounded-xl`.
- Bottom action buttons (+ Add, Done): upgrade to `h-11 px-5 rounded-2xl font-bold`.

#### Specific Refactoring Plan
1. Segmented tab header: `bg-black/40 border border-white/5 rounded-2xl p-1`.
2. Hardware profile cards: `bg-[#262626] rounded-3xl border border-white/10 shadow-lg p-5 flex flex-col gap-4 relative`.
3. Identity input: `bg-black/30 border border-white/5 rounded-2xl px-3 py-2 text-sm font-semibold text-white focus:border-[var(--color-accent)]`.
4. Geometric inputs: `bg-black/30 border border-white/5 rounded-2xl px-3 py-2 text-sm font-mono text-white text-right focus:border-[var(--color-accent)]`.
5. Checkboxes: custom styled toggle with `accent-[var(--color-accent)]`.
6. Delete confirmation: `bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col items-center gap-3`.

---

### 3.7 `src/components/settings/MachineManagerView.tsx` (Grinder Config & Calibration)

#### Purpose & Overview
Manage multi-machine configurations (constants $h_c, o$ for rear and front bases, axle diameter $D_a$, default machine assignment, active calibration profile selection) and launch `CalibrationWizard`.

#### Line Count
392 lines.

#### Current Styling & Deficiencies Relative to `ProgressionView.tsx`
- Machine cards use `.card-elevated` with `${BTN.*}` button utility classes.
- Modal dialogues use standard `.rounded-lg` modal wrappers.
- Inactive calibration profile badges use light/dark border classes (`border-neutral-200 dark:border-neutral-800`).

#### Key State, Props, Callbacks & Math Integrations (DO NOT ALTER)
- Props: `jigs`, `usbs`, `global`, `wheels`, `machines`, `defaultMachineId`, `onAddMachine`, `onUpdateMachine`, `onDeleteMachine`, `onSetDefaultMachine`.
- Machine data structure: `MachineConfig` (`id`, `name`, `constants: { rear: { hc, o }, front: { hc, o } }`, `axleDiameter`, `calibrationProfiles`, `activeCalibrationId`).
- Calibration launcher: `setCalibratingMachineId(m.id)` switching cleanly to `<CalibrationWizard />`.

#### Mobile Responsiveness (<380px) & Touch Targets ($\ge 44\text{px}$)
- Action buttons (Edit, Delete, Set Default): ensure $\ge 44\text{px}$ touch targets.
- Hardware values grid: 2-column layout with bold monospace typography.

#### Specific Refactoring Plan
1. Machine profile cards: `bg-[#262626] rounded-3xl border border-white/10 shadow-lg p-6 flex flex-col gap-4 relative overflow-hidden`.
2. Default badge: `bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase`.
3. Constants container: `bg-black/20 border border-white/5 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs font-mono text-white`.
4. Calibration profile list inside Edit modal: `bg-black/30 border border-white/5 rounded-2xl p-3 flex items-center justify-between`.

---

### 3.8 `src/components/wheels/WheelManagerView.tsx` & `WheelFormFields.tsx` (Wheel Catalog & Forms)

#### Purpose & Overview
Sharpening wheel catalog management (SG-250, SJ-250, LA-220, diamond wheels), sorting, adding, editing, and deleting wheels with diameter ($D$), angle offsets ($\Delta\beta$), and honing flags.

#### Line Count
321 lines (`WheelManagerView.tsx`) + 143 lines (`WheelFormFields.tsx`).

#### Current Styling & Deficiencies Relative to `ProgressionView.tsx`
- `WheelManagerView`: `.panel-card .panel-card--strong` legacy container with `.card-grid md:grid-cols-2` and `.card-elevated .wheel-card`.
- `WheelFormFields`: `.rounded-lg border u-border u-surface p-3 sm:p-4` with legacy input styling `bg-black/5 dark:bg-white/5`.

#### Key State, Props, Callbacks & Math Integrations (DO NOT ALTER)
- Props: `wheels`, `onAddWheel`, `onUpdateWheel`, `onDeleteWheel`.
- Wheel attributes: `id`, `name`, `D` (numeric for calculations), `DText` (text input buffer), `angleOffset`, `baseForHn`, `isHoning`, `grit`.
- Draft state handlers: `openAddWheelModal`, `openEditWheelModal`, `handleSaveNewWheel`.

#### Mobile Responsiveness (<380px) & Touch Targets ($\ge 44\text{px}$)
- Wheel cards: `grid card-grid md:grid-cols-2` cleanly collapses to 1 column on mobile.
- Form inputs: `px-4 py-3 text-base rounded-2xl` $\rightarrow$ spacious touch interaction without mobile zoom.

#### Specific Refactoring Plan
1. Wheel catalog cards: `bg-[#262626] rounded-3xl border border-white/10 shadow-lg p-6 flex flex-col gap-3 relative transition-all duration-300 group`.
2. Diameter readout: `text-3xl font-extrabold text-white font-mono tracking-tight` with `mm` label.
3. Base & Honing badges: `bg-white/5 border border-white/5 text-white/70 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider`.
4. Form Fields: section blocks `bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3`, inputs `bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-base focus:border-[var(--color-accent)]`.

---

### 3.9 `src/components/presets/PresetManagerModal.tsx` & `SavePresetDialog.tsx` (Preset Modals)

#### Purpose & Overview
Save, rename, apply, and delete progression presets.

#### Line Count
181 lines (`PresetManagerModal.tsx`) + 80 lines (`SavePresetDialog.tsx`).

#### Current Styling & Deficiencies Relative to `ProgressionView.tsx`
- List items use `rounded border u-border u-surface px-2 py-2`.
- Inputs use `rounded border u-border u-surface px-2 py-1 text-xs`.
- Action buttons rely on `${BTN.*}` string classes.

#### Key State, Props, Callbacks & Math Integrations (DO NOT ALTER)
- Props: `isOpen`, `isClosing`, `onClose`, `sessionPresets`, `selectedPresetId`, `onLoadPreset`, `onDeletePreset`, `onRenamePreset`, `presetNameDraft`, `setPresetNameDraft`, `onSave`, `canSave`.
- Preset data model: `SessionPreset` (`id`, `name`, `createdAt`, `version: 1`, `steps: PresetStepRef[]`).

#### Mobile Responsiveness (<380px) & Touch Targets ($\ge 44\text{px}$)
- Preset action buttons: `h-10 px-3 rounded-xl font-bold text-xs` with $\ge 44\text{px}$ touch envelopes.
- Name inputs: `px-4 py-3 text-base rounded-2xl font-semibold`.

#### Specific Refactoring Plan
1. Preset items: `bg-black/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3`.
2. Active preset indicator: `bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase`.
3. Dialog inputs: `bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white text-base focus:border-[var(--color-accent)]`.

---

### 3.10 `src/components/CalibrationWizard.tsx` (Multi-Step Calibration Wizard)

#### Purpose & Overview
Interactive machine geometry calibration wizard calculating horizontal offset ($o$) and vertical datum constant ($h_c$) using non-linear least-squares fitting of caliper measurements with real-time residual analysis ($\varepsilon$) and angular error estimation.

#### Line Count
352 lines.

#### Current Styling & Deficiencies Relative to `ProgressionView.tsx`
- Root container uses `p-4 md:p-6 u-surface rounded shadow`.
- Measurement steps use `.card-elevated p-3 border-l-2 border-l-blue-500 / border-l-emerald-500`.
- Inputs use `.input-base` legacy styles.

#### Key State, Props, Callbacks & Math Integrations (DO NOT ALTER)
- Props: `global`, `activeMachine`, `wheels`, `onSaveProfile`, `onCancel`, `jigs`, `usbs`.
- Math solver calls: `calibrateBase(rows, calibDa, calibDs)` and `estimateMaxAngleErrorDeg(...)`.
- Steps: `step: 'intro' | 'measuring' | 'results'`, `measIndex`, `rearRows`, `frontRows`, `rearResult`, `frontResult`.

#### Mobile Responsiveness (<380px) & Touch Targets ($\ge 44\text{px}$)
- Measurement inputs ($h_n, CA_o$): `px-3 py-2.5 text-base font-mono rounded-2xl` $\rightarrow$ spacious and error-free on mobile.
- Navigation buttons (Next Height, Compute Results, Back, Save & Apply): `h-12 px-6 rounded-2xl font-bold text-sm`.

#### Specific Refactoring Plan
1. Wizard Card Container: `bg-[#262626] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative`.
2. Measurement Step Cards: `bg-black/30 rounded-2xl border border-white/5 p-4 flex flex-col gap-3`.
   - Rear base highlight: `border-l-4 border-l-blue-500`.
   - Front base highlight: `border-l-4 border-l-emerald-500`.
3. Results Diagnostic Pill: `bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2`.
   - Quality tag: `Excellent` $\rightarrow$ `text-[var(--color-accent)] font-bold`, `Good` $\rightarrow$ `text-emerald-400`.

---

### 3.11 `src/components/GlossaryPage.tsx` & `GlossaryCard.tsx` (Glossary & Reference)

#### Purpose & Overview
Reference documentation explaining symbols ($h_c, o, \varepsilon, pts, h_n, h_r, A, \beta$), mathematical definitions, and schematic diagram placeholder.

#### Line Count
34 lines (`GlossaryPage.tsx`) + 40 lines (`GlossaryCard.tsx`).

#### Current Styling & Deficiencies Relative to `ProgressionView.tsx`
- `GlossaryPage`: `.panel-card .panel-card--strong` legacy container.
- `GlossaryCard`: `rounded border border-neutral-700 bg-neutral-950/60 p-3 text-[0.75rem] text-neutral-200`.

#### Key State, Props, Callbacks & Math Integrations (DO NOT ALTER)
- Terms dictionary and definitions.

#### Specific Refactoring Plan
1. Container: `bg-[#262626] rounded-3xl border border-white/10 shadow-lg p-6 flex flex-col gap-4`.
2. Item rows: `bg-black/20 border border-white/5 rounded-2xl p-3.5 flex items-baseline gap-3`.
3. Term label: `font-mono font-bold text-[var(--color-accent)] text-sm shrink-0 min-w-[3.5rem]`.

---

### 3.12 `src/components/ImportExportPanel.tsx` (Data Backup & Restore)

#### Purpose & Overview
JSON export and selective import system with section filters and merge/overwrite modes.

#### Line Count
333 lines.

#### Current Styling & Deficiencies Relative to `ProgressionView.tsx`
- Uses `.panel-card .panel-card--strong` legacy container, raw unstyled checkboxes, and textarea with `.u-surface`.

#### Key State, Props, Callbacks & Math Integrations (DO NOT ALTER)
- Props: `exportText`, `onImportText`, `exportSections`, `onToggleExportSection`, `importSections`, `importModes`, `onToggleImportSection`, `onChangeImportMode`.
- JSON parse and selective merge engine.

#### Specific Refactoring Plan
1. Container: `bg-[#262626] rounded-3xl border border-white/10 shadow-lg p-6 flex flex-col gap-4`.
2. Section cards: `bg-black/20 border border-white/5 rounded-2xl p-3.5 flex items-center justify-between`.
3. Textarea: `bg-black/30 border border-white/10 rounded-2xl p-4 text-xs font-mono text-white focus:border-[var(--color-accent)]`.

---

### 3.13 Auxiliary Components (`ModalShell.tsx`, `MiniSelect.tsx`, `GrindDirToggle.tsx`, `ExpandToggle.tsx`)

#### ModalShell.tsx (67 lines)
- **Current Deficiencies:** `rounded-lg` (8px), `.u-border`, `.u-surface`.
- **Refactoring:** `max-w-lg bg-[#262626] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden`.
- **Close Button:** `w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition flex items-center justify-center`.

#### MiniSelect.tsx (240 lines)
- **Current Deficiencies:** Legacy `.dropdown-menu` classes.
- **Refactoring:** Trigger: `bg-black/30 hover:bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-xs font-semibold text-white`. Menu: `bg-[#262626] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-1 z-30`.

#### GrindDirToggle.tsx (64 lines)
- **Current Deficiencies:** Small touch area (28px), legacy styling.
- **Refactoring:** Minimum touch envelope $\ge 44\text{px}$.
  - Rear / Leading: `bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)] border border-[var(--color-accent)]/40 rounded-xl px-2.5 py-1.5 font-bold text-xs`.
  - Front / Trailing: `bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-xl px-2.5 py-1.5 font-bold text-xs`.
  - Honing / Locked: `bg-white/5 text-white/30 border border-white/5 cursor-not-allowed rounded-xl px-2.5 py-1.5 font-bold text-xs`.

#### ExpandToggle.tsx (42 lines)
- **Current Deficiencies:** `btn-toggle` (28px height).
- **Refactoring:** `w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition`.

---

## 4. Verification Checklist & Quality Gates

To certify that every component complies with the visual refactoring criteria without logic regression:

- [ ] **Visual Consistency Gate:** Every component utilizes `bg-[#262626]`, `border-white/10`, `rounded-3xl` cards, and `rounded-2xl` inner elements.
- [ ] **No Light Colors Gate:** Zero hardcoded light-mode background classes (e.g. `bg-white`, `bg-neutral-50`, `bg-black/5`) remain in production code.
- [ ] **Workshop Touch Targets Gate:** Every interactive button, stepper, selector, and toggle has a physical touch target $\ge 44\text{px} \times 44\text{px}$.
- [ ] **Narrow Viewport Gate:** All cards and steppers scale cleanly down to $<380\text{px}$ without horizontal clipping or unreadable text wrapping.
- [ ] **Strict Logic Preservation Gate:** Zero alterations to React state hooks, effect hooks, callbacks, or mathematical functions in `src/math/tormek.ts`.
- [ ] **Build Quality Gates:**
  - `npm run typecheck` $\rightarrow$ 0 errors
  - `npm run lint` $\rightarrow$ 0 errors
  - `npm run build` $\rightarrow$ Clean build passing
