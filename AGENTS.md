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
1. **Log Proposed Work**: If a significant, concrete feature is discussed and agreed upon but not implemented right away, add it to [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) as a `[PROPOSED]` job. Do not log minor tweaks or bugs.
2. **Update Status**: For major, long-running jobs, update the status to `[IN PROGRESS]`, and `[COMPLETED]` when done. Skip this for quick fixes.
3. **Log Code Changes**: Rely on Git history for granular changes. Only update [`docs/CHANGELOG.md`](docs/CHANGELOG.md) for significant milestones or when the user explicitly requests a release log.
4. **Dynamic Catch-Up**: If the user asks *"Where are we up to?"* or *"What's on the schedule?"*, read [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) and [`docs/CHANGELOG.md`](docs/CHANGELOG.md), summarize current progress, and recommend the next priority task.

---

## ⚡ Core Development Rules

- **Proactive Impact Assessment**: When modifying UI layouts, keep potential unintended consequences in mind (e.g., overflow issues), but do not waste tokens writing theoretical impact assessments before coding.
- **Strict Math Engine Isolation**: All math belongs in `src/math/`. This is a pure algorithm layer. **NEVER** import React, UI types, or Zustand stores into the `math/` directory. The boundary is enforced by ESLint.
- **Data Safety & Schema Migrations (CRITICAL)**: User data (wheels, jigs, presets) is sacred. If you add a new feature that requires new saved data, update `src/state/schema.ts`. Note that using Zod's `.catch()` will drop unrecognized old data; use proper migration logic if changing structural keys to avoid data loss.
- **State Management (Zustand & Zod)**: The app uses a slice-based Zustand store (`src/state/store.ts`) with Zod validation. **NEVER** use React Context or `useState` in `App.tsx` for global domain data. All persistent state modifications must map to `src/state/schema.ts`. Avoid subscribing to an entire parent object if the component only needs a few primitive fields, as this causes unnecessary re-rendering.
- **Minimize Prop-Drilling**: UI Components should generally pull their required state directly from the Zustand stores. However, passing objects down lists (e.g., mapping over a list of wheels) is perfectly acceptable and preferred over forcing every child component to independently subscribe to the store.
- **Workshop Touch Ergonomics & Accessibility**: Minimum $44\text{px} \times 44\text{px}$ touch targets apply to *most* interactive elements, but use your best judgment if space is tight. **Accessibility is mandatory:** Visual `<label>`s must link to `<input>`s via `htmlFor`. Custom UI elements acting as checkboxes or switches must include `role="switch"`, `aria-checked`, `tabIndex={0}`, and `onKeyDown` handlers for Space/Enter to ensure full keyboard and screen reader support without breaking the premium aesthetic. **Viewport Targets**: Aim for a comfortable baseline of `390px`. If layout crowding occurs on smaller viewports, horizontal scrolling or wrapping is permitted. Full keyboard modal dismissal.
- **Verification Gate**: Before finishing a major block of work or committing, ensure that `npm run typecheck`, `npm run lint`, and `npm run build` all pass with **0 errors**. You do not need to run these on every single iterative conversational turn.
- **Comprehensive Reversions**: When removing or reverting a feature, remove all associated side-effects (orphaned classes, event listeners, etc.). Log the reversion as a new entry in `docs/CHANGELOG.md`. Do not retroactively scrub past entries.
- **DOM Side-Effects & Layout Thrashing**: Never use raw, localized DOM mutations (e.g., `document.body.style.overflow = 'hidden'`) inside generic UI components. Always use centralized hooks (like `useBodyLock` or `useModalLayout`) to manage shared side-effects via reference counting. When dealing with `ResizeObserver` or scroll events, you MUST debounce the callback using `requestAnimationFrame` to prevent synchronous layout thrashing. Prefer pure CSS `calc()` over JavaScript-driven height calculations wherever possible.

- **Scrollable Padding (Safari Fix)**: Never rely on `padding-bottom` (e.g., `pb-6`) on `overflow-y-auto` containers to provide bottom clearance for content, as mobile Safari ignores it. Instead, always append an invisible spacer block as the final child *inside* the scroll container.
- **Flex Gap Math for Spacers**: When placing a spacer inside a `flex` container that uses `gap`, remember the spacer receives the gap spacing from the preceding element. To make the bottom scroll padding exactly match the container's gap, use a 1px spacer (e.g., `<div className="h-px shrink-0 w-full" />`).
- **Experimentation (Feature Branches)**: For major architectural changes or new features with multiple approaches, prefer using standard git feature branches rather than building complex "V2" parallel components or developer toggles, unless you specifically need to A/B test live on the same build.
- **Dynamic Default Labels in UI**: When building or updating developer tools, settings menus, or range sliders, the "Default" value displayed in the helper text or UI labels **must** dynamically reference the actual source of truth (e.g., the `initialState` constant in the Zustand store). Never use arbitrary hardcoded string values (e.g., "Default: 44px") in the JSX, so that when defaults are updated in the codebase, the UI accurately reflects the new baseline.

- **Responsive Layout**: The UI should gracefully adapt to smaller viewports. While preventing horizontal scrolling is ideal, it is acceptable if necessary to accommodate standard touch targets or dense information (e.g., horizontally scrolling toolbars or tables).
- **Single Component Per File (Strict Modularity)**: Non-trivial UI components SHOULD be extracted into their own dedicated files within the `src/components/` directory structure. **No "God Components":** Try to keep components focused. Layout orchestrators (like `App.tsx`) are naturally larger, but generic UI buttons and visual layers should be isolated.
- **Native-First Fluidity & Modern Standards**: The app must feel like a premium native iOS/Android application, not a legacy website. When implementing layouts, transitions, or modals, you MUST prioritize modern web APIs and physics:
  - **Reordering & Layout Shifts**: Use the View Transitions API (`document.startViewTransition`) instead of instantly snapping elements or relying on complex React unmounting.
  - **Modals & Drawers**: Utilize the native Top Layer (`<dialog>` or `popover`) combined with `@starting-style` and `transition-behavior: allow-discrete`. Avoid older z-index wars and `opacity-0 delay-x` hacks.
  - **Expandable Content**: Use CSS Grid (`grid-template-rows: 0fr -> 1fr`) for seamless accordion expansions, rather than arbitrary `max-height` hacks.
  - **Touch Physics**: For swipeable elements (like drawers), use genuine spring physics and 1:1 gesture tracking (e.g., `framer-motion` or `use-gesture`) instead of arbitrary hardcoded `deltaY` thresholds that lack inertia.


