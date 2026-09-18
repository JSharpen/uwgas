---
name: auto-debug
description: >-
  Use this skill to autonomously triage and debug application issues. It assesses the codebase, determines the best debugging strategy, and spawns specialized subagents or runs automated checks to resolve the problem.
---

# Auto-Debug Skill

When the user asks you to debug an issue, find a bug, or investigate an error, follow these steps to autonomously triage and resolve the problem.

## Process

1. **Initial Assessment (Triage Agent):**
   - Use the `invoke_subagent` tool to spawn a `Triage Agent` (you can use the built-in `research` agent or define a custom one).
   - Provide the Triage Agent with the user's description of the bug.
   - Instruct the Triage Agent to review the relevant files, recent changes, and application state to determine the best debugging approach.

2. **Select & Execute a Debugging Strategy:**
   Based on the Triage Agent's findings, select and execute one of the following strategies:

   - **Strategy A: Multi-Agent Investigation (Complex/Architectural Issues)**
     If the issue spans multiple domains (e.g., UI state not syncing with the math engine), use `define_subagent` to spawn specialized agents (e.g., `State Inspector`, `Math Verifier`, `UI Debugger`) to investigate concurrently and synthesize their findings.
   
   - **Strategy B: Automated Checks (Build/Type/Lint Issues)**
     If the issue seems related to types, syntax, or linting, use `run_command` to execute the relevant checks (e.g., `npm run typecheck`, `npm run lint`). Review the output to pinpoint and resolve the error.

   - **Strategy C: Domain-Specific Deep Dive (Isolated Bugs)**
     If the issue is clearly isolated to a specific domain (e.g., Zod schema validation failing, Zustand state mutations), investigate that specific layer. Keep the project's strict rules in mind (e.g., pure math isolation in `src/math/`, Zod schema migration safety).

3. **Request Console Output (If Needed):**
   If the root cause cannot be determined statically or requires runtime context, explicitly ask the user to reproduce the bug and paste the browser console output, network tab logs, or terminal errors.

4. **Propose and Implement a Fix:**
   Once the root cause is identified, propose a fix. Ensure the fix adheres strictly to the `AGENTS.md` rules (e.g., no raw DOM mutations, proper touch ergonomics, strict math engine isolation). Wait for user approval if the change is architectural, otherwise apply the fix.

5. **Verify Verification Gate:**
   Ensure the following checks pass cleanly before considering the bug resolved:
   - `npm run typecheck` (Ensures structural integrity)
   - `npm run lint` (Ensures code best practices)
   - `npm run test` (Ensures the pure math engine logic hasn't broken)
   - `npm run build` (Ensures the Vite bundler can compile for production)
   - **Visual/Runtime Check:** If it was a UI or state issue, explicitly ask the user to verify the fix visually in the browser and confirm there are no errors in the DevTools console.

