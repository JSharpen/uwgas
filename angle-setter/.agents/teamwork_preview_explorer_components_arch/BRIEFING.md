# BRIEFING — 2026-09-07T11:00:00Z

## Mission
Conduct R4: Component Structure & Scalability Analysis for UWGAS, evaluating current src/ layout, coupling, modal architecture, layout rigidity, and proposing a modular, pluggable calculator architecture compliant with workshop ergonomics.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, architect, synthesizer
- Working directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_components_arch
- Original parent: 63a71e74-b00f-4e32-a004-5f5550db5c13
- Milestone: R4 (Component Structure & Scalability Analysis)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source files
- Workshop ergonomics compliance: touch targets >=44px, 360px min / 390px baseline viewport, Safari scroll spacer rules, keyboard accessibility
- Ground all findings in concrete code citations and architectural rationale
- Write metadata/reports (.md) ONLY inside assigned folder

## Current Parent
- Conversation ID: 63a71e74-b00f-4e32-a004-5f5550db5c13
- Updated: 2026-09-07T11:00:00Z

## Investigation State
- **Explored paths**: `src/App.tsx`, `src/components/*`, `src/math/*`, `src/state/*`, `src/ui/*`, `docs/*`, `.agents/*`
- **Key findings**:
  1. `App.tsx` is a 758-line God component managing 20+ states with severe prop drilling.
  2. Math engine `tormek.ts` is polluted by `computeWheelResults` view-model logic; presentation components (`StepCard`) perform raw math calculations.
  3. Zero keyboard accessibility on modals (no `Escape` key listener), duplicate timeout hacks, DOM style hacking in `MiniSelect.tsx`.
  4. Multiple touch targets below 44px (header buttons `h-9` = 36px, modal close and action buttons `w-10 h-10` = 40px).
  5. Missing Safari scroll spacers in `ActionSheetPicker`, `ModalShell`, `HardwareManagerView`, `PresetManagerModal`.
  6. Dead code detected: `useAppState.ts`, `GrindDirToggle.tsx`, `ExpandToggle.tsx`, `buttons.ts`, and leftover transpiled files `tormek.cjs`, `types/core.js`.
- **Unexplored areas**: None. Codebase thoroughly mapped.

## Key Decisions Made
- Recommend proceeding with Zustand refactor but **SIGNIFICANTLY MODIFY** `implementation_plan.md`:
  - Split monolithic store into domain slices (calculator, hardware, presets, UI).
  - Strictly extract View-Model adapters out of `src/math/tormek.ts` into calculator plugins.
  - Implement pluggable `CalculatorPlugin` contract to support Belt Grinders, Paper Wheels, and Jigs without duplicating layout.
  - Establish reusable `src/ui/` workshop primitives enforcing >=44px touch targets and Safari scroll spacers.

## Artifact Index
- DISPATCH.md — Initial dispatch payload
- BRIEFING.md — Working memory index
- progress.md — Heartbeat and status log
- handoff.md — Comprehensive 5-section R4 report
