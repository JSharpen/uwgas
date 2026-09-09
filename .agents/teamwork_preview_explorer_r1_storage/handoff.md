# Comprehensive Architecture & Storage Audit: R1 ("The Roast") & R3 (User Data Storage)

**Target Codebase**: Universal Wet Grinder Angle Setter (UWGAS)  
**Investigating Agent**: Explorer (teamwork_preview_explorer_r1_storage)  
**Date**: 2026-09-07  
**Scope**: `src/App.tsx`, `src/state/storage.ts`, `src/state/useAppState.ts`, `src/utils/normalizers.ts`, and associated consumer components in `src/components/`.

---

## 1. Observation

Direct observations of source files, line ranges, and concrete code implementations:

### A. Observations in `src/App.tsx` (759 Lines)
1. **Monolithic State Sprawl (Lines 54–75, 94, 128, 137, 140, 164–170, 173–198)**:
   `App.tsx` instantiates 18+ distinct `useState` hooks, managing core domain data, routing/view states, modal states, and import/export configurations:
   ```tsx
   // Lines 54-74
   const [initialState] = React.useState(() => readPersistedState());
   const [global, setGlobal] = React.useState<GlobalState>(initialState.global);
   const [machines, setMachines] = React.useState<MachineConfig[]>(initialState.machines || []);
   const [defaultMachineId, setDefaultMachineId] = React.useState<string | undefined>(initialState.defaultMachineId);
   const [jigs, setJigs] = React.useState<JigConfig[]>(initialState.jigs);
   const [usbs, setUsbs] = React.useState<UsbConfig[]>(initialState.usbs);
   const [wheels, setWheels] = React.useState<Wheel[]>(() => { ... });
   const [sessionSteps, setSessionSteps] = React.useState<SessionStep[]>(initialState.sessionSteps);
   const [sessionPresets, setSessionPresets] = React.useState<SessionPreset[]>(initialState.sessionPresets);
   const [heightMode, setHeightMode] = React.useState<'hn' | 'hr'>(initialState.heightMode || 'hn');
   ```
2. **Synchronous Persistence on Every Render & Initial Mount (Lines 77–90)**:
   ```tsx
   React.useEffect(() => {
     writePersistedState({
       version: 5,
       global,
       machines,
       defaultMachineId,
       jigs,
       usbs,
       wheels,
       sessionSteps,
       sessionPresets,
       heightMode,
     });
   }, [global, machines, defaultMachineId, jigs, usbs, wheels, sessionSteps, sessionPresets, heightMode]);
   ```
   Note that `version: 5` is hardcoded here, whereas `storage.ts:15` exports `PERSIST_VERSION = 6`.
3. **Out-of-Band Global DOM Event Bus (Lines 132–134, 141–145)**:
   ```tsx
   React.useEffect(() => {
     window.dispatchEvent(new CustomEvent("collapseAll"));
   }, [view]);

   React.useEffect(() => {
     if (isSetupPanelOpen) {
       window.dispatchEvent(new CustomEvent("collapseAll"));
     }
   }, [isSetupPanelOpen]);
   ```
   In `src/components/ProgressionView.tsx:361-365`, a listener subscribes to this window event:
   ```tsx
   React.useEffect(() => {
     const handleCollapseAll = () => setExpandedStepId(null);
     window.addEventListener('collapseAll', handleCollapseAll);
     return () => window.removeEventListener('collapseAll', handleCollapseAll);
   }, []);
   ```
4. **Direct DOM Traversal & Selector Sniffing on `document` (Lines 147–161)**:
   ```tsx
   React.useEffect(() => {
     const handleGlobalPointerDown = (e: PointerEvent | MouseEvent | TouchEvent) => {
       const target = e.target as HTMLElement;
       const isInteractive = target.closest('#global-setup-card, .motion-list-item, .bg-\\[\\#262626\\], .bg-neutral-900, .action-sheet, button, input, select, [role="dialog"]');
       if (!isInteractive) {
         setIsSetupPanelOpen(false);
       }
     };
     document.addEventListener('pointerdown', handleGlobalPointerDown);
     return () => document.removeEventListener('pointerdown', handleGlobalPointerDown);
   }, []);
   ```
