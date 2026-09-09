# Project: UWGAS "Modern Sleek" Visual Refactor

## Architecture
The Universal Wet Grinder Angle Setter (UWGAS) is a single-page React + TypeScript + Tailwind CSS application engineered for high-precision workshop grinding calculations.
The architecture consists of:
- **Presentation Layer**: View components, interactive cards, modals, sheets, and wizards in `src/components/`.
- **Design System Benchmark**: `src/components/ProgressionView.tsx` defines the authoritative "Modern Sleek" dark theme design tokens (`bg-[#262626]`, `border-white/10`, `rounded-3xl` primary cards, `rounded-2xl` inner wells, `rounded-xl` steppers/buttons, `rounded-full` pills, amber `#f59e0b` primary accents, sky blue `#38bdf8` focus highlights, high-contrast monospace readouts, $\ge 44\text{px}$ touch targets).
- **Core Calculation Engine**: Pure trigonometric models in `src/math/tormek.ts` (strictly preserved, read-only).
- **Persistence & State**: `src/state/storage.ts` and React hooks in `src/App.tsx` and child views (strictly preserved, no schema changes).

## Feature / Component Inventory
| # | Component / Feature | Current File | Target Paradigm | Assigned Milestone | Status |
|---|---------------------|--------------|-----------------|-------------------|--------|
| 1 | ModalShell | `src/components/ModalShell.tsx` | Modern Sleek dark shell, `rounded-3xl`, `border-white/10`, `bg-[#262626]`, smooth backdrop `bg-black/70` | M1 | DONE |
| 2 | ActionSheetPicker | `src/components/calculator/ActionSheetPicker.tsx` | Dark bottom drawer / centered dialog, `bg-[#262626]`, `rounded-3xl`, amber active states, 44px items | M1 | DONE |
| 3 | MiniSelect | `src/components/MiniSelect.tsx` | Dark floating portal dropdown, `bg-[#262626]`, `rounded-2xl`, `border-white/10`, high contrast | M1 | DONE |
| 4 | SavePresetDialog | `src/components/presets/SavePresetDialog.tsx` | Modern Sleek dark dialog, `rounded-3xl`, `bg-[#262626]`, amber save CTA | M1 | DONE |
| 5 | PresetManagerModal | `src/components/presets/PresetManagerModal.tsx` | Modern Sleek preset list, `rounded-3xl` shell, `rounded-2xl` preset cards, amber badges | M1 | DONE |
| 6 | SettingsRootView | `src/components/settings/SettingsRootView.tsx` | Modern Sleek tabbed settings container, `rounded-3xl` root, crisp navigation tabs | M2 | DONE |
| 7 | MeasurementSettingsView | `src/components/settings/MeasurementSettingsView.tsx` | Dark settings cards, `rounded-2xl` wells, tactile segmented switches, large numbers | M2 | DONE |
| 8 | HardwareManagerView | `src/components/settings/HardwareManagerView.tsx` | Dark hardware cards, USB projection steppers, `rounded-2xl` wells | M2 | DONE |
| 9 | MachineManagerView | `src/components/settings/MachineManagerView.tsx` | Modern Sleek machine profile list, add/edit/delete modals with `rounded-3xl` / `rounded-2xl` | M2 | DONE |
| 10 | WheelManagerView | `src/components/wheels/WheelManagerView.tsx` | Modern Sleek wheel list, add/edit/delete modals, grit badges, amber accents | M2 | DONE |
| 11 | WheelFormFields | `src/components/wheels/WheelFormFields.tsx` | Dark input wells, `rounded-2xl` containers, `bg-black/30` wells, clear labels | M2 | DONE |
| 12 | ImportExportPanel | `src/components/ImportExportPanel.tsx` | Modern Sleek backup/restore panel, danger zone with `bg-red-500/10`, `rounded-3xl` | M2 | DONE |
| 13 | CalibrationWizard | `src/components/CalibrationWizard.tsx` | 3-step wizard (Intro, Measuring, Results), massive readouts, diagnostics, `rounded-3xl` | M3 | DONE |
| 14 | GlossaryPage | `src/components/GlossaryPage.tsx` | Modern Sleek glossary index, category chips, search bar, `bg-[#09090b]` canvas | M3 | DONE |
| 15 | GlossaryCard | `src/components/GlossaryCard.tsx` | Dark definition cards, formula highlight blocks, `rounded-3xl` / `rounded-2xl`, amber badges | M3 | DONE |
| 16 | GrindDirToggle | `src/components/GrindDirToggle.tsx` | Tactile segmented direction toggle, `rounded-full` pill, amber/blue indicators | M3 | DONE |
| 17 | ExpandToggle | `src/components/ExpandToggle.tsx` | Crisp circular / pill chevron expand toggle, `rounded-full`, tactile hover | M3 | DONE |
| 18 | GlobalSetupCard | `src/components/calculator/GlobalSetupCard.tsx` | Modern Sleek setup drawer, quick-adjust steppers, machine/jig pickers, `rounded-3xl` | M4 | DONE |
| 19 | App Layout & Header | `src/App.tsx` & `src/index.css` | Root container styling, top bar, bottom navigation, responsive max-width wrapper | M4 | DONE |
| 20 | Design QA & Build Gates | Project-wide | TypeScript check, ESLint, Vite build, and 19-file visual diff certification | M5 | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Modals, Dialogs & Core Pickers | `ModalShell.tsx`, `ActionSheetPicker.tsx`, `MiniSelect.tsx`, `SavePresetDialog.tsx`, `PresetManagerModal.tsx` | none | DONE |
| M2 | Settings Views & Managers | `SettingsRootView.tsx`, `MeasurementSettingsView.tsx`, `HardwareManagerView.tsx`, `MachineManagerView.tsx`, `WheelManagerView.tsx`, `WheelFormFields.tsx`, `ImportExportPanel.tsx` | M1 | DONE |
| M3 | Wizard, Reference & Interactive Controls | `CalibrationWizard.tsx`, `GlossaryPage.tsx`, `GlossaryCard.tsx`, `GrindDirToggle.tsx`, `ExpandToggle.tsx` | M1 | DONE |
| M4 | Global Layout, Setup Card & App Shell Integration | `GlobalSetupCard.tsx`, `App.tsx`, `index.css` | M1, M2, M3 | DONE |
| M5 | Design QA Review & Technical Verification | `npm run typecheck`, `npm run lint`, `npm run build`, full Design QA certification across all 19 files, `docs/PROJECT_PLAN.md` & `docs/CHANGELOG.md` updates | M1-M4 | DONE |

