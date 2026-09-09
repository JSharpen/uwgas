# Comprehensive Investigation & Architectural Verification Report
**Task Focus**: R2 Refactoring Plan Verification & R5 Sacred Math Engine Isolation Strategy  
**Repository**: Universal Wet Grinder Angle Setter (UWGAS)  
**Date**: 2026-09-07T10:56:00Z  
**Author**: Explorer Agent (`teamwork_preview_explorer_plan_math`)  

---

## Executive Summary & Definitive Verdict

1. **Definitive Verdict on `.agents/implementation_plan.md`**: **MODIFY (Substantial Structural Overhaul Required)**.
   - **Rationale**: The high-level intent to dismantle the 759-line `App.tsx` God component and eliminate 22+ prop-drilling pathways via Zustand is correct. However, the drafted implementation plan is an incomplete preliminary sketch that introduces serious architectural risks:
     - It creates a **single monolithic God Store** that dumps 9 core domain states and 10+ ephemeral UI/modal flags into one untyped bucket.
     - It **completely ignores derived math calculations** (`computeWheelResults` and `suggestedFrontUsbHeight`), providing zero strategy for where, when, and how math outputs are computed or memoized.
     - It specifies **zero selector hygiene**, guaranteeing severe application-wide re-render cascades on every user keystroke.
     - It treats **persistence and schema migration as an unaddressed "open question"**, risking catastrophic loss of user grinding machine configurations by ignoring the existing versioned multi-key migration pipeline in `storage.ts`.
     - It omits React 19 compatibility requirements (`package.json` uses React `^19.2.0`, which requires Zustand v5).
2. **Sacred Math Engine Isolation Strategy (R5)**:
   - While `src/math/tormek.ts` contains brilliant closed-form trigonometric solvers, it currently commits a major architectural boundary violation: **`computeWheelResults` directly couples the sacred math file to application domain entities** (`GlobalState`, `SessionStep`, `Wheel`, `MachineConfig`, `JigConfig`, `UsbConfig`), UI string formatting, and display turns logic.
   - We specify an **ironclad 5-pillar architectural boundary**:
     1. **Layer Decoupling**: Isolate pure geometry functions (`src/math/core/`) from application-state adaptation (`src/services/calculationService.ts`).
     2. **Pure Functional Contract & Runtime Validation**: Enforce deterministic, side-effect-free calculations with boundary validation guards preventing `NaN` and divide-by-zero, frozen via `Object.freeze` in development.
     3. **Compile-Time Immutability**: Dedicated geometric type interfaces with `Readonly<T>` parameter signatures.
     4. **Architectural Enforcement**: ESLint `no-restricted-imports` blocking React/Zustand/UI imports into `src/math/`, and restricting UI direct access to low-level math primitives.
     5. **Isolated Headless Test Harness**: Automated regression testing executing all Golden Master test vectors from `docs/MATH_REFERENCE.md` in `< 50ms` via headless runner (`npm test`), resolving an uncovered documentation discrepancy.

---

## 1. Observation: Direct Code Evidence & Empirical Findings

### 1.1 Audit of `App.tsx`: The God Component Anti-Patterns & Impacts

Direct inspection of `/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/src/App.tsx` reveals 759 lines of tightly coupled logic containing:

