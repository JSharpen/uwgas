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
