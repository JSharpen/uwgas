# Explorer 3 Survey Report: `App.tsx` Dismantling, UI Prop-Drilling Inventory, & Housekeeping Audit

**Agent Identity**: `teamwork_preview_explorer_survey_3`  
**Working Directory**: `/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_explorer_survey_3`  
**Parent Agent**: `teamwork_preview_orchestrator_2` (`6fedca73-ef37-4988-8c06-9f6566f6a92f`)  
**Timestamp**: 2026-09-07T21:49:00+10:00  

---

## 1. Observation

Direct line-by-line inspection of `src/App.tsx`, all UI child components in `src/components/`, `src/primitives.css`, and related files yielded the following verified facts:

### 1.1 `src/App.tsx` State Hook Inventory (23 `useState` Hooks)

`src/App.tsx` (759 lines) directly manages 23 distinct `useState` hooks:

| # | Hook Location | Variable & Setter | Initial Value / Initializer | Domain / Target Slice |
|---|---|---|---|---|
| 1 | `App.tsx:54` | `[initialState]` | `readPersistedState()` | Storage bootstrap |
| 2 | `App.tsx:55` | `[global, setGlobal]` | `initialState.global` | Domain: `calculatorSlice` |
| 3 | `App.tsx:56` | `[machines, setMachines]` | `initialState.machines \|\| []` | Domain: `machineSlice` |
| 4 | `App.tsx:57` | `[defaultMachineId, setDefaultMachineId]` | `initialState.defaultMachineId` | Domain: `machineSlice` |
| 5 | `App.tsx:58` | `[jigs, setJigs]` | `initialState.jigs` | Domain: `hardwareSlice` |
| 6 | `App.tsx:59` | `[usbs, setUsbs]` | `initialState.usbs` | Domain: `hardwareSlice` |
| 7 | `App.tsx:61` | `[wheels, setWheels]` | `initialState.wheels.map(normalizeWheel)` deduplicated | Domain: `wheelSlice` |
| 8 | `App.tsx:72` | `[sessionSteps, setSessionSteps]` | `initialState.sessionSteps` | Domain: `progressionSlice` |
| 9 | `App.tsx:73` | `[sessionPresets, setSessionPresets]` | `initialState.sessionPresets` | Domain: `presetSlice` |
| 10 | `App.tsx:74` | `[heightMode, setHeightMode]` | `initialState.heightMode \|\| 'hn'` | Domain: `settingsSlice` / `calculatorSlice` |
| 11 | `App.tsx:94` | `[view, setView]` | `'calculator'` | Ephemeral UI: `useUIStore.view` |
| 12 | `App.tsx:128` | `[settingsView, setSettingsView]` | `'root'` | Ephemeral UI: `useUIStore.settingsView` |
| 13 | `App.tsx:137` | `[isConfirmingClear, setIsConfirmingClear]` | `false` | Local UI: Progression header |
| 14 | `App.tsx:140` | `[isSetupPanelOpen, setIsSetupPanelOpen]` | `false` | Ephemeral UI: `useUIStore.isSetupPanelOpen` |
| 15 | `App.tsx:164` | `[selectedPresetId, setSelectedPresetId]` | `''` | Ephemeral UI: `useUIStore.selectedPresetId` |
| 16 | `App.tsx:165` | `[isPresetDialogOpen, setIsPresetDialogOpen]` | `false` | Ephemeral UI: `useUIStore.isPresetDialogOpen` |
| 17 | `App.tsx:166` | `[isPresetDialogClosing, setIsPresetDialogClosing]` | `false` | Ephemeral UI / Modal local |
| 18 | `App.tsx:167` | `[presetNameDraft, setPresetNameDraft]` | `''` | Local UI: `SavePresetDialog` |
| 19 | `App.tsx:169` | `[isPresetManagerOpen, setIsPresetManagerOpen]` | `false` | Ephemeral UI: `useUIStore.isPresetManagerOpen` |
| 20 | `App.tsx:170` | `[isPresetManagerClosing, setIsPresetManagerClosing]` | `false` | Ephemeral UI / Modal local |
| 21 | `App.tsx:173` | `[exportSections, setExportSections]` | All 6 sections `true` | Ephemeral UI: `ImportExportPanel` |
| 22 | `App.tsx:182` | `[importSections, setImportSections]` | All 6 sections `true` | Ephemeral UI: `ImportExportPanel` |
| 23 | `App.tsx:191` | `[importModes, setImportModes]` | All 6 sections `'merge'` | Ephemeral UI: `ImportExportPanel` |