| Anti-Pattern Observed in `App.tsx` | Concrete Code Citation | Performance & Maintainability Impact |
| :--- | :--- | :--- |
| **State Explosion (22 `useState` Hooks)** | `App.tsx:54-74, 94, 128, 137, 140, 164-170, 173-198` | The component maintains 9 domain states (`global`, `machines`, `defaultMachineId`, `jigs`, `usbs`, `wheels`, `sessionSteps`, `sessionPresets`, `heightMode`), 10 transient UI/modal states (`view`, `settingsView`, `isConfirmingClear`, `isSetupPanelOpen`, `selectedPresetId`, `isPresetDialogOpen`, `isPresetDialogClosing`, `presetNameDraft`, `isPresetManagerOpen`, `isPresetManagerClosing`), and 3 import/export configs. Any update re-evaluates the entire 759-line root function. |
| **Severe Prop-Drilling ("Air Traffic Controller")** | `App.tsx:432-451` (15 props to `GlobalSetupCard`), `App.tsx:540-555` (14 props to `ProgressionView`), `App.tsx:602-611` (9 props to `HardwareManagerView`), `App.tsx:625-635` (10 props to `MachineManagerView`), `App.tsx:686-702` (10 props to `PresetManagerModal`), `App.tsx:705-721` (8 props to `SavePresetDialog`) | Massive prop contracts create extreme refactoring friction. Adding or modifying a single configuration field requires touching `types/core.ts`, `App.tsx`, parent cards, and child components. |
| **Monolithic State-To-Disk Sync Bottleneck** | `App.tsx:77-90`: `React.useEffect(() => { writePersistedState({...}) }, [global, machines, defaultMachineId, jigs, usbs, wheels, sessionSteps, sessionPresets, heightMode])` | Every keystroke in a number stepper or text input triggers a synchronous `JSON.stringify()` serialization of the entire application dataset across 9 distinct `localStorage` keys (`storage.ts:140-153`). |
| **Direct Calculation Coupling in Component Loop** | `App.tsx:207-210`: `const wheelResults = React.useMemo(() => computeWheelResults(...), [...])` and `GlobalSetupCard.tsx:62-67`: `computeSuggestedFrontUsbHeight(...)` | Heavy trigonometric loop runs on the main UI thread during React render cycles. Because `App.tsx` re-renders on UI state changes (e.g. typing a preset name), memoization dependencies are frequently invalidated. |
| **DOM Side-Effects & Event Interceptors** | `App.tsx:97-127` (`ResizeObserver` setting CSS variable `--progression-header-bottom`), `App.tsx:132-134` (window `CustomEvent("collapseAll")`), `App.tsx:147-161` (global `pointerdown` listener intercepting clicks) | Global browser events and style mutations are intertwined with view layout, bypassing React's declarative component model and making unit testing impossible. |
| **Inline Business Logic Monolith** | `App.tsx:212-286` (15 crud handler functions) and `App.tsx:328-413` (85-line JSON import parser with section-by-section merge/overwrite logic) | Domain mutations are declared as local closures inside `App()`, making them non-reusable, un-testable in isolation, and bloating the component. |

### 1.2 Evaluation of `.agents/implementation_plan.md`

Direct review of `.agents/implementation_plan.md` reveals critical design gaps:

```markdown
# Excerpt from .agents/implementation_plan.md:
Line 30-33:
#### [NEW] src/state/store.ts
- Create the core Zustand store.
- Define the state interface encompassing: global, machines, jigs, usbs, wheels, sessionSteps, sessionPresets, heightMode, and UI/View states.
- Define actions to mutate this state (e.g., setGlobal, addStep, loadPreset).
```

1. **Monolithic Store Flaw**: Dumping domain data (`machines`, `wheels`, `sessionSteps`) together with transient UI states (`UI/View states`) into a single file creates a "God Store" that replicates the structural sins of `App.tsx`.
2. **Missing Calculation Pipeline**: The words `computeWheelResults`, `wheelResults`, or `math` appear **zero times** in `implementation_plan.md`. Line 54 simply states: *"ProgressionView.tsx ... Wire directly to the Zustand store"*. It does not specify whether `wheelResults` is a computed selector, stored state, or hook calculation.
3. **No Selector or Re-render Strategy**: Line 50 instructs `GlobalSetupCard.tsx` to: *"Implement useStore() hooks to grab the exact data and actions it needs"*. In Zustand, calling `useStore()` without atomic selectors causes the component to re-render whenever *any* property in the entire store updates.
4. **Ignored Persistence & Migration Safety**: Under *Open Questions* (line 15), the plan asks: *"Should we migrate to the Zustand persist middleware, or keep the existing custom storage.ts logic for now to minimize risk?"* It provides no migration path. Slapping on Zustand's default `persist` middleware would break existing user setups because UWGAS stores data across separate localStorage keys (`t_global`, `t_machines`, `t_wheels`, etc.) with legacy schema migrations.
5. **Incomplete Component Scope**: The plan only mentions 4 components (`GlobalSetupCard`, `ProgressionView`, `PresetManagerModal`, `SavePresetDialog`). It completely neglects `MachineManagerView`, `HardwareManagerView`, `MeasurementSettingsView`, `WheelManagerView`, and `SettingsRootView`, which currently take dozens of props from `App.tsx`.

