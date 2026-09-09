# Project: UWGAS State Management Overhaul & Sacred Math Engine Isolation
# Scope: Phase 1 & Phase 2 Architecture Overhaul

## Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│  Tier 4: Layout Shell & Routed Views                                   │
│  App.tsx (~60 lines) -> CalculatorView, WheelManagerView, SettingsView │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Direct Zustand hooks / selectors
┌───────────────────────────────────▼────────────────────────────────────┐
│  Tier 3: State Management Layer (Zustand v5 & Zod)                     │
│  - src/state/store.ts (Root store, debounced persist, multi-tab sync)  │
│  - src/state/slices/ (calculator, progression, machine, hardware,      │
│                       wheel, preset, settings)                         │
│  - src/state/uiStore.ts (Ephemeral UI store: view, dialogs, drawers)   │
│  - src/state/migration.ts (Legacy 11+ t_* keys -> uwgas_app_state_v1)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Subscribes via useShallow
┌───────────────────────────────────▼────────────────────────────────────┐
│  Tier 2: Application Calculation Adapter Service                       │
│  src/services/calculationService.ts                                    │
│  (Entity resolution, orientation labels, stop collar math,             │
│   unadjusted angle carryover, useWheelResults() hook)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Pure scalar arguments (Readonly<T>)
┌───────────────────────────────────▼────────────────────────────────────┐
│  Tier 1: Sacred Pure Math Engine Core ("The Vault")                    │
│  src/math/tormek.ts & src/math/types.ts                                │
│  (Pure trigonometry, runtime validation guards, Object.freeze in dev,   │
│   ESLint boundary barrier, zero UI/React/Zustand imports)              │
└────────────────────────────────────────────────────────────────────────┘
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Phase 1 Dead Code & Artifact Purge | Delete orphaned files (`GrindDirToggle.tsx`, `ExpandToggle.tsx`, `useAppState.ts`, `buttons.ts`, `tormek.cjs`, `core.js`) and unused `.u-btn` CSS in `primitives.css` | M1 | Audit Report Phase 1 |
| 2 | Tier 1 Pure Math Engine | Isolate `src/math/tormek.ts` to pure geometric formulas using `src/math/types.ts`, `Readonly<T>`, `validateTonInput`, `validateProjectionInput`, and `Object.freeze` | M2 | User Request R3 & Audit Phase 2 |
| 3 | Tier 2 Calculation Adapter Service | Create `src/services/calculationService.ts` extracting `computeWheelResults` and `estimateMaxAngleErrorDeg`, exposing `useWheelResults()` hook | M2 | User Request R3 & Audit Phase 2 |
| 4 | Headless Golden Master Test Suite | Implement `src/math/tormek.test.ts` (11 Golden Master vectors, <50ms) and configure `npm test` script | M2 | Audit Report Phase 2 |
| 5 | ESLint Sacred Math Import Barrier | Add `no-restricted-imports` in `eslint.config.js` barring React, Zustand, UI, hooks, and state in `src/math/` | M2 | User Request R3 & Acceptance Criteria |
| 6 | Zustand Domain Slices | Create `src/state/slices/` (calculator, progression, machine, hardware, wheel, preset, settings) | M3 | User Request R1 & Audit Phase 4 |
| 7 | Root Store & Debounced Storage | Implement `src/state/store.ts` with 300ms debounce, `beforeunload` flush, multi-tab sync, and Zod validation | M3 | User Request R4 & Audit Phase 4 |
| 8 | Legacy LocalStorage Migration Bridge | Implement `src/state/migration.ts` importing 11+ legacy `t_*` keys into `uwgas_app_state_v1` on boot | M3 | User Request R4 & Audit Phase 4 |
| 9 | Ephemeral UI Store | Implement `src/state/uiStore.ts` for routing, active panels, modals, and draft state | M3 | User Request R1 & Audit Phase 4 |
| 10 | Component Prop-Drilling Eradication | Refactor `GlobalSetupCard`, `ProgressionView`, `StepCard`, `WheelManagerView`, `MachineManagerView`, `HardwareManagerView`, `MeasurementSettingsView`, `CalibrationWizard`, `PresetManagerModal`, `SavePresetDialog`, `ImportExportPanel` to use atomic Zustand selectors | M4 | User Request R2 & Acceptance Criteria |
| 11 | App.tsx Decomposition | Dismantle `src/App.tsx` down to ~60-line structural layout shell and extract `src/views/CalculatorView.tsx` and `src/views/SettingsView.tsx` | M5 | User Request R1 & Acceptance Criteria |
| 12 | End-to-End Verification & Audit Gate | Run typecheck, lint, build, unit tests, and perform forensic integrity audit | M6 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Housekeeping & Dead Code Purge | Delete orphaned source files, stray build artifacts, and dead CSS | none | DONE |
| 2 | Sacred Math Engine Isolation & Headless Test Suite | Purify `src/math/tormek.ts`, create `src/math/types.ts` & `src/services/calculationService.ts`, configure ESLint barrier, implement unit tests | M1 | DONE |
| 3 | Sliced Zustand Stores & Storage Migration Bridge | Implement 7 domain slices, root store with debounced persist, legacy migration bridge, and ephemeral UI store | M1 | DONE |
| 4 | UI Component Refactoring & Prop-Drilling Eradication | Wire all UI components directly to Zustand stores with fine-grained selector hygiene | M2, M3 | DONE |
| 5 | App.tsx Decomposition into Structural Layout Shell | Reduce `src/App.tsx` to ~60-line shell and extract views (`CalculatorView.tsx`, `SettingsView.tsx`) | M4 | DONE |
| 6 | Verification, Regression Testing & Forensic Audit | Verify `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and independent forensic audit | M5 | DONE |

## Interface Contracts

### Tier 1 Pure Math Engine (`src/math/types.ts` & `src/math/tormek.ts`)
```typescript
export interface ReadonlyTonInput {
  readonly base: 'rear' | 'front';
  readonly D: number;
  readonly A: number;
  readonly betaDeg: number;
  readonly Dj: number;
  readonly Ds: number;
  readonly constants: Readonly<{
    rear: Readonly<{ hc: number; o: number }>;
    front: Readonly<{ hc: number; o: number }>;
  }>;
  readonly angleOffsetDeg?: number;
}

