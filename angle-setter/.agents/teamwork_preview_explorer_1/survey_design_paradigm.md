# Modern Sleek Design Paradigm Specification
**Universal Wet Grinder Angle Setter (UWGAS)**
*Authoritative visual design system specification derived from `src/components/ProgressionView.tsx`*

---

## 1. Executive Summary & Paradigm Principles

The **"Modern Sleek"** design paradigm represents the benchmark UI aesthetic for the entire UWGAS application. First established in `src/components/ProgressionView.tsx` and the `GlobalSetupCard` summary pill, this design language replaces legacy CSS-class based gradients and boxy panels (`.panel-card`, `.card-elevated`, `.u-surface`, `.u-btn`) with a unified, high-contrast, tactile dark interface tailored specifically for workshop tablet and mobile bench usage.

### Core Paradigm Principles:
1. **Elevated Monochromatic Slate Surfaces**: Cards float on a deep canvas (`#09090b`) using smooth dark slate surfaces (`bg-[#262626]`), accented with subtle white translucent edge lighting (`border-white/10`, `bg-gradient-to-b from-white/[0.03] to-transparent`).
2. **Generous Continuous Radii**: Distinctive rounded hierarchy using `rounded-3xl` (24px) for primary cards and modal shells, `rounded-2xl` (16px) for input wells and sub-groupings, `rounded-xl` (12px) for steppers and buttons, and `rounded-full` for pills and status badges.
3. **Massive High-Contrast Typography**: Readouts are legible from 1–2 meters away with bold monospace numerals (`text-3xl sm:text-4xl font-extrabold tracking-tighter` or `text-5xl font-bold font-mono`), paired with crisp, tracking-spaced uppercase micro-labels (`text-[10px] text-white/40 uppercase tracking-widest font-bold`).
4. **Targeted Workshop Ergonomics**: Minimum 44x44px touch targets (or `w-10 h-10` with padded surrounding hit areas), tactile steppers with `-` / `+` pills, generous padding (`p-6`, `gap-4`), and uncrowded mobile scaling down to 380px screen widths.
5. **Purposeful Semantic Accents**: Amber (`--color-accent` / `#f59e0b`) for primary progression actions and active states; Sky Blue (`--color-focus` / `#38bdf8`) for support bars and trailing edges; Red (`#ef4444`) for destructive actions and out-of-range warnings.

---

## 2. Exhaustive Design Token Catalog

### 2.1 Background Colors & Surfaces

| Token / Class | Hex / Alpha Equivalent | Context & Usage |
| :--- | :--- | :--- |
| `u-bg` / `bg-[#09090b]` | `#09090b` (Zinc-950) | Root application canvas and backdrop background |
| `bg-[#262626]` | `#262626` (Slate/Zinc-800+) | **Authoritative Card Surface**: All top-level cards, modal dialogs, summary bars |
| `bg-black/20` | `rgba(0, 0, 0, 0.20)` | Accordion expanded drawer backgrounds, secondary card recesses |
| `bg-black/30` | `rgba(0, 0, 0, 0.30)` | Stepper containers, dropdown trigger wells, input field enclosures |
| `bg-black/40` | `rgba(0, 0, 0, 0.40)` | Step index badges, high-contrast dark circular icons |
| `bg-black/60` / `bg-black/70` | `rgba(0, 0, 0, 0.60–0.70)` | Modal backdrop overlay, action sheet backdrop |
| `bg-white/5` | `rgba(255, 255, 255, 0.05)` | Default button surface, inactive chips, hover state idle |
| `hover:bg-white/5` | `rgba(255, 255, 255, 0.05)` | Interactive card and list item hover highlight |
| `bg-white/10` | `rgba(255, 255, 255, 0.10)` | Secondary action buttons, active navigation items |
| `hover:bg-white/10` | `rgba(255, 255, 255, 0.10)` | Stepper button hover state, action button hover |
| `active:bg-white/10` | `rgba(255, 255, 255, 0.10)` | Card press / tap feedback |
| `hover:bg-white/20` | `rgba(255, 255, 255, 0.20)` | Secondary action button hover / active state |
| `bg-neutral-950` | `#0a0a0a` | Segmented control track background, bottom navigation bar |
| `bg-neutral-900` / `bg-[#1f1f23]` | `#171717` / `#1f1f23` | Bottom action sheet container surface, drawer body |
| `bg-accent/10` | `rgba(245, 158, 11, 0.10)` | Amber badge/pill tint, active selection highlight |
| `bg-red-500/10` | `rgba(239, 68, 68, 0.10)` | Danger button background, clear all button background |
| `hover:bg-red-500/20` | `rgba(239, 68, 68, 0.20)` | Danger button hover state |

