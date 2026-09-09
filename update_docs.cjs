const fs = require('fs');

// Update PROJECT_PLAN.md
let plan = fs.readFileSync('docs/PROJECT_PLAN.md', 'utf8');
plan = plan.replace(
  "| **JOB-019** | Preset Controls Migration | `[COMPLETED]` | **HIGH** | Migrate preset selection into the Global Setup Drawer and summary strip. Retained Save/Manage in Progression kebab menu pending Progression view overhaul. |",
  "| **JOB-019** | Preset Controls Migration | `[COMPLETED]` | **HIGH** | Migrate preset selection into the Global Setup Drawer and summary strip. Retained Save/Manage in Progression kebab menu pending Progression view overhaul. |\n| **JOB-020** | UI/UX Modernization: Live List & Setup Unification | `[COMPLETED]` | **HIGH** | Unify global settings by moving Machine selector and Preset Save/Manage into the Setup Drawer. Overhaul Progression view into a 'Live List' with inline accordion editing, removing separate edit modes and kebab menus. |"
);
fs.writeFileSync('docs/PROJECT_PLAN.md', plan);

// Update CHANGELOG.md
let changelog = fs.readFileSync('docs/CHANGELOG.md', 'utf8');
const date = new Date().toISOString().split('T')[0];
changelog = changelog.replace(
  "## [0.9.6] - 2026-08-31",
  "## [0.9.6] - 2026-08-31\n\n### Added\n- Added inline accordion editing for Progression steps (JOB-020).\n- Added Machine selector to Global Setup Drawer hardware triggers.\n- Added \"Save Current\" and \"Manage\" preset buttons to Global Setup Drawer.\n\n### Changed\n- Deprecated and removed `ProgressionEditor.tsx` as an independent view.\n- Removed the legacy Kebab menu from the Progression list header.\n- Refactored `ProgressionView.tsx` into a \"Live List\" with inline inputs for diameter, micro-bevel, and step reordering/deletion.\n"
);
fs.writeFileSync('docs/CHANGELOG.md', changelog);
