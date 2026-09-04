# Changelog & Autonomous Session Log

> **Universal Wet Grinder Angle Setter (UWGAS)**
> All notable changes and autonomous AI session modifications are logged in this file.
> The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.9.8] — 2026-09-03 (Session: Modern Sleek Dark Theme Visual Refactor)

### 💄 UI & Modern Sleek Design System Overhaul (JOB-022)
- **Universal Dark Zinc / Amber Aesthetic**:
  - Fully refactored all modal shells, pickers, settings views, managers, wizards, cards, and application shell to strictly align with the `ProgressionView.tsx` design tokens (`bg-[#262626]`, `border-white/10`, `rounded-3xl` containers, `rounded-2xl` inner wells, `rounded-xl` controls, amber `#f59e0b` accents, sky blue `#38bdf8` focus states, and $\ge 44\text{px}$ touch targets).
  - Eliminated all residual light-mode colors and hardcoded backgrounds (`bg-white`, `bg-neutral-800`, light borders) in favor of high-contrast workshop dark theme styling.
- **Modals, Dialogs & Selectors**:
  - `ModalShell.tsx`: Standardized dark modal container with smooth backdrop (`bg-black/70`), crisp border (`border-white/10`), rounded corners (`rounded-3xl`), and responsive padding.
  - `ActionSheetPicker.tsx`: Refactored bottom drawer / centered dialog with high-contrast active item indicators and tactile option items.
  - `MiniSelect.tsx`: Transformed into a dark floating dropdown with `bg-[#262626]`, `rounded-2xl`, `border-white/10`, and amber selection highlights.
  - `SavePresetDialog.tsx` & `PresetManagerModal.tsx`: Modern sleek dark preset dialogs with `rounded-3xl` cards, `rounded-2xl` preset list items, amber badges, and high-contrast action buttons.
- **Settings & Managers**:
  - `SettingsRootView.tsx`: Modern sleek tabbed settings shell with clear section headers, `rounded-2xl` navigation items, and smooth transitions.
  - `MeasurementSettingsView.tsx`: Dark settings cards with tactile segmented switches and high-contrast labels.
  - `HardwareManagerView.tsx` & `MachineManagerView.tsx`: Refactored hardware/machine profile lists with `rounded-2xl` wells, steppers, and modal add/edit forms.
  - `WheelManagerView.tsx` & `WheelFormFields.tsx`: Dark wheel library management with grit badges, `rounded-2xl` input containers, and `bg-black/30` wells.
  - `ImportExportPanel.tsx`: Modern sleek backup/restore panel with dark JSON preview areas and `bg-red-500/10` danger zone cards.
- **Wizards, Reference & Interactive Controls**:
  - `CalibrationWizard.tsx`: Upgraded 3-step calibration flow (Intro, Measuring, Results) with massive monospace readouts, real-time error residual indicators ($\varepsilon$), and `rounded-3xl` cards.
  - `GlossaryPage.tsx` & `GlossaryCard.tsx`: Modern sleek glossary index with search bar, category chips, formula highlight blocks, and amber badge readouts.
  - `GrindDirToggle.tsx` & `ExpandToggle.tsx`: Tactile segmented direction toggle and circular chevron expand controls.
- **Application Shell & Global Setup**:
  - `GlobalSetupCard.tsx`: Unified dark setup drawer with `rounded-3xl` container, `rounded-2xl` parameter wells, responsive workshop steppers, and quick-adjust pickers.
  - `App.tsx` & `src/index.css`: Root container styling, fixed top bar, bottom tab navigation bar, responsive max-width wrapper, and custom scrollbar dark theming.

### 🛡️ Technical Verification & Logic Preservation
- Verified 100% preservation of all React state hooks, event handlers, and pure mathematical calculation engine (`src/math/tormek.ts`).
- Passed all verification gates with 0 errors: `npm run typecheck`, `npm run lint`, and `npm run build`.

## [0.9.7] — 2026-09-01 (Session: Mobile-First UX Overhaul)

### 💄 UI & Ergonomics
- **Bottom Tab Bar**: Replaced the top navigation buttons with a permanent, fixed bottom tab bar using clean icon-only indicators (`IconCalculator`, `IconDisc`, `IconSettings`).
- **Bottom Drawer Global Setup**: 
  - Transformed the `GlobalSetupCard` into a fixed bottom drawer that sits right on top of the new tab bar.
  - The drawer expands *upwards*, visually overlaying the progression list without disrupting background scroll.
