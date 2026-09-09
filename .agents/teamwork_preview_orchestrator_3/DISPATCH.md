## 2026-09-07T11:42:36Z
You are the Project Orchestrator for UWGAS.
Your identity: teamwork_preview_orchestrator_3
Your working directory: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_orchestrator_3
Original user request file: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/ORIGINAL_REQUEST.md
Architecture Audit Report: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_orchestrator_2/ARCHITECTURE_AUDIT_REPORT.md

Objective:
Execute Phase 1 and Phase 2 of ARCHITECTURE_AUDIT_REPORT.md to completely overhaul the state management architecture of UWGAS.
Migrate the monolithic App.tsx to the newly established Zustand stores and enforce strict architectural boundaries around the pure math engine.
The user explicitly requested: "Use a very large team of agents to ensure this massive refactor is completed concurrently and efficiently."

Key Requirements:
1. R1. Dismantle the God Component: Remove all domain state (useState) from App.tsx. Migrate all state logic, JSON import/export merging, and persistence handlers into the newly created Zustand stores (src/state/store.ts and src/state/uiStore.ts). App.tsx must be reduced to a purely structural layout shell handling only top-level routing and UI scaffolding.
2. R2. Eradicate Prop Drilling (Plug and Play): Refactor all UI components (e.g., GlobalSetupCard.tsx, ProgressionView.tsx, SettingsRootView.tsx) to consume their required state directly from the Zustand stores. Use selector hygiene (pulling individual properties or fine-grained selectors) to prevent re-render storms. Remove all prop-drilling related to global state.
3. R3. Enforce Math Engine Isolation (The Vault): Implement the 2-Tier Math Isolation strategy outlined in the audit report. Ensure that src/math/tormek.ts (Tier 1) remains a pure algorithmic module with zero React dependencies or UI-specific types. Establish the Tier 2 adapter service to bridge the Zustand store with the pure math engine.
4. R4. Storage Modernization Integration: Wire the application to correctly utilize the new debounced, Zod-validated uwgas_app_state_v1 local storage mechanism established in src/state/store.ts. Ensure legacy fallback migrations handle the transition gracefully.

Acceptance Criteria:
- App.tsx contains absolutely zero useState hooks managing domain data (wheels, machines, presets, global parameters).
- Components like GlobalSetupCard and ProgressionView receive zero global state variables via React props, fetching exclusively from useStore() and useUIStore().
- npm run typecheck passes with 0 errors.
- npm run lint passes with 0 errors, explicitly verifying that no React imports exist in src/math/.
- npm run build succeeds cleanly with 0 errors.
- The math engine calculation pipeline is verified to function correctly when hooked into the new Zustand store.

Maintain progress.md and plan.md in your working directory. Keep progress.md updated regularly so the sentinel can monitor progress.
When all tasks and acceptance criteria are satisfied, report completion with your handoff report.
