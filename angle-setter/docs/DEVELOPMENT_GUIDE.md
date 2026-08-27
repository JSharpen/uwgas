# UWGAS Development Guide & AI Context

> **Universal Wet Grinder Angle Setter (UWGAS)**
> *Developer workflow, coding conventions, Git branching strategy, and instructions for AI coding assistants.*

---

## 🛠️ Development Environment & Tooling

### Core Tech Stack
- **Framework**: React 19 + TypeScript (~5.9)
- **Bundler / Dev Server**: Vite 7
- **Styling**: Tailwind CSS v4 + PostCSS
- **Persistence**: Client-side `localStorage` + JSON Import/Export
- **Target Platform**: Responsive Web + PWA (Mobile / Tablet / Desktop)
- **Deployment**: GitHub Pages (`gh-pages`)

### Essential Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Start Vite development server locally |
| `npm run console` / `./angle-dev-console.sh` | Interactive Bash dev console with live status, QR code, and Git helpers |
| `npm run typecheck` | Run `tsc --noEmit` to verify strict TypeScript types |
| `npm run lint` | Run ESLint across all TypeScript and React files |
| `npm run build` | Compile and bundle production output into `dist/` |
| `npm run deploy` | Run build and deploy directly to GitHub Pages |

---

## 🚀 The Dev Console (`angle-dev-console.sh`)

The project includes an interactive terminal console (`angle-dev-console.sh`) designed for Linux (Fedora / GNOME / KDE) and cross-platform terminal use.

### Key Console Features
1. **Live Header**: Displays server PID, port, local URL (`localhost:5173`), LAN IP (`192.168.x.x`), and Git dirty status.
2. **Mobile QR Code**: Automatically prints a terminal QR code using `qrencode` for rapid smartphone/tablet testing on local Wi-Fi.
3. **Automated Quality Prechecks**: Runs tree cleanliness, linting, typechecking, and production builds before merging or deploying.
4. **Git Branching Automation**: Streamlined checkout, WIP stash, commit, and `dev` $\rightarrow$ `main` promotion.

---

## 🌿 Git Branching Strategy

```
[origin/dev] ──(Work, Fixes, Features)──> [dev] ──(Precheck Pass)──> [main] ──(Deploy)──> [gh-pages]
```

- **`dev` Branch**: Active development branch. All feature work, bug fixes, and refactoring MUST happen on `dev`.
- **`main` Branch**: Production-ready release branch. Only updated by merging `dev` once all precheck gates pass.
- **`gh-pages` Branch**: Automated deployment target generated from `dist/` by `npm run deploy`.

---

## 🤖 Instructions for AI Coding Assistants (Future Sessions)

When starting or resuming work on this repository, all AI assistants MUST adhere to the following rules:

### 1. Session Start Discovery Protocol (CRITICAL)
Every new AI session MUST first read:
1. **`docs/PROJECT_PLAN.md`**: To inspect the **Active Job Schedule & Backlog** table, check what is `[IN PROGRESS]`, `[READY]`, or `[PROPOSED]`, and read the recent Decision Log.
2. **`docs/CHANGELOG.md`**: To see the granular history of code changes, new components, and features added in previous sessions.
3. **`docs/ARCHITECTURE.md`**: To verify math formulas, state schemas, and component boundaries before modifying code.

### 2. Job Tracking & Autonomous Logging Protocol
Whenever a user discusses a feature, proposed improvement, bug fix, or architectural change:
1. **Immediate Job Logging**: If an idea or feature is proposed or discussed (even if not worked on immediately), add it as an entry in `docs/PROJECT_PLAN.md` under the **Active Job Schedule & Backlog** table with status `[PROPOSED]` or `[READY]`.
2. **Standard Job Statuses**:
   - `[PROPOSED]`: Discussed/requested idea; awaiting design refinement or prioritization.
   - `[READY]`: Scoped and approved; ready for implementation.
   - `[IN PROGRESS]`: Currently being developed in the active session.
   - `[BLOCKED]`: Waiting on user input, physical measurement, or dependency.
   - `[COMPLETED]`: Fully implemented, verified with tests, and built.
   - `[DEFERRED]`: Shelved for future milestones.
3. **Changelog Updates**: Whenever code is created or modified, append a structured release or session entry in `docs/CHANGELOG.md` detailing the files and features affected.
4. **Catch-Up & Dynamic Suggestions**: When a user starts a new chat or asks *"What's on the schedule?"* or *"Where are we up to?"*, the agent MUST read `docs/PROJECT_PLAN.md` and `docs/CHANGELOG.md`, summarize the recent work and open jobs, and make proactive recommendations on what to tackle next based on priority.

### 3. Math & Physics Integrity
- All trigonometric calculations live in `src/math/tormek.ts`.
- **Do not modify math equations** unless explicitly fixing a verified geometric discrepancy against Dutchman's canonical formulations.
- Ensure all angles are converted between degrees and radians accurately (`deg2rad`, `rad2deg`).
- Keep math functions **pure** (no React state or DOM dependencies).

### 4. State & Migration Safety
- Never introduce breaking changes to `AppPersistedState` without:
  1. Incrementing `PERSIST_VERSION` in `src/state/storage.ts`.
  2. Providing backwards-compatible default fallbacks in `_load()`.
  3. Testing JSON import / export round-trips.

### 5. UI & Workshop Ergonomics
- Keep touch targets at or above $44\text{px} \times 44\text{px}$.
- Use high-contrast font hierarchies for numbers ($h_n, h_r, A, \beta$).
- Ensure all modal views listen to `Escape` key and click-outside dismissal (via `useModalLayout`).
- Use standardized button styling classes from `src/ui/buttons.ts` (`BTN`, `BTN_MUTED`).

### 6. Verification Before Ending Session
Before ending any session:
1. Run `npm run typecheck` to confirm zero TypeScript errors.
2. Run `npm run lint` to confirm zero ESLint violations.
3. Verify that `npm run build` succeeds cleanly.