---

### 2.2 Borders, Dividers & Opacity

| Token / Class | Value | Context & Usage |
| :--- | :--- | :--- |
| `border border-white/10` | `rgba(255, 255, 255, 0.10)` | **Authoritative Card Outer Border**: Clean, subtle definition on dark slate |
| `border border-white/5` | `rgba(255, 255, 255, 0.05)` | Stepper wells, sub-panel enclosures, dropdown buttons |
| `border-t border-white/5` | `rgba(255, 255, 255, 0.05)` | Accordion drawer top divider, section separation line |
| `border border-neutral-800` | `#262626` | Step index number circle borders, bottom nav top border |
| `border border-neutral-700/60` | `rgba(63, 63, 70, 0.60)` | Drawer upper lip border, action sheet divider |
| `border-dashed border-white/10` | `rgba(255, 255, 255, 0.10)` | Empty state cards / placeholders |
| `border-accent/30` | `rgba(245, 158, 11, 0.30)` | Selected item card border, active input focus |
| `border-danger/30` | `rgba(239, 68, 68, 0.30)` | Error/invalid input border |

---

### 2.3 Border Radius Rules

| Class | Pixel Radius | Application Rules |
| :--- | :--- | :--- |
| `rounded-3xl` | 24px (1.5rem) | **Top-Level Structural Cards**: Step cards in `ProgressionView`, Global Setup summary pill, modal dialog root containers, empty state cards |
| `rounded-2xl` | 16px (1.0rem) | **Sub-Panels & Interactive Enclosures**: Stepper outer containers, dropdown select buttons, large action buttons, modal form cards |
| `rounded-xl` | 12px (0.75rem) | **Buttons & Controls**: Stepper `-` / `+` buttons, sort arrows, delete buttons, small input pills |
| `rounded-lg` | 8px (0.5rem) | **Compact Controls**: Small tags, secondary chips, compact modal fields |
| `rounded-full` | 9999px | **Pills & Circular Badges**: Step numbers (`w-6 h-6`), segmented control tracks/pills, angle offset badges, drawer drag nibs (`w-10 h-1.5`) |

---

### 2.4 Typography Scales & Responsive Hierarchy

| Typography Role | Classes | Responsive Scaling | Example Content |
| :--- | :--- | :--- | :--- |
| **Massive Primary Readout** | `text-3xl sm:text-4xl font-extrabold text-white tracking-tighter` | Down to `text-3xl` on narrow mobile (<400px), `text-4xl` on sm+ | `152.45 mm`, `38.20 mm` |
| **Numeric Unit Suffix** | `text-lg text-white/50 font-medium ml-1` | Inline with massive readout | `mm`, `°` |
| **Drawer Big Input Display** | `text-4xl sm:text-5xl font-bold font-mono text-center text-white` | Scales `text-4xl` to `text-5xl` | `15.0°`, `120.0 mm` |
| **Primary Title / Step Name** | `text-lg font-semibold text-white tracking-wide truncate` | Text truncation prevents row break | `SG-250 Original`, `Japanese Waterstone 4000` |
| **Section Header** | `text-lg font-bold text-neutral-200` | Static crisp sizing | `Progression`, `Machine Profiles` |
| **Micro Section / Label** | `text-[10px] text-white/40 uppercase tracking-widest font-bold` | With `pl-1` alignment | `WHEEL DIAMETER`, `MICRO-BEVEL (Δ°)`, `MACHINE OVERRIDE` |
| **Secondary Readout / Delta** | `text-[10px] uppercase tracking-widest font-bold` | Amber for machine, Focus for USB, White/40 for delta | `Δ +1.20 MM`, `TORMEK T-8`, `15.0° / REAR BASE` |
| **Value Display in Stepper** | `text-sm font-mono font-bold text-white` | Monospace prevents jitter | `248.0 mm`, `+0.5°` |
| **Action Sheet Option Title** | `text-sm sm:text-base font-semibold text-white` | High contrast tap targets | `Tormek T-8 Shop`, `KJ-45 Centering Jig` |
| **Action Sheet Option Meta** | `text-xs text-neutral-400 font-mono` | Right-aligned metadata | `D: 250mm`, `Ds: 12mm` |