### Changed
- **Global Setup Drawer Integration**: Completely overhauled the Global Setup panel into an animated bottom sheet drawer. Separated the unified background into two visually distinct components: a permanently visible floating Summary Pill, and a Drawer Body that smoothly expands upwards from behind the pill on tap/swipe.
- **Preset Management**: Moved the preset selection dropdown from the Progression header into the new Global Setup drawer as a dedicated ActionSheetPicker. The active preset is now prominently displayed on its own line inside the Summary Pill. Save and Manage Preset controls remain in the Progression Kebab menu for now.
- **Settings Overhaul**: Removed top tab navigation and moved Advanced options (Height Mode, Constants) into a dedicated modal Settings page.
- **Native Settings Navigation**: 
  - Scrapped the `MiniSelect` dropdown for Settings navigation.
  - Created a classic vertical list root menu (`SettingsRootView`) with drill-down submenus.
  - Relocated calculation and measurement modes (`calcMode`, `useProtrusionMode`, `heightMode`) into a new dedicated "Measurement" submenu to fully declutter the main Global Setup card.

## [0.9.6] — 2026-09-01 (Session: JOB-007 Jig Protrusion & Projection)

### 🚀 Added
- **Blade Protrusion (Caliper) Measurement Mode**:
  - Implemented `$P_b$` (Blade Protrusion) mode in `GlobalSetupCard`, allowing users to directly input a caliper measurement rather than the full projection $A$.
  - Expanded `JigConfig` to track `length` (base length of the jig), `isAdjustableLength` (collar adjustable jigs), and `threadPitch`.
  - Added new defaults: KJ-45 (100mm), KJ-140 (140mm).
- **Adjustable Jig Projection Solver**:
  - In Projection Solver Mode (fixed USB), the math engine now computes the exact required jig length.
  - Automatically calculates and renders the required physical $\Delta$ mm adjustment and number of turns (if thread pitch is defined) directly in the `ProgressionView` readout.
- **General Preferences View**:
  - Created a new "Preferences" tab under the main App Settings.
  - Relocated the "Reference Base" toggle (Datum vs Wheel / $h_n$ vs $h_r$) to this new global settings view.

### 💄 UI & Ergonomics
- Refined `GlobalSetupCard` grid geometries to optimally adapt between Projection and Height modes.
- Merged Front and Rear USB fixed inputs into a unified tabbed card in Projection Mode to restore the clean 2x2 grid.
- Dynamically reflowed the Hardware Selection block to display side-by-side on desktop when spanning full-width.

## [0.9.5] — 2026-08-31 (Session: Hardware Manager & Jigs/USB Profiles)

### 🚀 Added
- **Hardware Profile Manager**:
  - Replaced raw USB ($D_s$) and Jig ($D_j$) diameter inputs with a new `HardwareManagerView` (accessible via Settings > Hardware) that allows creating, editing, and deleting named Jigs and USBs profiles.
  - V5 schema migration automatically converts legacy raw diameters into generated named custom profiles for seamless backwards compatibility.
- **Dynamic Hardware Selectors**:
  - `GlobalSetupCard` now utilizes `MiniSelect` dropdowns for selecting the active Jig and USB profile.
  - `ProgressionEditor` step cards now support individual USB profile overrides instead of raw diameters.
- **Progression Card Redesign**:
  - Re-flowed progression card inputs to reserve the bottom row for the step's support bar (USB) override and wheel diameter, moving the angle offset to the main body of the card.
  - `ProgressionView` accurately resolves hardware names and renders warning badges for unmapped geometry.

### ♻️ Changed
- Replaced the "Machines & hardware" setting menu option with distinct "Machines" and "Hardware" views.
- Safely deprecated the Direct Swap calculator from the UI, keeping the mathematical algorithm inside `tormek.ts` for future experiments (`JOB-015`).

## [0.9.4] — 2026-08-30 (Session: Multi-Machine Profiles System)

### 🚀 Added
- **Multi-Machine Profiles System (`JOB-006`)**:
  - Replaced the legacy global constants card with a new `MachineManagerView` to create, edit, and set a default machine profile.
  - The `CalibrationWizard` is now launched strictly per machine directly from the manager view, updating that machine's constants seamlessly upon application.
  - Implemented dynamic per-step hardware overrides in `ProgressionEditor` and `ProgressionView`, allowing users to select a different machine or explicitly override the USB diameter ($D_s$) for any individual step in a sequence.

## [0.9.3] — 2026-08-28 (Session: Suggested Front USB Height & Custom Override)

### 🚀 Added
- **Suggested Front USB Height Solver (`JOB-014`)**:
  - Implemented `computeSuggestedFrontUsbHeight` in `src/math/tormek.ts` to calculate the front USB bar datum height ($h_n$) or wheel height ($h_r$) that exactly matches the wheel center to USB center distance ($CA$) of the rear USB setting.
  - Guarantees that when moving a knife from rear (grinding) to front (honing) with the same wheel diameter and target angle, the required projection $A$ is identical, saving setup and reclamping time.
