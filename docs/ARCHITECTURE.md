# UWGAS Technical Architecture & Mathematical Foundation

> **Universal Wet Grinder Angle Setter (UWGAS)**
> *Technical specifications, mathematical formulas, state model, and architectural design.*

---

## 📐 Mathematical Model (Dutchman / Ton Trigonometry)

UWGAS implements the exact geometric model developed by Dutchman and Ton for Tormek-style wet sharpeners. For worked test vectors and verification tables, see [`docs/MATH_REFERENCE.md`](MATH_REFERENCE.md).

```
       [USB Bar (top)]
            (•) Ds
             |  \
             |   \  CA
             |    \
     y       |     \
 (vertical)  |      \
             |       \
             |   o    \
  [Axle] ----+---------• (Axle Centre)
             |
             hc (datum offset)
             |
       [Machine Base Datum]
```

### Geometric Parameters & Symbols

| Symbol | Parameter | Description |
| :--- | :--- | :--- |
| $D_w$ ($D$) | Wheel Diameter | Effective outer diameter of the grinding or honing wheel (mm) |
| $R$ | Wheel Radius | $R = D_w / 2$ |
| $A$ | Projection | Distance from knife clamp stop line to the apex/edge (mm) |
| $D_j$ | Jig Diameter | Diameter of the jig collar/bar resting against the USB (mm) |
| $D_s$ | USB Diameter | Diameter of the Universal Support Bar (typically 12.0 mm) |
| $\beta$ (`betaDeg`) | Target Angle | Target grinding bevel angle per side (degrees) |
| $\Delta\beta$ | Angle Offset | Incremental angle adjustment applied per-step (degrees) |
| $h_c$ | Vertical Constant | Height offset from machine base datum to axle centre line (mm) |
| $o$ | Horizontal Offset | Horizontal offset between axle centre line and USB mount base (mm) |
| $h_n$ | Base Height | Measured distance from machine datum base to the top of the USB (mm) |
| $h_r$ | Wheel-to-USB Height | Distance from wheel perimeter to the top of the USB (mm) |

### Core Calculation Steps (`computeTonHeights`)

1. **Apex-to-Jig Centre along Tangent line ($jg$):**
   $$jg = A - \frac{D_s}{2}$$

2. **Jig Centre to USB Centre Perpendicular ($CJ$):**
   $$CJ = \frac{D_j}{2} + \frac{D_s}{2}$$

3. **Apex to USB Centre hypotenuse ($CG$):**
   $$CG = \sqrt{jg^2 + CJ^2}$$

4. **Jig Angle offset ($\phi$):**
   $$\phi = \arctan\left(\frac{CJ}{jg}\right)$$

5. **Effective Bevel Angle in Radians ($\beta_{\text{total}}$):**
   $$\beta_{\text{total}} = \text{deg2rad}(\beta + \text{angleOffset})$$

6. **Distance from Wheel Centre to USB Centre ($CA$ - Dutchman Law of Cosines):**
   $$CA = \sqrt{CG^2 + R^2 + 2 \cdot CG \cdot R \cdot \sin(\beta_{\text{total}} - \phi)}$$

7. **Height above Wheel ($h_r$):**
   $$h_r = (CA - R) + \frac{D_s}{2}$$

8. **Vertical Coordinate $y$ and Datum Base Height ($h_n$):**
   $$y = \sqrt{\max(CA^2 - o^2, 0)}$$
   $$h_n = y - h_c + \frac{D_s}{2}$$

---

## 🎯 Machine Calibration Algorithm

The machine constants ($h_c, o$) represent the physical location of the USB support base relative to the main drive axle.

### Calibration Inputs
- Outer-to-outer span $CA_o$ measured with calipers between the main drive axle ($D_a$) and USB ($D_s$).
- Center-to-center span:
  $$CA = CA_o - \frac{D_a}{2} - \frac{D_s}{2}$$
- Datum height measurement $h_n$.

### Mathematical Solver
From the right triangle relationship:
$$CA^2 = (h_n + h_c - D_s/2)^2 + o^2$$

Using $N \ge 2$ paired measurements $(h_{n,i}, CA_i)$, UWGAS runs a non-linear least-squares optimization to solve for $(h_c, o)$ minimizing the sum of squared residuals:
$$S(h_c, o) = \sum_{i=1}^N \left( \sqrt{(h_{n,i} + h_c - D_s/2)^2 + o^2} - CA_i \right)^2$$

Residual diagnostics ($\varepsilon_i$) and maximum error bounds are presented to verify calibration quality.

---

## 💾 State Architecture & Persistence

State is managed client-side using a **slice-based Zustand store** (`src/state/store.ts`). All global data is persisted to the browser's `localStorage` under the key `uwgas_app_state_v1` with a **300ms debounce** to prevent main-thread freezing during continuous UI interactions. Ephemeral UI state (like active tabs or open modals) is kept completely separate in an unpersisted `useUIStore`.

### The Zod Migration Bridge (`src/state/schema.ts`)

To guarantee strict data safety and absolute backwards compatibility, UWGAS uses **Zod** as a runtime schema validator.

