## 2026-09-02T19:27:20Z

You are the Implementation Worker for Milestone 3 (M3: Wizard, Reference & Interactive Controls) of the UWGAS Modern Sleek Visual Refactor project.
Your assigned working directory is: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_worker_m3/

MANDATORY INPUTS:
Subagents MUST read these before starting:
1. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/ORIGINAL_REQUEST.md
2. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/PROJECT.md
3. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_1/survey_design_paradigm.md
4. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_2/survey_modals_wizards.md
5. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_3/survey_views_cards.md
6. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/src/components/ProgressionView.tsx (Reference Standard)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP FOR M3:
You own and may ONLY edit these 5 files:
1. `src/components/CalibrationWizard.tsx`
2. `src/components/GlossaryPage.tsx`
3. `src/components/GlossaryCard.tsx`
4. `src/components/GrindDirToggle.tsx`
5. `src/components/ExpandToggle.tsx`

TASK REQUIREMENTS:
1. Refactor the visual styling of these 5 components to strictly match the "Modern Sleek" dark theme paradigm:
   - `CalibrationWizard.tsx`:
     - 3-step wizard workflow (Intro, Measurement/Inputs, Results/Diagnostics):
     - Step indicator pill: `rounded-full bg-black/40 border border-neutral-800`.
     - Step card wrappers: `bg-[#262626]`, `rounded-3xl`, `border border-white/10`, `shadow-2xl`.
     - Diagnostic result readouts: massive monospace numbers (`text-3xl sm:text-4xl font-extrabold text-white tracking-tighter`), error residuals with color-coded badges (`text-emerald-400` for good, `text-amber-400` for warning, `text-red-400` for error).
     - Steppers and inputs: `rounded-2xl` / `rounded-xl` wells with `bg-black/30 border border-white/5`.
     - Action CTAs: `bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-2xl px-6 py-3.5`.
   - `GlossaryPage.tsx`:
     - Search bar: `bg-[#262626] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30`.
     - Category filter pills: `rounded-full px-4 py-1.5`, active `bg-amber-400 text-black font-bold`, inactive `bg-white/5 hover:bg-white/10 text-white/70 border border-white/5`.
     - Responsive grid: uncrowded, clean responsive gaps down to 380px.
   - `GlossaryCard.tsx`:
     - Card container: `bg-[#262626] rounded-3xl border border-white/10 shadow-lg p-6 relative overflow-hidden`.
     - Formula blocks / callouts: `bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-amber-300`.
     - Category badge: `rounded-full text-[10px] font-bold px-2.5 py-0.5 bg-accent/15 text-accent border border-accent/20`.
   - `GrindDirToggle.tsx`:
     - Tactile segmented direction toggle: track `bg-neutral-950 p-1 rounded-full border border-neutral-800`, active thumb `bg-white/10 text-white font-bold rounded-full shadow`, icons with amber (leading) and sky blue (trailing) highlights.
   - `ExpandToggle.tsx`:
     - Modern pill/circular expand button: `w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/70 hover:text-white flex items-center justify-center border border-white/5 transition-all`.
   - Touch targets: >= 44x44px.
2. STRICT LOGIC PRESERVATION:
   - Preserve ALL React hooks, state, props interfaces, and event handlers verbatim.
   - Preserve calibration mathematical calls (`calibrateBase`, `estimateMaxAngleErrorDeg`) and state persistence without modification.
3. VERIFICATION:
   - Run `npm run typecheck`, `npm run lint`, and `npm run build`.
   - Ensure all pass with 0 errors.
4. Deliver your results:
   - Write `progress.md` and `handoff.md` in `.agents/teamwork_preview_worker_m3/`.
   - Notify parent orchestrator via `send_message`.