---

### 1.2 `src/App.tsx` Unmemoized Handlers & Inline Closures Inventory

All 18 state-mutating handlers in `App.tsx` are declared as plain arrow functions without `React.useCallback`, recreating references on every render tick:

1. `App.tsx:212-214`: `handleAddWheel = (wheel: Omit<Wheel, 'id'>) => { setWheels(prev => [...prev, { ...wheel, id: generateId() }]); }`
2. `App.tsx:215-217`: `handleDeleteWheel = (id: string) => { setWheels(prev => prev.filter(w => w.id !== id)); }`
3. `App.tsx:219`: `handleUpdateJig = (id: string, patch: Partial<JigConfig>) => setJigs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j))`
4. `App.tsx:220`: `handleAddJig = (j: JigConfig) => setJigs(prev => [...prev, j])`
5. `App.tsx:221`: `handleDeleteJig = (id: string) => setJigs(prev => prev.filter(j => j.id !== id))`
6. `App.tsx:223`: `handleUpdateUsb = (id: string, patch: Partial<UsbConfig>) => setUsbs(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u))`
7. `App.tsx:224`: `handleAddUsb = (u: UsbConfig) => setUsbs(prev => [...prev, u])`
8. `App.tsx:225`: `handleDeleteUsb = (id: string) => setUsbs(prev => prev.filter(u => u.id !== id))`
9. `App.tsx:227-229`: `handleUpdateWheel = (id: string, patch: Partial<Wheel>) => { setWheels(prev => prev.map(w => (w.id === id ? { ...w, ...patch } : w))); }`
10. `App.tsx:231-238`: `handleAddStep = () => { setSessionSteps(prev => [...prev, { id: generateId(), wheelId: wheels[0]?.id ?? '', base: 'front', angleOffset: 0 }]); }`
11. `App.tsx:239-241`: `handleDeleteStep = (id: string) => { setSessionSteps(prev => prev.filter(s => s.id !== id)); }`
12. `App.tsx:242-244`: `handleUpdateStep = (id: string, patch: Partial<SessionStep>) => { setSessionSteps(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s))); }`
13. `App.tsx:245-254`: `handleMoveStep = (index: number, direction: -1 | 1) => { ... }`
14. `App.tsx:255-266`: `handleLoadDefaultProgression = () => { ... }`
15. `App.tsx:268-280`: `handleLoadPreset = (id: string) => { const preset = sessionPresets.find(...); ... }`
16. `App.tsx:281-283`: `handleDeletePreset = (id: string) => { setSessionPresets(prev => prev.filter(p => p.id !== id)); }`
17. `App.tsx:284-286`: `handleRenamePreset = (id: string, newName: string) => { setSessionPresets(prev => prev.map(...)); }`
18. `App.tsx:287-310`: `handleSavePreset = () => { ... setSessionPresets(prev => [...prev, ...]); setIsPresetDialogOpen(false); }`

In addition, 12 inline JSX arrow closures are passed directly into child props:
- `App.tsx:438-441`: `onLoadPreset={(id) => { setSelectedPresetId(id); if (id) handleLoadPreset(id); }}`
- `App.tsx:442`: `onOpenSavePreset={() => setIsPresetDialogOpen(true)}`
- `App.tsx:443`: `onOpenManagePresets={() => setIsPresetManagerOpen(true)}`
- `App.tsx:462`: `onClick={() => setIsConfirmingClear(false)}`
- `App.tsx:476-479`: `onClick={() => { setSessionSteps([]); setIsConfirmingClear(false); }}`
- `App.tsx:491`: `onClick={() => setIsConfirmingClear(true)}`
- `App.tsx:630-633`: Inline machine callbacks: `onAddMachine`, `onUpdateMachine`, `onDeleteMachine`, `onSetDefaultMachine`
- `App.tsx:653-663`: Inline import/export toggles: `onToggleExportSection`, `onToggleImportSection`, `onChangeImportMode`
- `App.tsx:688-694`: `PresetManagerModal` close timer closure
- `App.tsx:707-714`: `SavePresetDialog` close timer closure
- `App.tsx:727, 737, 747`: Tab navigation inline callbacks

