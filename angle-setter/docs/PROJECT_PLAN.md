# UWGAS Project Plan & Roadmap

> **Universal Wet Grinder Angle Setter (UWGAS)**
> *Living roadmap, job schedule, backlog, and issue tracker. Update this file continuously to track project state across AI sessions.*

---

## 📋 Active Job Schedule & Backlog

| Job ID | Feature / Task | Status | Priority | Description & Next Action |
| :--- | :--- | :--- | :--- | :--- |
| **JOB-001** | `App.tsx` Modular Decomposition | `[COMPLETED]` | **HIGH** | Decomposed 2,900-line `App.tsx` into modular components (`src/components/calculator/`, `src/components/wheels/`, `src/components/presets/`, `src/components/settings/`). |
| **JOB-002** | First-Run & Default Progression UX | `[COMPLETED]` | **HIGH** | Auto-populates / provides 1-click standard (Grind + Hone) progression so the user immediately gets calculated USB heights on initial load. |
| **JOB-003** | Global MicroBump Removal | `[COMPLETED]` | **LOW** | Removed redundant global micro-bevel toggle and degree adjuster to streamline interface; per-step angle offsets remain for micro-beveling. |
| **JOB-004** | Direct $h_n \leftrightarrow h_r$ Height Mode Toggle | `[COMPLETED]` | **HIGH** | Dedicated segmented control in the Global Setup card for switching between datum base height ($h_n$) and wheel surface height ($h_r$) in 1 click. |
| **JOB-005** | Workshop Steppers & Mobile 2-Col Layout | `[COMPLETED]` | **HIGH** | Permanent 2-column side-by-side layout with touch-friendly $+/-$ steppers for Projection $A$ ($\pm 1\text{mm}$, $\pm 5\text{mm}$) and Angle $\beta$ ($\pm 0.5^\circ$, $\pm 1.0^\circ$). |
| **JOB-006** | Multi-Machine Profiles System | `[READY]` | **MEDIUM** | Store multiple grinder configs (e.g. "T-8 Shop", "T-4 Mobile", "Jet Clone") with individual USB diameters and calibration offsets. |
| **JOB-007** | Built-in Jig Catalog & Projection Calc | `[PROPOSED]` | **MEDIUM** | Provide jig presets (SVM-45, KJ-45 centering jig, etc.) and knife clamp projection calculators (blade width + clamp depth $\rightarrow A$). |
| **JOB-008** | Large Readout Workshop HUD Mode | `[PROPOSED]` | **MEDIUM** | Fullscreen high-contrast view with massive $h_n$ readouts designed for viewing from 2 meters away while at the grinding wheel. |
| **JOB-009** | Vitest Math Engine Unit Tests | `[PROPOSED]` | **MEDIUM** | Golden-master test suite validating Ton math against canonical Dutchman spreadsheet tables ([`docs/MATH_REFERENCE.md`](MATH_REFERENCE.md)). |
| **JOB-010** | Wheel Wear & Trueing Logger | `[PROPOSED]` | **LOW** | Track wheel diameter reduction over time with trueing cut notes and quick $\Delta D$ adjustment. |
| **JOB-011** | Device, Screen Size & Density Optimization | `[PROPOSED]` | **MEDIUM** | Adaptive responsive scaling, pixel-density tuning, and display density presets (Compact / Standard / Touch-Spacious) across mobile, tablet, and bench displays. |
| **JOB-012** | Projection Solver for Adjustable Jigs & Fixed USB | `[COMPLETED]` | **HIGH** | Exact closed-form inverse Dutchman solver calculating required knife projection $A$ for fixed USB bar ($h_n / h_r$) with header mode toggle and workshop steppers. |
| **JOB-013** | Global Setup Full Collapse & Compact Summary Strip | `[COMPLETED]` | **MEDIUM** | Header collapse toggle collapses the entire inputs body; renders a compact one-line variable summary strip when collapsed with 1-click expand. |

---

## 🐛 Known Issues & Bench Feedback Tracker

| Issue ID | Severity | Status | Description & Reproduction | Resolution / Target Job |
| :--- | :--- | :--- | :--- | :--- |
| *No open bugs* | — | — | All current quality gates and build prechecks are passing with 0 errors. | — |

> *Tip: When testing at the bench, report any quirks or observations in chat to log them here as `BUG-xxx`.*

---

## 🎯 Project Vision

UWGAS is a precision angle calculator and sharpening workflow companion designed for Tormek and clone wet grinders (e.g., Jet, Scheppach, Wen, Triton). It utilizes the **Dutchman / Ton** trigonometry formulas to calculate exact Universal Support Bar (USB) heights ($h_n$ and $h_r$) for arbitrary wheel diameters, jig configurations, projections, and target bevel angles.

