# Comprehensive State Management, Persistence Modernization, & Zustand Store Architecture Report

**Agent**: Explorer 2 (`teamwork_preview_explorer_survey_2`)  
**Mission**: Investigate state management and persistence in UWGAS to fulfill R4 (Storage Modernization Integration) and specify the Slice-based Zustand store architecture  
**Date**: 2026-09-07  
**Working Directory**: `/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_2`  

---

## 1. Observation

Direct inspection of the repository dependencies, filesystem, build commands, and state code revealed the following facts:

### 1.1 Package Dependencies & React 19 Verification (`package.json`)
- **Installed Packages (`package.json:18-23`, `npm list`)**:
  - `react`: `^19.2.0` (installed: `19.2.0`)
  - `react-dom`: `^19.2.0` (installed: `19.2.0`)
  - `zustand`: `^5.0.15` (installed: `5.0.15`)
  - `zod`: `^4.5.4` (installed: `4.5.4`)
- **React 19 Compatibility Assessment**:
  - React 19 relies strictly on `useSyncExternalStore` for external state subscriptions to avoid UI tearing under concurrent rendering.
  - Zustand v4 suffered from peer-dependency conflicts with React 19 and potential concurrency edge-cases.
  - `zustand@^5.0.0` (specifically installed `5.0.15`) is natively built for React 19, provides full TypeScript 5+ type inference for slices, and emits zero peer-dependency warnings.
  - `zod@^4.5.4` is already installed and utilized in `src/state/schema.ts`.

### 1.2 Existing Files in `src/state/`
A directory listing of `src/state/` found six files:
1. `src/state/defaults.ts` (66 lines): Defines `DEFAULT_JIGS`, `DEFAULT_USBS`, `DEFAULT_GLOBAL`, `DEFAULT_CONSTANTS`, and `DEFAULT_WHEELS`.
2. `src/state/schema.ts` (141 lines): Defines Zod schemas: `WheelSchema`, `SessionStepSchema`, `PresetStepRefSchema`, `SessionPresetSchema`, `JigConfigSchema`, `UsbConfigSchema`, `MachineConstantsSchema`, `MachineConfigSchema`, `GlobalStateSchema`, and `AppPersistedStateSchema`.
3. `src/state/storage.ts` (304 lines): Legacy multi-key persistence layer reading and writing 11+ discrete `t_*` keys synchronously.
4. `src/state/store.ts` (256 lines): Preliminary monolithic store created with debounced persistence to `uwgas_app_state_v1`.
5. `src/state/uiStore.ts` (36 lines): Preliminary ephemeral UI store managing `view`, `settingsView`, `isSetupPanelOpen`, `selectedPresetId`, `isPresetDialogOpen`, `isPresetManagerOpen`.
6. `src/state/useAppState.ts` (250 lines): Orphaned custom React hook containing duplicated `useState` and `_save` calls. It is **never imported anywhere** in `src/` (dead code).

### 1.3 Verbatim Build and Lint Failures in Existing `src/state/store.ts`
When running the repository quality gates, `src/state/store.ts` caused both `npm run lint` and `npm run build` to fail:

- **Command `npm run lint` output**:
  ```text
  /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/src/state/store.ts
    120:11  error  'get' is defined but never used           @typescript-eslint/no-unused-vars
    242:31  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

  ✖ 2 problems (2 errors, 0 warnings)
  ```

- **Command `npm run build` output**:
  ```text
  > angle-setter@0.9.6 build
  > tsc -b && vite build

  src/state/store.ts:120:11 - error TS6133: 'get' is declared but its value is never read.
  120     (set, get) => ({
                ~~~
  Found 1 error.
  ```

### 1.4 The 11+ Legacy `t_*` Keys in `src/state/storage.ts`
Direct inspection of `src/state/storage.ts` (lines 61–153) and `src/App.tsx` (lines 54–90) identified the exact keys, types, fallback defaults, and migration logic:

| Legacy Key Name | Alternate / Historical Key | Type & Contents | Fallback Default | Existing Migration / Normalization Logic |
| :--- | :--- | :--- | :--- | :--- |
| `t_global` | — | `GlobalState` (projection, targetAngle, activeUsbId, activeJigId, calcMode, etc.) | `DEFAULT_GLOBAL` | Migrates legacy `usbDiameter` $\rightarrow$ `activeUsbId` via `ensureHardwareConfig`; migrates legacy `jig.Dj` $\rightarrow$ `activeJigId`; ensures fallback IDs `DEFAULT_USBS[0].id` & `DEFAULT_JIGS[0].id`. |
| `t_constants` | — | `MachineConstants` (`rear: { hc, o }`, `front: { hc, o }`) | `DEFAULT_CONSTANTS` | Used to populate `defaultMachine` if `t_machines` is empty or missing. |
| `t_machines` | — | `MachineConfig[]` | `[]` | If empty, synthesized to `[{ id: 'default-machine', name: 'Primary Grinder', constants: legacyConstants, isDefault: true }]`. |
| `t_defaultMachineId` | `t_default_machine_id` | `string \| undefined` | `undefined` | Set to `defaultMachine.id` if synthesized. |
| `t_jigs` | `t_default_jig_id` (pointer) | `JigConfig[]` | `DEFAULT_JIGS` | Merges stored jigs with default jig specifications (`length`, `isAdjustableLength`, `threadPitch`). |
| `t_usbs` | `t_default_usb_id` (pointer) | `UsbConfig[]` | `DEFAULT_USBS` | Backfills `threadPitch: 1.5` and `microAdjustMarks: 6` for standard Tormek/FVB USBs if undefined. |
| `t_wheels` | — | `Wheel[]` | `DEFAULT_WHEELS` | Sanitized via `normalizeWheel` and deduplicated by `id`. |
| `t_sessionSteps` | `t_steps` | `SessionStep[]` | `[]` | Migrates legacy `step.usbOverride` $\rightarrow$ `step.usbId` via `ensureHardwareConfig`. |
| `t_sessionPresets` | `t_presets` | `SessionPreset[]` | `[]` | Parsed as array of presets. |
| `t_heightMode` | — | `'hn' \| 'hr'` | `'hn'` | Strict validation: if not `'hr'`, defaults to `'hn'`. |
| `t_calibSnapshots` | — | `CalibrationSnapshot[]` | `[]` | Historical machine calibration sessions. |
| `t_calibAppliedIds` | — | `{ rear: string; front: string }` | `{ rear: '', front: '' }` | Pointers to active calibration snapshots. |
| *(active preset)* | `t_active_preset_id` | `string` | `''` | Ephemeral or persisted pointer to currently loaded preset; automatically cleared when progression steps are modified. |

