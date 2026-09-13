# Feature Idea: Context-Aware Dynamic Hardware Variables

- **Category**: UI/UX & Calculation Workflow
- **Date**: 2026-09-10
- **Status**: Ready for Backlog / Implementation (`[PROPOSED]`)
- **Target Repository**: `uwgas` (Universal Wet Grinder Angle Setter)

---

## 🎯 Core Concept
When selecting or displaying hardware (Sharpening Jigs, Universal Support Bars) in the Calculator View—both inside the **Global Setup Drawer** and within individual **Progression Step Cards**—only display and query the hardware parameters that are strictly required by the active calculation mode and measurement method.

---

## 🔍 Context & Problem Solved

### The Problem
Currently, hardware selectors (such as `ActionSheetPicker` in `GlobalSetupCard.tsx`) render static, hardcoded metadata lines (e.g., `Length: ${j.length || j.Dj}mm` or `Ds: ${u.Ds}mm`) irrespective of how the user is measuring their setup:
- If the user uses direct **Projection ($A$)** measurement, jig length is completely unused by the math engine, creating unnecessary clutter and confusion.
- If the user uses the **Stick-out / Protrusion ($P_b$)** method (caliper stick-out from clamp body to blade edge), jig length ($L_j$) is a vital mathematical dependency ($A = L_j + P_b$). In this mode, missing or hidden jig length directly impacts calculation accuracy.

### The Solution
Implement context-aware filtering on hardware metadata tags and input cards:
1. Detect active measurement mode (`global.useProtrusionMode` vs direct `global.projection`).
2. Detect active calculation mode (`heightMode: 'hn' | 'hr'` vs `calcMode: 'projection'`).
3. Only render the hardware properties that directly participate in the active formula.
4. Flag missing critical variables (e.g., alert if Protrusion mode is active on a jig lacking `jig.length`).

---

## 📊 Calculation Mode $\leftrightarrow$ Hardware Variable Dependency Map

| Measurement / Calc Mode | Formula In Use | Required Jig Variables | Required USB Variables | Irrelevant / Omitted Variables |
| :--- | :--- | :--- | :--- | :--- |
| **Standard Projection ($A$)** | $h_n = f(D_w, A, \beta, D_j, D_s, h_c, o)$ | Collar Diameter ($D_j$) | Bar Diameter ($D_s$) | Jig Length ($L_j$), Jig Thread Pitch |
| **Stick-out / Protrusion ($P_b$)** | $A = L_j + P_b$<br>$h_n = f(D_w, A, \beta, \dots)$ | **Jig Length ($L_j$)** & Collar Diameter ($D_j$) | Bar Diameter ($D_s$) | Jig Thread Pitch (unless adjustable) |
| **Fixed USB Projection Solver** | $A = \text{inverse\_ton}(h_n, D_w, \beta, \dots)$ | Collar Diameter ($D_j$) | Bar Diameter ($D_s$) | Jig Length ($L_j$) (unless converting to $P_b$) |
| **Thread Turns / Micro-Adjust** | $\text{turns} = \frac{\Delta h}{\text{pitch}}$ | Thread Pitch (if jig adjustable) | Thread Pitch ($P_s$), Micro Marks | Static dimensions |

---

## ⚙️ Technical Specifications & Implementation Plan

### 1. Helper Function: `getRelevantHardwareMeta(item, context)`
Create a clean utility (e.g., in `src/utils/hardwareContext.ts` or `src/services/calculationService.ts`):
```typescript
interface HardwareDisplayContext {
  useProtrusionMode: boolean;
  calcMode?: 'height' | 'projection';
  showThreadTurns?: boolean;
}

export function getJigMeta(jig: JigConfig, ctx: HardwareDisplayContext): string {
  const parts: string[] = [];
  
  // Dj is always needed for Dutchman geometry
  parts.push(`Collar: ${jig.Dj}mm`);

  // Length is only relevant when deriving Projection from Stick-out (Pb)
  if (ctx.useProtrusionMode) {
    if (jig.length !== undefined) {
      parts.push(`Length: ${jig.length}mm`);
    } else {
      parts.push(`⚠️ Missing Length`);
    }
  }

  // Thread pitch is only relevant for adjustable jigs
  if (jig.isAdjustableLength && jig.threadPitch) {
    parts.push(`Pitch: ${jig.threadPitch}mm`);
  }

  return parts.join(' • ');
}
```

