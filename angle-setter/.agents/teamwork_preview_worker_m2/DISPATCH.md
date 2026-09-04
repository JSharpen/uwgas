## 2026-09-02T19:27:20Z

You are the Implementation Worker for Milestone 2 (M2: Settings Views & Managers) of the UWGAS Modern Sleek Visual Refactor project.
Your assigned working directory is: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_worker_m2/

MANDATORY INPUTS:
Subagents MUST read these before starting:
1. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/ORIGINAL_REQUEST.md
2. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/PROJECT.md
3. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_1/survey_design_paradigm.md
4. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_3/survey_views_cards.md
5. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/src/components/ProgressionView.tsx (Reference Standard)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP FOR M2:
You own and may ONLY edit these 7 files:
1. `src/components/settings/SettingsRootView.tsx`
2. `src/components/settings/MeasurementSettingsView.tsx`
3. `src/components/settings/HardwareManagerView.tsx`
4. `src/components/settings/MachineManagerView.tsx`
5. `src/components/wheels/WheelManagerView.tsx`
6. `src/components/wheels/WheelFormFields.tsx`
7. `src/components/ImportExportPanel.tsx`

TASK REQUIREMENTS:
1. Refactor the visual styling of these 7 components to strictly match the "Modern Sleek" dark theme paradigm:
   - Top-level cards/views: `bg-[#262626]`, `rounded-3xl`, `border border-white/10`, `shadow-lg`, subtle top edge highlight `<div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />`.
   - Navigation tabs / segmented controls: track `bg-neutral-950 p-1 rounded-full border border-neutral-800`, active tab `bg-white/10 text-white font-bold rounded-full shadow`, inactive tab `text-white/50 hover:text-white rounded-full`.
   - Sub-panel wells / cards: `bg-black/30` or `bg-black/20`, `rounded-2xl`, `border border-white/5`.
   - Steppers & toggles: rounded-xl controls, high contrast monospace readouts, touch targets >= 44x44px.
   - Profile list items (Machines, Wheels): `bg-black/20 hover:bg-black/30 border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all`, amber badge for active profile (`border-accent/40 bg-accent/10 text-accent`).
   - Add/Edit modals in Machine & Wheel Managers: use `bg-[#262626]`, `rounded-3xl`, `border border-white/10`, `shadow-2xl`.
   - WheelFormFields: dark input wells `bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white`, clear labels with `text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1`.
   - ImportExportPanel: clean backup/restore cards, danger zone with `bg-red-500/10 border border-red-500/20 rounded-2xl p-5`, danger buttons `bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-4 py-2.5`.
   - Mobile scaling: responsive padding `p-4 sm:p-6`, uncrowded layout on 380px screens.
2. STRICT LOGIC PRESERVATION:
   - Preserve ALL React hooks, state, props interfaces, and event handlers verbatim.
   - Do NOT delete or alter any machine/wheel/hardware profile management logic, JSON export/import handlers, or storage state updates.
3. VERIFICATION:
   - Run `npm run typecheck`, `npm run lint`, and `npm run build`.
   - Ensure all pass with 0 errors.
4. Deliver your results:
   - Write `progress.md` and `handoff.md` in `.agents/teamwork_preview_worker_m2/`.
   - Notify parent orchestrator via `send_message`.
