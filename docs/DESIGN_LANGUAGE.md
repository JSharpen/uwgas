# UWGAS Design Language Rules

> **Universal Wet Grinder Angle Setter (UWGAS)**
> *This document sets the strict UI design, implementation, and styling constraints for the app. All AI coding sessions MUST understand and follow this design language when making changes or adding features.*

---

## 1. Max-Width Constraints & Mobile-First Layouts
- **Global Container Constraint**: The app is strictly constrained to a maximum width of 576px (`max-w-[576px] mx-auto`). This is applied on the root container in `App.tsx` and mirrored on fixed elements like the Context Bar.
- **Top Bar Bleed Masking**: To prevent scrollable cards from peeking through the gaps above the Context Bar during scrolling, a localized DOM mask is used rather than complex padding hacks: `<div className="fixed top-0 left-0 right-0 max-w-[576px] mx-auto h-12 bg-[#09090b] pointer-events-none z-[45]" />`.
- **Responsive Adaptability**: Layouts generally wrap or expand dynamically using Flexbox, preventing arbitrary overflow. Text scaling uses sensible responsive font sizes (e.g., `text-[10px] sm:text-xs`).

## 2. Modals, Popovers, and Dialogs
- **Native Top Layer (`<dialog>`)**: The primary `ModalShell` uses the native HTML `<dialog>` element, taking full advantage of the browser's top layer over complex z-index stacking.
- **Styling the Dialog**: The dialog wrapper uses utility classes `z-50 m-auto overflow-y-auto bg-transparent` alongside `backdrop:bg-black/75 backdrop:backdrop-blur-sm` for an integrated darkened overlay without requiring a separate DOM node for the backdrop.
- **Edge Highlighting**: Most overlays feature a subtle inner light bleed to establish hierarchy: `<div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />`.
- **Safe Area Spacing**: Overlays and Action Sheets dynamically incorporate the iOS Home Bar via `pb-[calc(env(safe-area-inset-bottom)+16px)]`.
- **Dismissal**: Always ensure modals can be closed via a visible "Cancel/Close" button *and* by pressing the `Escape` key.

## 3. Context Bar & Bottom Tab Bar Paradigms (CRITICAL)
- **Context Bar Dynamic Swapping**: The Context Bar (`touch-none fixed top-3 sm:top-4 z-50`) is the **sole location** for view-specific, high-level controls (e.g. "Save", "Add"). It conditionally renders specific `leftSlot`, `centerSlot`, and `rightSlot` elements based on the current active view, preserving a clean header. Do NOT place primary page actions arbitrarily inline within the scrollable page content.
- **Bottom Tab Bar Scroll Bleed Fix**: The `BottomTabBar` utilizes a unique padding trick to prevent sub-pixel rounding errors (often caused by OS scaling or browser zoom) which can result in scrolling content peeking out under the bar. The element extends 10px below the viewport (`bottom-[-10px]`) while symmetrically padding the bottom (`pb-[calc(10px_+_env(safe-area-inset-bottom))]`).
- **Glassmorphism**: The Bottom bar uses `bg-[#18181b]/95 backdrop-blur-lg` to create a seamless depth of field.

## 4. Button Sizing, Active States, and Color Paradigms
- **Standard Touch Targets**: Interactive buttons rely on strictly uniform padding (`p-3.5` with `rounded-2xl`). `p-3.5` provides exactly 14px of padding on all 4 sides, which mathematically sums with standard text to a perfect `44px` minimum touch target height without needing a rigid `h-11` constraint.
- **Typography & Interaction**: Action buttons utilize uppercase tracking for legibility (`font-bold text-[10px] sm:text-xs uppercase tracking-wider`). Press physics are simulated with `active:scale-95 transition-all` (or `active:scale-[0.98]` on larger elements).
- **Amber (Primary Context)**: Amber represents creation, completion, or default active states.
  - Buttons: `bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.15)]`
  - Active Context Bar: `border-amber-500/30 ring-1 ring-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.15)]`
- **Red (Destructive Context)**: Red warns the user or manages critical state deletion.
  - Buttons: `bg-red-500 text-white hover:bg-red-400 active:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.2)]`
  - Warning Context Bar: `border-red-500/30 ring-1 ring-red-500/20 shadow-[0_4px_12px_rgba(239,68,68,0.15)]`