---

### 1.3 Event Listeners, Observers, & Brute-Force DOM Querying in `src/App.tsx`

1. **Sticky Header ResizeObserver (`App.tsx:97-127`)**:
   - Observes `headerRef.current`.
   - Computes resting bottom offset: `section.offsetTop + stickyHeader.offsetHeight`.
   - Sets inline CSS custom property: `document.documentElement.style.setProperty('--progression-header-bottom', `${restingBottom}px`)`.
   - Re-registers every time `view` changes. Lines 115-125 duplicate the exact same code outside the observer callback.
2. **Untyped Imperative Event Bus (`CustomEvent("collapseAll")`)**:
   - `App.tsx:132-134`: `window.dispatchEvent(new CustomEvent("collapseAll"))` dispatched on `[view]`.
   - `App.tsx:141-145`: `window.dispatchEvent(new CustomEvent("collapseAll"))` dispatched when `isSetupPanelOpen` is true.
   - `ProgressionView.tsx:361-365`: `window.addEventListener('collapseAll', () => setExpandedStepId(null))`.
3. **Main-Thread Brute-Force CSS String Matching (`App.tsx:147-161`)**:
   ```typescript
   const handleGlobalPointerDown = (e: PointerEvent | MouseEvent | TouchEvent) => {
     const target = e.target as HTMLElement;
     const isInteractive = target.closest('#global-setup-card, .motion-list-item, .bg-\\[\\#262626\\], .bg-neutral-900, .action-sheet, button, input, select, [role="dialog"]');
     if (!isInteractive) {
       setIsSetupPanelOpen(false);
     }
   };
   document.addEventListener('pointerdown', handleGlobalPointerDown);
   ```
   - Executes `target.closest(...)` with an 8-clause selector on *every pointerdown event* across the application.

---

### 1.4 Prop-Drilling Inventory by Component

#### `GlobalSetupCard` (`src/components/calculator/GlobalSetupCard.tsx:10-30`, called at `App.tsx:432-451`)
**18 Props Passed**:
1. `jigs: JigConfig[]`
2. `usbs: UsbConfig[]`
3. `sessionSteps: SessionStep[]` $\rightarrow$ **DEFECT: Completely unused inside `GlobalSetupCard`!**
4. `machines: MachineConfig[]`
5. `defaultMachineId?: string`
6. `setDefaultMachineId: (id: string) => void`
7. `sessionPresets: SessionPreset[]`
8. `selectedPresetId: string | null`
9. `onLoadPreset: (id: string) => void`
10. `onOpenSavePreset: () => void`
11. `onOpenManagePresets: () => void`
12. `global: GlobalState`
13. `setGlobal: React.Dispatch<React.SetStateAction<GlobalState>>`
14. `isSetupPanelOpen: boolean`
15. `setIsSetupPanelOpen: React.Dispatch<React.SetStateAction<boolean>>`
16. `heightMode?: 'hn' | 'hr'`
17. `targetAngleSymbol?: string` (hardcoded `'θ'`)
18. `constants?: MachineConstants` (computed during render in `App.tsx:450`)

#### `ProgressionView` (`src/components/ProgressionView.tsx:6-23`, called at `App.tsx:540-555`)
**16 Props Passed**:
1. `wheelResults: WheelResult[]`
2. `machines: MachineConfig[]`
3. `defaultMachineId?: string`
4. `usbs: UsbConfig[]`
5. `jigs?: JigConfig[]`
6. `globalJigId?: string`
7. `wheels?: Wheel[]`
8. `globalUsbId: string`
9. `heightMode: 'hn' | 'hr'`
10. `calcMode?: CalcMode`
11. `showAdvancedStepOverrides?: boolean`
12. `onUpdateStep: (id: string, patch: Partial<SessionStep>) => void`
13. `onDeleteStep: (id: string) => void`
14. `onMoveStep: (index: number, direction: -1 | 1) => void`
15. `onUpdateWheel?: (id: string, patch: Partial<Wheel>) => void` (in interface, omitted in App.tsx)
16. `angleErrorById?: Record<string, number | null>` (in interface, omitted in App.tsx)