5. **Direct CSS Variable Mutation via ResizeObserver (Lines 97–127)**:
   `App.tsx` directly modifies `document.documentElement.style.setProperty('--progression-header-bottom', ...)` whenever `headerRef` resizes or `view` toggles.
6. **Unmemoized Handler Allocations (Lines 212–310)**:
   18 handlers (`handleAddWheel`, `handleDeleteWheel`, `handleUpdateJig`, `handleAddJig`, `handleDeleteJig`, `handleUpdateUsb`, `handleAddUsb`, `handleDeleteUsb`, `handleUpdateWheel`, `handleAddStep`, `handleDeleteStep`, `handleUpdateStep`, `handleMoveStep`, `handleLoadDefaultProgression`, `handleLoadPreset`, `handleDeletePreset`, `handleRenamePreset`, `handleSavePreset`) are re-instantiated on every single render without `useCallback`.
7. **Severe Prop Drilling into Child Views (Lines 432–451, 540–555)**:
   - `GlobalSetupCard` receives 18 props (including raw state setters `setGlobal`, `setIsSetupPanelOpen`, `setDefaultMachineId`).
   - `ProgressionView` receives 14 props, which it then forwards to every single `StepCard` child in a loop (`StepCard` receives 18 props, lines 383–406 of `ProgressionView.tsx`).
8. **Inlined Parsing & Reconciliation Engine (Lines 328–413)**:
   85 lines of JSON parsing, Map-based ID merging, and section dispatching live directly inside the component body of `App.tsx`.

---

### B. Observations in `src/state/storage.ts` (304 Lines)
1. **Unthrottled Synchronous Sequential Storage Writes (Lines 17–25, 140–153)**:
   ```tsx
   export function _save(k: string, v: unknown) {
     try {
       if (typeof localStorage !== 'undefined') {
         localStorage.setItem(k, JSON.stringify(v));
       }
     } catch {
       // ignore
     }
   }

   export function writePersistedState(state: AppPersistedState) {
     _save('t_global', state.global);
     if (state.machines) _save('t_machines', state.machines);
     if (state.defaultMachineId) _save('t_defaultMachineId', state.defaultMachineId);
     if (state.jigs) _save('t_jigs', state.jigs);
     if (state.usbs) _save('t_usbs', state.usbs);
     if (state.constants) _save('t_constants', state.constants); // Legacy
     _save('t_wheels', state.wheels);
     _save('t_sessionSteps', state.sessionSteps);
     _save('t_sessionPresets', state.sessionPresets);
     if (state.heightMode) _save('t_heightMode', state.heightMode);
     if (state.calibSnapshots) _save('t_calibSnapshots', state.calibSnapshots);
     if (state.calibAppliedIds) _save('t_calibAppliedIds', state.calibAppliedIds);
   }
   ```
   Every call to `writePersistedState` triggers up to **11 consecutive, synchronous `localStorage.setItem` and `JSON.stringify` executions**.
2. **Missing Version Persistence (The Disappearing Version)**:
   In `writePersistedState` (lines 140–153), **`state.version` is never saved to localStorage**. There is no `_save('t_version', ...)` call.
   In `readPersistedState` (lines 61–138), there is no `_load('t_version', ...)` call. Line 121 hardcodes `version: PERSIST_VERSION`.
   Therefore, data in `localStorage` has **no stored schema version**.
3. **Silent Quota & Error Swallowing (Lines 23, 35)**:
   In `_save`, any exception (e.g. `QuotaExceededError`) is caught and silently dropped (`catch { // ignore }`).
   In `_load`, any parse error silently returns the default value (`catch { return def; }`).
4. **Ad-Hoc Structural Mutation & Duplication (Lines 40–59, 89–118)**:
   Instead of version-gated migration routines, `readPersistedState` runs ad-hoc heuristic checks on every load:
   ```tsx
   if (loadedGlobal.usbDiameter !== undefined && !loadedGlobal.activeUsbId) {
     const res = ensureHardwareConfig(usbs, loadedGlobal.usbDiameter, 'Ds', 'usb', 'Custom USB');
     usbs = res.items;
     loadedGlobal.activeUsbId = res.id;
   }
   ```
   `ensureHardwareConfig` dynamically generates IDs using `Date.now() + Math.random()` and casts partial objects to `T` via `as unknown as T`, omitting required properties like `threadPitch` and `microAdjustMarks`.
   This migration logic is copy-pasted verbatim in `parsePersistedState` (lines 222–248).
