# Empirical Challenge Report: Zustand State Store, Persistence & Storage Migration Bridge

**Agent Identity**: `teamwork_preview_challenger_2` (Challenger 2 - State Persistence & Storage Migration Challenger)  
**Role**: Critic, Specialist  
**Evaluation Target**: `src/state/store.ts`, `src/state/slices/`, `src/state/uiStore.ts`, `src/state/migration.ts`, `src/state/schema.ts`, `src/state/defaults.ts`  
**Overall Verdict**: **REJECT** (2 Confirmed Data-Loss Defects Identified; Requires Remediation)

---

## 1. Observation

### 1.1 Technical Gate Verification
Commands executed directly in workspace `/home/jordancarruthers/Documents/GitHub/uwgas/angle-setter`:

```bash
$ npm test
> node --experimental-strip-types --test src/math/tormek.test.ts
✔ Sacred Math Engine - Golden Master Test Suite (7.06ms)
ℹ tests 13 | pass 13 | fail 0 | cancelled 0

$ npm run typecheck
> tsc --noEmit
# Result: 0 errors (Exit code 0)

$ npm run lint
> eslint .
# Result: 0 errors, 0 warnings (Exit code 0)

$ npm run build
> tsc -b && vite build
✓ built in 1.09s (Exit code 0)
```

### 1.2 State Persistence & Migration Test Suite Execution
An automated test suite with 30 empirical assertions was created at `src/state/state.test.ts` with browser environment mocking at `src/state/test_env.ts` and module resolver at `scripts/register-ts.mjs`.

Command executed:
```bash
$ node --import ./scripts/register-ts.mjs --experimental-strip-types --test src/state/state.test.ts
```

Output:
```
▶ State Persistence & Storage Migration Challenger Suite
  ▶ 1. Deep Store Operations Across All 7 Slices
    ✔ calculatorSlice: mutates all global configuration properties (2.11ms)
    ✔ progressionSlice: manages session steps, ordering, and default progression (3.18ms)
    ✔ machineSlice: manages custom machines, default fallback, and calibration profiles (0.89ms)
    ✔ hardwareSlice: manages jigs and usbs (0.54ms)
    ✔ wheelSlice: adds, normalizes, updates, and deletes wheels (1.13ms)
    ✔ presetSlice: saves, validates, renames, loads, and deletes presets (0.61ms)
    ✔ settingsSlice: manages heightMode and calibration snapshots (0.39ms)
    ✔ uiStore: manages ephemeral UI navigation, modal states, and section selectors (0.33ms)
  ✔ 1. Deep Store Operations Across All 7 Slices (9.93ms)
  ▶ 2. Debounced Persistence (300ms) & Flush Mechanisms
    ✔ debounces storage writes by 300ms (371.02ms)
    ✔ flushPendingWrite() immediately commits pending writes without waiting for timer (0.39ms)
    ✔ flushes pending writes on window beforeunload event (0.20ms)
    ✔ coalesces rapid repeated mutations into a single final write (550.86ms)
    ✔ removeItem() cancels any pending debounced write and clears the key (350.33ms)
    ✔ flushPendingWrite() survives localStorage write errors without throwing (1.87ms)
    ✔ multi-tab synchronization: rehydrates store when storage event fires for uwgas_app_state_v1 (105.67ms)
  ✔ 2. Debounced Persistence (300ms) & Flush Mechanisms (1380.84ms)
  ▶ 3. Legacy Storage Migration Bridge (11+ Legacy Keys)
    ✔ returns false when localStorage has no legacy keys and no unified key (0.37ms)
    ✔ returns false when unified key already exists (does not overwrite existing state) (0.20ms)
    ✔ migrates full 11+ legacy keys into uwgas_app_state_v1 without destroying legacy keys (2.15ms)
    ✔ honors snake_case legacy keys (t_steps, t_presets, t_default_machine_id) (0.67ms)
    ✔ synthesizes default grinder when legacy t_machines is missing (0.46ms)
    ✔ camelCase keys take precedence over snake_case keys if both are present (0.57ms)
    ✔ migrates legacy step.usbOverride into a custom USB and sets step.usbId (0.42ms)
    ✔ EMPIRICALLY CONFIRMED BUG: Raw usbDiameter & jig.Dj in t_global dropped due to DEFAULT_GLOBAL pre-merge (0.34ms)
  ✔ 3. Legacy Storage Migration Bridge (11+ Legacy Keys) (5.43ms)
  ▶ 4. Zod Validation Resilience Against Corrupted Storage
    ✔ handles non-JSON raw strings in localStorage without throwing (0.66ms)
    ✔ rejects schema violations (out-of-range types, invalid enums) and preserves valid state (1.12ms)
    ✔ validates a complete, compliant AppPersistedState object cleanly (0.38ms)
  ✔ 4. Zod Validation Resilience Against Corrupted Storage (2.26ms)
  ▶ 5. JSON Import / Export Round-Trip & Modes
    ✔ importState: handles invalid JSON gracefully with descriptive error (0.27ms)
    ✔ importState: overwrite mode replaces collections completely (0.39ms)
    ✔ importState: merge mode unions items by ID, updating existing and appending new (0.40ms)
    ✔ CHALLENGE: constants section in importState does not import jigs or usbs (0.27ms)
  ✔ 5. JSON Import / Export Round-Trip & Modes (1.46ms)
✔ State Persistence & Storage Migration Challenger Suite (1400.55ms)
ℹ tests 30 | suites 6 | pass 30 | fail 0 | cancelled 0 | skipped 0 | todo 0
```