---

### 2.5 Accent Colors & Indicator System

- **Amber Primary Accent** (`#f59e0b`, `--color-accent`): Active presets, primary calculations, angle offsets, rear base leading icon (`IconEdgeLeading`).
- **Amber Tint Surface** (`bg-accent/10` / `bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]`): Pill badges, active state highlights.
- **Sky Blue Focus Accent** (`#38bdf8`, `--color-focus`): USB support bars, front base trailing icon (`IconEdgeTrailing`), focus outlines.
- **Danger Red** (`#ef4444`, `--color-danger`): Negative angle bump, delete buttons, clear all, out-of-reach (OOR) warning states.
- **Red Tint Surface** (`bg-red-500/10` / `bg-danger/20`): Destructive action pills, delete step buttons.
- **Emerald Indicator** (`#10b981`, `emerald-400/500`): Successful calibration diagnostics, verified precision status.

---

### 2.6 Visual Accents & Lighting Layer

All primary cards in the Modern Sleek paradigm feature an edge-lighting top gradient layer:
```tsx
{/* Subtle Edge Highlight */}
<div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />
```
This creates refined depth and a sleek machined-chassis rim effect without relying on muddy CSS drop shadows.

---

## 3. Standard UI Component Blueprints

### 3.1 Step Card Blueprint (`ProgressionView.tsx`)

```tsx
<div className="bg-[#262626] rounded-3xl border border-white/10 shadow-lg relative flex flex-col motion-list-item transition-all duration-300 group">
  {/* Edge Highlight */}
  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />
  
  {/* Clickable Header / View State */}
  <div 
    className="flex justify-between items-center p-6 relative z-10 cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors rounded-3xl"
    onClick={() => setExpanded(!expanded)}
  >
    {/* Left Identity Area */}
    <div className="flex flex-col gap-1 min-w-0 flex-1 pr-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-xs font-bold font-mono text-white border border-neutral-800 shrink-0">
          {index + 1}
        </div>
        <span className="text-lg font-semibold text-white tracking-wide truncate">
          {stepName}
        </span>
        {hasBadge && (
          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-accent/20 text-accent">
            +0.5°
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 pl-8">
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
          15.0° / REAR BASE
        </span>
      </div>
    </div>

    {/* Right Massive Readout */}
    <div className="flex flex-col items-end shrink-0">
      <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tighter">
        145.20<span className="text-lg text-white/50 font-medium ml-1">mm</span>
      </span>
      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">
        Δ +1.20 MM
      </span>
    </div>
  </div>

  {/* Expandable Drawer Body */}
  <div className={`relative z-10 bg-black/20 overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-[500px] opacity-100 border-t border-white/5' : 'max-h-0 opacity-0'}`}>
    <div className="p-6 flex flex-col gap-4">
      {/* Steppers & Controls */}
    </div>
  </div>