### 1.3 Audit of Current Storage Architecture (`src/state/storage.ts`)

Inspection of `src/state/storage.ts` reveals:
- **`PERSIST_VERSION = 6`** (line 15).
- Multi-key discrete storage: `_save('t_global')`, `_save('t_machines')`, `_save('t_wheels')`, etc. (lines 140-153).
- **Active Schema Migrations in `readPersistedState()`**:
  - Lines 78-87: Migration from single `t_constants` to `MachineConfig[]` (`default-machine`).
  - Lines 89-100: **V5 Migration**: Migration of raw `usbDiameter` and `jig.Dj` into named configurations (`ensureHardwareConfig`).
  - Lines 106-117: Migration of `sessionSteps[].usbOverride` to `sessionSteps[].usbId`.
- **Verdict on Persistence**: Migrating to Zustand `persist` is highly desirable (eliminating the synchronous `useEffect` in `App.tsx`), but it **must** include an explicit migration adapter that reads legacy `t_*` keys if the unified Zustand key is absent.

### 1.4 Audit of Sacred Math Engine (`src/math/tormek.ts`) & Test Findings

Inspection of `src/math/tormek.ts` (552 lines) reveals:
- **Boundary Violation in `computeWheelResults` (lines 154-348)**:
  - Imports application UI types: `GlobalState`, `MachineConfig`, `SessionStep`, `Wheel`, `JigConfig`, `UsbConfig` (`tormek.ts:1-18`).
  - Implements UI-specific logic:
    - Line 166: checks `global.useProtrusionMode` and `activeJig.length`.
    - Line 212: formats UI orientation labels (`'Edge leading (rear base)'`).
    - Lines 262-267: computes physical turns and millimeters for adjustable jigs (`activeJig.threadPitch`).
    - Lines 318-345: iterates over steps to calculate "unadjusted carry-over angles" for UI display.
  - **Conclusion**: `computeWheelResults` is not pure math — it is an **application service / domain adapter**. Having it in `src/math/tormek.ts` constantly exposes the math file to UI and schema alterations.
- **Defensive Guard Deficiencies**:
  - `computeTonHeights` (lines 29-82) does not guard against $D \le 0$, $A \le D_s/2$ (which causes $jg \le 0$ and $\arctan(\infty)$), or $\beta \le 0$. If invalid numbers pass through, it computes `NaN` or unhandled geometry errors.
  - Return objects are mutable and not frozen.
- **Empirical Test Execution & Discovery of Documentation Drift**:
  - We executed `scratch/test_math.mjs` against `src/math/tormek.ts` and `docs/MATH_REFERENCE.md`.
  - **Result**:
    - Lines 86-90 of `docs/MATH_REFERENCE.md` document:
      `CA = 227.142 mm`, `hr = 108.14 mm`, `hn = 198.57 mm` for $D = 250, A = 139, \beta = 15^\circ$.
    - However, `src/math/tormek.ts` produces:
      `CA = 197.904 mm`, `hr = 78.90 mm`, `hn = 168.48 mm`.
    - **Crucial Cross-Check**: Lines 164-171 of `docs/MATH_REFERENCE.md` (Inverse Solver Golden Master) specify:
      *Rear Base, $h_n = 168.4836\text{ mm}, D = 250.00\text{ mm}, \beta = 15.00^\circ \implies \mathbf{A = 139.00\text{ mm}}$ (Exact round-trip identity)*!
    - **Discovery**: The math implementation in `src/math/tormek.ts` is mathematically consistent with the inverse solver ($168.48\text{ mm} \leftrightarrow 139.00\text{ mm}$), but the manual documentation table in lines 78-107 of `docs/MATH_REFERENCE.md` contains legacy drifted values (calculated for $A \approx 173\text{ mm}$).
    - **Root Cause**: `package.json` line 13 has `"test": "echo \"(no tests defined yet)\" && exit 0"`. Because there is zero automated CI unit testing for the math engine, documentation discrepancies and regressions went completely undetected!

