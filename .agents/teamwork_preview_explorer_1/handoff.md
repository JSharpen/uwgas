# Handoff Report — Explorer 1

## 1. Observation
1. **Source of Truth Inspection**: In `src/components/ProgressionView.tsx`:
   - Step Card Root Container (line 86): `className="bg-[#262626] rounded-3xl border border-white/10 shadow-lg relative flex flex-col motion-list-item transition-all duration-300 group"`
   - Top Edge Highlight Layer (line 90): `<div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />`
   - Interactive Card Header (line 94): `className="flex justify-between items-center p-6 relative z-10 cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors rounded-3xl"`
   - Step Number Badge (line 100): `className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-xs font-bold font-mono text-white border border-neutral-800 shrink-0"`
   - Title / Readouts (lines 104, 128): `className="text-lg font-semibold text-white tracking-wide truncate"`, Massive Output: `className="text-3xl sm:text-4xl font-extrabold text-white tracking-tighter"` with unit `className="text-lg text-white/50 font-medium ml-1"`
   - Accordion Expanded Drawer (line 166): `className="relative z-10 bg-black/20 overflow-hidden transition-all duration-300 ease-in-out border-t border-white/5 p-6"`
   - Stepper Containers & Buttons (lines 177, 179): `className="bg-black/30 border border-white/5 rounded-2xl flex items-center justify-between p-1"`, Stepper Button: `className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition"`
   - Micro Labels (line 173): `className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1 flex justify-between"`
   - Delete Button (line 250): `className="px-4 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold text-xs transition"`

2. **Global Container Inspection**:
   - `src/App.tsx` (line 401): `<div className="min-h-dvh u-bg p-3 sm:p-4 pb-[140px] flex flex-col gap-4 max-w-4xl mx-auto">`
   - `src/components/calculator/GlobalSetupCard.tsx` (line 403): `<button className="relative z-10 pointer-events-auto w-full bg-[#262626] border border-neutral-600 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-3xl flex flex-col items-center justify-center pt-4 pb-4 touch-none transition-transform active:scale-[0.98]">`

3. **Legacy UI Discrepancies**:
   - Modals (`ModalShell.tsx`, `PresetManagerModal.tsx`, `SavePresetDialog.tsx`) currently rely on legacy classes `.u-surface`, `.u-border`, `rounded-lg`, `.modal-shell__header`, and `.u-btn`.
   - Settings Views (`SettingsRootView.tsx`, `MachineManagerView.tsx`, `MeasurementSettingsView.tsx`, `HardwareManagerView.tsx`, `GlossaryPage.tsx`) use `.panel-card`, `.card-elevated`, and small button classes.
   - Wheel Views (`WheelManagerView.tsx`, `WheelFormFields.tsx`) use `.wheel-card__header` gradients and small inputs.

## 2. Logic Chain
1. *From ProgressionView structure*: The Modern Sleek design language relies exclusively on Tailwind utility tokens without relying on legacy `.panel-card` or `.card-elevated` gradient CSS overrides.
2. *From color & opacity tokens*: Elevated surfaces are cleanly represented by `bg-[#262626]`, with insets represented by `bg-black/20` and `bg-black/30`, and borders cleanly delineated with `border-white/10` and `border-white/5`.
3. *From radii hierarchy*: Top containers utilize `rounded-3xl` (24px), internal control wells and forms utilize `rounded-2xl` (16px), touch steppers and buttons utilize `rounded-xl` (12px), and status indicators utilize `rounded-full`.
4. *From typography and spacing*: High contrast visibility at workbench distance requires massive monospace numeric displays (`text-3xl sm:text-4xl font-extrabold` / `text-5xl font-mono`), coupled with micro uppercase labels (`text-[10px] text-white/40 uppercase tracking-widest font-bold`).
5. *From workshop ergonomics*: Touch targets must be at least $44 \times 44\text{px}$ (or `w-10 h-10` with surrounding padding), card padding must be generous (`p-6`), and layouts must remain responsive down to 380px without horizontal scroll.

## 3. Caveats
- No caveats. All UI files, CSS stylesheets, and configurations across the entire application were inspected and cataloged.
- The investigation is read-only; no application source code was modified.

## 4. Conclusion
The comprehensive design specification has been codified and written to:
`/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_1/survey_design_paradigm.md`

This document serves as the authoritative blueprint for implementation agents to refactor `ModalShell`, settings panels, preset dialogs, wheel managers, calibration wizard, and global layout wrappers to achieve 100% visual consistency with `ProgressionView.tsx`.

## 5. Verification Method
1. Inspect the design specification artifact:
   `view_file /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_1/survey_design_paradigm.md`
2. Verify all referenced classes match `src/components/ProgressionView.tsx`:
   `grep_search` for `bg-[#262626]`, `border-white/10`, `rounded-3xl`, `text-[10px]` in `src/components/ProgressionView.tsx`.
3. Verify test/typecheck integrity:
   `npm run typecheck && npm run lint && npm run build` (0 errors).