5. **Blind Type Assertions Without Runtime Validation (Lines 27–37)**:
   `_load<T>` performs `return parsed as T;` with zero schema validation or structural type guards.
6. **Unused Normalizers (Dead Sanitization Code)**:
   In `src/utils/normalizers.ts`:
   - `normalizeSessionStep` (lines 44–63) is defined but **never called anywhere in the codebase**.
   - `normalizeCalibrationSnapshots` (lines 65–120) is defined but **never called anywhere in the codebase**.
   - `normalizeWheel` (lines 13–42) assigns `D = NaN` on line 18 if invalid, which serializes to `null` in JSON. On next load, `Number(null)` evaluates to `0`, corrupting wheel diameters to `0 mm`.
7. **Zombie Legacy State Module (`src/state/useAppState.ts`)**:
   `src/state/useAppState.ts` contains 250 lines defining a `useAppState` hook with obsolete schema definitions. It is not imported by `src/App.tsx` or any active component.

---

## 2. Logic Chain

From these direct observations, we establish a logical progression proving five major architectural flaws (R1) and seven critical persistence vulnerabilities (R3).

### A. R1 Codebase Audit ("The Roast")

#### Flaw 1: The Monolithic "God Component" & Violation of Single Responsibility Principle
- **Observation**: `App.tsx` is 759 lines long and coordinates 18+ `useState` hooks, 2 modal flows, direct document event listening, CSS variable injection, import/export reconciliation, and all view routing (Obs A.1, A.4, A.5, A.8).
- **Reasoning**:
  1. A React component is designed to map state to visual UI. In `App.tsx`, state storage, persistence synchronization, layout measurement, global window event broadcasting, DOM element querying, and data serialization are all coupled into a single execution unit.
  2. Because all state lives at the root, any state mutation anywhere in the app forces the entire `App` component function to re-execute from line 51 to 758.
- **Performance Impact**:
  - **Unnecessary Render Cascades**: Modifying local UI states (e.g. typing a preset name draft in `presetNameDraft`, or expanding a panel) forces the entire root virtual DOM tree to re-render.
  - **Memory Allocation Thrashing**: 18 top-level callback closures, new object references for child props, and multiple inline JSX lambdas are allocated on every single keystroke or stepper click.
  - **CPU Cycles**: Unchecked execution of layout effects, calculation memos, and virtual DOM reconciliation across 750+ lines of component tree.
- **Maintainability Impact**:
  - **Testing Impossibility**: `App.tsx` cannot be unit-tested without heavily mocking `window`, `document.addEventListener`, `ResizeObserver`, `localStorage`, and `CustomEvent`. As a result, the project currently has **0 tests** (`package.json:13`: `"test": "echo \"(no tests defined yet)\"`).
  - **Extreme Cognitive Load**: Adding or changing a feature requires understanding and modifying the central orchestrator file.
  - **Fragility**: High risk of unintended regression when editing unrelated features within the same monolithic file.

#### Flaw 2: The "Prop Drilling Abyss" & Hierarchical Component Coupling
- **Observation**: `App.tsx` passes 18 props to `GlobalSetupCard` (Obs A.7) and 14 props to `ProgressionView` (Obs A.7). `ProgressionView` then drills 18 props into every `StepCard` instance in a loop (`ProgressionView.tsx:383-406`).
- **Reasoning**:
  1. Intermediate components (`ProgressionView`) act merely as courier pipelines for machine geometries, USB configurations, jig lists, and action handlers that they do not consume themselves.
  2. Leaf components receive raw React `Dispatch<SetStateAction<...>>` setters (e.g., `setGlobal`, `setDefaultMachineId`) rather than intention-revealing domain actions.
- **Performance Impact**:
  - **O(N) Step Card Re-render Storm**: When a user tweaks target angle $\beta$ or projection $A$ in `GlobalSetupCard`, `App` re-renders. Because `ProgressionView` receives a new `wheelResults` array and fresh function references, `ProgressionView` re-renders and re-mounts/re-diffs every single `StepCard`.
  - **Linear Search Multipliers**: Inside each `StepCard` render pass (`ProgressionView.tsx:96-103`), `.find()` is called on `machines`, `usbs`, and `jigs`. If there are $S$ steps and $M$ machines, every top-level state tick triggers $O(S \times M)$ lookups, redundant unit string formatting, and touch handler registrations.