### 1.3 Defect 1: Silent Dropping of Legacy `usbDiameter` and `jig.Dj`
In `src/state/migration.ts:138-168`:
```typescript
138:     const anyGlobal: Record<string, unknown> = { ...DEFAULT_GLOBAL, ...loadedGlobal };
139:     if (anyGlobal.usbDiameter !== undefined && !anyGlobal.activeUsbId) {
140:       const res = ensureHardwareConfig(
141:         usbs,
142:         Number(anyGlobal.usbDiameter),
143:         'Ds',
144:         'usb',
145:         'Custom USB'
146:       );
147:       usbs = res.items;
148:       anyGlobal.activeUsbId = res.id;
149:     }
150:     if (
151:       anyGlobal.jig &&
152:       typeof anyGlobal.jig === 'object' &&
153:       (anyGlobal.jig as Record<string, unknown>).Dj !== undefined &&
154:       !anyGlobal.activeJigId
155:     ) {
156:       const res = ensureHardwareConfig(
157:         jigs,
158:         Number((anyGlobal.jig as Record<string, unknown>).Dj),
159:         'Dj',
160:         'jig',
161:         'Custom Jig'
162:       );
163:       jigs = res.items;
164:       anyGlobal.activeJigId = res.id;
165:     }
166: 
167:     if (!anyGlobal.activeUsbId) anyGlobal.activeUsbId = DEFAULT_USBS[0].id;
168:     if (!anyGlobal.activeJigId) anyGlobal.activeJigId = DEFAULT_JIGS[0].id;
```
In `src/state/defaults.ts:14-27`:
```typescript
export const DEFAULT_GLOBAL: GlobalState = {
  projection: 127.39,
  activeUsbId: 'usb-tormek',
  targetAngle: 16,
  activeJigId: 'jig-svm45',
  ...
```

When a legacy user has `localStorage.getItem('t_global')` with `{"targetAngle": 15, "usbDiameter": 13.25, "jig": {"Dj": 14.75}}` (and no `activeUsbId`/`activeJigId`):
Line 138 evaluates `{ ...DEFAULT_GLOBAL, ...loadedGlobal }`.
Because `loadedGlobal` lacks `activeUsbId` and `activeJigId`, `DEFAULT_GLOBAL` supplies `'usb-tormek'` and `'jig-svm45'`.
Therefore:
- `!anyGlobal.activeUsbId` evaluates to `!'usb-tormek'` $\rightarrow$ `false`.
- `!anyGlobal.activeJigId` evaluates to `!'jig-svm45'` $\rightarrow$ `false`.
Lines 140-149 and 150-165 are never executed. `ensureHardwareConfig` is never called.
The custom USB (13.25mm) and custom Jig (14.75mm) are never added to `usbs` or `jigs`.
When `AppPersistedStateSchema.safeParse` runs on candidate state, `GlobalStateSchema` strips unknown keys `usbDiameter` and `jig`.
The user's legacy custom hardware specifications are completely wiped out.

