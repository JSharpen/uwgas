# Changelog & Autonomous Session Log

> **Universal Wet Grinder Angle Setter (UWGAS)**
> All notable changes and autonomous AI session modifications are logged in this file.
> The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased] (Session: Context Bar Refactor)

### Changed / Reverted
- **LCD Tag Bar Experiment**: Explored replacing the individual data pill `<Tag>` elements on Wheel cards with a single unified, hardware-styled `<LcdBar>` component. After implementing and refining several variations (including pneumatic neu-concave cutouts and flat LCD aesthetics), the design was reverted back to the minimal ghost tags to preserve UI cleanliness and reduce visual bulk.

### Added
- **Shared Modal Selector Component (`JOB-033`)**:
  - Replaced the custom generic `ActionSheet` app-wide with a unified `ModalSelector` component built on top of the shared `ModalShell`.
  - Simplifies component API, enforces consistent `z-50` backdrop stacking, ensures standard safe-area-inset padding, and eliminates arbitrary CSS physics drifting.
- **Global Standardized Input Components**:
  - Abstracted text, number, and switch toggle inputs into reusable shared components (`TextInput.tsx`, `NumberInput.tsx`, `SwitchButton.tsx`) inside `src/components/ui/`.
  - Refactored `MachineManagerView`, `JigManagerView`, `UsbManagerView`, and `WheelFormFields` to use these standardized components, adhering to the anti-drift design principle.
- **Global Standardized Tag Component**:
  - Abstracted hardcoded `<span>` tags across the app (`GlobalSetupSummaryPill`, `MachineManagerView`, `WheelManagerView`, `ProgressionView`, and `CalibrationWizard`) into a strictly typed `<Tag>` component (`src/components/ui/Tag.tsx`).
  - Standardized the visual design language using explicit `intent` (warning, success, info, accent, default) and `appearance` (solid, outline, ghost) props with smart typography defaults (monospaced vs uppercase) and baseline spacing (`px-2 py-0.5`).

### Refactored
- Abstracted expanding accordion cards (`ProgressionView`, `MachineManagerView`, etc.) into a unified `ExpandableCard` shared component, enforcing design language rules.


### 🛠️ Architecture & UI Refactor: Context Bar (Inversion of Control)
- **Decentralized Header Logic**: Refactored the monolithic, brittle `ContextBar.tsx` switchboard into a clean `ContextBarShell.tsx` using an Inversion of Control pattern. 
- **React Portals API**: Views (`CalculatorView`, `EquipmentView`, `SettingsView`, etc.) now inject their own specific navigation controls directly into the global header using `<ContextBar.Slot>` React Portals, completely eliminating cross-feature logic tangles.
- **Strict UI Components**: Built a locked-down component library (`<ContextBar.Button>`, `<ContextBar.Title>`, etc.) that strictly enforces `DESIGN_LANGUAGE.md` constraints (minimum 44px touch targets, active state physics, and Amber/Red contextual highlights).
- **Global Destructive Overrides**: Retained the ability for the Context Bar shell to globally override any View's injected controls when a critical Destructive Confirmation (like deleting a preset) is triggered.

### 🛠️ Architecture & UI Refactor: Global Setup Drawer
- **Decomposed the "God Component"**: Split the monolithic `GlobalSetupCard.tsx` into strict, single-responsibility files (`GlobalSetupCard.tsx`, `GlobalSetupSummaryPill.tsx`, `GlobalSetupInputs.tsx`, and `StepperButtonGroup.tsx`).
- **Eliminated Zustand Blob Anti-Pattern**: Replaced the global state subscription (`useStore(s => s.global)`) with `useShallow` to prevent catastrophic re-renders across the drawer. Migrated ephemeral UI state (`activeUsbTab`, `activeSheet`) to `useUIStore.ts`.
- **Removed JS Layout Thrashing**: Replaced synchronous `getComputedStyle` layout thrashing in the `ResizeObserver` with a `requestAnimationFrame` debouncer. Replaced the generic `document.body.style.overflow` hack with a centralized, reference-counted `useBodyLock` hook.
- **Workshop Ergonomics & A11y**: 
  - Enhanced touch targets: the "Custom/Auto" toggle is now a `min-h-[44px]` rounded-xl button, and the "Rear/Front" pill switch now includes `role="switch"`, `aria-checked`, and `tabIndex={0}` for proper keyboard navigability and A11y support.