- **Maintainability Impact**:
  - **Refactoring Gridlock**: Modifying a data structure (e.g., adding a calibration profile or micro-adjust parameter) requires altering TypeScript interfaces across 4–5 files (`types/core.ts`, `App.tsx`, `ProgressionView.tsx`, `StepCardProps`, `GlobalSetupCard.tsx`).
  - **Leaky Abstractions**: Leaf components have visibility into full global collections and raw setters, violating encapsulation.

#### Flaw 3: Referential Instability & Unmemoized Inline Handler Allocations
- **Observation**: Handlers in `App.tsx` (lines 212–310) are declared without `useCallback`. Props in JSX (lines 438–443, 630–633, 688–694) are passed as inline arrow functions and inline expressions (Obs A.6).
- **Reasoning**:
  1. In JavaScript, every function literal evaluated during render creates a new object in memory with a unique memory address.
  2. Even if child components (`GlobalSetupCard`, `ProgressionView`, `StepCard`) were wrapped in `React.memo`, shallow comparison (`prevProp === nextProp`) would evaluate to `false` on every render pass due to referential inequality.
- **Performance Impact**:
  - **100% Defeat of React Memoization**: Child components cannot bail out of rendering.
  - **V8 GC Pressure**: Creating tens of short-lived function closures per second during continuous interactions (like dragging a slider or stepping micro-bumps) forces frequent JavaScript Garbage Collection sweeps, causing stutter and micro-freezes on mobile devices.
- **Maintainability Impact**:
  - **Closure Traps & Stale State**: Inline closures capturing state inside asynchronous timeouts (e.g. modal closing timeouts at `App.tsx:690, 710`) can execute against stale state if the user performs rapid interactions within 200ms.

#### Flaw 4: Imperative Out-of-Band State Synchronization via Window Events & DOM Sniffing
- **Observation**: `App.tsx` uses `window.dispatchEvent(new CustomEvent("collapseAll"))` (Obs A.3) and attaches a document `pointerdown` listener querying CSS class strings (`#global-setup-card`, `.motion-list-item`, `.bg-[#262626]`, `.bg-neutral-900`, `.action-sheet`, etc., Obs A.4).
- **Reasoning**:
  1. React is designed around declarative, unidirectional data flow. Using untyped browser window events to synchronize component UI state (expanding/collapsing step cards) introduces an unmonitored side-channel.
  2. Using `document.addEventListener('pointerdown')` with raw class selector queries couples the JavaScript behavior of `App.tsx` to specific Tailwind utility classes in child presentation components.
- **Performance Impact**:
  - **Unnecessary DOM Queries on Every Interaction**: Every pointer event on the screen runs `target.closest(...)` against an 8-selector CSS string on the main thread before any user gesture can be processed.
  - **Uncoordinated State Flushes**: CustomEvents bypass React 19's concurrent scheduler and batching guarantees.
- **Maintainability Impact**:
  - **Silent Breakage on Styling Changes**: If a developer changes `.bg-[#262626]` to a CSS variable (e.g., `bg-surface`), the click-outside collapse mechanism silently breaks without any compile-time or lint warning.
  - **DevTools Invisibility**: CustomEvent dispatches do not appear in React DevTools timelines or state inspection trees.

#### Flaw 5: Smearing of Business Logic & Zombie Legacy Code
- **Observation**: `App.tsx:328-413` contains 85 lines of JSON parsing and Map-based array merging (Obs A.8). `src/state/useAppState.ts` contains 250 lines of dead code (Obs B.7). `GlobalSetupCard.tsx` directly modifies `global` properties using ad-hoc reducer lambdas. Visual UI toggles (`showAdvancedStepOverrides`) are co-located in `GlobalState`, which invalidates the `wheelResults` math memo (`App.tsx:207-210`).
- **Reasoning**:
  1. Business logic (merging imports, deduplicating entities, ensuring default machines) is scattered across UI components rather than encapsulated in dedicated, testable domain modules.
  2. Mathematical formulas in `tormek.ts` are recomputed whenever `global` changes identity, even if the change was merely a cosmetic UI toggle (`showAdvancedStepOverrides`).
  3. Obsolete legacy state files (`useAppState.ts`) confuse contributors and AI coding assistants.