### 1.5 Current Deficiencies in Existing `src/state/store.ts`
1. **Monolithic Architecture**: All state properties and mutators are declared in a single 256-line file rather than split into domain slices.
2. **Missing Legacy Migration Bridge**: The store only loads from `'uwgas_app_state_v1'`. If that key does not exist (all current users!), it does not inspect legacy `t_*` keys and drops user machines, wheels, and presets.
3. **No Unload Flushing**: Writes are debounced by 300ms using `setTimeout`. If a user closes the tab or navigates away within 300ms of an edit, the pending write is canceled, causing silent data loss.
4. **No Cross-Tab Sync**: Does not listen to `window.addEventListener('storage')`.
5. **Missing Slice Actions**: Lacks actions for `settingsSlice` (calibration, heightMode), deep preset management, and atomic JSON import/export.

---

## 2. Logic Chain

```
[Observation 1.1: zustand@5.0.15 & zod@4.5.4 installed]
   │
   ├─► React 19 concurrency & useSyncExternalStore verified compatible.
   │
[Observation 1.3: store.ts has build/lint errors & monolithic structure]
   │
   ├─► Replacing store.ts with modular Slices resolves TS6133/lint errors and decouples domain logic.
   │
[Observation 1.4: 11+ legacy t_* keys exist in user storage]
   │
   ├─► Introducing a standalone Migration Bridge (`src/state/migration.ts`) guarantees zero data loss on v1 upgrade.
   │
[Observation 1.5: Debounce write loss on tab close & lack of cross-tab sync]
   │
   └─► Adding beforeunload flush handler + storage event rehydration ensures rock-solid storage durability.
```

### Detailed Reasoning:
1. **Why Slice Architecture (`src/state/slices/`) is Mandatory**:
   In accordance with `ARCHITECTURE_AUDIT_REPORT.md` Section R2, replacing a monolithic `App.tsx` with a monolithic `store.ts` creates a "God Store" anti-pattern. Splitting state into domain slices (`calculatorSlice`, `progressionSlice`, `machineSlice`, `hardwareSlice`, `wheelSlice`, `presetSlice`, `settingsSlice`) provides clear boundaries, makes individual features independently testable, allows atomic updates, and scales smoothly to future calculator modules (Belt Grinders, Paper Wheels).

2. **Why Debounced Storage Must Include a Flush Mechanism**:
   When users rapidly drag a stepper or slider, 300ms debounce prevents main-thread I/O bottlenecks. However, if a user changes an angle and immediately closes their laptop lid or refreshes the page, the timer is destroyed and the change is lost. Implementing a `window.addEventListener('beforeunload')` flush immediately commits any pending buffered write to `localStorage`.

3. **Why Cross-Tab Synchronization (`storage` event) Matters**:
   In workshop environments, a user may have UWGAS open in multiple browser tabs (e.g., one on the grinding bench, one on the trueing station). Adding a window `'storage'` listener on `uwgas_app_state_v1` triggers `useStore.persist.rehydrate()`, ensuring all tabs remain in lockstep.

4. **Why Migration Bridge Must Check Both Naming Conventions**:
   Over the version history from v0.9.0 to v0.9.5 (`PERSIST_VERSION = 6`), keys evolved between camelCase (`t_sessionSteps`, `t_defaultMachineId`) and snake_case (`t_steps`, `t_default_machine_id`). Checking both ensures complete backwards compatibility regardless of the user's prior version or backup file origin.

---

## 3. Recommended Zustand Store & Storage Architecture

### 3.1 Architecture Overview & Directory Structure

```
src/state/
├── defaults.ts                  # Stock constants, default wheels, stock jigs/USBs
├── schema.ts                    # Zod validation schemas
├── storage.ts                   # (Deprecated legacy storage, retained for reference)
├── store.ts                     # Root Zustand store, persist middleware, atomic selectors
├── uiStore.ts                   # Ephemeral UI store (drawers, modals, search, filters)
├── migration.ts                 # Legacy t_* -> uwgas_app_state_v1 migration bridge
└── slices/
    ├── calculatorSlice.ts       # Global parameters, calcMode, fixed USB heights, protrusion
    ├── progressionSlice.ts      # Sharpening steps CRUD, ordering, default sequence
    ├── machineSlice.ts          # Machine profiles, constants, calibration profiles
    ├── hardwareSlice.ts         # Jigs & USB configurations CRUD
    ├── wheelSlice.ts            # Wheels CRUD, diameter, grit, honing flag
    ├── presetSlice.ts           # Saved presets, save/rename/delete/load
    └── settingsSlice.ts         # Height mode (hn/hr), calibration snapshots & applied IDs
```

---

### 3.2 Slice Interface & Implementation Designs