- **Dynamic Text Display & Custom Override Checkbox in Projection Mode**:
  - Replaced the front USB input and stepper buttons with a clean, high-contrast monospace text readout displaying the suggested height value by default.
  - Added a touch-friendly `Custom setting` checkbox. When enabled, exposes a numeric input to override the suggested value with a custom front height without cluttering stepper buttons.
  - Updated collapsed summary strip in `GlobalSetupCard` to dynamically display the active front height with full reactivity.
- **Global Setup Auto Front USB**: In Projection Mode, the Front USB height is now automatically suggested based on the rear USB height and wheel parameters.
- **Custom Front USB Toggle**: Users can optionally check "Custom setting" in Projection Mode to manually override the suggested Front USB height.

### ♻️ Changed
- **Default Wheel Library Streamlined**: Removed extra wheels from the default list in `DEFAULT_WHEELS` (`src/state/defaults.ts`) to provide a cleaner starting point. The defaults now strictly include only the SG-250, SJ-250, and LA-220 wheels.
- **Mobile Grid Layout Consistency**: Refactored the layout of `GlobalSetupCard` so both Height Mode and Projection Mode display a perfectly consistent 2x2 grid of half-width cards on mobile. Removed full-width text inputs and restyled the Reference Toggle and Advanced Diameters to fit seamlessly within the grid.

### ⚙️ State & Schema Extensions
- Extended `GlobalState` type and `DEFAULT_GLOBAL` with `useCustomFrontUsb?: boolean` (defaulting to `false`).
- Integrated with `computeWheelResults` to resolve suggested vs custom front heights automatically.

---

## [0.9.2] — 2026-08-27 (Session: Projection Solver & Fixed USB Mode)

### 🚀 Added
- **Exact Inverse Dutchman Projection Solver (`JOB-012`)**:
  - Implemented exact closed-form algebraic inverse Dutchman trigonometry in `computeRequiredProjection` (`src/math/tormek.ts`) solving for knife projection $A$ from wheel radius $R$, jig diameter $D_j$, USB diameter $D_s$, target bevel angle $\beta$, and fixed USB bar position ($h_n$ base datum or $h_r$ wheel surface).
  - Sub-nanometer precision identity ($< 10^{-13}\text{ mm}$ round-trip accuracy) with physical reachability boundary checks preventing negative square roots or physically unreachable geometries.
- **Dual Fixed USB Inputs (Rear & Front Bases)**:
  - Added dedicated, independent fixed USB height inputs for both **Rear Base** (e.g. grinding) and **Front Base** (e.g. honing) with respective base geometry and machine constants.
  - Responsive 3-column layout in `GlobalSetupCard` on wider screens (`USB Rear` | `USB Front` | `Target angle θ°`) with seamless 2-column wrapping on mobile.
- **Global Setup Card Solver Mode Header Toggle**:
  - Added a dedicated mode toggle button in `GlobalSetupCard` header (`Solve: Height` $\leftrightarrow$ `Solve: Proj A`) styled with `${BTN.base} px-3 text-xs` matching the Progression Edit button.
  - Dynamically updates primary inputs and steppers with $\pm 1\text{mm}, \pm 5\text{mm}$ touch-friendly workshop steppers.
- **Progression View Projection Readouts**:
  - `ProgressionView` automatically renders high-contrast `A = XX.XX mm` readouts when in Projection solver mode with clear base indicators (`Base R` / `Base F`) and graceful `Out of range` danger indicators when physically unreachable.
- **Global Setup Full Collapse & Compact Summary Strip (`JOB-013`)**:
  - Re-engineered `GlobalSetupCard` collapse behavior so the header chevron toggles the entire input panel.
  - Designed a high-contrast compact summary strip shown when collapsed, displaying active variables (`A` / `Rear hn`, `Front hn`, `Target angle θ°`, `Readout mode`, and `Ds/Dj` diameters) at a glance with a 1-click shortcut to expand for edits.
- **Schema & State Persistence Extensions**:
  - Extended `GlobalState` with `calcMode`, `fixedUsbRear`, and `fixedUsbFront` with safe fallback migrations in `readPersistedState` and `parsePersistedState`.

---

## [0.9.1] — 2026-08-26 (Session: Architecture & Usability Overhaul)