</div>
```

---

### 3.2 Workshop Stepper Blueprint

```tsx
<div className="flex-1 flex flex-col gap-1.5 w-full">
  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1 flex justify-between">
    <span>Wheel Diameter</span>
    <span className="text-white/30 hover:text-white cursor-pointer" onClick={onChange}>Change</span>
  </label>
  <div className="bg-black/30 border border-white/5 rounded-2xl flex items-center justify-between p-1">
    <button 
      type="button"
      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-white/60 font-bold transition"
      onClick={handleDecrement}
    >
      -
    </button>
    <span className="text-sm font-mono font-bold text-white">250.0 mm</span>
    <button 
      type="button"
      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-white/60 font-bold transition"
      onClick={handleIncrement}
    >
      +
    </button>
  </div>
</div>
```

---

### 3.3 Action Sheet Trigger Blueprint

```tsx
<div className="flex-1 flex flex-col gap-1.5 w-full">
  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Machine Override</label>
  <button 
    type="button"
    className="flex items-center justify-between w-full p-2.5 bg-black/30 hover:bg-white/5 border border-white/5 rounded-2xl text-xs font-semibold text-white transition"
    onClick={onOpenSheet}
  >
    <span className="truncate">Tormek T-8 Shop</span>
    <span className="text-white/30 ml-2">▼</span>
  </button>
</div>
```

---

### 3.4 Modal Shell Blueprint (`ModalShell.tsx`)

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
  <div className="relative w-full max-w-lg bg-[#262626] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col motion-dialog">
    {/* Top Edge Highlight */}
    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-3xl z-0" />

    {/* Header */}
    <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
        {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
      </div>
      <button 
        type="button"
        onClick={onClose}
        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition"
      >
        <IconClose className="w-5 h-5" />
      </button>
    </div>

    {/* Body */}
    <div className="relative z-10 p-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
      {children}
    </div>

    {/* Footer (if provided) */}
    {footer && (
      <div className="relative z-10 px-6 pb-6 pt-2 flex justify-end gap-2 border-t border-white/5">
        {footer}
      </div>
    )}
  </div>
</div>
```

---

### 3.5 Action Sheet Picker Blueprint (`ActionSheetPicker.tsx`)