## Interface Contracts & Invariants
### Styling Tokens Contract
- Card Background: `bg-[#262626]`
- Canvas Background: `bg-[#09090b]` or `u-bg`
- Primary Border: `border border-white/10`
- Inner Well / Recess Background: `bg-black/20` or `bg-black/30` with `border border-white/5`
- Card Radius: `rounded-3xl` (24px)
- Well / Section Radius: `rounded-2xl` (16px)
- Control / Stepper Radius: `rounded-xl` (12px)
- Pill / Badge Radius: `rounded-full` (9999px)
- Primary Accent: Amber `#f59e0b` (`text-accent`, `bg-accent/20`, `border-accent/30`)
- Secondary Focus: Sky Blue `#38bdf8` (`text-focus`, `bg-focus/20`)
- Danger Accent: Red `#ef4444` (`text-danger`, `bg-red-500/10`)
- Minimum Touch Target: $44\text{px} \times 44\text{px}$
- Responsive Typography: Massive monospace readouts with fallback down to 380px (`text-3xl sm:text-4xl`)

### Logic Preservation Invariant (ZERO REGRESSION)
- ALL React state hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`) remain identical in signatures, initial values, and state updates.
- ALL component props interfaces remain backwards-compatible.
- ALL event callbacks remain preserved.
- ZERO modifications to mathematical calculations (`calibrateBase`, `computeWheelResults`, `estimateMaxAngleErrorDeg`).
