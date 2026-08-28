# Changelog & Autonomous Session Log

> **Universal Wet Grinder Angle Setter (UWGAS)**
> All notable changes and autonomous AI session modifications are logged in this file.
> The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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