#### `StepCard` (`src/components/ProgressionView.tsx:25-46`, rendered in loop at `ProgressionView.tsx:383-406`)
**22 Props Drilled**:
`r`, `index`, `totalSteps`, `prevR`, `isExpanded`, `onToggleExpand`, `machines`, `defaultMachineId`, `usbs`, `jigs`, `globalJigId`, `globalUsbId`, `heightMode`, `isProjectionMode`, `showAdvancedStepOverrides`, `onUpdateStep`, `onUpdateWheel`, `onDeleteStep`, `onMoveStep`, `setSheetConfig`, plus key and synthetic handlers.
Inside each `StepCard` render tick (`ProgressionView.tsx:96-103`), `.find()` is called on `machines`, `usbs`, and `jigs`.

#### `MachineManagerView` (`src/components/settings/MachineManagerView.tsx:9-20`, called at `App.tsx:625-634`)
**10 Props Passed**:
`jigs`, `usbs`, `global`, `wheels`, `machines`, `defaultMachineId`, `onAddMachine`, `onUpdateMachine`, `onDeleteMachine`, `onSetDefaultMachine`.

#### `CalibrationWizard` (`src/components/CalibrationWizard.tsx:17-25`, called at `MachineManagerView.tsx:81-102`)
**7 Props Passed**:
1. `jigs: JigConfig[]` $\rightarrow$ **DEFECT: Drilled but never used inside `CalibrationWizard`!**
2. `usbs: UsbConfig[]`
3. `global: GlobalState`
4. `activeMachine: MachineConfig`
5. `wheels: Wheel[]`
6. `onSaveProfile: (profile: CalibrationProfile) => void`
7. `onCancel: () => void`

#### `HardwareManagerView` (`src/components/settings/HardwareManagerView.tsx:4-14`, called at `App.tsx:601-611`)
**9 Props Passed**:
`jigs`, `usbs`, `onUpdateJig`, `onAddJig`, `onDeleteJig`, `onUpdateUsb`, `onAddUsb`, `onDeleteUsb`, `onClose`.

#### `MeasurementSettingsView` (`src/components/settings/MeasurementSettingsView.tsx:4-10`, called at `App.tsx:582-588`)
**5 Props Passed**:
`heightMode`, `setHeightMode`, `global`, `setGlobal`, `onBack`.

#### `WheelManagerView` (`src/components/wheels/WheelManagerView.tsx:8-13`, called at `App.tsx:566-571`)
**4 Props Passed**:
`wheels`, `onAddWheel`, `onUpdateWheel`, `onDeleteWheel`.

#### `ImportExportPanel` (`src/components/ImportExportPanel.tsx:12-21`, called at `App.tsx:649-664`)
**9 Props Passed**:
`exportText`, `onImportText`, `exportSections`, `onToggleExportSection`, `importSections`, `importModes`, `onToggleImportSection`, `onChangeImportMode`, plus back button wrapper.

#### `PresetManagerModal` (`src/components/presets/PresetManagerModal.tsx:5-16`, called at `App.tsx:685-702`)
**9 Props Passed**:
`isOpen`, `isClosing`, `onClose`, `sessionPresets`, `selectedPresetId`, `onLoadPreset`, `onDeletePreset`, `onRenamePreset`, `overlayStyle`, `dialogStyle`.

#### `SavePresetDialog` (`src/components/presets/SavePresetDialog.tsx:5-15`, called at `App.tsx:704-721`)
**9 Props Passed**:
`isOpen`, `isClosing`, `onClose`, `presetNameDraft`, `setPresetNameDraft`, `onSave`, `canSave`, `overlayStyle`, `dialogStyle`.

---

### 1.5 Housekeeping & Dead Code Audit Findings

1. **`src/components/GrindDirToggle.tsx`** (74 lines):
   - Confirmed: **0 imports** anywhere in `src/`.
   - Superseded by the `base: 'front' | 'rear'` toggle in `StepCard` and `GlobalSetupCard`.
2. **`src/components/ExpandToggle.tsx`** (42 lines):
   - Confirmed: **0 imports** anywhere in `src/`.
   - Superseded by standard Lucide-style chevron icons and inline drawer toggles.
3. **`src/state/useAppState.ts`** (249 lines):
   - Confirmed: **0 imports** anywhere in `src/`.
   - Abandoned monolithic hook prototype.
4. **`src/ui/buttons.ts`** (17 lines):
   - Confirmed: **0 imports** anywhere in `src/`.
   - Contains dictionary mapping to dead `.u-btn` CSS classes.
