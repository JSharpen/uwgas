# Handoff Report — Explorer 3: Survey of Views, Cards, Navigation & Settings

## 1. Observation
- **Benchmark Source of Truth:** `src/components/ProgressionView.tsx` (315 lines) establishes the modern sleek dark theme:
  - Container cards: `bg-[#262626] rounded-3xl border border-white/10 shadow-lg relative flex flex-col motion-list-item transition-all duration-300 group`
  - Subtle top-down highlight: `absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0`
  - Inner wells / input containers: `bg-black/30 border border-white/5 rounded-2xl`
  - Interactive stepper buttons: `w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition`
  - Massive output typography: `text-3xl sm:text-4xl font-extrabold text-white tracking-tighter` with unit labels `text-lg text-white/50 font-medium ml-1`
  - Badge accents: Amber `bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)]` and Danger `bg-danger/20 text-danger`
  - Transitions: `max-h-[500px] opacity-100 border-t border-white/5`

- **Surveyed Components & Current Deviations:**
  1. `src/App.tsx` (670 lines): Uses legacy `.u-bg` and hardcoded `bg-neutral-950 border-neutral-800` for fixed bottom tab bar (lines 401, 644).
  2. `src/components/calculator/GlobalSetupCard.tsx` (482 lines): Drawer uses `bg-neutral-900 border border-neutral-700/60` (line 148), buttons `bg-neutral-800/80` (lines 218-221), summary pill uses `bg-[#262626] border border-neutral-600` (line 403).
  3. `src/components/calculator/ActionSheetPicker.tsx` (83 lines): Sheet uses `bg-neutral-900 border-t border-neutral-700 rounded-t-2xl` (line 52).
  4. `src/components/settings/SettingsRootView.tsx` (51 lines): Uses legacy `.panel-card .panel-card--strong` and `.u-border border-neutral-800/50` (lines 29, 35).
  5. `src/components/settings/MeasurementSettingsView.tsx` (120 lines): Uses legacy `.card-elevated` (line 24) and `bg-neutral-950` pills (line 32).
  6. `src/components/settings/HardwareManagerView.tsx` (281 lines): Container is `bg-neutral-900` (line 53), cards `.card-elevated` (line 89).
  7. `src/components/settings/MachineManagerView.tsx` (392 lines): Cards use `.card-elevated` (line 132) and `${BTN.*}` (line 125).
  8. `src/components/wheels/WheelManagerView.tsx` (321 lines): Uses `.panel-card .panel-card--strong` (line 115) and `.card-elevated .wheel-card` (line 148).
  9. `src/components/wheels/WheelFormFields.tsx` (143 lines): Uses `.rounded-lg border u-border u-surface` (lines 20, 37, 91).
  10. `src/components/presets/PresetManagerModal.tsx` (181 lines) & `SavePresetDialog.tsx` (80 lines): Use legacy `.u-border .u-surface` and standard input styling.
  11. `src/components/CalibrationWizard.tsx` (352 lines): Root uses `.u-surface rounded` (line 189), steps use `.card-elevated` with colored left borders (lines 273, 289).
  12. `src/components/GlossaryPage.tsx` (34 lines) & `GlossaryCard.tsx` (40 lines): Use `.panel-card` and `bg-neutral-950/60 border-neutral-700`.
  13. `src/components/ImportExportPanel.tsx` (333 lines): Uses `.panel-card` (lines 103, 217) and `.u-surface` textarea (line 270).
  14. `src/components/ModalShell.tsx` (67 lines): Uses `max-w-md rounded-lg border u-border u-surface` (line 38).
  15. `src/components/GrindDirToggle.tsx` (64 lines), `MiniSelect.tsx` (240 lines), `ExpandToggle.tsx` (42 lines): Use legacy utility and CSS token classes.

- **Historical / Convergence Mappings:**
  - `AngleTargetCard.tsx` $\rightarrow$ Unified in `GlobalSetupCard.tsx` (JOB-001, JOB-005, JOB-020).
  - `GrindingWheelCard.tsx` $\rightarrow$ Unified in `WheelManagerView.tsx`.
  - `ResultDisplayCard.tsx` $\rightarrow$ Unified in `ProgressionView.tsx`.
  - `InteractiveDiagram.tsx` $\rightarrow$ Represented by SVG icons (`IconEdgeLeading`, `IconEdgeTrailing`, `IconGrinder`, `IconDisc` in `src/icons.tsx`) and schematic placeholder in `GlossaryPage.tsx`.
  - `NavigationHeader.tsx` & `BottomToolbar.tsx` $\rightarrow$ Integrated in `src/App.tsx`.

## 2. Logic Chain
1. *Step 1:* `ProgressionView.tsx` defines the target design language: dark zinc background `bg-[#262626]`, `border-white/10`, `rounded-3xl` cards, `rounded-2xl` inner wells, large monospace numbers, amber highlights, and $\ge 44\text{px}$ touch targets.
2. *Step 2:* Inspection of all remaining View, Card, Navigation, and Settings components in `src/` reveals a patchwork of legacy CSS classes (`.panel-card`, `.card-elevated`, `.u-border`, `.u-surface`, `bg-neutral-900`, `bg-neutral-800`).
3. *Step 3:* Each component's visual styling can be systematically refactored to match `ProgressionView.tsx` without touching any React state hooks, effect hooks, callbacks, or mathematical functions.
4. *Step 4:* The comprehensive catalog in `survey_views_cards.md` provides exact before $\rightarrow$ after mapping, line counts, props, and responsive considerations for each component.

## 3. Caveats
- No modifications have been made to `src/` files (adhering strictly to Explorer read-only scope).
- When implementing, modal layout adjustments in `useModalLayout.ts` should be maintained to preserve virtual keyboard avoidance.
- Small screens ($<380\text{px}$) require careful preservation of `truncate` and `font-mono text-xs/text-sm` to avoid horizontal overflow.

## 4. Conclusion
The comprehensive survey of all View, Card, Navigation, and Settings components is complete. All 19 UI files are cataloged with line counts, styling deficiencies, immutable logic/state touchpoints, mobile touch ergonomics, and precise refactoring plans in:
`/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_3/survey_views_cards.md`

## 5. Verification Method
- **Inspect Artifact:**
  ```bash
  cat /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_3/survey_views_cards.md
  ```
- **Verify Repository Health:**
  ```bash
  npm run typecheck # Passes (0 errors)
  npm run build     # Passes (Vite 7 build in <1s)
  ```
- **Invalidation Conditions:** Any unidentified UI component in `src/` or any proposed modification that alters state interfaces or mathematical formulas in `src/math/tormek.ts`.