### 1.4 Defect 2: Dropping of Custom Hardware in JSON Backup Import
In `src/components/ImportExportPanel.tsx:322-327`:
```typescript
322:     if (exportSections.constants) {
323:       payload.machines = s.machines;
324:       if (s.defaultMachineId) payload.defaultMachineId = s.defaultMachineId;
325:       payload.jigs = s.jigs;
326:       payload.usbs = s.usbs;
327:     }
```
In `src/state/store.ts:130-139`:
```typescript
130:           if (sections.constants && Array.isArray(parsedObj.machines)) {
131:             nextState.machines =
132:               modes.constants === 'overwrite'
133:                 ? (parsedObj.machines as RootStoreState['machines'])
134:                 : mergeById(state.machines, parsedObj.machines as RootStoreState['machines']);
135:             if (typeof parsedObj.defaultMachineId === 'string') {
136:               nextState.defaultMachineId = parsedObj.defaultMachineId;
137:             }
138:             appliedSummary.push(`machines: ${modes.constants}`);
139:           }
```
`ImportExportPanel.tsx` bundles `machines`, `jigs`, and `usbs` under the `constants` section when exporting.
However, `importState()` in `store.ts` only extracts and merges `parsedObj.machines`. It never checks or merges `parsedObj.jigs` or `parsedObj.usbs`.
Consequently, restoring a backup on another device or importing user configurations drops all custom jigs and custom universal support bars.

---

## 2. Logic Chain

1. **Premise 1 (Legacy Migration Integrity)**: UWGAS previously stored physical USB bar diameter in `global.usbDiameter` and jig diameter in `global.jig.Dj`. In V5+, these became named entities in `jigs: JigConfig[]` and `usbs: UsbConfig[]`, referenced by `activeUsbId` and `activeJigId`.
2. **Step 1**: In `src/state/migration.ts:138`, `anyGlobal` is formed by spreading `DEFAULT_GLOBAL` before `loadedGlobal`.
3. **Step 2**: Because `DEFAULT_GLOBAL` assigns `activeUsbId = 'usb-tormek'` and `activeJigId = 'jig-svm45'`, `anyGlobal.activeUsbId` is truthy.
4. **Step 3**: The conditional `if (anyGlobal.usbDiameter !== undefined && !anyGlobal.activeUsbId)` evaluates to `false` whenever `loadedGlobal` is from a legacy store (where `activeUsbId` was absent).
5. **Step 4**: The custom hardware is never created, and `activeUsbId` defaults to the standard Tormek bar (11.98mm) and `activeJigId` to SVM-45 (12.0mm).
6. **Step 5**: Dutchmen angle-setting calculations depend directly on jig diameter ($D_j$) and USB diameter ($D_s$). Using 11.98mm instead of a user's 12.5mm aftermarket bar introduces geometric angle error on every grinding calculation after migration.
7. **Premise 2 (Backup & Restore Durability)**: Users backing up their grinding workshop setups expect all custom hardware to transfer across devices.
8. **Step 6**: `exportSections.constants` writes `machines`, `jigs`, and `usbs` to JSON.
9. **Step 7**: `importState()` in `store.ts` reads only `machines`.
10. **Conclusion**: Both defects represent silent data-loss failure modes that undermine the primary goal of Phase 1/Phase 2 state persistence overhaul.

---

## 3. Caveats