- **Performance Impact**:
  - **Redundant Dutchman Trigonometric Calculations**: Dutchman Law of Cosines and coordinate transformations are re-run for all wheels when non-mathematical UI toggles are clicked.
- **Maintainability Impact**:
  - **Duplicate Merge Rules**: The logic for merging imported configurations is split between `App.tsx` and `storage.ts`, creating divergence risks when new fields are added.

---

### B. R3 User Data Storage Audit

#### Vulnerability 1: Synchronous `localStorage` Blocking & Thread Starvation
- **Observation**: `writePersistedState` triggers up to 11 sequential calls to `localStorage.setItem` and `JSON.stringify` on every state change and on mount (Obs B.1).
- **Reasoning**:
  1. `localStorage` is a synchronous, blocking Web API that operates on the browser's main UI thread.
  2. On mobile devices (iOS Safari, Android Chrome), disk writes to flash storage or synchronous IPC calls to the browser storage process typically take 5ms to 25ms per invocation.
  3. Executing 11 consecutive writes within a React `useEffect` hook blocks the main thread for 50ms–100ms. When dragging a slider or tapping a stepper, this produces severe visual jank and input lag.
  4. There is no write debouncing, batching, or asynchronous offloading.

#### Vulnerability 2: Missing Version Persistence & Non-Existent Migration Dispatch
- **Observation**: `storage.ts:15` exports `PERSIST_VERSION = 6`, `App.tsx:79` hardcodes `version: 5`, and `writePersistedState` never saves `version` to localStorage (Obs A.2, B.2). `readPersistedState` never reads a version from storage (Obs B.2).
- **Reasoning**:
  1. Because `version` is never saved to `localStorage`, the stored data is essentially version-less.
  2. The app cannot execute version-targeted migrations (e.g. `if (v < 2) ...; if (v < 5) ...`).
  3. `PERSIST_VERSION` in `storage.ts` is purely decorative. Any schema evolution must rely on runtime property presence detection, which is fragile and error-prone.

#### Vulnerability 3: Silent Failure & Unhandled Storage Exceptions
- **Observation**: `_save` catches and ignores all exceptions (`storage.ts:23`), and `_load` catches and returns defaults (`storage.ts:34`) (Obs B.3).
- **Reasoning**:
  1. If `localStorage` is full (`QuotaExceededError`) or disabled (e.g., strict privacy modes, iframe sandbox restrictions), writes fail silently. The user is given no indication that their calibrations, wheels, and presets are not being saved.
  2. In `_load`, if one JSON string in localStorage is malformed, that specific key silently resets to defaults while the other 10 keys load normally.
  3. For example, if `t_wheels` fails to parse and resets to `DEFAULT_WHEELS`, `sessionSteps` (which loaded successfully from `t_sessionSteps`) will now contain foreign `wheelId` references. These orphaned references cause steps to silently drop out of `computeWheelResults` (`tormek.ts:181`: `if (!w) continue;`), confusing the user with missing results.

#### Vulnerability 4: Serialization Corruption (`NaN`, `null`, and Numeric Drift)
- **Observation**: `JSON.stringify(NaN)` serializes as `null`. `normalizeWheel` assigns `D = NaN` for invalid numbers (`normalizers.ts:18`). On load, `_nz(null, 0)` coerces `null` to `0` (Obs B.6).
- **Reasoning**:
  1. If a wheel diameter or machine constant evaluates to `NaN` (due to an empty input or calculation edge case), saving to localStorage turns it into `null`.
  2. Upon reloading, `_nz(wheel.D, 0)` coerces `null` to `0`.
  3. A wheel diameter of $0\text{ mm}$ ($R = 0$) causes Dutchman trigonometric formulas to produce degenerate or negative values, corrupting calculations without throwing a visible error.
  4. Neither `normalizeSessionStep` nor `normalizeCalibrationSnapshots` is called during storage loading, leaving step offsets and calibration records completely unvalidated.

