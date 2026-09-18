---
name: ui-audit
description: Spawns a team of subagents to audit the application's styling and layout against the official docs/DESIGN_LANGUAGE.md, identifying inconsistent or out-of-place UI elements.
---

# UI Consistency Audit Workflow

Use this skill whenever the user asks to "audit the UI", "check styling consistency", "find UI inconsistencies", or asks for a design review against the established design language.

## 🎯 Goal
To identify elements, components, or layouts in the codebase that violate the rules established in `docs/DESIGN_LANGUAGE.md` and stand out as unfinished or inconsistent.

## 🛠️ Execution Steps

### 1. Establish the Baseline
If you have not already read it recently, use `view_file` to read `docs/DESIGN_LANGUAGE.md` to refresh your understanding of the app's structural paradigms, colors, and touch ergonomics.

### 2. Spawn the Assessment Team
Use the `invoke_subagent` tool to spawn a team of two specialized auditors to scour the codebase.

**Subagent 1: Layout & Structural Assessor**
- **Model:** `pro`
- **Role:** `Structural UI Auditor`
- **Prompt:** "Audit the structural views (`src/views/`) and layout components (`src/App.tsx`, `ContextBar`, `BottomTabBar`) against `docs/DESIGN_LANGUAGE.md`. Look for: 
  1. Elements breaking the 576px max-width container rule.
  2. Primary actions (Save, Add, Edit) placed inline within scrollable views instead of being routed to the Context Bar.
  3. Hardcoded `padding-bottom` on scrollable containers instead of using invisible spacer divs.
  4. Misuse of modal backdrops or z-index (instead of native `<dialog>`).
  Report back a list of specific files/lines that violate these layout rules."

**Subagent 2: Component & Interaction Assessor**
- **Model:** `pro`
- **Role:** `Component Auditor`
- **Prompt:** "Audit the UI components (`src/components/`) against `docs/DESIGN_LANGUAGE.md`. Look for:
  1. Buttons or clickable elements that lack the minimum ~44px touch target (e.g., missing `h-11` or adequate padding).
  2. Missing press physics (interactive elements missing `active:scale-95` or similar transitions).
  3. Color usage that violates the semantic rules (e.g., using Red for non-destructive actions, or primary buttons lacking Amber).
  4. Hardcoded CSS values where dev store variables (`var(--card-stack-gap)`) should be used.
  Report back a list of specific files/lines that violate these component-level rules."

### 3. Compile the Inconsistency Report
Wait for both subagents to report their findings. 
Once received, compile their findings into a structured Artifact named `ui-consistency-report.md`. 
Organize the report by severity or component type:
- **High Priority** (e.g., Primary actions not in Context Bar, tiny touch targets)
- **Visual Polish** (e.g., missing active states, wrong semantic colors)
- **Layout/Scroll Issues** (e.g., missing flex spacers)

### 4. Present Actionable Next Steps
Present the report to the user and ask which components or views they would like you to fix first to unify the app's styling.