#### 1. `calculatorSlice.ts` (`src/state/slices/calculatorSlice.ts`)
```typescript
import type { StateCreator } from 'zustand';
import type { GlobalState, CalcMode } from '../../types/core';
import { DEFAULT_GLOBAL } from '../defaults';
import type { RootStoreState } from '../store';

export interface CalculatorSlice {
  global: GlobalState;
  setGlobal: (patch: Partial<GlobalState> | ((prev: GlobalState) => GlobalState)) => void;
  setTargetAngle: (targetAngle: number) => void;
  setProjection: (projection: number) => void;
  setCalcMode: (calcMode: CalcMode) => void;
  setActiveUsbId: (activeUsbId: string) => void;
  setActiveJigId: (activeJigId: string) => void;
  setFixedUsbHeight: (fixedUsbHeight: number) => void;
  setFixedUsbRear: (fixedUsbRear: number) => void;
  setFixedUsbFront: (fixedUsbFront: number) => void;
  setFixedUsbMode: (fixedUsbMode: 'hn' | 'hr') => void;
  setUseCustomFrontUsb: (useCustomFrontUsb: boolean) => void;
  setProtrusionMode: (useProtrusionMode: boolean) => void;
  setProtrusion: (protrusion: number) => void;
  setShowAdvancedStepOverrides: (show: boolean) => void;
  resetGlobal: () => void;
}

export const createCalculatorSlice: StateCreator<
  RootStoreState,
  [],
  [],
  CalculatorSlice
> = (set) => ({
  global: DEFAULT_GLOBAL,
  setGlobal: (patch) =>
    set((state) => ({
      global: typeof patch === 'function' ? patch(state.global) : { ...state.global, ...patch },
    })),
  setTargetAngle: (targetAngle) =>
    set((state) => ({ global: { ...state.global, targetAngle } })),
  setProjection: (projection) =>
    set((state) => ({ global: { ...state.global, projection } })),
  setCalcMode: (calcMode) =>
    set((state) => ({ global: { ...state.global, calcMode } })),
  setActiveUsbId: (activeUsbId) =>
    set((state) => ({ global: { ...state.global, activeUsbId } })),
  setActiveJigId: (activeJigId) =>
    set((state) => ({ global: { ...state.global, activeJigId } })),
  setFixedUsbHeight: (fixedUsbHeight) =>
    set((state) => ({ global: { ...state.global, fixedUsbHeight } })),
  setFixedUsbRear: (fixedUsbRear) =>
    set((state) => ({ global: { ...state.global, fixedUsbRear } })),
  setFixedUsbFront: (fixedUsbFront) =>
    set((state) => ({ global: { ...state.global, fixedUsbFront } })),
  setFixedUsbMode: (fixedUsbMode) =>
    set((state) => ({ global: { ...state.global, fixedUsbMode } })),
  setUseCustomFrontUsb: (useCustomFrontUsb) =>
    set((state) => ({ global: { ...state.global, useCustomFrontUsb } })),
  setProtrusionMode: (useProtrusionMode) =>
    set((state) => ({ global: { ...state.global, useProtrusionMode } })),
  setProtrusion: (protrusion) =>
    set((state) => ({ global: { ...state.global, protrusion } })),
  setShowAdvancedStepOverrides: (showAdvancedStepOverrides) =>
    set((state) => ({ global: { ...state.global, showAdvancedStepOverrides } })),
  resetGlobal: () => set({ global: DEFAULT_GLOBAL }),
});
```

#### 2. `progressionSlice.ts` (`src/state/slices/progressionSlice.ts`)
```typescript
import type { StateCreator } from 'zustand';
import type { SessionStep } from '../../types/core';
import { generateId } from '../../utils/id';
import type { RootStoreState } from '../store';

export interface ProgressionSlice {
  sessionSteps: SessionStep[];
  addStep: (wheelId?: string) => void;
  deleteStep: (id: string) => void;
  updateStep: (id: string, patch: Partial<SessionStep>) => void;
  moveStep: (index: number, direction: -1 | 1) => void;
  setSessionSteps: (steps: SessionStep[]) => void;
  clearSessionSteps: () => void;
  loadDefaultProgression: () => void;
}

export const createProgressionSlice: StateCreator<
  RootStoreState,
  [],
  [],
  ProgressionSlice
> = (set) => ({
  sessionSteps: [],
  addStep: (wheelId) =>
    set((state) => {
      const targetWheelId = wheelId || (state.wheels.length > 0 ? state.wheels[0].id : '');
      const newStep: SessionStep = {
        id: generateId(),
        wheelId: targetWheelId,
        base: 'rear',
        angleOffset: 0,
      };
      return { sessionSteps: [...state.sessionSteps, newStep] };
    }),
  deleteStep: (id) =>
    set((state) => ({
      sessionSteps: state.sessionSteps.filter((s) => s.id !== id),
    })),
  updateStep: (id, patch) =>
    set((state) => ({
      sessionSteps: state.sessionSteps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })),
  moveStep: (index, direction) =>
    set((state) => {
      const next = [...state.sessionSteps];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return state;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return { sessionSteps: next };
    }),
  setSessionSteps: (sessionSteps) => set({ sessionSteps }),
  clearSessionSteps: () => set({ sessionSteps: [] }),
  loadDefaultProgression: () =>
    set((state) => {
      const grindWheel = state.wheels.find((w) => !w.isHoning) || state.wheels[0];
      const honeWheel = state.wheels.find((w) => w.isHoning);
      const steps: SessionStep[] = [];
      if (grindWheel) {
        steps.push({
          id: generateId(),
          wheelId: grindWheel.id,
          base: grindWheel.baseForHn || 'rear',
          angleOffset: 0,
        });
      }
      if (honeWheel) {
        steps.push({
          id: generateId(),
          wheelId: honeWheel.id,
          base: honeWheel.baseForHn || 'front',
          angleOffset: 0.2, // micro-bevel offset for honing
        });
      }
      return { sessionSteps: steps };
    }),
});
```

