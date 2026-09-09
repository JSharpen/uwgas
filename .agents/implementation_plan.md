# App Architecture Refactor: Global State Migration

The high-level goal of this task is to make the application faster, easier to work on, and less error-prone by eliminating "Prop Drilling" and dismantling the "God Component" (`App.tsx`). This will reduce AI context usage and make adding future features significantly simpler.

## User Review Required

> [!WARNING]
> **No code will be written until this plan is explicitly approved.** 
> As discussed, this plan should be reviewed by architectural subagents (via `/teamwork-preview`) to ensure all edge cases are considered before proceeding.

## Open Questions

> [!IMPORTANT]
> 1. **State Manager Choice**: This plan proposes using `zustand` due to its minimal boilerplate and excellent TypeScript support. Are we okay with adding this lightweight dependency, or do we prefer sticking strictly to React's built-in `Context API`?
> 2. **Local Storage Strategy**: We currently use `storage.ts` to manually read/write to `localStorage`. Zustand has a built-in `persist` middleware that can automate this. Should we migrate to the Zustand persist middleware, or keep the existing custom `storage.ts` logic for now to minimize risk?

## Proposed Changes

We will systematically extract state out of `App.tsx` and into a centralized store.

### Dependency Management

#### [NEW] package.json
- Install `zustand` as a dependency.

---

### Core State Infrastructure

#### [NEW] src/state/store.ts
- Create the core Zustand store.
- Define the state interface encompassing: `global`, `machines`, `jigs`, `usbs`, `wheels`, `sessionSteps`, `sessionPresets`, `heightMode`, and UI/View states.
- Define actions to mutate this state (e.g., `setGlobal`, `addStep`, `loadPreset`).

#### [DELETE] src/state/useAppState.ts
- Remove this unused legacy file to reduce codebase clutter.

---

### Component Refactoring (Decoupling)

#### [MODIFY] src/App.tsx
- Remove all 18+ `useState` hooks.
- Remove all prop-passing from child components.
- Retain only layout structure, navigation bar rendering, and top-level view switching.
- *Bonus*: Extract the massive JSON Import/Export merging logic into a dedicated hook (e.g., `useImportExport.ts`).

#### [MODIFY] src/components/calculator/GlobalSetupCard.tsx
- Remove all incoming props (e.g., `jigs`, `usbs`, `sessionSteps`, `onLoadPreset`, etc.).
- Implement `useStore()` hooks to grab the exact data and actions it needs directly from the global state.

#### [MODIFY] src/components/ProgressionView.tsx (and related step components)
- Remove incoming props related to machine constants, wheels, and global state.
- Wire directly to the Zustand store.

#### [MODIFY] src/components/presets/PresetManagerModal.tsx & SavePresetDialog.tsx
- Wire directly to the store for `isOpen` state, `sessionPresets`, and save/delete actions.

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to ensure no TypeScript interfaces are broken.
- Run `npm run lint` to confirm codebase hygiene.
- Run `npm run build` to verify production compilation.

### Manual Verification
- Test creating a new preset.
- Test altering a global setting (e.g., Target Angle) and verify it updates the progression list instantly.
- Test JSON export/import to ensure the new state structure serializes correctly.
