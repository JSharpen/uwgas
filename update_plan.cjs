const fs = require('fs');

let plan = fs.readFileSync('docs/PROJECT_PLAN.md', 'utf8');
plan = plan.replace(
  "| **JOB-020** | UI/UX Modernization: Live List & Setup Unification | `[COMPLETED]` | **HIGH** | Unify global settings by moving Machine selector and Preset Save/Manage into the Setup Drawer. Overhaul Progression view into a 'Live List' with inline accordion editing, removing separate edit modes and kebab menus. |",
  "| **JOB-020** | UI/UX Modernization: Live List & Setup Unification | `[COMPLETED]` | **HIGH** | Unify global settings by moving Machine selector and Preset Save/Manage into the Setup Drawer. Overhaul Progression view into a 'Live List' with inline accordion editing, removing separate edit modes and kebab menus. |\n| **JOB-021** | Gesture-Based Step Reordering (Drag and Drop) | `[PROPOSED]` | **MEDIUM** | Implement native-feeling touch drag-and-drop reordering for the Progression list (e.g. using `@dnd-kit`), adding drag handles to avoid clicking up/down buttons. |"
);
fs.writeFileSync('docs/PROJECT_PLAN.md', plan);