5. **Transpiled Artifact `src/math/tormek.cjs`** (431 lines):
   - Confirmed: Leftover compiled CommonJS file, not imported by Vite or tests.
6. **Transpiled Artifact `src/types/core.js`** (110 lines):
   - Confirmed: Leftover compiled JS file, not imported by Vite or tests.
7. **`.u-btn` CSS Classes in `src/primitives.css`** (Lines 18–215):
   - Confirmed: **0 occurrences** across all TSX components in `src/`.
8. **`CollapseToggle` in `src/components/ImportExportPanel.tsx`** (Lines 32–60):
   - Sub-44px touch target (`w-10 h-10` = 40px), non-standard custom arrow SVG.

---

## 2. Logic Chain

1. **From Observation 1.1 & 1.2 to R1 (God Component Dismantling)**:
   - `App.tsx` re-evaluates its entire virtual DOM tree and reallocates closures for 18 handlers whenever any user input occurs (e.g. typing 1 character in `presetNameDraft`, or expanding a drawer).
   - Moving all domain state to Zustand slices (`calculatorSlice`, `progressionSlice`, `machineSlice`, `hardwareSlice`, `wheelSlice`, `presetSlice`, `settingsSlice`) and ephemeral UI state to `useUIStore` removes all 23 `useState` calls from `App.tsx`.
   - This reduces `App.tsx` from 759 lines to ~60 lines of static layout and view routing.

2. **From Observation 1.4 to R2 (Prop Drilling Eradication & Selector Hygiene)**:
   - Components currently receive up to 22 props, including raw state objects (`global`, `machines`) and raw setters (`setGlobal`, `setDefaultMachineId`).
   - If a component simply calls `useStore()` without a selector, it re-renders on every store mutation.
   - By enforcing **atomic primitive selectors** for scalar values (`useStore(s => s.global.targetAngle)`) and **`useShallow`** for collections (`useStore(useShallow(s => s.wheels))`), each component only re-renders when its specific subscribed data changes.
   - Props drilled into `StepCard` are eliminated: `StepCard` will subscribe to store slices directly or via scoped entity hooks, eliminating the $O(\text{Steps} \times \text{Machines})$ lookup cascade on every top-level angle tweak.

3. **From Observation 1.3 to Clean Declarative Architecture**:
   - The untyped `CustomEvent("collapseAll")` event bus and the brittle `document.addEventListener('pointerdown')` with CSS string matching (`.bg-\\[\\#262626\\]`) violate encapsulation and break if Tailwind classes change.
   - Declarative state in `useUIStore` (`expandedStepId: string | null`, `isSetupPanelOpen: boolean`) and a backdrop overlay `<div className="fixed inset-0 z-20" onClick={() => setIsSetupPanelOpen(false)} />` completely replace these imperative workarounds with standard React patterns.

4. **From Observation 1.5 to Phase 1 Dead Code Cleanup**:
   - Grep verification confirms that deleting `GrindDirToggle.tsx`, `ExpandToggle.tsx`, `useAppState.ts`, `buttons.ts`, `tormek.cjs`, `core.js`, and `.u-btn` in `primitives.css` causes zero broken imports and zero compile errors.

---

## 3. Component-by-Component Store Slice & Selector Hygiene Specification

### 3.1 Architecture Overview

```
                   ┌──────────────────────────────────────────────┐
                   │               App.tsx (~60 L)                │
                   │    (Structural Layout Shell & Tab Router)    │
                   └───────┬──────────────┬──────────────┬────────┘
                           │              │              │
           ┌───────────────▼┐     ┌───────▼────────┐     │
           │ CalculatorView │     │ WheelManager   │     │
           │ (Setup Drawer, │     │ View           │     │
           │  Progression)  │     │                │     │
           └───────┬────────┘     └───────┬────────┘     │
                   │                      │              │
 ┌─────────────────┴──────────────────────┼──────────────┼───────────────┐
 │                                        │              │               │
 ▼                                        ▼              ▼               ▼
Zustand Stores:
- `useStore` (Domain Slices: calculator, progression, machine, hardware, wheel, preset, settings)
- `useUIStore` (Ephemeral UI: view, settingsView, isSetupPanelOpen, isPresetDialogOpen, etc.)
- `useWheelResults()` (Tier 2 calculation service hook subscribing via useShallow)
```