export interface ReadonlyTonOutput {
  readonly hn: number;
  readonly hr: number;
  readonly CA: number;
  readonly y: number;
  readonly phiRad: number;
  readonly betaEffDeg: number;
}
```

### Tier 2 Calculation Adapter Service (`src/services/calculationService.ts`)
```typescript
export function computeWheelResults(
  wheels: Wheel[],
  sessionSteps: SessionStep[] | null,
  global: GlobalState,
  machines: MachineConfig[],
  jigs: JigConfig[],
  usbs: UsbConfig[],
  defaultMachineId?: string
): WheelResult[];

export function useWheelResults(): WheelResult[];
```

### Tier 3 Slices & Root Store (`src/state/store.ts` & `src/state/uiStore.ts`)
- `useStore`: Domain store containing `calculatorSlice`, `progressionSlice`, `machineSlice`, `hardwareSlice`, `wheelSlice`, `presetSlice`, `settingsSlice`.
- `useUIStore`: Ephemeral UI store containing `view`, `settingsView`, `isSetupPanelOpen`, `isPresetDialogOpen`, etc.

## Code Layout
- `src/math/types.ts`: Pure geometric types and input/output contracts.
- `src/math/tormek.ts`: Pure trigonometric algorithms (zero UI, zero React, zero Zustand).
- `src/math/tormek.test.ts`: Golden Master test suite.
- `src/services/calculationService.ts`: Tier 2 application calculation service.
- `src/state/slices/`: Domain store slices.
- `src/state/store.ts`: Root Zustand store with debounced persistence.
- `src/state/uiStore.ts`: Ephemeral UI store.
- `src/state/migration.ts`: Legacy storage migration bridge.
- `src/views/CalculatorView.tsx`: Extracted calculator tab view.
- `src/views/SettingsView.tsx`: Extracted settings tab view.
- `src/App.tsx`: Structural shell (~60 lines).