---

## 2. Logic Chain: Architectural Analysis & Synthesis

### 2.1 Logic Chain for R2: Store Architecture & Slices

```
[Observation: App.tsx has 22 useState hooks, 60+ passed props, and 15 CRUD handlers]
   │
   ├─► [Deduction 1: Centralized state management is necessary to eliminate prop-drilling]
   │
   ├─► [Observation: implementation_plan.md proposes a single monolithic store.ts with UI + domain state]
   │      │
   │      └─► [Deduction 2: Monolithic store creates a God Store; persisting UI state causes dirty reloads]
   │             │
   │             └─► [Requirement 1: Split store into modular Slices for domain data, keep ephemeral UI state separate]
   │
   ├─► [Observation: Calling useStore() without atomic selectors re-renders on any state update]
   │      │
   │      └─► [Requirement 2: Enforce atomic selector hooks (useAppStore(s => s.x)) and useShallow]
   │
   ├─► [Observation: storage.ts has versioned multi-key migrations (PERSIST_VERSION = 6)]
   │      │
   │      └─► [Requirement 3: Zustand persist middleware must include a Legacy Storage Migration Bridge]
   │
   └─► [Observation: computeWheelResults is the heart of the app, yet absent from implementation_plan.md]
          │
          └─► [Requirement 4: Introduce a dedicated Calculation Service / custom hook (useWheelResults) that subscribes to store slices]
```

### 2.2 Logic Chain for R5: Sacred Math Engine Isolation

```
[Observation: computeWheelResults in tormek.ts imports 6 UI domain models and formats UI text]
   │
   ├─► [Deduction 1: Math engine is currently polluted with UI/state schema concerns]
   │      │
   │      └─► [Requirement 1: Move computeWheelResults to an Application Calculation Service (src/services/calculationService.ts)]
   │             │
   │             └─► [Result: src/math/ contains ONLY pure trigonometric algorithms taking primitives/pure geometry]
   │
   ├─► [Observation: Input parameters are mutable and lack boundary validation guards]
   │      │
   │      └─► [Requirement 2: Add compile-time Readonly<T> interfaces and runtime guards (validateTonInput, Object.freeze)]
   │
   ├─► [Observation: eslint.config.js has no import restrictions]
   │      │
   │      └─► [Requirement 3: Add ESLint no-restricted-imports rule preventing any UI/state import into src/math/**]
   │
   └─► [Observation: npm test is a no-op; documentation drift went unnoticed]
          │
          └─► [Requirement 4: Stand up a zero-dependency headless unit test harness for math engine]
```

---

## 3. Detailed Architectural Specifications

### 3.1 R2: The Revised Zustand Architecture Specification

Instead of a monolithic `store.ts`, implement a **Modular Slice Architecture** with **Separated UI State**:

```
src/state/
├── store.ts                     # Root Zustand store combining domain slices + persist middleware
├── migration.ts                 # Legacy localStorage (t_*) to Zustand migration bridge
├── useUIStore.ts                # Ephemeral, non-persisted UI navigation state (tabs, drawers, modals)
└── slices/
    ├── calculatorSlice.ts       # global settings (angles, projection, fixedUsb, calcMode)
    ├── progressionSlice.ts      # sessionSteps, add/delete/update/move step
    ├── machineSlice.ts          # machines, defaultMachineId, calibration bindings
    ├── hardwareSlice.ts         # jigs, usbs CRUD
    ├── wheelSlice.ts            # wheels CRUD
    ├── presetSlice.ts           # sessionPresets CRUD & load
    └── settingsSlice.ts         # heightMode ('hn' | 'hr')
```

