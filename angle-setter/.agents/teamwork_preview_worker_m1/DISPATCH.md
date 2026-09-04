## 2026-09-02T19:23:15Z

You are the Implementation Worker for Milestone 1 (M1: Modals, Dialogs & Core Pickers) of the UWGAS Modern Sleek Visual Refactor project.
Your assigned working directory is: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_worker_m1/

MANDATORY INPUTS:
Subagents MUST read these before starting:
1. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/ORIGINAL_REQUEST.md
2. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/PROJECT.md
3. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_1/survey_design_paradigm.md
4. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_2/survey_modals_wizards.md
5. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/src/components/ProgressionView.tsx (Reference Standard)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP FOR M1:
You own and may ONLY edit these 5 files:
1. `src/components/ModalShell.tsx`
2. `src/components/ActionSheetPicker.tsx`
3. `src/components/MiniSelect.tsx`
4. `src/components/SavePresetDialog.tsx`
5. `src/components/PresetManagerModal.tsx`

TASK REQUIREMENTS:
1. Refactor the visual styling of these 5 components to strictly match the "Modern Sleek" dark theme paradigm:
   - Root modal containers: `bg-[#262626]`, `rounded-3xl`, `border border-white/10`, `shadow-2xl`, subtle top edge highlight `<div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />`.
   - Backdrop: smooth dark overlay `bg-black/70` with backdrop-blur.
   - Header: clean high-contrast titles, close button with `w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors`.
   - Inner card wells / groups: `bg-black/30` or `bg-black/20`, `rounded-2xl`, `border border-white/5`.
   - Input fields: `bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-accent focus:ring-1 focus:ring-accent`.
   - Action buttons: primary CTA with `bg-accent hover:bg-amber-400 text-black font-bold rounded-2xl px-5 py-3 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all`, secondary buttons `bg-white/10 hover:bg-white/15 text-white font-semibold rounded-2xl px-4 py-3`.
   - ActionSheetPicker: tactile dark drawer / popup, items with `rounded-2xl`, active item highlighted with `border-accent bg-accent/10 text-accent`.
   - MiniSelect: dark floating portal dropdown, `bg-[#262626] border border-white/10 rounded-2xl shadow-2xl`, items with `hover:bg-white/10 rounded-xl p-3`.
   - Touch targets: minimum 44x44px.
   - Responsive scaling: ensure clean rendering on mobile devices down to 380px without horizontal overflow.
2. STRICT LOGIC PRESERVATION:
   - Preserve ALL React hooks, state, props interfaces, and event handlers verbatim.
   - Do NOT delete or modify business logic or callbacks (`onClose`, `onSave`, `onSelect`, `onDelete`, etc.).
3. VERIFICATION:
   - Run `npm run typecheck`, `npm run lint`, and `npm run build`.
   - Ensure all pass with 0 errors.
4. Deliver your results:
   - Write `progress.md` and `handoff.md` in your working directory `.agents/teamwork_preview_worker_m1/`.
   - Notify parent orchestrator via `send_message`.
