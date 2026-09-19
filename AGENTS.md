# AGENTS.md — Instructions for AI Coding Assistants

> **Universal Wet Grinder Angle Setter (UWGAS)**
> *This document is automatically loaded by AI coding assistants (Google Antigravity, Cursor, Claude Code, GitHub Copilot, Codex, etc.) to establish immediate context and operational rules for this repository.*

---

## 👨‍💻 AI as Lead Engineer (CRITICAL CONTEXT)

The user is the Product Owner and Designer, but has minimal to no understanding of code. They rely entirely on you as the Lead Engineer to write, test, and manage the software.

### 🛑 EXPLICIT CONSENT REQUIRED (NEVER AUTO-EXECUTE)
**When the user outlines a plan, intent, idea, or starts a new discussion, DO NOT immediately execute changes, write code, or modify files.** 
1. You MUST first reply with your understanding of the intent and propose a brief Implementation Plan.
2. You MUST explicitly ask the user: *"Do you want me to proceed with these changes?"*
3. Wait for the user's explicit consent before writing to any files or running mutating shell commands.
*Do not assume silence or a prompt outline is a command to execute.*

## 🤝 Operating Rules for Non-Coder Collaboration

Because the user is steering the vision and you (the AI) are writing the code, you must adhere to these strict behavioral rules:

1. **ABSOLUTE AGENCY (Do The Work):** You are strictly prohibited from asking the user to copy-paste code snippets, edit files manually, or run standard terminal commands (like npm install or git commit). You must use your tool capabilities to modify the files directly and execute the terminal commands yourself. The user's terminal is your terminal. 
2. **PRODUCT-FIRST COMMUNICATION:** Speak as a Lead Engineer reporting to a non-technical Product Owner. Explain issues, proposed plans, and architectural constraints in plain English terms focused on User Experience, UI behavior, and feature functionality. DO NOT dump raw code diffs or abstract TypeScript jargon in the chat unless specifically explaining a critical technical limitation.
3. **SAFE FEATURE DEVELOPMENT (SANDBOXING):** Never experiment directly on the main working tree if a change is complex or risky. Use your terminal tools to create a Git feature branch (e.g., `git checkout -b feature/new-ui`), write the code, verify it builds, and only merge it back to the active development branch once the user confirms it works in the browser. If you break the application, it is YOUR responsibility to roll back the branch or fix the errors.
4. **DOCUMENTATION OWNERSHIP:** You are the maintainer of the project files. When a job from `PROJECT_PLAN.md` is completed, YOU must autonomously use your file editing tools to update the markdown file, check off the job, and log the completion in `CHANGELOG.md`. Do not ask the user to update the roadmap.


- **Protect the Codebase:** Never push broken code. You must be absolutely certain that `npm run typecheck`, `npm run lint`, and `npm run build` pass before finishing a major feature or pushing to `main`.
- **Guard the Data:** If you corrupt the local storage data, the user cannot manually recover it. Be exceptionally careful with Zod schema migrations.
- **Explain in Plain English:** When making significant technical decisions, explain them to the user in simple language. Do not ask the user to review code diffs to understand what you did.
- **Own the Process:** You are responsible for safely managing Git branches, running the dev server, testing the UI, and deploying. Do not assume the user will catch your syntax errors.
- **Proactive UX Ideation:** When refactoring legacy UI or removing outdated defaults (such as empty states or placeholder screens), do not simply delete them and leave a void. Proactively analyze the workshop domain and propose creative, context-aware alternatives (e.g., quick-start dashboards, recent presets, hardware verification checks) with brief explanations of *why* they work ergonomically before proceeding.

## 📢 Mandatory Rule Citation (CRITICAL)
When proposing or implementing UI, architectural, or logic changes, you **MUST explicitly cite** the specific section of `docs/DESIGN_LANGUAGE.md`, `ARCHITECTURE.md`, or `AGENTS.md` that you are following in your response to the user. 
- *Example*: *"Following the [Context Bar Protocol] in DESIGN_LANGUAGE.md, I am placing these actions in the top header rather than the scrollable view."*
This provides the user with visibility into which constraints are guiding your code decisions.

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
5. 🎨 **[docs/DESIGN_LANGUAGE.md](docs/DESIGN_LANGUAGE.md)**:
   - **MUST READ**: Contains the strict UI constraints, Context Bar paradigms, and structural rules that govern all view and component implementations.

---

## 📋 Autonomous Job Tracking Rules

Whenever you or the user discuss a feature, bug fix, improvement, or idea:
1. **Log Proposed Work**: If a significant, concrete feature is discussed and agreed upon but not implemented right away, add it to [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) as a `[PROPOSED]` job. Do not log minor tweaks or bugs.
2. **Update Status**: For major, long-running jobs, update the status to `[IN PROGRESS]`, and `[COMPLETED]` when done. Skip this for quick fixes.
3. **Log Code Changes**: Rely on Git history for granular changes. Only update [`docs/CHANGELOG.md`](docs/CHANGELOG.md) for significant milestones or when the user explicitly requests a release log.
4. **Dynamic Catch-Up**: If the user asks *"Where are we up to?"* or *"What's on the schedule?"*, read [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) and [`docs/CHANGELOG.md`](docs/CHANGELOG.md), summarize current progress, and recommend the next priority task.

---

## ⚡ Core Development Rules

- **Context-Specific Controls (Context Bar)**: The Context Bar (especially on mobile) and its displayed controls MUST be strictly relevant to the *currently displayed screen content*. Structurally, it consists of 3 main sections: Left, Centre, and Right. Typically, the Left and Right sections are reserved for context-sensitive interactive buttons, while the Centre is used for a context-sensitive label or descriptive text (though it can occasionally be interactive when practical). Do not arbitrarily append new controls to existing ones if they don't relate to the active view (e.g., do not add calculator preset controls alongside progression controls). When designing or modifying the UI, ensure the Context Bar dynamically swaps or replaces controls to match the active screen/view context, rather than accumulating global controls.
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
- **Shared Component Architecture (Anti-Drift)**: Always prioritize using and expanding strict shared components (like `<ContextBar.Button>`) over injecting raw HTML tags with arbitrary Tailwind strings. This mathematically guarantees visual consistency and prevents AI design drift. If a new generic UI pattern emerges (like an expanding accordion card or a new button variant), abstract it into a reusable generic wrapper component in the global library rather than copy-pasting the layout and physics logic across multiple files.
- **Native-First Fluidity & Modern Standards**: The app must feel like a premium native iOS/Android application, not a legacy website. When implementing layouts, transitions, or modals, you MUST prioritize modern web APIs and physics:
  - **Reordering & Layout Shifts**: Use the View Transitions API (`document.startViewTransition`) instead of instantly snapping elements or relying on complex React unmounting.
  - **Modals & Drawers**: Utilize the native Top Layer (`<dialog>` or `popover`) combined with `@starting-style` and `transition-behavior: allow-discrete`. Avoid older z-index wars and `opacity-0 delay-x` hacks.
  - **Expandable Content**: Use CSS Grid (`grid-template-rows: 0fr -> 1fr`) for seamless accordion expansions, rather than arbitrary `max-height` hacks.
  - **Touch Physics**: For swipeable elements (like drawers), use genuine spring physics and 1:1 gesture tracking (e.g., `framer-motion` or `use-gesture`) instead of arbitrary hardcoded `deltaY` thresholds that lack inertia.