#### A. Domain Slice Pattern Example (`progressionSlice.ts`)
```typescript
import { StateCreator } from 'zustand';
import type { SessionStep } from '../types/core';
import { generateId } from '../utils/id';

export interface ProgressionSlice {
  sessionSteps: SessionStep[];
  addStep: (wheelId?: string) => void;
  deleteStep: (id: string) => void;
  updateStep: (id: string, patch: Partial<SessionStep>) => void;
  moveStep: (index: number, direction: -1 | 1) => void;
  clearProgression: () => void;
  setSessionSteps: (steps: SessionStep[]) => void;
}

export const createProgressionSlice: StateCreator<
  ProgressionSlice,
  [],
  [],
  ProgressionSlice
> = (set) => ({
  sessionSteps: [],
  addStep: (wheelId) => set((state) => ({
    sessionSteps: [
      ...state.sessionSteps,
      { id: generateId(), wheelId: wheelId ?? '', base: 'front', angleOffset: 0 }
    ]
  })),
  deleteStep: (id) => set((state) => ({
    sessionSteps: state.sessionSteps.filter((s) => s.id !== id)
  })),
  updateStep: (id, patch) => set((state) => ({
    sessionSteps: state.sessionSteps.map((s) => (s.id === id ? { ...s, ...patch } : s))
  })),
  moveStep: (index, direction) => set((state) => {
    const next = [...state.sessionSteps];
    if (index + direction < 0 || index + direction >= next.length) return state;
    const temp = next[index];
    next[index] = next[index + direction];
    next[index + direction] = temp;
    return { sessionSteps: next };
  }),
  clearProgression: () => set({ sessionSteps: [] }),
  setSessionSteps: (steps) => set({ sessionSteps: steps }),
});
```

#### B. Ephemeral UI Store (`useUIStore.ts`)
Transient states that do NOT belong in `localStorage`:
```typescript
import { create } from 'zustand';

interface UIState {
  view: 'calculator' | 'wheels' | 'settings';
  settingsView: 'root' | 'machine' | 'hardware' | 'measurement' | 'import' | 'glossary';
  isSetupPanelOpen: boolean;
  setView: (view: UIState['view']) => void;
  setSettingsView: (sv: UIState['settingsView']) => void;
  setIsSetupPanelOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: 'calculator',
  settingsView: 'root',
  isSetupPanelOpen: false,
  setView: (view) => set({ view, isSetupPanelOpen: false }),
  setSettingsView: (settingsView) => set({ settingsView }),
  setIsSetupPanelOpen: (isSetupPanelOpen) => set({ isSetupPanelOpen }),
}));
```
*Note on Modals*: `presetNameDraft`, `isConfirmingClear`, and closing animation timers belong as **local component state** inside their respective modal/dialog components (`SavePresetDialog`, `PresetManagerModal`), eliminating unnecessary re-renders in the rest of the application.

#### C. Legacy Storage Migration Bridge (`migration.ts`)
To prevent data loss for existing users, `persist` middleware must check for legacy keys on hydration:
```typescript
import { readPersistedState } from './storage';
import type { AppStoreState } from './store';

export function migrateLegacyLocalStorage(): Partial<AppStoreState> | null {
  if (typeof localStorage === 'undefined') return null;
  // Check if legacy key exists and new unified key does not
  if (localStorage.getItem('t_global') && !localStorage.getItem('uwgas-store-v6')) {
    const legacy = readPersistedState();
    return {
      global: legacy.global,
      machines: legacy.machines ?? [],
      defaultMachineId: legacy.defaultMachineId,
      jigs: legacy.jigs,
      usbs: legacy.usbs,
      wheels: legacy.wheels,
      sessionSteps: legacy.sessionSteps,
      sessionPresets: legacy.sessionPresets,
      heightMode: legacy.heightMode ?? 'hn',
    };
  }
  return null;
}
```

#### D. Selector Hygiene & Performance
Components must strictly use atomic selectors or `useShallow`:
```typescript
// ✅ Good: Atomic selector (only re-renders when targetAngle changes)
const targetAngle = useAppStore(s => s.global.targetAngle);
const addStep = useAppStore(s => s.addStep); // Reference-stable action

// ✅ Good: Multi-property selector using useShallow
import { useShallow } from 'zustand/react/shallow';
const { jigs, usbs } = useAppStore(useShallow(s => ({ jigs: s.jigs, usbs: s.usbs })));

// ❌ Bad: Monolithic destructuring (re-renders on ANY store change)
const { global, sessionSteps } = useAppStore();
```