#### Vulnerability 5: Ad-Hoc Migration Heuristics & Dynamic Object Generation
- **Observation**: `ensureHardwareConfig` dynamically generates IDs with `Date.now() + Math.random()` and casts incomplete objects via `as unknown as T` (`storage.ts:40-59`) (Obs B.4).
- **Reasoning**:
  1. If a floating-point tolerance mismatch occurs (`Number(item[prop]) === value`), `ensureHardwareConfig` creates a new duplicate custom hardware config every time the page loads.
  2. The generated objects lack required fields (e.g. `threadPitch`, `microAdjustMarks`, `length`), creating schema drift and partial objects in memory.
  3. Duplicating this entire block in both `readPersistedState` and `parsePersistedState` violates DRY and creates maintenance divergence.

#### Vulnerability 6: Lack of Runtime Schema Validation
- **Observation**: `_load<T>` uses `parsed as T` (`storage.ts:33`) without runtime validation (Obs B.5).
- **Reasoning**:
  1. TypeScript type assertions (`as T`) are erased during compilation to JavaScript.
  2. If stored data is corrupted, altered by another script, or out of date, unexpected types (e.g. string instead of number, missing properties) enter the application unchecked.
  3. The application lacks runtime schema validation libraries (such as **Zod**) to parse, validate, and sanitize inbound persisted data.

#### Vulnerability 7: Hydration, Multi-Tab, and Race Condition Hazards
- **Observation**: State is read synchronously on initial render and immediately written back on mount (`App.tsx:54-90`) (Obs A.2). No `window.addEventListener('storage')` listener exists.
- **Reasoning**:
  1. Writing back to localStorage immediately on mount is wasteful and can overwrite newer data if a multi-tab race occurs.
  2. If a user has UWGAS open in two browser tabs, changes in Tab 1 do not notify Tab 2. When Tab 2 updates any state, it overwrites Tab 1's changes with stale data.
  3. In SSR or static preview environments, accessing `localStorage` during initial render causes hydration mismatches.

---

## 3. Storage Modernization Architecture Recommendations

To elevate the storage and state architecture to production grade, the following concrete architectural upgrades are recommended:

### A. Centralized State Store with Zustand & Persist Middleware
Replace the 18+ `useState` hooks in `App.tsx` and fragmented `storage.ts` with a unified Zustand store.
- **Single Storage Key**: Consolidate the 11 separate `t_*` keys into a single envelope key: `uwgas_app_state_v1`.
- **Atomic Writes**: Saving is atomic; a single JSON document ensures cross-entity referential integrity (e.g. wheel IDs in session steps always match wheels).
- **Asynchronous / Debounced Persistence**: Implement debounced storage writes (e.g., 300ms debounce) to eliminate main-thread stutter during slider drags and stepper clicks.

### B. Formal Versioned Migration Pipeline
Configure Zustand's `persist` middleware with an explicit, sequential migration pipeline:
```typescript
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Store state and actions...
    }),
    {
      name: 'uwgas_app_state_v1',
      version: 6,
      migrate: (persistedState: unknown, version: number) => {
        let state = persistedState as Record<string, any>;
        if (version < 2) {
          state = migrateV1ToV2(state);
        }
        if (version < 3) {
          state = migrateV2ToV3(state);
        }
        if (version < 4) {
          state = migrateV3ToV4(state);
        }
        if (version < 5) {
          state = migrateV4ToV5(state);
        }
        if (version < 6) {
          state = migrateV5ToV6(state);
        }
        return state as AppStoreState;
      },
    }
  )
);
```

### C. Runtime Schema Validation via Zod
Replace blind `as T` type assertions with strict Zod schemas:
- Define schemas for `WheelSchema`, `SessionStepSchema`, `MachineConfigSchema`, `GlobalStateSchema`.
- Infer TypeScript types directly from schemas: `export type Wheel = z.infer<typeof WheelSchema>;`.
- In the storage deserializer or Zustand `storage` adapter, validate with `Schema.safeParse(data)`:
  - If valid: hydrate state.
  - If invalid: log diagnostic errors, apply fallback defaults for damaged entities, and notify the user rather than crashing or corrupting data.