### 💄 UI & Native App Feel Overhaul (Animations)
- **Global Setup Drawer Physics (`framer-motion`)**: Replaced the legacy manual gesture math and CSS `opacity-0 delay-x` transitions with genuine iOS-style drawer physics. Implemented `<motion.div>` with `drag="y"`, `dragConstraints`, and a velocity-based `onDragEnd` resolver.
- **Top Layer Native Modals**: Refactored `ModalShell.tsx` (and consequently `PresetManagerModal` and `SavePresetDialog`) to utilize the modern HTML5 `<dialog>` element via `.showModal()`. Upgraded the backdrop to `backdrop:bg-black/75 backdrop:backdrop-blur-sm` utilizing native pseudo-elements.
- **Progression List View Transitions**: Wrapped step reordering (Up/Down) and step deletion events inside `document.startViewTransition()` along with dynamic `viewTransitionName` properties on the step cards. The browser now performs flawless, native gliding reorder animations.
- **Card Expansion Accordion (CSS Grid)**: Eliminated the buggy `max-h-[500px]` transition hack from `ProgressionView.tsx` which caused non-linear easing. Replaced with modern CSS Grid (`grid-template-rows: 0fr -> 1fr`) applied dynamically based on `isExpanded` state, ensuring perfect content-hugging expansions.

### 🚀 Added
- **Developer Suite Architecture**: Expanded Developer Mode into a full drill-down developer suite with categories for "UI & Theme Lab" and "State & Storage Tools".
- **UI & Theme Scalability Adjustments**: Added dynamic CSS custom properties for `--pill-bottom` (controls setup drawer resting location), `--top-bar-thickness` (sticky header profile), and `--ui-radius` (global border-radius overrides for `.rounded-[size]`). Connected these to real-time adjustable sliders in the Developer UI Theme Lab.
- **Scroll Fades**: Added dynamic mask fades using `#09090b` box-shadows to smoothly fade out progression list content as it scrolls underneath the top `ContextBar` (`maskTopFade`) and the bottom `GlobalSetupCard` summary pill (`maskBottomFade`).
- **Context Bar & Summary Pill Highlights**: 
  - Fixed a stacking context bug where solid `#09090b` mask blocks (using `before:-z-10`) were clipping the `ring-1` highlights on the `ContextBar`. Replaced with independent `z-[45]` and `z-[15]` sibling `div` masks in `App.tsx` and `CalculatorView.tsx`.
  - Refactored inline `boxShadow` styles to use `--tw-shadow` to preserve Tailwind's native ring rendering.
  - Applied the `border-amber-500/30 ring-1 ring-amber-500/20` styling to the `GlobalSetupCard` summary pill to match the Context Bar's glowing aesthetic.
  - Removed the `activePreset.name` span from the summary pill to reduce vertical height and visual clutter (preset name remains visible in the Context Bar).

- **Semantic Debug Outlines**: Added a toggle to inject `.debug-layouts` which outlines major semantic DOM elements to assist in touch target and responsive testing.

- **State Data Lab**: Added one-click utilities to inject dummy progression steps, dump the live Zustand tree to browser console, and irreversibly nuke `localStorage`.

- **Developer Mode Configuration Lab**: Added a `Developer Mode` section to `SettingsRootView` exclusively available in dev environments (`import.meta.env.DEV`). Allows real-time live manipulation of root CSS custom properties including `--ui-scale`, `--step-card-height`, and `--card-stack-gap`.
- **Global UI Scaling (`--ui-scale`)**: Refactored `index.css` to base its `:root` `font-size` off of `calc(16px * var(--ui-scale, 1))`. This cascades proportionally through `rem`-based typography and structural layouts.
- **Persisted Dev Store**: Implemented `src/state/devStore.ts` using `zustand/middleware` `persist` to ensure UI experimentation values stick across hot reloads and page refreshes.