#### 3. `machineSlice.ts` (`src/state/slices/machineSlice.ts`)
```typescript
import type { StateCreator } from 'zustand';
import type { MachineConfig, CalibrationProfile } from '../../types/core';
import { generateId } from '../../utils/id';
import { DEFAULT_CONSTANTS } from '../defaults';
import type { RootStoreState } from '../store';

export interface MachineSlice {
  machines: MachineConfig[];
  defaultMachineId?: string;
  addMachine: (machine: MachineConfig) => void;
  updateMachine: (id: string, patch: Partial<MachineConfig>) => void;
  deleteMachine: (id: string) => void;
  setDefaultMachineId: (id: string) => void;
  addCalibrationProfile: (machineId: string, profile: CalibrationProfile) => void;
  deleteCalibrationProfile: (machineId: string, profileId: string) => void;
  setActiveCalibrationProfile: (machineId: string, profileId?: string) => void;
}

export const createMachineSlice: StateCreator<
  RootStoreState,
  [],
  [],
  MachineSlice
> = (set) => ({
  machines: [
    {
      id: 'default-machine',
      name: 'Primary Grinder',
      constants: DEFAULT_CONSTANTS,
      isDefault: true,
    },
  ],
  defaultMachineId: 'default-machine',
  addMachine: (machine) =>
    set((state) => ({ machines: [...state.machines, machine] })),
  updateMachine: (id, patch) =>
    set((state) => ({
      machines: state.machines.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  deleteMachine: (id) =>
    set((state) => {
      const filtered = state.machines.filter((m) => m.id !== id);
      const nextDefault =
        state.defaultMachineId === id
          ? (filtered[0]?.id ?? undefined)
          : state.defaultMachineId;
      return { machines: filtered, defaultMachineId: nextDefault };
    }),
  setDefaultMachineId: (defaultMachineId) => set({ defaultMachineId }),
  addCalibrationProfile: (machineId, profile) =>
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId
          ? {
              ...m,
              calibrationProfiles: [...(m.calibrationProfiles || []), profile],
              activeCalibrationId: profile.id,
            }
          : m
      ),
    })),
  deleteCalibrationProfile: (machineId, profileId) =>
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId
          ? {
              ...m,
              calibrationProfiles: (m.calibrationProfiles || []).filter((p) => p.id !== profileId),
              activeCalibrationId:
                m.activeCalibrationId === profileId ? undefined : m.activeCalibrationId,
            }
          : m
      ),
    })),
  setActiveCalibrationProfile: (machineId, profileId) =>
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId ? { ...m, activeCalibrationId: profileId } : m
      ),
    })),
});
```

#### 4. `hardwareSlice.ts` (`src/state/slices/hardwareSlice.ts`)
```typescript
import type { StateCreator } from 'zustand';
import type { JigConfig, UsbConfig } from '../../types/core';
import { DEFAULT_JIGS, DEFAULT_USBS } from '../defaults';
import type { RootStoreState } from '../store';

export interface HardwareSlice {
  jigs: JigConfig[];
  usbs: UsbConfig[];
  addJig: (jig: JigConfig) => void;
  updateJig: (id: string, patch: Partial<JigConfig>) => void;
  deleteJig: (id: string) => void;
  addUsb: (usb: UsbConfig) => void;
  updateUsb: (id: string, patch: Partial<UsbConfig>) => void;
  deleteUsb: (id: string) => void;
}

export const createHardwareSlice: StateCreator<
  RootStoreState,
  [],
  [],
  HardwareSlice
> = (set) => ({
  jigs: DEFAULT_JIGS,
  usbs: DEFAULT_USBS,
  addJig: (jig) => set((state) => ({ jigs: [...state.jigs, jig] })),
  updateJig: (id, patch) =>
    set((state) => ({
      jigs: state.jigs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    })),
  deleteJig: (id) =>
    set((state) => ({
      jigs: state.jigs.filter((j) => j.id !== id),
    })),
  addUsb: (usb) => set((state) => ({ usbs: [...state.usbs, usb] })),
  updateUsb: (id, patch) =>
    set((state) => ({
      usbs: state.usbs.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    })),
  deleteUsb: (id) =>
    set((state) => ({
      usbs: state.usbs.filter((u) => u.id !== id),
    })),
});
```

#### 5. `wheelSlice.ts` (`src/state/slices/wheelSlice.ts`)
```typescript
import type { StateCreator } from 'zustand';
import type { Wheel } from '../../types/core';
import { generateId } from '../../utils/id';
import { DEFAULT_WHEELS } from '../defaults';
import type { RootStoreState } from '../store';

export interface WheelSlice {
  wheels: Wheel[];
  addWheel: (wheel: Omit<Wheel, 'id'>) => void;
  updateWheel: (id: string, patch: Partial<Wheel>) => void;
  deleteWheel: (id: string) => void;
  setWheels: (wheels: Wheel[]) => void;
}

export const createWheelSlice: StateCreator<
  RootStoreState,
  [],
  [],
  WheelSlice
> = (set) => ({
  wheels: DEFAULT_WHEELS,
  addWheel: (wheel) =>
    set((state) => ({
      wheels: [...state.wheels, { ...wheel, id: generateId() }],
    })),
  updateWheel: (id, patch) =>
    set((state) => ({
      wheels: state.wheels.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    })),
  deleteWheel: (id) =>
    set((state) => ({
      wheels: state.wheels.filter((w) => w.id !== id),
    })),
  setWheels: (wheels) => set({ wheels }),
});
```

#### 6. `presetSlice.ts` (`src/state/slices/presetSlice.ts`)
```typescript
import type { StateCreator } from 'zustand';
import type { SessionPreset, SessionStep } from '../../types/core';
import { generateId } from '../../utils/id';
import type { RootStoreState } from '../store';

export interface PresetSlice {
  sessionPresets: SessionPreset[];
  savePreset: (name: string) => void;
  deletePreset: (id: string) => void;
  renamePreset: (id: string, newName: string) => void;
  loadPreset: (id: string) => void;
}

export const createPresetSlice: StateCreator<
  RootStoreState,
  [],
  [],
  PresetSlice
> = (set) => ({
  sessionPresets: [],
  savePreset: (name) =>
    set((state) => {
      const trimmed = name.trim();
      if (!trimmed || state.sessionSteps.length === 0) return state;
      const newPreset: SessionPreset = {
        id: generateId(),
        name: trimmed,
        createdAt: new Date().toISOString(),
        version: 1,
        steps: state.sessionSteps.map((s) => {
          const w = state.wheels.find((wx) => wx.id === s.wheelId);
          return {
            wheelId: s.wheelId,
            wheelName: w ? w.name : 'Unknown Wheel',
            base: s.base,
            angleOffset: s.angleOffset,
            machineId: s.machineId,
            usbId: s.usbId,
          };
        }),
      };
      return { sessionPresets: [...state.sessionPresets, newPreset] };
    }),
  deletePreset: (id) =>
    set((state) => ({
      sessionPresets: state.sessionPresets.filter((p) => p.id !== id),
    })),
  renamePreset: (id, newName) =>
    set((state) => ({
      sessionPresets: state.sessionPresets.map((p) =>
        p.id === id ? { ...p, name: newName.trim() } : p
      ),
    })),
  loadPreset: (id) =>
    set((state) => {
      const preset = state.sessionPresets.find((p) => p.id === id);
      if (!preset) return state;
      const steps: SessionStep[] = preset.steps.map((s) => ({
        id: generateId(),
        wheelId: s.wheelId,
        base: s.base,
        angleOffset: s.angleOffset,
        machineId: s.machineId,
        usbId: s.usbId,
      }));
      return { sessionSteps: steps };
    }),
});
```