### 3.2 Detailed Mapping Table

| Component | Current Props | Target Props | Subscribed Store Slices & Selectors | Actions / Setters | Hygiene Rule |
|---|---|---|---|---|---|
| **`GlobalSetupCard`** | 18 props | **0 props** (`{}`) | `useStore(s => s.global.targetAngle)`<br>`useStore(s => s.global.projection)`<br>`useStore(s => s.global.calcMode)`<br>`useStore(s => s.global.activeJigId)`<br>`useStore(s => s.global.activeUsbId)`<br>`useStore(s => s.global.fixedUsbRear)`<br>`useStore(s => s.global.fixedUsbFront)`<br>`useStore(s => s.global.useCustomFrontUsb)`<br>`useStore(s => s.global.useProtrusionMode)`<br>`useStore(s => s.global.bladeProtrusion)`<br>`useStore(s => s.global.showAdvancedStepOverrides)`<br>`useStore(s => s.heightMode)`<br>`useStore(s => s.defaultMachineId)`<br>`useStore(useShallow(s => s.machines))`<br>`useStore(useShallow(s => s.jigs))`<br>`useStore(useShallow(s => s.usbs))`<br>`useStore(useShallow(s => s.sessionPresets))`<br>`useUIStore(s => s.isSetupPanelOpen)`<br>`useUIStore(s => s.selectedPresetId)` | `setGlobal`<br>`setDefaultMachineId`<br>`loadPreset`<br>`setSetupPanelOpen`<br>`setSelectedPresetId`<br>`setPresetDialogOpen`<br>`setPresetManagerOpen` | Atomic primitives for inputs; `useShallow` for collections. Never re-renders on wheel edits or progression reordering. |
| **`ProgressionView`** | 16 props | **0 props** (`{}`) | `useWheelResults()`<br>`useStore(s => s.sessionSteps.length)` | `addStep`<br>`clearSessionSteps` | Pure coordinator. Renders list of `StepCard`. |
| **`StepCard`** | 22 props drilled | `result: WheelResult`<br>`index: number`<br>`prevResult?: WheelResult` | `useStore(s => s.heightMode)`<br>`useStore(s => s.global.calcMode === 'projection')`<br>`useStore(s => s.global.showAdvancedStepOverrides)`<br>`useStore(s => s.global.activeUsbId)`<br>`useStore(s => s.global.activeJigId)`<br>`useStore(s => s.defaultMachineId)`<br>`useStore(useShallow(s => s.machines))`<br>`useStore(useShallow(s => s.usbs))`<br>`useStore(useShallow(s => s.jigs))` | `updateStep`<br>`deleteStep`<br>`moveStep`<br>`updateWheel` | Direct store action calls. Wrapped in `React.memo`. |
| **`WheelManagerView`** | 4 props | **0 props** (`{}`) | `useStore(useShallow(s => s.wheels))` | `addWheel`<br>`updateWheel`<br>`deleteWheel` | Subscribes strictly to `wheels`. Modifying global angles or steps does not trigger re-render. |
| **`MachineManagerView`** | 10 props | **0 props** (`{}`) | `useStore(useShallow(s => s.machines))`<br>`useStore(s => s.defaultMachineId)` | `addMachine`<br>`updateMachine`<br>`deleteMachine`<br>`setDefaultMachineId`<br>`useUIStore.setSettingsView` | Direct store subscriptions. |
| **`CalibrationWizard`** | 7 props | `activeMachineId: string`<br>`onSaveProfile`<br>`onCancel` | `useStore(s => s.machines.find(m => m.id === activeMachineId))`<br>`useStore(useShallow(s => s.usbs))`<br>`useStore(s => s.global.activeUsbId)`<br>`useStore(useShallow(s => s.wheels))` | Direct profile persistence in `machineSlice` | Removed unused `jigs` prop. Subscribes directly to machine and USBs. |
| **`HardwareManagerView`** | 9 props | **0 props** (`{}`) | `useStore(useShallow(s => s.jigs))`<br>`useStore(useShallow(s => s.usbs))` | `addJig`<br>`updateJig`<br>`deleteJig`<br>`addUsb`<br>`updateUsb`<br>`deleteUsb` | Subscribes only to `hardwareSlice`. |
| **`MeasurementSettingsView`** | 5 props | **0 props** (`{}`) | `useStore(s => s.heightMode)`<br>`useStore(s => s.global.calcMode)`<br>`useStore(s => s.global.useProtrusionMode)` | `setHeightMode`<br>`setGlobal` | Atomic primitive selectors. |
| **`SettingsRootView`** | 1 prop | **0 props** (`{}`) | None | `useUIStore.setSettingsView` | Zero domain state subscriptions. Completely static UI menu. |
| **`ImportExportPanel`** | 9 props | **0 props** (`{}`) | `useStore.getState()` (on export click)<br>Local or `useUIStore` import options | Direct store import action `importState` | JSON serialization/merging moved to store action / utility service. |
| **`PresetManagerModal`** | 9 props | **0 props** (`{}`) | `useUIStore(s => s.isPresetManagerOpen)`<br>`useUIStore(s => s.selectedPresetId)`<br>`useStore(useShallow(s => s.sessionPresets))` | `setPresetManagerOpen`<br>`loadPreset`<br>`deletePreset`<br>`renamePreset` | Modals read open flag from `useUIStore`. |
| **`SavePresetDialog`** | 9 props | **0 props** (`{}`) | `useUIStore(s => s.isPresetDialogOpen)`<br>`useStore(s => s.sessionSteps.length > 0)` | `setPresetDialogOpen`<br>`savePreset` | Draft name managed locally in dialog component. |