## 5. CSS Custom Variables (Dev Store Layout Engine)
The UI heavily depends on runtime-injected CSS variables (`--ui-scale`, `--step-card-height`, `--card-stack-gap`, `--top-bar-thickness`, `--ui-radius`) powered by the Dev Store (`App.tsx`).
- Variables are consumed directly in components using inline styles to override Tailwind where extreme fluidity is required (e.g., `style={{ gap: 'var(--card-stack-gap, 1.25rem)' }}` in Progression lists, or `minHeight: 'var(--top-bar-thickness, 60px)'` in the Context Bar).

## 6. Padding & Spacing Layout Tricks (Scroll Fixes)
- **Invisible Fixed-Header Spacers**: Because the `ContextBar` is fixed, elements behind it need to be pushed down. Instead of a hardcoded margin, an invisible `div` reserves the exact space using the injected CSS vars: 
  `<div className="w-full shrink-0" style={{ height: \`calc(${headerActualHeight}px + var(--card-stack-gap, 12px) - 1rem)\` }} />`
- **Safari `padding-bottom` Scrolling Bug**: The app avoids placing `padding-bottom` directly on `overflow-y-auto` elements (which iOS Safari ignores). Instead, it relies on adding structural spacer divs or expanding the Bottom Tab Bar's physical height to achieve bottom clearance.

## 7. Selection & Expansion Behavior (Cards & Accordions)
- **Unified Selection Highlight:** When a card (such as a Machine, Wheel, or Progression Step) is expanded/selected, the outer container must use `border-amber-400/30`. The unselected state uses `border-black/40`.
- **Inner Header Highlight:** The clickable header region of the card relies strictly on `hover:bg-white/5 active:bg-white/10` for press interaction. Do NOT apply a permanent flat `bg-white/5` background when expanded, as this optically washes out the underlying `.neu-convex` 3D gradients and makes the component look flat and lifeless.
- **Title Accent Color:** The title text within the header transitions from `text-white` to `text-amber-400` (or `text-amber-400/80`) when selected, reinforcing the active state.
- **Collapsible Details (Grid Trick):** The detail pane inside the card expands using CSS grid (`grid-template-rows: 1fr` vs `0fr`). To prevent layout clipping during the transition, the container applies `overflow-hidden` and houses the padding elements *inside* the child `div`.

## 8. Segmented Pill Menus (Equipment Navigation)
- **Top-Level Navigation**: When a primary view (like Equipment) requires switching between multiple equal-weight child managers (Wheels, Machines, Jigs, USBs), use a horizontal segmented pill control placed *inline* at the top of the scrollable view, rather than a vertical drill-down list (which is strictly reserved for Settings).
- **Styling**: The segmented control uses a floating container with `neu-convex rounded-full border border-black/40 p-1 flex bg-neutral-950 shadow-lg relative z-20 shrink-0`.
- **Segment Buttons**: Buttons within the control use `flex-1 h-11 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition-all active:scale-95`.
- **Active State**: The selected segment uses `bg-amber-400 text-black shadow-sm`, while inactive segments use `text-white/40 hover:text-white hover:bg-white/5`.

## 9. Shared Components & Universal Toolkit (Component-Driven Design)
- **Zero Raw HTML Policy in Feature Views**: Feature views (`src/views/`, `src/components/*ManagerView.tsx`, `ProgressionView.tsx`, etc.) are strictly **layout orchestrators**, composing shared components together like LEGO bricks. They must **never** contain raw interactive HTML tags (`<button>`, `<input>`, `<select>`, `<dialog>`) or bespoke, heavy inline Tailwind blocks.
- **Single Source of Truth (SSOT)**: If a styling, layout, or interaction tweak is needed, it must be edited inside the shared component in `src/components/ui/` or a centralized CSS utility, automatically propagating across the entire application simultaneously.
- **Strict Semantic Naming & Discoverability**: All shared components in `src/components/ui/` must use intuitive, self-describing, industry-standard names (e.g. `Button`, `TextInput`, `NumberInput`, `SwitchButton`, `SegmentedControl`, `StepperControl`, `Tag`, `ExpandableCard`, `ModalShell`, `ModalSelector`, `Divider`).
- **Central Component Registry (`src/components/ui/index.ts`)**: Every shared component must be cleanly exported from `src/components/ui/index.ts`. Any AI assistant or developer building a new feature MUST first inspect this file to identify existing building blocks before writing any UI code.
- **Prevent Design Drift**: Never construct raw HTML buttons (`<button className="...">`) or reinvent layout wrappers for established design patterns if a strict shared component exists (e.g. `<Button>`, `<ContextBar.Button>`).
- **Context Bar Inversion of Control**: Individual views must inject their Context Bar controls via `<ContextBar.Slot>` and strictly use the `<ContextBar.Button>`, `<ContextBar.Title>`, and `<ContextBar.AmbientInfo>` components. Do not attempt to style context bar elements from scratch, and do not append global controls via `App.tsx` directly.
- **Future Expansion Guideline**: As new generic UI patterns solidify (e.g. standard dialog buttons, generic expanding accordion cards with `neu-convex` backgrounds), extract them into `src/components/ui/` to permanently lock down styling against accidental drift.

