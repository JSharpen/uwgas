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
- **Standard Touch Targets**: Interactive buttons rely on `h-11 px-3 sm:px-4 rounded-2xl` to ensure a ~44px minimum touch target height.
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
