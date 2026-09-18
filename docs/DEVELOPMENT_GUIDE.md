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

- **`dev` Branch**: Active development branch. All feature work, bug fixes, and refactoring should target `dev` (using feature branches when appropriate).
- **`main` Branch**: Production-ready release branch. Only updated by merging `dev` once all precheck gates pass.
- **`gh-pages` Branch**: Automated deployment target generated from `dist/` by `npm run deploy`.

---

## 🤖 Instructions for AI Coding Assistants (Future Sessions)

Please refer strictly to **`AGENTS.md`** in the root of the repository for all mandatory session start protocols, job tracking rules, state management, and UI verification gates. All AI rules have been centralized to prevent duplication.

## 🎨 UI Design & Layout Constraints

For detailed information on the visual language, the Context Bar, layout paradigms, and touch ergonomics, refer to **`docs/DESIGN_LANGUAGE.md`**. Any UI additions must abide by these principles.