## [0.9.12] — 2026-09-09 (Session: Progression View Swipe Fix)

### 🐛 Bug Fixes & UX Polish
- **Swipe-to-Collapse Ergonomics (`src/components/ProgressionView.tsx`)**: Fixed a frustrating mobile bug where attempting to scroll or interact within an expanded step's edit drawer would accidentally trigger the `swipe-to-close` gesture and immediately collapse the card. The touch gesture handlers (`onTouchStart`, `onTouchEnd`) have been relocated directly to the card's header, ensuring safe and uninterrupted interaction within the edit drawer while preserving the expected swipe-to-close behavior on the header itself.

## [0.9.11] — 2026-09-08 (Session: State Refactor Quality Gate Remediation)

### 🐛 Bug Fixes & Architecture Remediation (Gate Review)
- **Legacy Storage Migration Bridge (`src/state/migration.ts`)**: Resolved bug where `loadedGlobal` legacy properties `usbDiameter` and `jig.Dj` were dropped during `DEFAULT_GLOBAL` pre-merging. `loadedGlobal` is now checked directly before setting default IDs, guaranteeing custom legacy hardware entities are created and assigned via `ensureHardwareConfig`.
- **JSON Backup Import (`src/state/store.ts`)**: Fixed `importState()` when restoring configurations under `sections.constants`. In addition to grinder machines, `parsedObj.jigs` and `parsedObj.usbs` are now properly merged or overwritten per selected mode.
- **Component Prop-Drilling Elimination (`src/components/CalibrationWizard.tsx` & `src/components/settings/MachineManagerView.tsx`)**: Decoupled `CalibrationWizard` from `global`, `wheels`, and `usbs` props, subscribing directly to Zustand stores via `useStore` and `useShallow`. Removed redundant subscriber middlemen from `MachineManagerView`.
- **Workshop Touch Ergonomics (`src/views/CalculatorView.tsx`)**: Upgraded sticky progression header pill buttons (`Clear All`, `No`, `Yes`, `+ Add Step`) from `h-9` (36px) to `h-11` (44px), meeting minimum workshop touch targets.
- **State Test Suite Harmonization (`src/state/state.test.ts`)**: Updated empirical test assertions to verify custom USB/Jig migration and constants import roundtripping now pass with 100% genuine execution (30/30 passed).

## [0.9.10] — 2026-09-07 (Session: Safari Layout & Padding Fixes)

### 🐛 Bug Fixes & UI Polish
- **Safari Scroll Padding Fix**: Resolved layout issues in the Global Setup Card drawer where content was abruptly cut off by the Summary Pill overlapping the scroll area.
- **Flex Gap Math Alignment**: Implemented a dynamic `h-px` spacer at the precise bottom of the `Inputs Area` flex container to perfectly balance the 16px `gap-4` padding requirement, providing pixel-perfect bottom clearance without relying on unreliable CSS padding that mobile Safari ignores.
- **Drawer Overlap Geometry**: Verified DOM tree geometry to ensure the `Drawer Body` successfully wraps the inner scroll area and gracefully slides behind the overlapping `Summary Pill` without structural leakage.

## [Unreleased]
- **Shared Modal Selector Component (`JOB-033`)**:
  - Replaced the custom generic `ActionSheet` app-wide with a unified `ModalSelector` component built on top of the shared `ModalShell`.
  - Simplifies component API, enforces consistent `z-50` backdrop stacking, ensures standard safe-area-inset padding, and eliminates arbitrary CSS physics drifting.

## [0.9.9] — 2026-09-05 (Session: Progression View Neumorphic Polish)

