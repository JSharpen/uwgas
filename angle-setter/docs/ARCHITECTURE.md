# UWGAS Technical Architecture & Mathematical Foundation

> **Universal Wet Grinder Angle Setter (UWGAS)**
> *Technical specifications, mathematical formulas, state model, and architectural design.*

---

## 📐 Mathematical Model (Dutchman / Ton Trigonometry)

UWGAS implements the exact geometric model developed by Dutchman and Ton for Tormek-style wet sharpeners.

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
       [Machine Base]
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
| $\Delta\beta$ | Angle Offset / MicroBump | Incremental angle adjustments applied globally or per-step (degrees) |
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
   $$\beta_{\text{total}} = \text{deg2rad}(\beta + \text{microBump} + \text{angleOffset})$$

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

State is managed client-side and saved to `localStorage` with versioned migrations (`src/state/storage.ts`).

### Schema Definition (`AppPersistedState`)

```typescript
export type AppPersistedState = {
  version: number;                // Incremented on schema changes
  global: GlobalState;            // A, Ds, targetAngle, jig (Dj), microBump
  constants: MachineConstants;    // { rear: { hc, o }, front: { hc, o } }
  wheels: Wheel[];                // Array of available wheels (D, grit, honing flag, etc.)
  sessionSteps: SessionStep[];    // Active progression sequence
  sessionPresets: SessionPreset[];// User saved progression presets
  heightMode?: 'hn' | 'hr';      // Preferred readout display mode
  calibSnapshots?: CalibrationSnapshot[]; // Historical calibration records
  calibAppliedIds?: { rear: string; front: string };
};
```

### Migration Rules
- When updating schema properties, never remove existing fields without providing a migration fallback in `_load()`.
- Always increment `PERSIST_VERSION` in `src/state/storage.ts` when adding non-backwards-compatible attributes.
- Ensure `ImportExportPanel.tsx` validates imported JSON against the active schema before overwriting state.

---

## 🧱 Component Hierarchy & Modularization Map

```
src/
├── main.tsx                    # Entry point & theme initializer
├── App.tsx                     # Main layout & orchestrator (Under Refactoring)
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
│   └── useModalLayout.ts       # Modal backdrop, ESC listener, and click-outside handler
└── components/
    ├── CalibrationWizard.tsx   # Calibration multi-step solver & measurement inputs
    ├── ProgressionView.tsx     # Active sharpening sequence & wheel result cards
    ├── ImportExportPanel.tsx   # JSON backup, restore, & factory reset
    ├── GlossaryPage.tsx        # Formula references & terminology guide
    ├── GlossaryCard.tsx        # Collapsible terminology cards
    ├── GrindDirToggle.tsx      # Leading / Trailing base selector
    ├── MiniSelect.tsx          # Custom lightweight dropdown UI
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
  - Minimum touch target: $44\text{px} \times 44\text{px}$ for interactive elements.
  - Large-scale high-contrast monospace fonts for numerical readouts ($h_n, h_r$).
  - Full keyboard navigation support (Enter/Escape modal handling, number incrementers).