- **No other regressions identified**: The remainder of the 7 Zustand slices (`calculatorSlice`, `progressionSlice`, `machineSlice`, `hardwareSlice`, `wheelSlice`, `presetSlice`, `settingsSlice`), the ephemeral `uiStore`, the debounced storage (300ms debounce, unload flush, multi-tab sync), and Zod schema validation resilience function properly and passed all 30 tests.
- **Legacy storage non-destruction verified**: Legacy `t_*` keys are correctly retained in localStorage during migration and are never wiped.
- **`step.usbOverride` migration verified**: Steps with legacy `usbOverride` correctly synthesize a custom USB and assign `step.usbId`. The defect is solely in `t_global`'s top-level hardware properties.

---

## 4. Conclusion & Actionable Verdict

### Verdict: **REJECT**

The state architecture refactor cannot be approved for production until the two data-loss defects are fixed.

### Required Actions for Worker Agent:

1. **Fix Legacy Global Migration in `src/state/migration.ts`**:
   Extract `usbDiameter` and `jig.Dj` from `loadedGlobal` *before* falling back to default IDs:
   ```typescript
   // In src/state/migration.ts
   const anyGlobal: Record<string, unknown> = { ...DEFAULT_GLOBAL, ...loadedGlobal };
   
   if (loadedGlobal.usbDiameter !== undefined && !loadedGlobal.activeUsbId) {
     const res = ensureHardwareConfig(
       usbs,
       Number(loadedGlobal.usbDiameter),
       'Ds',
       'usb',
       'Custom USB'
     );
     usbs = res.items;
     anyGlobal.activeUsbId = res.id;
   }
   
   if (
     loadedGlobal.jig &&
     typeof loadedGlobal.jig === 'object' &&
     (loadedGlobal.jig as Record<string, unknown>).Dj !== undefined &&
     !loadedGlobal.activeJigId
   ) {
     const res = ensureHardwareConfig(
       jigs,
       Number((loadedGlobal.jig as Record<string, unknown>).Dj),
       'Dj',
       'jig',
       'Custom Jig'
     );
     jigs = res.items;
     anyGlobal.activeJigId = res.id;
   }
   ```

2. **Fix Hardware Import in `src/state/store.ts`**:
   In `importState()` under `sections.constants`:
   ```typescript
   if (sections.constants) {
     if (Array.isArray(parsedObj.machines)) {
       nextState.machines =
         modes.constants === 'overwrite'
           ? (parsedObj.machines as RootStoreState['machines'])
           : mergeById(state.machines, parsedObj.machines as RootStoreState['machines']);
       if (typeof parsedObj.defaultMachineId === 'string') {
         nextState.defaultMachineId = parsedObj.defaultMachineId;
       }
       appliedSummary.push(`machines: ${modes.constants}`);
     }
     if (Array.isArray(parsedObj.jigs)) {
       nextState.jigs =
         modes.constants === 'overwrite'
           ? (parsedObj.jigs as RootStoreState['jigs'])
           : mergeById(state.jigs, parsedObj.jigs as RootStoreState['jigs']);
       appliedSummary.push(`jigs: ${modes.constants}`);
     }
     if (Array.isArray(parsedObj.usbs)) {
       nextState.usbs =
         modes.constants === 'overwrite'
           ? (parsedObj.usbs as RootStoreState['usbs'])
           : mergeById(state.usbs, parsedObj.usbs as RootStoreState['usbs']);
       appliedSummary.push(`usbs: ${modes.constants}`);
     }
   }
   ```

---

## 5. Verification Method

To independently verify these findings:

1. Run the headless math engine Golden Master suite:
   ```bash
   npm test
   ```
2. Run the empirical State Persistence & Migration test suite:
   ```bash
   node --import ./scripts/register-ts.mjs --experimental-strip-types --test src/state/state.test.ts
   ```
3. Inspect `src/state/state.test.ts` lines 794-830 to review the empirical proof demonstrating that legacy `usbDiameter` and `jig.Dj` are dropped by `src/state/migration.ts`.
4. Inspect `src/state/state.test.ts` lines 1128-1175 to review the empirical test verifying that `parsedObj.jigs` and `parsedObj.usbs` are omitted by `importState()` in `src/state/store.ts`.
5. Run the standard verification gate:
   ```bash
   npm run typecheck && npm run lint && npm run build
   ```
