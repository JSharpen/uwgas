# Universal Wet Grinder Angle Setter (UWGAS)

[![Version](https://img.shields.io/badge/version-0.9.0-blue.svg)](package.json)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**UWGAS** is a high-precision, mobile-first sharpening angle and USB (Universal Support Bar) height calculator designed for **Tormek** and clone wet grinder sharpening systems (Tormek T-8/T-4, Jet, Scheppach, Wen, Triton, etc.).

Powered by the mathematically proven **Dutchman / Ton** trigonometry model, UWGAS eliminates guesswork by computing the exact USB height ($h_n$ from machine datum or $h_r$ from wheel surface) for any combination of wheel diameter, projection distance, jig collar diameter, and target bevel angle.

---

## 🌐 Live Web Application

- **Production Site**: [https://jsharpen.github.io/uwgas/](https://jsharpen.github.io/uwgas/)
- Fully functional offline PWA (Progressive Web App). Installable directly to iOS/Android home screens or desktop browsers.

---

## 📚 Project Documentation & AI Continuity

To maintain complete consistency and continuity across human development sessions and AI pair-programming chats, the project maintains structured documentation:

- 🤖 **[AGENTS.md](AGENTS.md)**: Universal instructions for AI coding assistants and discovery protocol.
- 📋 **[Project Plan & Active Job Schedule](docs/PROJECT_PLAN.md)**: Live job tracker, milestone phases, task checklists, and issue logs.
- 📜 **[Changelog & Session Logs](docs/CHANGELOG.md)**: Granular record of all code changes, new features, and session history.
- 📐 **[Technical Architecture & State Model](docs/ARCHITECTURE.md)**: Component hierarchy, state schema persistence, and migration rules.
- 🧪 **[Mathematical Reference & Test Bench](docs/MATH_REFERENCE.md)**: Exact Dutchman/Ton geometric formulas and golden-master test vectors.
- 🛠️ **[Development Guide & Workflow](docs/DEVELOPMENT_GUIDE.md)**: Environment setup, dev console usage, and Git branching (`dev` $\rightarrow$ `main`).

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` (v9+)

### Installation & Local Run

```bash
# Clone repository
git clone https://github.com/jsharpen/uwgas.git
cd uwgas/angle-setter

# Install dependencies
npm install

# Start local Vite development server
npm run dev
```

### Interactive Dev Console (Linux / Bash)

For an all-in-one console featuring live server status, LAN QR code generation, quality gates, and Git automation:

```bash
./angle-dev-console.sh
# or
npm run console
```

---

## 📦 Scripts Overview

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start local Vite server with HMR |
| `npm run typecheck` | Validate TypeScript types with `tsc --noEmit` |
| `npm run lint` | Run ESLint checks |
| `npm run build` | Compile TypeScript and produce production bundle in `dist/` |
| `npm run deploy` | Build and deploy to GitHub Pages (`gh-pages`) |

---

## 📐 Key Features

- **Dutchman / Ton Trigonometry**: Micro-accurate USB height calculations for both Edge Leading (Rear Base) and Edge Trailing (Front Base).
- **Dual-Base Machine Calibration Wizard**: Measure with standard calipers to calibrate your specific grinder's physical constants ($h_c, o$) with non-linear least-squares residual analysis ($\varepsilon$).
- **Multi-Wheel Sharpening Progression**: Build step-by-step progressions across multiple grinding and honing wheels with per-step angle bumps and grit management.
- **Session Presets**: Save, load, and switch between custom sharpening setups (e.g., "Kitchen Knives 15°", "Woodturning Gouges", "Pocket Knives 20°").
- **Local Persistence & Data Ownership**: Automatic local storage saving with full JSON export and import for backups.
- **Custom Theme Lab**: Real-time CSS variable tweaking for light, dark, and high-contrast workshop environments.