```tsx
<div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto">
  {/* Backdrop */}
  <div 
    className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-250 ${isClosing ? 'opacity-0' : 'opacity-100 animate-in fade-in'}`}
    onClick={handleClose}
  />
  
  {/* Sheet */}
  <div 
    className={`relative w-full bg-[#1f1f23] border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col max-h-[80vh] transition-transform duration-250 ease-out ${isClosing ? 'translate-y-full' : 'animate-in slide-in-from-bottom-full'}`}
  >
    {/* Handle Bar & Title */}
    <div className="flex flex-col items-center pt-3 pb-3 px-6 shrink-0">
      <div className="w-12 h-1.5 bg-white/20 rounded-full mb-3" />
      <h3 className="text-base font-bold text-white">{title}</h3>
    </div>

    {/* List */}
    <div className="overflow-y-auto overscroll-contain px-6 pb-8 flex flex-col gap-2.5">
      {options.map(opt => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
              isSelected 
                ? 'bg-accent/10 border-accent/40 text-accent font-bold' 
                : 'bg-black/30 border-white/5 text-white/90 hover:bg-white/5'
            }`}
            onClick={() => handleSelect(opt.value)}
          >
            <span className="font-medium text-left truncate">{opt.label}</span>
            {opt.meta && (
              <span className={`text-xs font-mono ml-2 shrink-0 ${isSelected ? 'text-accent/80 font-bold' : 'text-white/40'}`}>
                {opt.meta}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
</div>
```

---

## 4. Global Architecture & Base Wrappers Inspection

### 4.1 Root Layout in `App.tsx`
The root app wrapper is configured as:
```tsx
<div className="min-h-dvh u-bg p-3 sm:p-4 pb-[140px] flex flex-col gap-4 max-w-4xl mx-auto">
```
- `min-h-dvh`: Uses dynamic viewport height to prevent mobile browser URL bar jump.
- `p-3 sm:p-4`: Fluid mobile padding.
- `pb-[140px]`: Generous bottom padding to clear the pinned Global Setup drawer and fixed bottom tab navigation.
- `max-w-4xl mx-auto`: Centers content on desktop and tablet screens.

### 4.2 Bottom Tab Navigation
```tsx
<div className="fixed bottom-0 left-0 right-0 h-16 bg-neutral-950 border-t border-neutral-800 flex items-center justify-around z-40 pb-safe">
```
- Needs slight visual update: `border-t border-white/10 bg-[#18181b]/95 backdrop-blur-md` to match the Modern Sleek palette.

### 4.3 Tailwind & CSS Bridge
- `tailwind.config.js` is clean with standard Tailwind extensions.
- `src/index.css` contains global CSS variable definitions, radial backgrounds, and legacy `.panel-card` / `.card-elevated` utility bridges.
- **Key Strategy**: During the visual refactor, replace hardcoded legacy classes (`.panel-card`, `.card-elevated`, `.u-surface`, `.u-btn`, `.u-border`) in JSX components directly with explicit Tailwind classes (`bg-[#262626]`, `border border-white/10`, `rounded-3xl`, `rounded-2xl`, etc.) matching `ProgressionView.tsx`.

---

## 5. Component-by-Component Migration Spec & Gap Analysis

| Component | Current Legacy Style | Target "Modern Sleek" Specification | Specific Changes Required |
| :--- | :--- | :--- | :--- |
| **`ModalShell.tsx`** | `rounded-lg border u-border u-surface p-4 shadow-xl`, `.modal-shell__header` | `bg-[#262626] border border-white/10 rounded-3xl shadow-2xl`, `bg-gradient-to-b from-white/[0.04]`, modern close button (`w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10`) | Replace legacy CSS classes with Tailwind tokens, update header/footer padding to `p-6`, add top edge highlight. |
| **`PresetManagerModal.tsx`** | Compact list `rounded border u-border u-surface px-2 py-2`, small `BTN.base` / `BTN.primary` | Card list `bg-black/30 border border-white/5 rounded-2xl p-4`, `w-10 h-10` / `px-4 h-10 rounded-xl` action buttons, active preset pill `bg-accent/20 text-accent rounded-full` | Remove `u-border`, `u-surface`, `BTN.*` classes; apply 16px radius cards and generous touch buttons. |
| **`SavePresetDialog.tsx`** | Small input `rounded border u-border px-2 py-1`, `BTN.primary` | `bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-base text-white`, `rounded-xl` action buttons | Elevate text input to touch-friendly height, update button styles. |
| **`SettingsRootView.tsx`** | Boxy `panel-card panel-card--strong`, `u-text`, `border-neutral-800/50` | `bg-[#262626] border border-white/10 rounded-3xl shadow-xl overflow-hidden`, item hover `hover:bg-white/5 active:bg-white/10`, `p-5` | Upgrade root card to `bg-[#262626] rounded-3xl border-white/10`, improve typography hierarchy and chevron styling. |
| **`MeasurementSettingsView.tsx`** | `card-elevated flex flex-col p-4`, custom checkbox switch | `bg-[#262626] border border-white/10 rounded-3xl p-6`, segmented controls with `bg-neutral-950 rounded-full border border-white/5 p-1` | Modernize card containers, adjust toggle switches to amber accent `bg-accent`, ensure responsive stacking. |
| **`MachineManagerView.tsx`** | `card-elevated`, legacy `BTN.primaryFlat`, small inline edit/trash buttons | `bg-[#262626] border border-white/10 rounded-3xl p-6`, machine cards with `bg-black/20 border border-white/5 rounded-2xl p-5`, `w-10 h-10 rounded-xl` action buttons | Transform list into modern cards, update Add/Edit modals with Modern Sleek inputs. |
| **`HardwareManagerView.tsx`** | Segmented tab `bg-neutral-950 p-1 rounded-lg`, `card-elevated` items | Modern tab pill `bg-black/40 border border-white/10 rounded-full p-1`, hardware cards `bg-[#262626] border border-white/10 rounded-2xl p-4`, touch-friendly steppers/inputs | Align card styling, modernize delete confirmation banner. |
| **`WheelManagerView.tsx`** | `panel-card panel-card--strong`, `card-elevated wheel-card` with blue accent strip | `bg-[#262626] border border-white/10 rounded-3xl p-6`, wheel item cards `bg-black/20 border border-white/5 rounded-2xl p-4 hover:bg-white/5` | Remove legacy wheel header gradients (`wheel-card__header`), replace with clean Modern Sleek headers, `font-mono` readouts. |
| **`WheelFormFields.tsx`** | `rounded-lg border u-border u-surface p-3`, small text inputs | `bg-black/30 border border-white/5 rounded-2xl p-4`, `rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm font-mono text-white` | Modernize form cards, increase touch heights on inputs and radio selectors. |
| **`CalibrationWizard.tsx`** | `u-surface rounded shadow`, `card-elevated p-3 border-l-2 border-l-blue-500`, `input-base` | `bg-[#262626] border border-white/10 rounded-3xl p-6`, measurement cards `bg-black/30 border border-white/5 rounded-2xl p-4`, large mono inputs | Overhaul wizard steps, measurement step indicator, and results diagnostics into Modern Sleek cards. |
| **`GlossaryPage.tsx` / `GlossaryCard.tsx`** | `panel-card panel-card--strong` | `bg-[#262626] border border-white/10 rounded-3xl p-6`, item rows `bg-black/20 border border-white/5 rounded-2xl p-4` | Modernize glossary cards and formula diagram placeholders. |
| **`ImportExportPanel.tsx`** | `btn-toggle`, `panel-card`, `u-btn` | `bg-[#262626] border border-white/10 rounded-3xl p-6`, section cards `bg-black/20 border border-white/5 rounded-2xl p-4` | Replace legacy toggle button styles and buttons with Modern Sleek pills and switches. |
| **`ActionSheetPicker.tsx`** | `bg-neutral-900 border-t border-neutral-700 rounded-t-2xl` | `bg-[#1f1f23] border-t border-white/10 rounded-t-3xl`, option buttons `bg-black/30 border border-white/5 rounded-2xl p-4` | Modernize action sheet container, rounded-t-3xl corners, and option item styling. |
| **`GlobalSetupCard.tsx`** | Pinned drawer `bg-neutral-900 border-neutral-700/60`, summary pill `bg-[#262626] border-neutral-600` | Align drawer styling with `bg-[#1f1f23] border border-white/10 rounded-t-3xl`, summary pill `border border-white/10`, stepper wells `bg-black/30 rounded-2xl` | Ensure complete parity with ProgressionView styling across all inner steppers and inputs. |

---

## 6. Implementation Checklist & Verification Matrix

When refactoring components to match this specification:

- [ ] **Background Check**: Primary cards use `bg-[#262626]`; sub-panels use `bg-black/20` or `bg-black/30`; no `bg-white` or legacy `.u-surface` / `.panel-card` classes remain.
- [ ] **Border Check**: Outer cards use `border border-white/10`; sub-panels use `border border-white/5`; no `.u-border` classes remain.
- [ ] **Radius Check**: Primary containers use `rounded-3xl`; groups use `rounded-2xl`; buttons/steppers use `rounded-xl`; badges/pills use `rounded-full`.
- [ ] **Typography Check**: Numbers use `font-mono` or `font-extrabold`; labels use `text-[10px] text-white/40 uppercase tracking-widest font-bold`.
- [ ] **Touch Targets**: Steppers and buttons maintain at least 44x44px touch envelopes (`w-10 h-10` with enclosing padding).
- [ ] **Responsiveness**: Verified layout down to 380px without horizontal scroll or truncated critical controls.
- [ ] **Purity & Safety**: Zero business logic, React hooks, mathematical calculations, or state migrations altered.