### Core Principles
1. **Mathematical Precision**: Accurate to sub-millimeter measurements; rigorous calibration solving for machine constants ($h_c, o$).
2. **Shop Ergonomics**: Designed for mobile and tablet use at the workbench (large touch targets, high contrast, quick progression navigation).
3. **Zero Lock-In / Privacy-First**: 100% client-side PWA with offline support, local storage persistence, and full JSON import/export.
4. **Modularity & Maintainability**: Clean separation between mathematical engine, state management, and UI presentation.

---

## 📊 Current Status (v0.9.1)

- [x] Dutchman / Ton core trigonometry solver (`src/math/tormek.ts`)
- [x] Dual-base machine calibration wizard with least-squares / non-linear solver and residual analysis ($\varepsilon$)
- [x] Multi-wheel progression list with per-step angle bump, grit labels, and base side toggles (Front / Rear)
- [x] Session presets management (create, apply, overwrite, delete, rename)
- [x] Local storage persistence with schema versioning (`src/state/storage.ts`)
- [x] Theme Lab with live CSS variable manipulation and preset switching
- [x] Interactive dev console shell script (`angle-dev-console.sh`) with auto-checking and GitHub Pages deployment
- [x] PWA web manifest and offline service worker integration
- [x] Modular component architecture with clean domain separation
- [x] Workshop touch steppers, quick angle chips, and direct $h_n \leftrightarrow h_r$ mode pill

---

## 🗺️ Roadmap & Milestones

```mermaid
flowchart LR
    P1[Phase 1: Architecture & Usability ✓] --> P2[Phase 2: Mathematical & Machine Profiling]
    P2 --> P3[Phase 3: Workshop Ergonomics & PWA]
    P3 --> P4[Phase 4: Automated Testing & Community Features]
```

### Phase 1: Architecture & Core Usability (Completed ✓)
*Objective: Decompose monolithic `App.tsx` and ensure immediate, frictionless bench usability.*

- [x] **1.1 Component Modularization (`JOB-001`)**
  - [x] Modal shell abstraction (`ModalShell.tsx`)
  - [x] Global setup card (`GlobalSetupCard.tsx`)
  - [x] Progression editor & steps (`ProgressionEditor.tsx`)
  - [x] Wheel manager & form fields (`WheelManagerView.tsx`, `WheelFormFields.tsx`)
  - [x] Preset manager & save dialog (`PresetManagerModal.tsx`, `SavePresetDialog.tsx`)
  - [x] Machine constants view (`MachineConstantsCard.tsx`)
- [x] **1.2 First-Run & Default Progression Flow (`JOB-002`)**
- [x] **1.3 Surface MicroBump Controls (`JOB-003`)**
- [x] **1.4 Direct Height Mode Toggle ($h_n \leftrightarrow h_r$) (`JOB-004`)**
- [x] **1.5 Workshop Touch Steppers & Angle Chips (`JOB-005`)**

---

### Phase 2: Multi-Machine Profiles & Advanced Grinding Features (Next Milestone)
*Objective: Expand the math and configuration engine to handle multi-machine setups, alternative jigs, and advanced geometry.*

- [ ] **2.1 Multi-Machine Profile Management (`JOB-006`)**
- [ ] **2.2 Jig & Knife Projection Helpers (`JOB-007`)**
- [ ] **2.3 Large Readout Workshop HUD Mode (`JOB-008`)**

---

### 📝 Decision Log & Session History

| Date | Topic / Change | Rationale / Notes |
| :--- | :--- | :--- |
| **2026-08-27** | Completed Projection Solver Mode (`JOB-012`) | Implemented exact closed-form algebraic inverse Dutchman solver to calculate required knife projection $A$ with fixed USB bar position ($h_n / h_r$). Added header toggle button and responsive workshop steppers. |
| **2026-08-26** | Completed Phase 1 Core Usability & Decomposition | Decomposed `App.tsx` into modular components, added touch steppers, quick angle chips, MicroBump controls, $h_n \leftrightarrow h_r$ pill, and default progression auto-loader. Verified with clean build. |
| **2026-08-25** | Active Job Schedule & Backlog Established | Introduced standardized job tracking (`JOB-xxx` IDs with explicit statuses) to maintain continuity across all AI agent sessions. |
| **2026-08-25** | Project documentation system established | Created `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `DEVELOPMENT_GUIDE.md` for cross-session continuity. |
| **2025-12-19** | Dev Console & Automated Deployment | Added `angle-dev-console.sh` with live dynamic status, QR codes, quality prechecks, and `gh-pages` deployment. |
| **2025-12-18** | Rebuilt core math & UI baseline | Restored Dutchman/Ton math engine, PWA manifest, and stable state persistence. |