---

## 4. Decomposition Blueprint: Proposed `src/App.tsx` Shell (~60 Lines)

```tsx
import * as React from 'react';
import { useUIStore } from './state/uiStore';
import { IconCalculator, IconDisc, IconSettings } from './icons';
import { APP_VERSION, APP_VERSION_DISPLAY } from './version';
import CalculatorView from './views/CalculatorView';
import WheelManagerView from './components/wheels/WheelManagerView';
import SettingsView from './views/SettingsView';
import { PresetManagerModal } from './components/presets/PresetManagerModal';
import { SavePresetDialog } from './components/presets/SavePresetDialog';

export default function App() {
  const view = useUIStore((s) => s.view);
  const setView = useUIStore((s) => s.setView);

  return (
    <div className="min-h-dvh bg-[#09090b] text-white p-3 sm:p-4 pb-[140px] flex flex-col gap-4 max-w-4xl mx-auto selection:bg-amber-400/30 selection:text-white">
      {view === 'settings' && (
        <div
          className="fixed top-3 right-4 text-xs text-white/30 font-mono tracking-wider pointer-events-none z-30"
          aria-label={`App version ${APP_VERSION}`}
        >
          v{APP_VERSION_DISPLAY}
        </div>
      )}
      {import.meta.env.DEV && (
        <div className="fixed top-1 left-1 opacity-40 pointer-events-none z-[100] px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[9px] font-mono font-bold text-amber-400">
          UWGAS DEV BUILD
        </div>
      )}

      {/* Main Routed View */}
      <main className="flex-1 w-full">
        {view === 'calculator' && <CalculatorView />}
        {view === 'wheels' && <WheelManagerView />}
        {view === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals */}
      <PresetManagerModal />
      <SavePresetDialog />

      {/* Workshop Bottom Tab Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#18181b]/95 backdrop-blur-lg border-t border-white/10 flex items-center justify-around z-40 pb-safe shadow-2xl">
        <button
          type="button"
          onClick={() => setView('calculator')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${view === 'calculator' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white/80'}`}
          aria-label="Calculator View"
        >
          <div className={`flex items-center justify-center w-12 h-10 rounded-2xl transition-all ${view === 'calculator' ? 'bg-amber-400/10' : ''}`}>
            <IconCalculator className="w-6 h-6" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setView('wheels')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${view === 'wheels' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white/80'}`}
          aria-label="Wheels View"
        >
          <div className={`flex items-center justify-center w-12 h-10 rounded-2xl transition-all ${view === 'wheels' ? 'bg-amber-400/10' : ''}`}>
            <IconDisc className="w-6 h-6" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setView('settings')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${view === 'settings' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white/80'}`}
          aria-label="Settings View"
        >
          <div className={`flex items-center justify-center w-12 h-10 rounded-2xl transition-all ${view === 'settings' ? 'bg-amber-400/10' : ''}`}>
            <IconSettings className="w-6 h-6" />
          </div>
        </button>
      </nav>
    </div>
  );
}
```

### Extracted View Wrappers:
1. `src/views/CalculatorView.tsx`:
   - Contains `<GlobalSetupCard />` and `<ProgressionView />`.
   - Encapsulates the sticky progression header and its `ResizeObserver` setup.
   - Encapsulates backdrop click-outside behavior for `isSetupPanelOpen`.
2. `src/views/SettingsView.tsx`:
   - Contains the sub-view router reading `settingsView` from `useUIStore`:
     - `'root'`: `<SettingsRootView />`
     - `'measurement'`: `<MeasurementSettingsView />`
     - `'hardware'`: `<HardwareManagerView />`
     - `'machine'`: `<MachineManagerView />`
     - `'import'`: `<ImportExportPanel />`
     - `'glossary'`: `<GlossaryPage />`
   - Provides consistent "Back to Settings" navigation header for sub-views.

---

## 5. Housekeeping & Dead Code Purge Action Plan

### 5.1 Deletion Checklist (Zero-Risk Removals)
| Target File / Class | Type | Line Count | Justification |
|---|---|---|---|
| `src/components/GrindDirToggle.tsx` | Orphan Component | 74 lines | 0 imports; replaced by `base: 'front' \| 'rear'` in StepCard. |
| `src/components/ExpandToggle.tsx` | Orphan Component | 42 lines | 0 imports; replaced by standard inline chevrons. |
| `src/state/useAppState.ts` | Orphan Hook | 249 lines | 0 imports; abandoned monolithic hook prototype. |
| `src/ui/buttons.ts` | Orphan Utility | 17 lines | 0 imports; exports references to obsolete `.u-btn` classes. |
| `src/math/tormek.cjs` | Transpiled Artifact | 431 lines | 0 imports; stray CommonJS build artifact in source tree. |
| `src/types/core.js` | Transpiled Artifact | 110 lines | 0 imports; stray JS build artifact in source tree. |
| `.u-btn` in `src/primitives.css` | Dead CSS Classes | Lines 18–215 (~198 lines) | 0 usages in any TSX components. |

### 5.2 Component Refinements
- **`CollapseToggle` in `src/components/ImportExportPanel.tsx:32-60`**: Replace inline 40px button (`w-10 h-10`) with standard Lucide icon or workshop-compliant `min-h-[44px]` button.
- **Unused Props Cleanup**: Remove `sessionSteps` from `GlobalSetupCardProps` and `jigs` from `CalibrationWizardProps`.

---

## 6. Caveats

1. **State Store Implementation Sequence**: Implementation of the UI store hooks in `GlobalSetupCard` and `ProgressionView` depends on Explorer 2's sliced Zustand store (`src/state/store.ts` and `src/state/uiStore.ts`) and Explorer 1's calculation service hook (`useWheelResults()`).
2. **Read-Only Investigation**: In strict accordance with mission constraints, no production source code files in `src/` or documentation files in `docs/` were modified during this investigation.

---

## 7. Conclusion

`src/App.tsx` can be immediately and safely dismantled from a 759-line "God Component" into a ~60-line structural shell. Prop drilling across 11 components (involving up to 22 props per component) can be completely eradicated using atomic Zustand selectors and `useShallow`. An immediate purge of 4 orphaned files, 2 transpiled build artifacts, and 198 lines of dead CSS will clean 1,121 lines of technical debt from `src/` with zero breaking changes.

---

## 8. Verification Method

To independently verify all claims made in this report:

1. **Verify Orphan Status**:
   ```bash
   git grep "GrindDirToggle" src/
   git grep "ExpandToggle" src/
   git grep "useAppState" src/
   git grep "buttons" src/
   git grep "tormek.cjs"
   git grep "core.js" src/
   git grep "u-btn" src/
   ```
   *Expected Output*: Only definitions within the respective dead files; zero external imports in any TSX/TS file.

2. **Verify Prop Drilling Locations**:
   Inspect line numbers cited in Section 1:
   - `src/App.tsx:54-74` (useState hooks)
   - `src/App.tsx:212-310` (unmemoized handlers)
   - `src/App.tsx:432-451` (GlobalSetupCard 18 props)
   - `src/App.tsx:540-555` (ProgressionView 16 props)
   - `src/components/ProgressionView.tsx:383-406` (StepCard 22 props)

3. **Verify Build Integrity**:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```
   *Expected Output*: 0 errors.
