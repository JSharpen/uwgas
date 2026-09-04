## 2026-09-02T19:32:13Z

You are the Implementation Worker for Milestone 4 (M4: Global Layout, Setup Card & App Shell Integration) of the UWGAS Modern Sleek Visual Refactor project.
Your assigned working directory is: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_worker_m4/

MANDATORY INPUTS:
Subagents MUST read these before starting:
1. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/ORIGINAL_REQUEST.md
2. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/PROJECT.md
3. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_1/survey_design_paradigm.md
4. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_3/survey_views_cards.md
5. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/src/components/ProgressionView.tsx (Reference Standard)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP FOR M4:
You own and may ONLY edit these 3 files:
1. `src/components/calculator/GlobalSetupCard.tsx`
2. `src/App.tsx`
3. `src/index.css`

TASK REQUIREMENTS:
1. Refactor `src/components/calculator/GlobalSetupCard.tsx`:
   - Align the Global Setup Drawer and Summary Bar to the Modern Sleek dark theme standard:
     - Closed Summary Bar / Strip: `bg-[#262626] rounded-3xl border border-white/10 shadow-xl p-4 sm:p-5 relative overflow-hidden`, edge lighting highlight, massive typography for primary angle/projection, pill chips for active machine, wheel, jig, and USB base (`rounded-full px-3 py-1 bg-white/5 border border-white/10 text-xs text-white/80 font-mono`).
     - Expanded Drawer Body: `bg-[#262626] rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden flex flex-col gap-5`.
     - Drawer drag handle / nib: `w-12 h-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors mx-auto mb-1`.
     - Quick-adjust steppers for Projection ($A$) and Angle ($\beta$): `bg-black/30 border border-white/5 rounded-2xl p-4`, `w-12 h-12 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold flex items-center justify-center active:scale-95 transition-all`, massive monospace numbers (`text-3xl sm:text-4xl font-extrabold text-white font-mono`).
     - Machine, Jig, Wheel action triggers: `bg-black/20 hover:bg-black/30 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center justify-between text-left transition-all`.
     - Height mode segmented pill ($h_n \leftrightarrow h_r$): `bg-neutral-950 p-1 rounded-full border border-neutral-800`.
     - Touch targets: >= 44x44px.
2. Refactor `src/App.tsx`:
   - Application Shell & Global Layout:
     - Root background: clean deep dark canvas (`bg-[#09090b] min-h-screen text-white`).
     - Max-width content wrapper: `max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 flex flex-col gap-6`.
     - Top Navigation Header / App Bar: sleek dark container, high-contrast title typography, icon buttons (`w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white flex items-center justify-center transition-colors`).
     - View Switching & Navigation Tabs: tactile segmented pill bar or bottom dock, `bg-[#18181b]/80 backdrop-blur-lg border border-white/10 rounded-full p-1.5 shadow-2xl`, active tab highlighted with `bg-white/10 text-white font-bold rounded-full px-5 py-2.5`, inactive tabs `text-white/50 hover:text-white px-4 py-2`.
     - Modals and Overlays container: seamless backdrop rendering.
3. Clean & Polish `src/index.css`:
   - Ensure dark theme base tokens are cleanly defined.
   - Clean up any legacy conflicting CSS classes that might conflict with Tailwind classes, while preserving required base utility reset styles.
4. STRICT LOGIC PRESERVATION:
   - Preserve ALL React hooks, state, props interfaces, and event handlers verbatim in `App.tsx` and `GlobalSetupCard.tsx`.
   - Preserve all calculator calculations, active profile selection, preset loading, progression management, and modal opening/closing logic.
5. VERIFICATION:
   - Run `npm run typecheck`, `npm run lint`, and `npm run build`.
   - Ensure all pass with 0 errors.
6. Deliver your results:
   - Write `progress.md` and `handoff.md` in `.agents/teamwork_preview_worker_m4/`.
   - Notify parent orchestrator via `send_message`.