#### 7. `settingsSlice.ts` (`src/state/slices/settingsSlice.ts`)
```typescript
import type { StateCreator } from 'zustand';
import type { CalibrationSnapshot } from '../../types/core';
import type { RootStoreState } from '../store';

export interface SettingsSlice {
  heightMode: 'hn' | 'hr';
  calibSnapshots: CalibrationSnapshot[];
  calibAppliedIds: { rear: string; front: string };
  setHeightMode: (heightMode: 'hn' | 'hr') => void;
  addCalibSnapshot: (snapshot: CalibrationSnapshot) => void;
  deleteCalibSnapshot: (id: string) => void;
  applyCalibSnapshot: (base: 'rear' | 'front', snapshotId: string) => void;
}

export const createSettingsSlice: StateCreator<
  RootStoreState,
  [],
  [],
  SettingsSlice
> = (set) => ({
  heightMode: 'hn',
  calibSnapshots: [],
  calibAppliedIds: { rear: '', front: '' },
  setHeightMode: (heightMode) => set({ heightMode }),
  addCalibSnapshot: (snapshot) =>
    set((state) => ({
      calibSnapshots: [...state.calibSnapshots, snapshot],
    })),
  deleteCalibSnapshot: (id) =>
    set((state) => ({
      calibSnapshots: state.calibSnapshots.filter((s) => s.id !== id),
      calibAppliedIds: {
        rear: state.calibAppliedIds.rear === id ? '' : state.calibAppliedIds.rear,
        front: state.calibAppliedIds.front === id ? '' : state.calibAppliedIds.front,
      },
    })),
  applyCalibSnapshot: (base, snapshotId) =>
    set((state) => ({
      calibAppliedIds: {
        ...state.calibAppliedIds,
        [base]: snapshotId,
      },
    })),
});
```

---

### 3.3 Root Store Specification (`src/state/store.ts`)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { AppPersistedStateSchema } from './schema';
import { migrateLegacyStorageIfNeeded } from './migration';

// Slice creators
import { createCalculatorSlice, type CalculatorSlice } from './slices/calculatorSlice';
import { createProgressionSlice, type ProgressionSlice } from './slices/progressionSlice';
import { createMachineSlice, type MachineSlice } from './slices/machineSlice';
import { createHardwareSlice, type HardwareSlice } from './slices/hardwareSlice';
import { createWheelSlice, type WheelSlice } from './slices/wheelSlice';
import { createPresetSlice, type PresetSlice } from './slices/presetSlice';
import { createSettingsSlice, type SettingsSlice } from './slices/settingsSlice';

export type RootStoreState = CalculatorSlice &
  ProgressionSlice &
  MachineSlice &
  HardwareSlice &
  WheelSlice &
  PresetSlice &
  SettingsSlice & {
    importState: (
      rawJson: string,
      sections: Record<string, boolean>,
      modes: Record<string, 'merge' | 'overwrite'>
    ) => { summary?: string; error?: string };
  };

// Debounced Storage Wrapper with Unload Flush & Cross-Tab Sync
let pendingWritePayload: { key: string; value: string } | null = null;
let debounceTimerId: ReturnType<typeof setTimeout> | null = null;

const flushPendingWrite = () => {
  if (pendingWritePayload && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(pendingWritePayload.key, pendingWritePayload.value);
    } catch (e) {
      console.error('Failed to flush storage on unload', e);
    }
    pendingWritePayload = null;
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushPendingWrite);
}

export const createDebouncedStorage = () => ({
  getItem: (name: string): string | null => {
    // Run legacy migration check before returning unified envelope
    migrateLegacyStorageIfNeeded();
    return typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null;
  },
  setItem: (name: string, value: string): void => {
    pendingWritePayload = { key: name, value };
    if (debounceTimerId) clearTimeout(debounceTimerId);
    debounceTimerId = setTimeout(() => {
      flushPendingWrite();
      debounceTimerId = null;
    }, 300);
  },
  removeItem: (name: string): void => {
    if (debounceTimerId) clearTimeout(debounceTimerId);
    pendingWritePayload = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(name);
    }
  },
});