---

### 3.2 R5: Strict Math Engine Isolation Strategy

To permanently treat the math engine as sacred, we institute a **Two-Tier Architecture**:

```
src/
├── math/                         # [TIER 1: SACRED CORE - PURE MATHEMATICS]
│   ├── tormek.ts                 # Dutchman / Ton trigonometry, inverse solver, calibration
│   ├── types.ts                  # Pure mathematical interfaces (ReadonlyTonInput, etc.)
│   └── tormek.test.ts            # Automated Golden Master regression tests
│
└── services/                     # [TIER 2: APPLICATION ADAPTER]
    └── calculationService.ts     # Translates Zustand state -> pure math inputs -> WheelResult[]
```

#### A. The Separation: Relocating `computeWheelResults`
Extract `computeWheelResults` out of `src/math/tormek.ts` and place it in `src/services/calculationService.ts`.
- **`src/math/tormek.ts`** retains *only* pure geometric solvers:
  - `computeTonHeights(input: ReadonlyTonInput): ReadonlyTonOutput`
  - `computeRequiredProjection(input: ReadonlyProjectionInput): ReadonlyProjectionOutput`
  - `computeSuggestedFrontUsbHeight(rearHeight, constants, Ds, mode): number`
  - `calibrateBase(rows, Da, Ds): CalibrationResult | null`
  - `solveBetaForFixedSetup(base, D, A, Dj, Ds, constants, target, mode): number | null`
  - `deg2rad(deg)`, `rad2deg(rad)`
- **`src/services/calculationService.ts`** handles application mapping:
  - Resolves active jig, USB, machine constants.
  - Formats orientation labels.
  - Computes micro-adjust turn counts.
  - Exposes the custom hook `useWheelResults()`:
```typescript
// src/services/calculationService.ts
import { useMemo } from 'react';
import { useAppStore } from '../state/store';
import { useShallow } from 'zustand/react/shallow';
import { computeWheelResultsInternal } from './wheelResultsCalculator';
import type { WheelResult } from '../types/core';

export function useWheelResults(): WheelResult[] {
  const { wheels, sessionSteps, global, machines, jigs, usbs, defaultMachineId } = useAppStore(
    useShallow((s) => ({
      wheels: s.wheels,
      sessionSteps: s.sessionSteps,
      global: s.global,
      machines: s.machines,
      jigs: s.jigs,
      usbs: s.usbs,
      defaultMachineId: s.defaultMachineId,
    }))
  );

  return useMemo(
    () => computeWheelResultsInternal(wheels, sessionSteps, global, machines, jigs, usbs, defaultMachineId),
    [wheels, sessionSteps, global, machines, jigs, usbs, defaultMachineId]
  );
}
```

#### B. Pure Functional Contract & Runtime Boundary Guards
In `src/math/tormek.ts`, add defensive input validation to guarantee determinism and prevent unhandled geometry exceptions:

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

export function validateTonInput(input: ReadonlyTonInput): void {
  if (input.D <= 0 || !Number.isFinite(input.D)) throw new RangeError(`Invalid wheel diameter: ${input.D}`);
  if (input.Ds <= 0 || !Number.isFinite(input.Ds)) throw new RangeError(`Invalid USB diameter: ${input.Ds}`);
  if (input.A <= input.Ds / 2) throw new RangeError(`Projection A (${input.A}) must be greater than Ds/2 (${input.Ds / 2})`);
  if (input.betaDeg <= 0 || input.betaDeg >= 90) throw new RangeError(`Target angle beta (${input.betaDeg}) must be between 0 and 90 deg`);
}