When the application boots (or when a user imports a `.json` backup), the Zustand `merge` function intercepts the raw data from `localStorage` and passes it through the Zod schema.
1. **Validation**: Zod strips out any corrupted or strictly invalid data (e.g., `NaN` resulting from a bad math calculation).
2. **Seamless Additions**: If a user's data is from an older version of the app and is missing newly added features (e.g., a new "grit" property on wheels), Zod automatically injects safe default values (using `.optional()` or `.default()`).
3. **Data Loss Warning (`.catch()`)**: Be extremely careful with `.catch()`. If you change a structural key (e.g., renaming `grindAngle` to `targetAngle`), Zod's `.catch()` will not migrate the data; it will discard the old data and insert the factory default. Use proper migration logic in `storage.ts` for structural changes.

### Solver Architectural Flow
1. **Height Solver Mode (`calcMode: 'height'`)**:
   - Inputs: Projection $A$, Target Angle $\beta$, step offsets $\Delta\beta$.
   - Output: Calculated USB heights ($h_n$ base datum, $h_r$ wheel surface).
2. **Projection Solver Mode (`calcMode: 'projection'`)**:
   - Inputs: Fixed USB Height ($h_n$ or $h_r$), Target Angle $\beta$, step offsets $\Delta\beta$.
   - Output: Calculated required knife projection $A$ per wheel with reachability boundary checks.

### Schema Version History & Migrations

| Schema Version | Storage Key | Migration Strategy |
| :--- | :--- | :--- |
| **Legacy v0** | Multiple Keys | Unversioned synchronous localStorage. Migrated seamlessly by Zustand initialization. |
| **`v1` (Zustand)** | `uwgas_app_state_v1` | Unified debounced JSON. Schema changes managed via proper storage migrations and Zod `.optional()` fallbacks. |

### Migration Rules
- **NEVER** introduce breaking changes to the state. Always update `src/state/schema.ts` to gracefully handle legacy user data.
- Ensure `ImportExportPanel.tsx` continues to validate imported JSON against the Zod schema before overwriting state.

---

## 🧱 Component Hierarchy & Architecture Map

```
src/
├── main.tsx                    # Entry point & theme initializer
├── App.tsx                     # Main layout orchestrator (~500 lines)
├── icons.tsx                   # SVG icon system
├── version.ts                  # App version & build metadata
├── math/
│   └── tormek.ts               # Pure Dutchman/Ton math engine & calibration solver
├── state/
│   ├── defaults.ts             # Default machine constants, global settings, & stock wheels
│   ├── storage.ts              # LocalStorage load/save & version migrations
│   └── useAppState.ts          # State hooks & reducers
├── types/
│   └── core.ts                 # TypeScript type definitions
├── ui/
│   └── buttons.ts              # Standardized button variants & utility classes
├── hooks/
│   └── useModalLayout.ts       # Modal backdrop, ESC listener, virtual keyboard offset
├── utils/
│   ├── dom.ts                  # DOM helpers (blurOnEnter)
│   ├── numbers.ts              # Numerical coercion (_nz)
│   └── normalizers.ts          # Robust state & snapshot normalizers
└── components/
    ├── calculator/
    │   ├── GlobalSetupCard.tsx    # Projection A, Angle β steppers, quick chips, MicroBump
    │   └── ProgressionEditor.tsx  # Step cards, base toggle, offsets, delete animation, notes
    ├── wheels/
    │   ├── WheelManagerView.tsx   # Wheel catalog, sorting, grouping, modal triggers
    │   └── WheelFormFields.tsx    # Reusable wheel attribute inputs
    ├── presets/
    │   ├── PresetManagerModal.tsx # Preset list, renaming, loading, deletion
    │   └── SavePresetDialog.tsx   # Save current progression dialog
    ├── settings/
    │   └── MachineConstantsCard.tsx # Front & rear base geometry and calibration bindings
    ├── CalibrationWizard.tsx   # Calibration multi-step solver & measurement inputs
    ├── ProgressionView.tsx     # Active sharpening sequence & wheel result cards
    ├── ImportExportPanel.tsx   # JSON backup, restore, & factory reset
    ├── GlossaryPage.tsx        # Formula references & terminology guide
    ├── GlossaryCard.tsx        # Collapsible terminology cards
    ├── GrindDirToggle.tsx      # Leading / Trailing base selector
    ├── MiniSelect.tsx          # Custom lightweight dropdown UI
    ├── ModalShell.tsx          # Accessible modal wrapper
    ├── ExpandToggle.tsx        # Chevron collapsible button
    └── ThemeLab.tsx            # Live CSS variable customizer & color tokens
```

---

## 🎨 Design System & Theme Engine

The styling uses **Tailwind CSS v4** with a custom CSS variable design token layer defined in `src/theme.css` and `src/primitives.css`.

- **Semantic Color Tokens**:
  - `--color-bg-primary`, `--color-bg-surface`, `--color-bg-elevated`
  - `--color-text-primary`, `--color-text-muted`, `--color-accent`
  - `--color-border-subtle`, `--color-border-focus`
- **Workshop Usability Standards**:
  - Minimum touch target: Aim for $44\text{px} \times 44\text{px}$ for interactive elements, but use judgment if space is tight.
  - **Viewport Constraints**:
    - **Minimum Target (360px)**: Covers base Androids (e.g., Galaxy S23). Try to keep content visible without wrapping or overlapping. If a row of buttons or complex UI cannot fit, prefer horizontal scrolling or wrapping over breaking the layout.
    - **Comfortable Baseline (390px - 393px)**: Target for modern devices (iPhone 13+, Pixel 8). UI should feel spacious and balanced.
  - Large-scale high-contrast monospace fonts for numerical readouts ($h_n, h_r$).
  - Full keyboard navigation support (Enter/Escape modal handling, number incrementers).