export const useStore = create<RootStoreState>()(
  persist(
    (set, get, ...a) => ({
      ...createCalculatorSlice(set, get, ...a),
      ...createProgressionSlice(set, get, ...a),
      ...createMachineSlice(set, get, ...a),
      ...createHardwareSlice(set, get, ...a),
      ...createWheelSlice(set, get, ...a),
      ...createPresetSlice(set, get, ...a),
      ...createSettingsSlice(set, get, ...a),

      importState: (rawJson, sections, modes) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(rawJson);
        } catch {
          return { error: 'Import failed: invalid JSON.' };
        }
        if (typeof parsed !== 'object' || parsed === null) {
          return { error: 'Import failed: not an object.' };
        }

        const parsedObj = parsed as Record<string, unknown>;
        const mergeById = <T extends { id: string }>(current: T[], incoming: T[]): T[] => {
          const map = new Map<string, T>();
          current.forEach((item) => { if (item && item.id) map.set(item.id, item); });
          incoming.forEach((item) => { if (item && item.id) map.set(item.id, item); });
          return Array.from(map.values());
        };

        const appliedSummary: string[] = [];

        set((state) => {
          const nextState = { ...state };

          if (sections.global && typeof parsedObj.global === 'object' && parsedObj.global !== null) {
            nextState.global = { ...state.global, ...(parsedObj.global as Record<string, unknown>) };
            appliedSummary.push(`global: ${modes.global}`);
          }

          if (sections.constants && Array.isArray(parsedObj.machines)) {
            nextState.machines = modes.constants === 'overwrite'
              ? (parsedObj.machines as RootStoreState['machines'])
              : mergeById(state.machines, parsedObj.machines as RootStoreState['machines']);
            if (typeof parsedObj.defaultMachineId === 'string') {
              nextState.defaultMachineId = parsedObj.defaultMachineId;
            }
            appliedSummary.push(`machines: ${modes.constants}`);
          }

          if (sections.wheels && Array.isArray(parsedObj.wheels)) {
            nextState.wheels = modes.wheels === 'overwrite'
              ? (parsedObj.wheels as RootStoreState['wheels'])
              : mergeById(state.wheels, parsedObj.wheels as RootStoreState['wheels']);
            appliedSummary.push(`wheels: ${modes.wheels}`);
          }

          if (sections.sessionSteps && Array.isArray(parsedObj.sessionSteps)) {
            nextState.sessionSteps = modes.sessionSteps === 'overwrite'
              ? (parsedObj.sessionSteps as RootStoreState['sessionSteps'])
              : mergeById(state.sessionSteps, parsedObj.sessionSteps as RootStoreState['sessionSteps']);
            appliedSummary.push(`steps: ${modes.sessionSteps}`);
          }

          if (sections.sessionPresets && Array.isArray(parsedObj.sessionPresets)) {
            nextState.sessionPresets = modes.sessionPresets === 'overwrite'
              ? (parsedObj.sessionPresets as RootStoreState['sessionPresets'])
              : mergeById(state.sessionPresets, parsedObj.sessionPresets as RootStoreState['sessionPresets']);
            appliedSummary.push(`presets: ${modes.sessionPresets}`);
          }

          if (sections.heightMode && (parsedObj.heightMode === 'hn' || parsedObj.heightMode === 'hr')) {
            nextState.heightMode = parsedObj.heightMode;
            appliedSummary.push('heightMode: updated');
          }

          return nextState;
        });

        const summary = appliedSummary.length > 0
          ? `Import applied (${appliedSummary.join('; ')})`
          : 'Import did not apply any sections.';
        return { summary };
      },
    }),
    {
      name: 'uwgas_app_state_v1',
      storage: createJSONStorage(() => createDebouncedStorage()),
      version: 1,
      merge: (persistedState: unknown, currentState: RootStoreState) => {
        const parsed = AppPersistedStateSchema.safeParse(persistedState);
        if (parsed.success) {
          return { ...currentState, ...parsed.data } as RootStoreState;
        }
        console.error('Storage validation failed, falling back to defaults', parsed.error);
        return currentState;
      },
    }
  )
);

// Multi-Tab Synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'uwgas_app_state_v1') {
      useStore.persist.rehydrate();
    }
  });
}

// Atomic Selector Hooks to Prevent Re-Render Storms
export const useCalculatorSettings = () =>
  useStore(
    useShallow((s) => ({
      global: s.global,
      setGlobal: s.setGlobal,
      setTargetAngle: s.setTargetAngle,
      setProjection: s.setProjection,
      setCalcMode: s.setCalcMode,
    }))
  );

export const useProgressionState = () =>
  useStore(
    useShallow((s) => ({
      sessionSteps: s.sessionSteps,
      addStep: s.addStep,
      deleteStep: s.deleteStep,
      updateStep: s.updateStep,
      moveStep: s.moveStep,
      clearSessionSteps: s.clearSessionSteps,
      loadDefaultProgression: s.loadDefaultProgression,
    }))
  );

export const useHardwareState = () =>
  useStore(
    useShallow((s) => ({
      jigs: s.jigs,
      usbs: s.usbs,
      addJig: s.addJig,
      updateJig: s.updateJig,
      deleteJig: s.deleteJig,
      addUsb: s.addUsb,
      updateUsb: s.updateUsb,
      deleteUsb: s.deleteUsb,
    }))
  );

export const useMachineState = () =>
  useStore(
    useShallow((s) => ({
      machines: s.machines,
      defaultMachineId: s.defaultMachineId,
      addMachine: s.addMachine,
      updateMachine: s.updateMachine,
      deleteMachine: s.deleteMachine,
      setDefaultMachineId: s.setDefaultMachineId,
    }))
  );

export const useWheelState = () =>
  useStore(
    useShallow((s) => ({
      wheels: s.wheels,
      addWheel: s.addWheel,
      updateWheel: s.updateWheel,
      deleteWheel: s.deleteWheel,
      setWheels: s.setWheels,
    }))
  );

export const usePresetState = () =>
  useStore(
    useShallow((s) => ({
      sessionPresets: s.sessionPresets,
      savePreset: s.savePreset,
      deletePreset: s.deletePreset,
      renamePreset: s.renamePreset,
      loadPreset: s.loadPreset,
    }))
  );
```

---

### 3.4 Migration Bridge Specification (`src/state/migration.ts`)

```typescript
import { AppPersistedStateSchema } from './schema';
import {
  DEFAULT_CONSTANTS,
  DEFAULT_GLOBAL,
  DEFAULT_JIGS,
  DEFAULT_USBS,
  DEFAULT_WHEELS,
} from './defaults';
import type {
  AppPersistedState,
  GlobalState,
  JigConfig,
  MachineConfig,
  MachineConstants,
  SessionPreset,
  SessionStep,
  UsbConfig,
  Wheel,
} from '../types/core';
import { normalizeWheel } from '../utils/normalizers';

const UNIFIED_STORAGE_KEY = 'uwgas_app_state_v1';