export function computeTonHeights(input: ReadonlyTonInput): Readonly<TonOutput> {
  // In development, enforce structural validation
  if (import.meta.env.DEV) {
    validateTonInput(input);
  }

  // ... pure trigonometric calculations ...

  const result: TonOutput = { hr, hn, betaEffDeg };

  // Freeze returned object in development to prevent downstream mutation
  return import.meta.env.DEV ? Object.freeze(result) : result;
}
```

#### C. Architectural Enforcement via ESLint (`eslint.config.js`)
Add the following strict barrier to `eslint.config.js`:

```javascript
// Strict Math Engine Isolation Barrier
{
  files: ['src/math/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          { name: 'react', message: 'SACRED MATH ISOLATION: src/math must never import React.' },
          { name: 'react-dom', message: 'SACRED MATH ISOLATION: src/math must never import React DOM.' },
          { name: 'zustand', message: 'SACRED MATH ISOLATION: src/math must never import Zustand.' },
        ],
        patterns: [
          {
            group: ['**/components/**', '**/hooks/**', '**/state/**', '**/ui/**'],
            message: 'SACRED MATH ISOLATION: src/math must never import from UI, hooks, state, or components.',
          },
        ],
      },
    ],
  },
},
// Component Math Boundary Barrier
{
  files: ['src/components/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '../math/tormek',
            importNames: ['computeWheelResults'],
            message: 'Use useWheelResults() from src/services/calculationService instead of calling low-level math directly.',
          },
        ],
      },
    ],
  },
}
```

#### D. Automated Isolated Test Harness (`src/math/tormek.test.ts`)
Configure a dedicated test runner (via `vitest` or Node 22 native `--experimental-strip-types --test`) hooked into `npm test`:

```typescript
// src/math/tormek.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeTonHeights, computeRequiredProjection, calibrateBase } from './tormek';

