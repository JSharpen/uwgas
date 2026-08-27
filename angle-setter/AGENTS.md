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

- **Math Purity**: All trigonometric calculations belong in `src/math/tormek.ts`. Never alter formulas without verifying against [`docs/MATH_REFERENCE.md`](docs/MATH_REFERENCE.md).
- **State Safety**: Never introduce breaking changes to `AppPersistedState` without incrementing `PERSIST_VERSION` in `src/state/storage.ts` and providing default migrations.
- **Workshop Touch Ergonomics**: Minimum $44\text{px} \times 44\text{px}$ touch targets, large font sizes for numbers ($h_n, h_r, A, \beta$), and full keyboard modal dismissal.
- **Verification Gate**: Before ending any turn with code modifications, ensure that `npm run typecheck`, `npm run lint`, and `npm run build` all pass with **0 errors**.

