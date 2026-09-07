# Original User Request

## Initial Request — 2026-09-03T05:18:00+10:00

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Refactor the entire UWGAS React application to strictly match the newly established "Modern Sleek" dark theme design language, updating all settings panels, modals, and wizards to use massive typography, rounded cards, and absolute visual consistency with the already-refactored `ProgressionView.tsx`. 

Working directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter
Integrity mode: development

## Requirements

### R1. Comprehensive Visual Refactor
Update the Tailwind CSS classes across all UI components (including but not limited to `SettingsRootView`, `CalibrationWizard`, `PresetManagerModal`, `ModalShell`, `GlobalSetupCard`, etc.) to match the dark zinc/amber aesthetic. Use `ProgressionView.tsx` as the absolute source of truth for styles (e.g., `bg-[#262626]`, `rounded-3xl`, `border-white/10`).

### R2. Strict Logic Preservation
This is a strictly visual CSS/Tailwind refactor. The team must carefully hand-code the updates. Absolutely no React state, business logic, component props, or underlying functionality may be altered, broken, or deleted.

### R3. Responsive Typography & Spacing
All updated components must implement responsive scaling for large typography (e.g., shifting from `text-4xl` to `text-3xl sm:text-4xl`) and utilize generous padding/gaps (`p-6`, `gap-4`). The layout must remain legible and uncrowded on narrow mobile devices (down to 380px widths).

## Acceptance Criteria

### Visual Consistency (Agent-as-Judge)
- [ ] An internal Design QA agent must review the git diff of every modified file and explicitly certify that the padding, border radii, and background colors exactly match the paradigms in `ProgressionView.tsx`.
- [ ] No hardcoded light-mode colors (e.g., `bg-white`) remain in the updated components.

### Technical Integrity
- [ ] `npm run typecheck` passes with 0 errors.
- [ ] `npm run lint` passes with 0 errors.
- [ ] `npm run build` succeeds.

## Follow-up — 2026-09-07T10:49:19Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Review the codebase, provide a critical architecture audit ("roast"), and rigorously verify the drafted Zustand refactoring plan. The goal is to elevate the code structure to a professional standard while establishing an ironclad separation between the UI and the math engine. No code modifications should be made.

Working directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter
Integrity mode: benchmark

## Requirements

### R1. Codebase Audit ("The Roast")
Critically analyze `App.tsx` and the current state management approach. Identify specific anti-patterns, performance bottlenecks, and tight coupling. 

### R2. Refactoring Plan Verification
Review the `implementation_plan.md` artifact (the proposed Zustand refactor). Evaluate if it fully addresses the identified issues, or if alternative approaches are more appropriate for a professional-grade React application.

### R3. User Data Storage Audit
Review the current user data storage structure (`storage.ts`). Critique its design and recommend improvements (e.g., migrating to Zustand's persist middleware, handling schema migrations).

### R4. Component Structure & Scalability
Analyze the `src/` directory and component groupings. Recommend a professional organizational pattern that scales cleanly as new calculators and UI features are added.

### R5. STRICT CONSTRAINT: Math Engine Isolation
The math engine (`src/math/tormek.ts` and any future math calculations) is the absolute core of the app and must be treated as sacred. The architecture recommendation MUST outline a strategy that structurally guarantees the math logic is isolated from UI state, ensuring that future UI tweaks cannot inadvertently break or mutate the calculations.

## Acceptance Criteria

### Assessment Rubric
- [ ] The report explicitly identifies at least three distinct architectural flaws or anti-patterns in the current implementation.
- [ ] The report explains the exact performance or maintainability impact of each identified flaw.
- [ ] The report provides a definitive verdict on whether to proceed with the `implementation_plan.md` as written, modify it, or reject it for a better approach.
- [ ] The report includes a dedicated section critiquing the current data storage/persistence structure and provides explicit recommendations.
- [ ] The report details a strict architectural boundary strategy to permanently protect the math engine from UI-related side effects.
- [ ] The report lists the specific, actionable steps the user must approve before implementation begins.