### 2. UI Updates in `src/components/calculator/GlobalSetupCard.tsx`
- Replace hardcoded `meta: 'Length: ${j.length || j.Dj}mm'` in `ActionSheetPicker`:
  ```tsx
  <ActionSheetPicker
    isOpen={activeSheet === 'jig'}
    onClose={() => setActiveSheet('none')}
    title="Select Sharpening Jig"
    options={jigs.map(j => ({
      value: j.id,
      label: j.name,
      meta: getJigMeta(j, { useProtrusionMode: !!global.useProtrusionMode }),
      warn: global.useProtrusionMode && !j.length,
    }))}
    value={global.activeJigId || ''}
    onChange={val => setGlobal(g => ({ ...g, activeJigId: val }))}
  />
  ```

### 3. Step-Level Overrides in `src/components/ProgressionView.tsx`
- Ensure step-level hardware indicators only display variables pertinent to the calculation applied for that specific abrasive/pass.

---

## 🤖 Directives for Downstream AI

1. **Do Not Break Schema**: Do not alter `JigConfig` or `UsbConfig` in `src/types/core.ts` or `src/state/schema.ts` without providing backward-compatible Zod fallbacks.
2. **Pure Logic Separation**: Keep display string formatting in a helper function; do not mix DOM strings into `src/math/`.
3. **Ergonomic Guardrail**: If `useProtrusionMode` is enabled and a chosen jig has no `length` defined, display a clear, non-blocking warning badge on the setup card advising the user to set a jig length in Hardware Manager.

---

# Feature Idea: Global Persistent Context-Aware Top Bar

- **Category**: UI Architecture & Ergonomics
- **Date**: 2026-09-10
- **Status**: Ready for Backlog / Implementation (`[PROPOSED]`)
- **Target Repository**: `uwgas` (Universal Wet Grinder Angle Setter)

---

## 🎯 Core Concept
Promote the floating/sticky top bar from `CalculatorView` into a **persistent, global application shell component** (`AppTopBar` in `App.tsx`). 

Its 3-slot layout (`[Left Action] — [Center Title / Status] — [Right Primary Action]`) dynamically updates based on the active route/view context and morphs into contextual action states (e.g., inline deletion/clear confirmations), completely replacing the fragmented top-row headers and back buttons currently scattered across individual menus.

---

## 🔍 Context & Problem Solved

### Current Pain Points
1. **Fragmented Navigation & Headers**:
   - **Calculator**: Has a custom sticky top bar (`Clear All` | `Progression` | `+ Add Step`) with inline confirmation (`No` | `Clear Progression?` | `Yes`).
   - **Wheel Manager**: Has an independent non-sticky header (`<h2>Wheel Manager</h2>` | `+ Add Wheel`).
   - **Settings Subviews**: Has a standalone floating back button (`← Back to Settings`) placed awkwardly above subview cards.
   - **Hardware & Machine Managers**: Duplicate headers, with "+ Add" buttons placed at the bottom footer rather than the top bar.
2. **Inconsistent Touch Targets & Spatial Layout**:
   - As the user switches between tabs or navigates into settings subviews, top-level controls jump positions, creating cognitive friction.
3. **Wasted Vertical Screen Real Estate**:
   - Having separate back buttons, section headers, and subview title bars crowds the 360px–390px mobile viewport.

### Proposed Solution
Unify all views under a single, persistent, morphing top bar rendered directly in `App.tsx`:
- Standardized height (`--top-bar-thickness`, ~60px), matching the dark zinc neumorphic styling (`bg-[#262626]/90 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl`).
- Reusable inline confirmation state pattern (Left = Cancel/No, Center = Warning Question, Right = Destructive/Confirm) across all views (e.g. deleting a wheel, deleting a machine, resetting settings).

