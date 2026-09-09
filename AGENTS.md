# AGENTS.md — Instructions for AI Coding Assistants

> **Universal Wet Grinder Angle Setter (UWGAS)**
> *This document is automatically loaded by AI coding assistants (Google Antigravity, Cursor, Claude Code, GitHub Copilot, Codex, etc.) to establish immediate context and operational rules for this repository.*

---

## 🧭 Mandatory Session Start Protocol

When starting or resuming a conversation on this codebase, you **MUST** immediately inspect the following documentation before suggesting or executing changes:

1. 📋 **[docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md)**:
   - Check the **Active Job Schedule & Backlog** table to see what is `[IN PROGRESS]`, `[READY]`, or `[PROPOSED]`.
   - Review the **Known Issues & Bench Feedback** table.
   - Read recent entries in the **Decision Log**.
2. 📜 **[docs/CHANGELOG.md](docs/CHANGELOG.md)**:
   - Review recent code modifications, added components, and version history.
3. 📐 **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**:
   - Understand the component boundaries, state schema, and pure math engine.
4. 🛠️ **[docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)**:
   - Follow development commands, branching rules (`dev` $\rightarrow$ `main`), and touch-first workshop design rules.

---

## 📋 Autonomous Job Tracking Rules

Whenever you or the user discuss a feature, bug fix, improvement, or idea:
1. **Log Proposed Work**: If an idea is discussed but not implemented right away, add it as a new row in [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) under the Active Job Schedule (`JOB-xxx`) with status `[PROPOSED]`.
2. **Update Status in Real Time**: When starting a task, update its status to `[IN PROGRESS]`. When completed and verified, mark it `[COMPLETED]`.
3. **Log Code Changes**: After making code edits, record a descriptive entry under the active version in [`docs/CHANGELOG.md`](docs/CHANGELOG.md).
4. **Dynamic Catch-Up**: If the user asks *"Where are we up to?"* or *"What's on the schedule?"*, read [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) and [`docs/CHANGELOG.md`](docs/CHANGELOG.md), summarize current progress, and recommend the next priority task.

---

## ⚡ Core Development Rules

- **Strict Math Engine Isolation (The Vault)**: All math belongs in `src/math/`. This is a pure algorithm layer. **NEVER** import React, UI types, or Zustand stores into the `math/` directory. The boundary is enforced by ESLint.
- **Data Safety & Schema Migrations (CRITICAL)**: User data (wheels, jigs, presets) is sacred. If you add a new feature that requires new saved data, you **MUST** update `src/state/schema.ts` using Zod's `.optional()` or `.catch()` fallbacks. This guarantees that old user data seamlessly migrates to the new version without crashing.
- **State Management (Zustand & Zod)**: The app uses a slice-based Zustand store (`src/state/store.ts`) with Zod validation. **NEVER** use React Context or `useState` in `App.tsx` for global domain data. All persistent state modifications must map to `src/state/schema.ts`.
- **Zero Prop-Drilling**: UI Components must pull their required state directly from the Zustand stores using fine-grained selectors and `useShallow`. Do not drill global state down as props.
- **Workshop Touch Ergonomics**: Minimum $44\text{px} \times 44\text{px}$ touch targets, large font sizes for numbers. **Viewport Targets**: Strict minimum of `360px` (crowding allowed, zero overlap/wrapping) and a comfortable baseline of `390px`. Full keyboard modal dismissal.
- **Verification Gate**: Before ending any turn with code modifications, ensure that `npm run typecheck`, `npm run lint`, and `npm run build` all pass with **0 errors**.
- **Comprehensive Reversions**: When removing or reverting a feature, you must completely remove all associated side-effects (orphaned classes like `touch-none`, event listeners, structural layout wrappers, etc.) that were introduced specifically for that feature. Never leave behind residual code that alters intended behavior. If unsure about the extent of the side-effects, explicitly ask the user before proceeding.

- **Scrollable Padding (Safari Fix)**: Never rely on `padding-bottom` (e.g., `pb-6`) on `overflow-y-auto` containers to provide bottom clearance for content, as mobile Safari ignores it. Instead, always append an invisible spacer block as the final child *inside* the scroll container.
- **Flex Gap Math for Spacers**: When placing a spacer inside a `flex` container that uses `gap`, remember the spacer receives the gap spacing from the preceding element. To make the bottom scroll padding exactly match the container's gap, use a 1px spacer (e.g., `<div className="h-px shrink-0 w-full" />`).
- **Parallel Refactoring (Expand & Contract)**: For major architectural changes, state migrations, or replacing complex components, do not overwrite the existing code immediately. Instead, build the new implementation in parallel (e.g., `[Component]V2`), verify it alongside the old one, and only rip out the legacy code once the new implementation is fully proven. *(Note: Skip this overhead for simple, isolated bug fixes or minor UI tweaks).*

---

## 🛠️ Proactive Tool & Workflow Suggestions

To maximize efficiency and collaboration, the AI assistant must proactively suggest optimal tools and slash commands based on the user's request context:

- **Major Architecture & Design:** If the user proposes complex systemic changes (e.g., to the math engine or state schema), suggest using the `/grill-me` command to clarify edge cases and design decisions before writing code.
- **Long-Running/Tedious Tasks:** If the request involves repetitive refactoring, large-scale file modifications, or extensive testing, remind the user about the `/goal` command for autonomous background execution.
- **Deep Research/Planning:** If a task is highly ambiguous or requires multi-agent strategy, suggest the `/boost` command.
- **Browser/UI Debugging:** When dealing with tricky CSS, layout bugs, or web APIs, remind the user that the AI can use Chrome DevTools to inspect the live DOM if the dev server is running.
- **Terminal/System Tasks:** Before making assumptions about environment setup (e.g., installing new packages), offer to run the necessary terminal commands (e.g., `npm install`) directly on the user's behalf.