### 💄 UI & Ergonomics (JOB-023)
- **Neumorphic Step Cards**: Refactored `ProgressionView.tsx` to use `neu-convex` for the view state and `neu-concave` for the expanded edit area, perfectly matching `GlobalSetupCard.tsx`.
- **Turn Calculator**: Display exact turns (e.g., `UP 1T 2M`) based on `threadPitch` and `microAdjustMarks` for the active USB (Height mode) or Jig (Projection mode) when navigating between steps.
- **Smart Scroll**: Expanding a step now elegantly scrolls it into the center of the viewport, ensuring it sits clearly above the bottom global setup drawer.
- **Swipe-to-Collapse**: Mirroring the setup drawer, you can now swipe up on an expanded step to collapse it.

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
- **Developer Suite Architecture**: Expanded Developer Mode into a full drill-down developer suite with categories for "UI & Theme Lab" and "State & Storage Tools".
- **UI & Theme Scalability Adjustments**: Added dynamic CSS custom properties for `--pill-bottom` (controls setup drawer resting location), `--top-bar-thickness` (sticky header profile), and `--ui-radius` (global border-radius overrides for `.rounded-[size]`). Connected these to real-time adjustable sliders in the Developer UI Theme Lab.

- **Semantic Debug Outlines**: Added a toggle to inject `.debug-layouts` which outlines major semantic DOM elements to assist in touch target and responsive testing.

- **State Data Lab**: Added one-click utilities to inject dummy progression steps, dump the live Zustand tree to browser console, and irreversibly nuke `localStorage`.

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

## [Unreleased]

### 🎨 Styling & Theming
- **Equipment Forms Neumorphic Overhaul**: 
  - Condense layouts and remove nested background wrappers in Wheels, Machines, Jigs, and USBs forms.
  - Convert text/number inputs to `neu-concave` styling matching the Progression View.
  - Transform boolean checkboxes to compact `neu-button` toggles with amber active highlights.
  - Ensure uniform theming across inline editable cards and "Add" modal dialogs.

## [0.9.5] — 2026-08-31 (Session: Hardware Manager & Jigs/USB Profiles)

### 🚀 Added
- **Developer Suite Architecture**: Expanded Developer Mode into a full drill-down developer suite with categories for "UI & Theme Lab" and "State & Storage Tools".
- **UI & Theme Scalability Adjustments**: Added dynamic CSS custom properties for `--pill-bottom` (controls setup drawer resting location), `--top-bar-thickness` (sticky header profile), and `--ui-radius` (global border-radius overrides for `.rounded-[size]`). Connected these to real-time adjustable sliders in the Developer UI Theme Lab.

- **Semantic Debug Outlines**: Added a toggle to inject `.debug-layouts` which outlines major semantic DOM elements to assist in touch target and responsive testing.

- **State Data Lab**: Added one-click utilities to inject dummy progression steps, dump the live Zustand tree to browser console, and irreversibly nuke `localStorage`.

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
- **Developer Suite Architecture**: Expanded Developer Mode into a full drill-down developer suite with categories for "UI & Theme Lab" and "State & Storage Tools".
- **UI & Theme Scalability Adjustments**: Added dynamic CSS custom properties for `--pill-bottom` (controls setup drawer resting location), `--top-bar-thickness` (sticky header profile), and `--ui-radius` (global border-radius overrides for `.rounded-[size]`). Connected these to real-time adjustable sliders in the Developer UI Theme Lab.

- **Semantic Debug Outlines**: Added a toggle to inject `.debug-layouts` which outlines major semantic DOM elements to assist in touch target and responsive testing.

- **State Data Lab**: Added one-click utilities to inject dummy progression steps, dump the live Zustand tree to browser console, and irreversibly nuke `localStorage`.

- **Multi-Machine Profiles System (`JOB-006`)**:
  - Replaced the legacy global constants card with a new `MachineManagerView` to create, edit, and set a default machine profile.
  - The `CalibrationWizard` is now launched strictly per machine directly from the manager view, updating that machine's constants seamlessly upon application.
  - Implemented dynamic per-step hardware overrides in `ProgressionEditor` and `ProgressionView`, allowing users to select a different machine or explicitly override the USB diameter ($D_s$) for any individual step in a sequence.