### 🚀 Added
- **Workshop Touch Steppers (`JOB-005`)**:
  - Reorganized Projection $A$ and Target Angle $\beta$ into a permanent 2-column side-by-side layout across all screen sizes (mobile through desktop) with full-width text-centered inputs and 4-button stepper button grids beneath each field (`[-5] [-1] [+1] [+5]` and `[-1°] [-0.5°] [+0.5°] [+1°]`) to minimize vertical screen usage.
  - Progressive disclosure: moved Height Readout Mode and Machine Diameters into the header's expandable panel for a clean, minimal default view.
  - Removed quick angle chips from the expandable panel to keep the setup interface minimal and focused on direct precision input and stepper adjustments.
- **Removed Global MicroBump Feature (`JOB-003`)**:
  - Removed redundant global micro-bevel toggle and degree adjuster from `GlobalSetupCard`, `GlobalState` type, and math engine calculations. Per-step angle offsets in the progression editor provide exact, granular micro-bevel control where needed.
- **Direct Height Readout Mode Control (`JOB-004`)**:
  - Integrated a dedicated segmented control in the Global Setup card for switching between datum base height ($h_n$) and wheel surface height ($h_r$), matching the visual style and ergonomics of the other setup controls.
- **First-Run & Default Progression Flow (`JOB-002`)**:
  - Auto-loads standard sequence (Grindstone Edge Leading $\rightarrow$ Leather Honing Edge Trailing with +0.2° micro-bevel) on first startup.
  - Added "+ Load Standard Progression" button in the empty state.
- **Unified Step Card Height via CSS Custom Property (`--step-card-height`)**:
  - Implemented `--step-card-height: 5.5rem` (88px) in `index.css` applied across all `.card-stack .card-elevated` containers with `flex: 1` body scaling.
  - Automatically unifies View Mode and Edit Mode to the exact same vertical height with zero prop-drilling or JavaScript resize overhead, laying the foundation for future display density settings (`JOB-011`).
- **Single-Line Step Card Headers & Elastic Wheel Selector**:
  - Upgraded `MiniSelect` to support responsive elastic layout (`flex-1 min-w-0`) with graceful label text truncation.
  - Made step card headers in both `ProgressionEditor` and `ProgressionView` permanently non-wrapping (`flex-nowrap justify-between`) across all viewport widths.
  - Fixed right-hand diameter ($D$) input and delete trash button into a compact group that never drops to a second row.
- **Removed Notes Feature & Streamlined Readouts**:
  - Removed the step notes feature, textarea modal, and empty "No notes" placeholder box.
  - Expanded the calculated height readouts ($h_n / h_r$) in `ProgressionView` to full width with prominent, high-contrast monospace typography.
  - Streamlined `ProgressionEditor` step cards to a clean 2-section layout (base side toggle & angle offset on left, reorder buttons on right).
- **Dedicated Modal & Component Subsystems (`JOB-001`)**:
  - `src/components/calculator/GlobalSetupCard.tsx`: Steppers, chips, and USB/Jig diameters.
  - `src/components/calculator/ProgressionEditor.tsx`: Step cards, base toggling, angle offsets, and removal animations.
  - `src/components/wheels/WheelManagerView.tsx`: Wheel library list, sorting, grouping, and modal triggers.
  - `src/components/wheels/WheelFormFields.tsx`: Reusable wheel attribute inputs.
  - `src/components/presets/PresetManagerModal.tsx`: Preset list, renaming, loading, and deletion.
  - `src/components/presets/SavePresetDialog.tsx`: Save current progression modal.
  - `src/components/settings/MachineConstantsCard.tsx`: Rear and Front base geometry settings and calibration snapshot selector.
  - `src/components/ModalShell.tsx`: Standard accessible modal wrapper with virtual keyboard offset handling.
  - `src/components/ExpandToggle.tsx`: Collapsible section chevron button.
  - `src/utils/normalizers.ts`: Robust, type-safe data and snapshot normalizers.

### ♻️ Changed / Refactored
- **`src/App.tsx`**: Decomposed from 2,899 lines of monolithic code down to ~500 lines of clean orchestrator logic.
- **`src/components/GrindDirToggle.tsx`**: Added support for optional full text labels (`showLabel`).

---

## [0.9.0] — 2025-12-19 (Baseline & Dev Console)

### 🚀 Added
- Interactive developer console shell script (`angle-dev-console.sh`) with live status header, LAN QR code generation, quality precheck suite, and `gh-pages` deployment.
- Initial Ton/Dutchman trigonometric math engine (`src/math/tormek.ts`).
- Dual-base machine calibration wizard (`src/components/CalibrationWizard.tsx`).
- Sharpening progression card views (`src/components/ProgressionView.tsx`).
- Theme Lab with live CSS variable editor (`src/components/ThemeLab.tsx`).
- Local persistence and JSON Import/Export backup panel (`src/components/ImportExportPanel.tsx`).
- PWA manifest and offline service worker.