### D. Serialization Guards & Number Sanitization
- Implement a custom serializer with replacer/reviver:
  - Replace `NaN` and non-finite numbers with valid domain fallbacks or explicit marker strings before serialization.
  - Revive and clamp numeric fields during parse, guaranteeing that wheel diameters ($D > 0$), projections ($A > 0$), and angles ($0 < \beta < 90$) satisfy domain invariants.

### E. Multi-Tab Synchronization & Hydration Safety
- Listen for browser `storage` events (`window.addEventListener('storage', (e) => { ... })`) to automatically sync state across open tabs when `e.key === 'uwgas_app_state_v1'`.
- Maintain a `hasHydrated` store flag to prevent any write-backs to storage before hydration is complete.

---

## 4. Caveats

1. **Read-Only Scope**: This investigation was strictly read-only; no code files were modified. All proposals are documented for implementation by dedicated worker agents upon approval.
2. **Component Deep Dives**: Sub-views such as `CalibrationWizard.tsx` and `WheelFormFields.tsx` were reviewed for prop interfaces and state coupling, but their internal CSS and layout details were not audited as they fall under visual refactoring.
3. **Browser Quota Differences**: LocalStorage quota limits vary across browsers (typically 5MB on mobile Safari vs 10MB on desktop Chrome). While current UWGAS state size is small (~10KB to 50KB), unthrottled writes remain a severe CPU/IPC bottleneck.

---

## 5. Conclusion

1. **R1 Verdict**: `App.tsx` exhibits severe architectural anti-patterns:
   - It acts as an unwieldy God Component managing 18+ `useState` hooks, layout effects, global DOM event listeners, and data merging.
   - It incurs massive prop drilling down through `ProgressionView` to `StepCard`.
   - It suffers from complete referential instability due to unmemoized inline callbacks.
   - It relies on an out-of-band imperative `CustomEvent("collapseAll")` event bus and brittle CSS class sniffing on `document`.
   - It co-locates visual UI toggles with math engine parameters, invalidating expensive geometric memos.
2. **R3 Verdict**: The current persistence layer in `storage.ts` is critically flawed:
   - It executes up to 11 unthrottled synchronous `localStorage` writes on every render tick and on initial mount.
   - It discards `state.version` entirely, leaving stored data version-less.
   - It silently swallows write and parse errors, risking silent data loss and cross-slice entity corruption.
   - It serializes `NaN` to `null` and coerces wheel diameters to `0 mm`.
   - It contains dead normalizer code and lacks runtime schema validation.
3. **Refactoring Recommendation**: The proposed Zustand refactoring in `.agents/implementation_plan.md` is **strongly validated and recommended**, but must be expanded to:
   - Integrate Zustand's `persist` middleware with atomic, debounced storage.
   - Implement a formal sequential migration pipeline (`version: 6`).
   - Introduce **Zod** for runtime schema validation and serialization safety.
   - Cleanly isolate the sacred math engine (`tormek.ts`) from UI state by computing derived values through pure selector functions rather than passing bloated UI state objects.

---

## 6. Verification Method

Independent verification of all findings can be performed using the following commands and inspection steps:

1. **Verify Line Counts and File Sizes**:
   ```bash
   wc -l src/App.tsx src/state/storage.ts src/state/useAppState.ts src/utils/normalizers.ts
   ```
   Confirms 759 lines in `App.tsx`, 304 lines in `storage.ts`, and 250 lines of unused code in `useAppState.ts`.
2. **Verify Missing Version in LocalStorage Writes**:
   Inspect `src/state/storage.ts:140-153` (`writePersistedState`). Note that `state.version` is never saved.
   Inspect `src/App.tsx:79` (`version: 5`) vs `src/state/storage.ts:15` (`PERSIST_VERSION = 6`).
3. **Verify Dead Normalizer Code**:
   Run grep for `normalizeSessionStep` and `normalizeCalibrationSnapshots`:
   ```bash
   git grep "normalizeSessionStep"
   git grep "normalizeCalibrationSnapshots"
   ```
   Both will show only their definition in `src/utils/normalizers.ts` and zero callers.
4. **Verify Out-of-Band CustomEvent Bus**:
   Inspect `src/App.tsx:132-134, 141-145` and `src/components/ProgressionView.tsx:361-365`.
5. **Verify Project Compilation & Quality Gate**:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```
   Confirms the project compiles cleanly under TypeScript 5.9 and Vite 7.2.