describe('Sacred Math Engine - Golden Master Vectors', () => {
  const tormekT8 = {
    rear: { hc: 29.00, o: 50.00 },
    front: { hc: 51.30, o: 131.70 },
  };

  it('Golden Master Case 1: Standard Kitchen Knife 15° Bevel (Rear Base)', () => {
    const res = computeTonHeights({
      base: 'rear',
      D: 250,
      A: 139,
      betaDeg: 15,
      Dj: 12,
      Ds: 12,
      constants: tormekT8,
    });

    assert.ok(Math.abs(res.hr - 78.90) < 0.02, `Expected hr ~78.90, got ${res.hr}`);
    assert.ok(Math.abs(res.hn - 168.48) < 0.02, `Expected hn ~168.48, got ${res.hn}`);
    assert.ok(Math.abs(res.betaEffDeg - 15.00) < 0.01, `Expected betaEff ~15.00, got ${res.betaEffDeg}`);
  });

  it('Golden Master Round-Trip Identity: Inverse Solver recovers Projection A = 139mm', () => {
    const inv = computeRequiredProjection({
      base: 'rear',
      D: 250,
      targetBetaDeg: 15,
      Dj: 12,
      Ds: 12,
      constants: tormekT8,
      fixedUsb: { mode: 'hn', value: 168.4836 },
    });

    assert.equal(inv.isReachable, true);
    assert.ok(inv.A !== null && Math.abs(inv.A - 139.00) < 0.01, `Expected A = 139.00, got ${inv.A}`);
  });

  it('Boundary Guard: throws RangeError on non-positive wheel diameter', () => {
    assert.throws(
      () => computeTonHeights({
        base: 'rear',
        D: 0,
        A: 139,
        betaDeg: 15,
        Dj: 12,
        Ds: 12,
        constants: tormekT8,
      }),
      /Invalid wheel diameter/
    );
  });
});
```

---

## 4. Caveats & Trade-offs

1. **Zustand Version Selection**:
   - `package.json` specifies React `^19.2.0`. Zustand v4 causes peer dependency warnings and potential tearing issues with React 19's concurrent features. **Zustand v5 (`zustand@^5.0.0`) must be selected** as it natively supports React 19 and `useSyncExternalStore`.
2. **`docs/MATH_REFERENCE.md` Golden Master Documentation Update**:
   - As proven empirically in Section 1.4, lines 78-107 in `docs/MATH_REFERENCE.md` contain legacy intermediate numbers that disagree with the exact round-trip formulas on lines 164-171 and `tormek.ts`. When implementation begins, `docs/MATH_REFERENCE.md` should be amended to reconcile these tables without changing the underlying validated formulas.
3. **Modal Dialog Animation States**:
   - Keeping modal open/closing booleans (`isPresetDialogOpen`, `isPresetDialogClosing`) in local component state requires moving the 200ms closing timeout into `SavePresetDialog.tsx` and `PresetManagerModal.tsx`. This is standard React practice and keeps the global store completely clean of ephemeral animation states.

---

## 5. Conclusion & Actionable Approval Roadmap

### Definitive Conclusion
The proposed migration to Zustand is the correct strategic evolution for UWGAS. However, `.agents/implementation_plan.md` must **NOT** be executed as written. It must be updated to incorporate:
1. The **Modular Slice Architecture** with isolated ephemeral UI state.
2. The **Calculation Service (`calculationService.ts`)** extracting `computeWheelResults` from `tormek.ts`.
3. The **Legacy LocalStorage Migration Bridge**.
4. The **ESLint & TypeScript Sacred Math Boundaries**.
5. The **Automated Headless Unit Test Suite** validating math vectors.

### Actionable Checklist for User Approval Prior to Implementation

Before any source code changes are initiated, the user should review and approve the following staged execution steps:

- [ ] **Step 1: Install Dependencies & Headless Test Runner**
  - Install `zustand@^5` and setup headless test script (`npm test` via Node 22 native test runner or `vitest`).
- [ ] **Step 2: Math Engine Hardening & Test Suite (`JOB-009`)**
  - Move `computeWheelResults` into `src/services/calculationService.ts`.
  - Add `Readonly<T>` interfaces, runtime validation guards, and `Object.freeze` to `src/math/tormek.ts`.
  - Implement `src/math/tormek.test.ts` validating all test vectors; wire into `npm test`.
  - Add ESLint import restrictions in `eslint.config.js`.
- [ ] **Step 3: Implement Modular Zustand Store Slices**
  - Create `src/state/slices/` (`calculatorSlice`, `progressionSlice`, `machineSlice`, `hardwareSlice`, `wheelSlice`, `presetSlice`, `settingsSlice`).
  - Create root store `src/state/store.ts` with `persist` middleware.
  - Implement legacy migration bridge (`migration.ts`) ensuring 100% preservation of existing user configurations.
- [ ] **Step 4: Implement Ephemeral UI Store & Calculation Hook**
  - Create `src/state/useUIStore.ts` for view switching and setup drawer state.
  - Create `src/services/calculationService.ts` exposing `useWheelResults()`.
- [ ] **Step 5: Refactor Components to Atomic Selectors**
  - Refactor `App.tsx` from 759 lines down to a clean shell (< 150 lines) handling only top-level view routing and layout.
  - Connect `GlobalSetupCard`, `ProgressionView`, `WheelManagerView`, `MachineManagerView`, `HardwareManagerView`, and modals to atomic store selectors.
  - Move JSON import/export handler into a dedicated store action.
- [ ] **Step 6: Execute Verification Gate**
  - Ensure `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` all pass with 0 errors.

---

## 6. Verification Method

Independent verification of the observations and findings in this report can be conducted using the following commands:

1. **Verify Math Formulas & Test Discrepancy**:
   ```bash
   node scratch/test_math.mjs
   ```
   *Expected Result*: Demonstrates exact round-trip identity on the inverse solver ($168.48\text{ mm} \leftrightarrow 139.00\text{ mm}$), confirming formula consistency while highlighting the documentation drift in `docs/MATH_REFERENCE.md`.

2. **Verify App.tsx Complexity & Prop Count**:
   ```bash
   wc -l src/App.tsx
   grep -c "useState" src/App.tsx
   ```
   *Expected Result*: Confirms 759 total lines and 22 distinct `useState` declarations.

3. **Verify Absence of Unit Tests**:
   ```bash
   npm test
   ```
   *Expected Result*: Outputs `(no tests defined yet)` and exits 0, confirming the complete absence of automated CI math validation.

4. **Verify ESLint Configuration**:
   ```bash
   grep -n "no-restricted-imports" eslint.config.js
   ```
   *Expected Result*: Returns no matches, confirming the current lack of architectural import barriers protecting `src/math/`.