## [0.9.3] — 2026-08-28 (Session: Suggested Front USB Height & Custom Override)

### 🚀 Added
- **Developer Suite Architecture**: Expanded Developer Mode into a full drill-down developer suite with categories for "UI & Theme Lab" and "State & Storage Tools".
- **UI & Theme Scalability Adjustments**: Added dynamic CSS custom properties for `--pill-bottom` (controls setup drawer resting location), `--top-bar-thickness` (sticky header profile), and `--ui-radius` (global border-radius overrides for `.rounded-[size]`). Connected these to real-time adjustable sliders in the Developer UI Theme Lab.

- **Semantic Debug Outlines**: Added a toggle to inject `.debug-layouts` which outlines major semantic DOM elements to assist in touch target and responsive testing.

- **State Data Lab**: Added one-click utilities to inject dummy progression steps, dump the live Zustand tree to browser console, and irreversibly nuke `localStorage`.

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
- **Developer Suite Architecture**: Expanded Developer Mode into a full drill-down developer suite with categories for "UI & Theme Lab" and "State & Storage Tools".
- **UI & Theme Scalability Adjustments**: Added dynamic CSS custom properties for `--pill-bottom` (controls setup drawer resting location), `--top-bar-thickness` (sticky header profile), and `--ui-radius` (global border-radius overrides for `.rounded-[size]`). Connected these to real-time adjustable sliders in the Developer UI Theme Lab.

- **Semantic Debug Outlines**: Added a toggle to inject `.debug-layouts` which outlines major semantic DOM elements to assist in touch target and responsive testing.

- **State Data Lab**: Added one-click utilities to inject dummy progression steps, dump the live Zustand tree to browser console, and irreversibly nuke `localStorage`.

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
- **Developer Suite Architecture**: Expanded Developer Mode into a full drill-down developer suite with categories for "UI & Theme Lab" and "State & Storage Tools".
- **UI & Theme Scalability Adjustments**: Added dynamic CSS custom properties for `--pill-bottom` (controls setup drawer resting location), `--top-bar-thickness` (sticky header profile), and `--ui-radius` (global border-radius overrides for `.rounded-[size]`). Connected these to real-time adjustable sliders in the Developer UI Theme Lab.

- **Semantic Debug Outlines**: Added a toggle to inject `.debug-layouts` which outlines major semantic DOM elements to assist in touch target and responsive testing.

- **State Data Lab**: Added one-click utilities to inject dummy progression steps, dump the live Zustand tree to browser console, and irreversibly nuke `localStorage`.

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
- **Developer Suite Architecture**: Expanded Developer Mode into a full drill-down developer suite with categories for "UI & Theme Lab" and "State & Storage Tools".
- **UI & Theme Scalability Adjustments**: Added dynamic CSS custom properties for `--pill-bottom` (controls setup drawer resting location), `--top-bar-thickness` (sticky header profile), and `--ui-radius` (global border-radius overrides for `.rounded-[size]`). Connected these to real-time adjustable sliders in the Developer UI Theme Lab.

- **Semantic Debug Outlines**: Added a toggle to inject `.debug-layouts` which outlines major semantic DOM elements to assist in touch target and responsive testing.

- **State Data Lab**: Added one-click utilities to inject dummy progression steps, dump the live Zustand tree to browser console, and irreversibly nuke `localStorage`.

- Interactive developer console shell script (`angle-dev-console.sh`) with live status header, LAN QR code generation, quality precheck suite, and `gh-pages` deployment.
- Initial Ton/Dutchman trigonometric math engine (`src/math/tormek.ts`).
- Dual-base machine calibration wizard (`src/components/CalibrationWizard.tsx`).
- Sharpening progression card views (`src/components/ProgressionView.tsx`).
- Theme Lab with live CSS variable editor (`src/components/ThemeLab.tsx`).
- Local persistence and JSON Import/Export backup panel (`src/components/ImportExportPanel.tsx`).
- PWA manifest and offline service worker.