## 10. Concentric UI Math & Anti-Bloat Strategy (CRITICAL)
- **Mathematical Concentricity (The Outside-In Rule)**: The Outer Radius of a container is the absolute master constraint. You establish the container's radius, define the padding, and let the system mathematically deduce the inner element's radius using the formula: `Inner Radius = Outer Radius - Uniform Padding`. (e.g., A `24px` card with `16px` padding forces its inner inputs to scale down to an `8px` radius).
- **Strictly Uniform Padding**: Never use asymmetric padding (e.g., `px-4 py-3`) on containers where child elements touch the bounding box, as this physically breaks the concentric radial curve. Use perfectly uniform padding (`p-3`, `p-4`, etc.).
- **Space Fillers (Text Labels)**: It is acceptable if an element does not touch all 4 sides of the container's padding (e.g., a text title sits above it). Concentric math only strictly applies to the physical edges that *do* sit flush against the uniform padding gap.
- **Anti-Bloat (Proactive Centralization & Shared Components)**: Before suggesting new UI elements, adding arbitrary raw HTML wrappers (`<div className="p-4 rounded-3xl...">`), or dumping inline Tailwind bloat into feature files, you MUST check if a shared component (`TextInput`, `SwitchButton`, `ExpandableCard`, `ModalShell`, `Tag`, `Divider`) can be used or updated. 
- **Universal Boilerplate Flagging Mandate**: If you encounter ANY raw HTML interactive elements (`<button>`, `<input>`, etc.) or repetitive inline Tailwind boilerplate acting as UI controls in feature views, **you must proactively pause and flag the bloat to the user.**
- **Consent & Action Planning**: Inform the user of the flagged bloat and propose an Action Plan to condense the code into a centralized Single Source of Truth in `src/components/ui/`. Seek explicit consent before executing the refactor. Do not autonomously rewrite files without approval.
- **Theming & Scalability Goal**: The strict goal of this centralization is to make the app highly scalable and maintainable. The UI must be structured using centralized CSS variables and shared components so that future architectural changes or global UI Themes can be introduced seamlessly without editing hundreds of lines across many files.

## 11. Neumorphic Shadow Clipping (Overflow Strategy)
- **The Clipping Problem:** Because neumorphic components (like `.neu-button`, `.neu-convex`, `.neu-concave`) heavily rely on drop-shadows and outer glows, placing them flush inside an `overflow-hidden` or `overflow-y-auto` container will cause their shadows to be abruptly cut off at the boundary.
- **The Padding Fix:** To prevent shadow clipping in scrollable containers, always apply padding that exceeds the maximum shadow blur radius (usually `p-2` or `px-2`) directly to the scroll container.
- **The Negative Margin Correction:** To ensure the container still visually aligns with its parent boundary without shrinking the layout, offset the applied padding with a matching negative margin (e.g., `<div className="overflow-y-auto px-2 -mx-2 py-2 -my-2">`).

## 12. Neumorphic Depth & Borders (Convex vs Concave)
- **The Neumorphic Rule of Borders:** Neumorphic 3D shapes rely entirely on their CSS `box-shadow` definitions (`inset` and drop shadows) to simulate light and depth. Do NOT add explicit light borders (e.g., `border-white/5`) to `.neu-convex` or `.neu-button` elements, as this optically destroys the 3D inset highlight. 
- **Grounding Stroke:** If a border is required to separate an element from its background, you must strictly use a dark grounding stroke (e.g., `border-black/40`) which acts as ambient occlusion, rather than a light stroke.
- **Nesting UI Depth:** Placing a `.neu-convex` element inside a `.neu-concave` container is the standard aesthetic for "buttons inside a well". 
- **Concentric Radii (Tailwind JIT Limits):** When nesting elements, do not use complex CSS `calc()` functions inside Tailwind utility brackets (e.g., `rounded-[calc(var(--ui-radius-core)-12px)]`), as the JIT compiler often struggles to evaluate dynamic CSS custom properties at runtime, resulting in broken square corners. Instead, rely on standard Tailwind scale classes (`rounded-lg`, `rounded-xl`) to achieve visual concentricity.