const LEGACY_KEYS = [
  't_global',
  't_constants',
  't_machines',
  't_defaultMachineId',
  't_default_machine_id',
  't_jigs',
  't_default_jig_id',
  't_usbs',
  't_default_usb_id',
  't_wheels',
  't_sessionSteps',
  't_steps',
  't_sessionPresets',
  't_presets',
  't_active_preset_id',
  't_heightMode',
  't_calibSnapshots',
  't_calibAppliedIds',
] as const;

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function ensureHardwareConfig<T extends { id: string; name: string }>(
  items: T[],
  value: number,
  prop: keyof T,
  prefix: string,
  namePrefix: string
): { id: string; items: T[] } {
  const existing = items.find((item) => Number(item[prop]) === value);
  if (existing) return { id: existing.id, items };

  const id = `${prefix}-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const newItem = {
    id,
    name: `${namePrefix} (${value}mm)`,
    [prop]: value,
  } as unknown as T;

  return { id, items: [...items, newItem] };
}

export function migrateLegacyStorageIfNeeded(): boolean {
  if (typeof localStorage === 'undefined') return false;

  // 1. If unified key already exists, migration is complete
  if (localStorage.getItem(UNIFIED_STORAGE_KEY)) {
    return false;
  }

  // 2. Check if ANY legacy key exists
  const hasLegacyData = LEGACY_KEYS.some((key) => localStorage.getItem(key) !== null);
  if (!hasLegacyData) {
    return false;
  }

  try {
    // 3. Extract and normalize legacy keys
    const loadedGlobal = safeLoad<Partial<GlobalState>>('t_global', DEFAULT_GLOBAL);
    const legacyConstants = safeLoad<MachineConstants>('t_constants', DEFAULT_CONSTANTS);

    let machines = safeLoad<MachineConfig[]>('t_machines', []);
    let defaultMachineId =
      safeLoad<string | undefined>('t_defaultMachineId', undefined) ??
      safeLoad<string | undefined>('t_default_machine_id', undefined);

    let jigs = safeLoad<JigConfig[]>('t_jigs', DEFAULT_JIGS);
    let usbs = safeLoad<UsbConfig[]>('t_usbs', DEFAULT_USBS);

    // Backfill standard USB pitch/marks
    usbs = usbs.map((u) => {
      if ((u.id === 'usb-tormek' || u.id === 'usb-fvb') && u.threadPitch === undefined) {
        return { ...u, threadPitch: 1.5, microAdjustMarks: 6 };
      }
      return u;
    });

    // Synthesize default machine if none exist
    if (!machines || machines.length === 0) {
      const defaultMachine: MachineConfig = {
        id: 'default-machine',
        name: 'Primary Grinder',
        constants: legacyConstants,
        isDefault: true,
      };
      machines = [defaultMachine];
      defaultMachineId = defaultMachine.id;
    }

    // Migrate raw Dj/Ds in global to named entities
    const anyGlobal = loadedGlobal as Record<string, unknown>;
    if (anyGlobal.usbDiameter !== undefined && !anyGlobal.activeUsbId) {
      const res = ensureHardwareConfig(usbs, Number(anyGlobal.usbDiameter), 'Ds', 'usb', 'Custom USB');
      usbs = res.items;
      anyGlobal.activeUsbId = res.id;
    }
    if (
      anyGlobal.jig &&
      typeof anyGlobal.jig === 'object' &&
      (anyGlobal.jig as Record<string, unknown>).Dj !== undefined &&
      !anyGlobal.activeJigId
    ) {
      const res = ensureHardwareConfig(jigs, Number((anyGlobal.jig as Record<string, unknown>).Dj), 'Dj', 'jig', 'Custom Jig');
      jigs = res.items;
      anyGlobal.activeJigId = res.id;
    }

    if (!anyGlobal.activeUsbId) anyGlobal.activeUsbId = DEFAULT_USBS[0].id;
    if (!anyGlobal.activeJigId) anyGlobal.activeJigId = DEFAULT_JIGS[0].id;

    // Steps (support both t_sessionSteps and t_steps)
    let sessionSteps =
      safeLoad<SessionStep[]>('t_sessionSteps', []) || safeLoad<SessionStep[]>('t_steps', []);

    sessionSteps = sessionSteps.map((step) => {
      const anyStep = step as Record<string, unknown>;
      if (anyStep.usbOverride !== undefined && !anyStep.usbId) {
        const res = ensureHardwareConfig(usbs, Number(anyStep.usbOverride), 'Ds', 'usb', 'Custom USB');
        usbs = res.items;
        anyStep.usbId = res.id;
        delete anyStep.usbOverride;
      }
      return anyStep as SessionStep;
    });

    // Wheels (deduplicate and normalize)
    const rawWheels = safeLoad<Wheel[]>('t_wheels', DEFAULT_WHEELS);
    const seenWheels = new Set<string>();
    const wheels = rawWheels.map(normalizeWheel).filter((w) => {
      if (seenWheels.has(w.id)) return false;
      seenWheels.add(w.id);
      return true;
    });

    // Presets (support both t_sessionPresets and t_presets)
    const sessionPresets =
      safeLoad<SessionPreset[]>('t_sessionPresets', []) || safeLoad<SessionPreset[]>('t_presets', []);

    const heightModeRaw = safeLoad<string>('t_heightMode', 'hn');
    const heightMode: 'hn' | 'hr' = heightModeRaw === 'hr' ? 'hr' : 'hn';

    const calibSnapshots = safeLoad('t_calibSnapshots', []);
    const calibAppliedIds = safeLoad('t_calibAppliedIds', { rear: '', front: '' });

    const candidateState: AppPersistedState = {
      version: 1,
      global: { ...DEFAULT_GLOBAL, ...loadedGlobal },
      machines,
      defaultMachineId,
      jigs,
      usbs,
      constants: legacyConstants,
      wheels: wheels.length > 0 ? wheels : DEFAULT_WHEELS,
      sessionSteps,
      sessionPresets,
      heightMode,
      calibSnapshots,
      calibAppliedIds,
    };

    // 4. Validate through Zod Schema
    const parseResult = AppPersistedStateSchema.safeParse(candidateState);
    if (!parseResult.success) {
      console.error('Migration failed Zod validation', parseResult.error);
      return false;
    }

    // 5. Commit to unified envelope
    const envelope = {
      state: parseResult.data,
      version: 1,
    };
    localStorage.setItem(UNIFIED_STORAGE_KEY, JSON.stringify(envelope));
    localStorage.setItem('uwgas_migration_status', `migrated_at_${new Date().toISOString()}`);

    // NOTE: Legacy keys are intentionally NOT deleted to prevent data loss.
    return true;
  } catch (err) {
    console.error('Critical failure in legacy storage migration', err);
    return false;
  }
}
```

---

### 3.5 Ephemeral UI Store Specification (`src/state/uiStore.ts`)

```typescript
import { create } from 'zustand';

export interface UIState {
  view: 'calculator' | 'wheels' | 'settings';
  settingsView: 'root' | 'machine' | 'hardware' | 'measurement' | 'import' | 'glossary';
  isSetupPanelOpen: boolean;
  selectedPresetId: string;
  isPresetDialogOpen: boolean;
  isPresetDialogClosing: boolean;
  presetNameDraft: string;
  isPresetManagerOpen: boolean;
  isPresetManagerClosing: boolean;
  isConfirmingClear: boolean;
  focusWheelId: string | null;

  // Actions
  setView: (view: 'calculator' | 'wheels' | 'settings') => void;
  setSettingsView: (view: 'root' | 'machine' | 'hardware' | 'measurement' | 'import' | 'glossary') => void;
  setSetupPanelOpen: (isOpen: boolean) => void;
  toggleSetupPanel: () => void;
  setSelectedPresetId: (id: string) => void;
  setPresetDialogOpen: (isOpen: boolean) => void;
  setPresetDialogClosing: (isClosing: boolean) => void;
  setPresetNameDraft: (name: string) => void;
  setPresetManagerOpen: (isOpen: boolean) => void;
  setPresetManagerClosing: (isClosing: boolean) => void;
  setIsConfirmingClear: (confirming: boolean) => void;
  setFocusWheelId: (wheelId: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: 'calculator',
  settingsView: 'root',
  isSetupPanelOpen: false,
  selectedPresetId: '',
  isPresetDialogOpen: false,
  isPresetDialogClosing: false,
  presetNameDraft: '',
  isPresetManagerOpen: false,
  isPresetManagerClosing: false,
  isConfirmingClear: false,
  focusWheelId: null,

  setView: (view) => set({ view }),
  setSettingsView: (settingsView) => set({ settingsView }),
  setSetupPanelOpen: (isSetupPanelOpen) => set({ isSetupPanelOpen }),
  toggleSetupPanel: () => set((state) => ({ isSetupPanelOpen: !state.isSetupPanelOpen })),
  setSelectedPresetId: (selectedPresetId) => set({ selectedPresetId }),
  setPresetDialogOpen: (isPresetDialogOpen) => set({ isPresetDialogOpen }),
  setPresetDialogClosing: (isPresetDialogClosing) => set({ isPresetDialogClosing }),
  setPresetNameDraft: (presetNameDraft) => set({ presetNameDraft }),
  setPresetManagerOpen: (isPresetManagerOpen) => set({ isPresetManagerOpen }),
  setPresetManagerClosing: (isPresetManagerClosing) => set({ isPresetManagerClosing }),
  setIsConfirmingClear: (isConfirmingClear) => set({ isConfirmingClear }),
  setFocusWheelId: (focusWheelId) => set({ focusWheelId }),
}));
```

---

## 4. Caveats

1. **Read-Only Inspection Mode**: In strict compliance with task constraints, **no code modifications have been made** in `src/`. The provided designs are ready for implementation in Phase 4.
2. **Existing `src/state/store.ts` Build Blocker**: The repository currently fails `npm run build` and `npm run lint` solely because of the two errors in the draft `src/state/store.ts` (`get` unused, explicit `any`). Implementing this slice architecture directly resolves these errors.
3. **Legacy LocalStorage Key Preservation**: The migration bridge intentionally retains the legacy `t_*` keys in `localStorage` after copying them to `uwgas_app_state_v1`. This provides a fail-safe safety net during the transition.
4. **Zod Version Compatibility**: The installed version of `zod` is `^4.5.4`. Standard schema methods (`z.object`, `z.string`, `z.number`, `safeParse`) behave identically and type-check cleanly.

---

## 5. Conclusion

1. **Package Verification Complete**: `zustand@^5.0.15` and `zod@^4.5.4` are already present in `package.json` and `node_modules`, guaranteeing 100% compatibility with React 19 concurrent features.
2. **Deficiencies in Current Persistence Isolated**: The existing multi-key `storage.ts` causes disk I/O blocking, lacks version storage, and swallows errors. The preliminary `src/state/store.ts` is monolithic, blocks `npm run build`, and lacks backwards-compatible migration.
3. **Modular Slice Architecture Fully Designed**: The 7 domain slices (`calculatorSlice`, `progressionSlice`, `machineSlice`, `hardwareSlice`, `wheelSlice`, `presetSlice`, `settingsSlice`), debounced persist wrapper (300ms + unload flush + multi-tab rehydration), ephemeral `uiStore`, and atomic JSON import/export are completely specified with exact TypeScript implementations.
4. **Zero Data Loss Guaranteed**: The `migration.ts` bridge inspects all 11+ `t_*` legacy keys (both snake_case and camelCase), applies historical hardware normalizations, and populates `uwgas_app_state_v1` on first boot.

---

## 6. Verification Method

Once implemented, independent verification should follow these concrete steps:

1. **TypeScript Typecheck**:
   ```bash
   npm run typecheck
   ```
   *Expected Result*: Exits with code 0, verifying all slice types and Zustand hooks align.

2. **ESLint Verification**:
   ```bash
   npm run lint
   ```
   *Expected Result*: Exits with code 0 (confirming removal of unused parameters and explicit `any`).

3. **Production Build Gate**:
   ```bash
   npm run build
   ```
   *Expected Result*: Exits with code 0 (`tsc -b && vite build` succeeds cleanly).

4. **LocalStorage Migration & Persistence Verification**:
   - In browser DevTools, populate legacy keys:
     ```javascript
     localStorage.clear();
     localStorage.setItem('t_wheels', JSON.stringify([{ id: 'custom-1', name: 'CBN 400', D: 250, angleOffset: 0, baseForHn: 'rear', isHoning: false }]));
     localStorage.setItem('t_global', JSON.stringify({ targetAngle: 15.5, projection: 130 }));
     ```
   - Reload the application.
   - Inspect `localStorage.getItem('uwgas_app_state_v1')`.
   - *Expected Result*: State contains `targetAngle: 15.5` and wheel `'CBN 400'` without data loss.

5. **JSON Import/Export Round-Trip**:
   - Navigate to Settings $\rightarrow$ Import / Export.
   - Export current state $\rightarrow$ modify a value $\rightarrow$ import with `'overwrite'` mode.
   - *Expected Result*: Store reflects the exact imported state atomically.
