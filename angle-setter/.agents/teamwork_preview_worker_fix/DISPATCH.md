## 2026-09-02T19:47:35Z
You are the Implementation Worker for completing the JSON export serialization in `src/App.tsx`.
Your assigned working directory is: /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/teamwork_preview_worker_fix/

MANDATORY INPUTS:
1. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/.agents/ORIGINAL_REQUEST.md
2. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/PROJECT.md
3. /home/jordancarruthers/Documents/GitHub/uwgas/angle-setter/src/App.tsx

TASK:
1. In `src/App.tsx`, update `exportText` memo around line 266:
   Replace:
   ```tsx
   const exportText = React.useMemo(() => JSON.stringify(null, null, 2), []);
   ```
   with:
   ```tsx
   const exportText = React.useMemo(() => {
     const payload: Record<string, unknown> = {};
     if (exportSections.includes('global')) payload.global = global;
     if (exportSections.includes('machines')) payload.machines = machines;
     if (exportSections.includes('wheels')) payload.wheels = wheels;
     if (exportSections.includes('sessionSteps')) payload.sessionSteps = sessionSteps;
     if (exportSections.includes('sessionPresets')) payload.sessionPresets = sessionPresets;
     if (exportSections.includes('heightMode')) payload.heightMode = heightMode;
     return JSON.stringify(payload, null, 2);
   }, [exportSections, global, machines, wheels, sessionSteps, sessionPresets, heightMode]);
   ```
2. Verify that `npm run typecheck`, `npm run lint`, and `npm run build` all pass with 0 errors.
3. Write `handoff.md` and notify the orchestrator.