---

## 📊 View Context State Matrix

| View / Route | Left Action Slot | Center Title / Status | Right Primary Action Slot | Contextual / Inline Confirmation State |
| :--- | :--- | :--- | :--- | :--- |
| **Calculator** | `Clear All` (disabled if 0 steps) | `Progression` | `+ Add Step` | **Confirm Clear**: `No` \| `Clear Progression?` \| `Yes` |
| **Wheels Manager** | *(Optional)* Sort / Filter | `Wheels` | `+ Add Wheel` | **Confirm Delete**: `Cancel` \| `Delete [Wheel]?` \| `Delete` |
| **Settings (Root)** | App Version badge | `Settings` | *(Optional)* Dev Mode toggle | — |
| **Settings Subviews** (Hardware, Machine, Measurement, Import, Glossary, Dev) | `← Back` (returns to Settings root or Dev) | Subview Name (e.g., `Machines`, `Hardware`, `Glossary`) | Context Action: `+ Add Machine`, `+ Add Jig/USB`, or `Export` | **Confirm Delete/Reset**: `Cancel` \| `Are you sure?` \| `Confirm` |

---

## ⚙️ Technical Architecture & Implementation Plan

### 1. State Management (`src/state/uiStore.ts`)
Provide a lightweight header registration mechanism or derive the top bar configuration directly from the active view state:

```typescript
export interface TopBarConfirmation {
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

// In uiStore slice:
topBarConfirmation: TopBarConfirmation | null;
setTopBarConfirmation: (conf: TopBarConfirmation | null) => void;
```

### 2. Component Structure: `src/components/layout/AppTopBar.tsx`
Extract the calculator header markup into a generic shell:
```tsx
export function AppTopBar() {
  const view = useUIStore(s => s.view);
  const settingsView = useUIStore(s => s.settingsView);
  const confirmation = useUIStore(s => s.topBarConfirmation);

  if (confirmation) {
    return (
      <header className="sticky top-2 z-30 flex items-center justify-between mb-4 px-2 py-2 bg-[#262626]/90 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl transition-all duration-300">
        <button onClick={confirmation.onCancel}>
          {confirmation.cancelLabel ?? 'Cancel'}
        </button>
        <span className="text-red-400 font-bold uppercase text-xs sm:text-sm truncate px-2">
          {confirmation.message}
        </span>
        <button onClick={confirmation.onConfirm} className="bg-red-500 text-white ...">
          {confirmation.confirmLabel ?? 'Confirm'}
        </button>
      </header>
    );
  }

  // Render context-specific 3-slot layout based on `view` and `settingsView`
}
```

### 3. Migration & Codebase Cleanup
1. **`src/App.tsx`**: Mount `<AppTopBar />` right above `<main className="flex-1 w-full">`.
2. **`src/views/CalculatorView.tsx`**: Remove the local sticky header and `isConfirmingClear` state.
3. **`src/components/wheels/WheelManagerView.tsx`**: Remove local `<h2>Wheel Manager</h2>` header row and connect "+ Add Wheel" to `AppTopBar`.
4. **`src/views/SettingsView.tsx`**: Remove standalone floating back button (`handleBack`).
5. **`src/components/settings/HardwareManagerView.tsx` & `MachineManagerView.tsx`**: Move "+ Add" action into the top bar's right slot.

---

## 🤖 Directives for Downstream AI

1. **Workshop Ergonomics**: All top-bar interactive elements must strictly adhere to the $\ge 44\text{px} \times 44\text{px}$ touch target rule and prevent horizontal text overflow on 360px viewports.
2. **Animation Continuity**: Preserve the smooth height/opacity CSS transition when morphing into confirmation mode (`transition-all duration-300`).
3. **Z-Index Coordination**: Ensure `AppTopBar` maintains `z-30` or `z-40` so it stays above scrolling content while properly sitting beneath modals (`ModalShell` is `z-50`).
4. **Sticky / Safe Area Alignment**: Top bar should sit at `sticky top-2` (or `pt-safe`) with standard margin clearance.
