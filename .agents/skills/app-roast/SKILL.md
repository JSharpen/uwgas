---
name: app-roast
description: >-
  Use this skill when the user asks you to "roast" a particular aspect of the app, review a component, or critically analyze code in relation to high-level goals.
---

# App Roast Skill

When the user asks you to "roast" or critically review a specific aspect, component, or file within the application, follow these steps to provide a comprehensive, multi-agent analysis.

## Process

1. **Understand the Target**: Identify the specific file, component, or aspect the user wants roasted.

2. **Invoke Subagents**: Use the `define_subagent` and `invoke_subagent` tools to assign specialized agents to review the content concurrently. You should define and invoke the following subagent roles (adjusting based on the specific aspect being roasted):
   - **Code Quality Critic**: Reviews the target for code quality, adherence to standard practices, anti-patterns, performance bottlenecks, and potential bugs.
   - **Architecture Auditor**: Reviews how the target works in relation to the rest of the app, ensuring it aligns with `docs/ARCHITECTURE.md` and the pure math engine isolation rules.
   - **Goal Alignment Reviewer**: Evaluates the target against the high-level goals outlined in `docs/PROJECT_PLAN.md` and `docs/DEVELOPMENT_GUIDE.md` to ensure it serves the app's purpose.
   - **UX/UI Nitpicker** (if applicable): Checks for adherence to the "Workshop Touch Ergonomics" (44x44px touch targets, scaling, etc.) and visual design consistency.

3. **Synthesize the Feedback**: Wait for all subagents to complete their reviews. Once they have reported back, synthesize their findings.

4. **Deliver the Roast**: Create an artifact containing a comprehensive "Roast Report". The tone can be playfully critical (a "roast") but must remain constructive, highlighting:
   - What's wrong or sub-optimal.
   - Why it's a problem in the context of the app's architecture and goals.
   - Specific recommendations for how to fix or improve it.

## Subagent Instructions

When defining the subagents, ensure you instruct them to read the relevant documentation for their role (e.g., `docs/ARCHITECTURE.md` for the Architect, `docs/PROJECT_PLAN.md` for the Goal Reviewer).

