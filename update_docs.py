import re

# 1. Update PROJECT_PLAN.md
with open('docs/PROJECT_PLAN.md', 'r') as f:
    plan = f.read()

# Replace [IN PROGRESS] with [COMPLETED] for the Calibration Workflow
plan = plan.replace(
    "| **Calibration Workflow (Boundary-First)** | Refactor the UI wizard to a deterministic 5-step process. Remove manual 'Improve It' logic. Build pure math pruning functions into `src/math/tormek.ts`. | `[IN PROGRESS]` |",
    "| **Calibration Workflow (Boundary-First)** | Refactor the UI wizard to a deterministic 5-step process. Remove manual 'Improve It' logic. Build pure math pruning functions into `src/math/tormek.ts`. | `[COMPLETED]` |"
)
plan = plan.replace(
    "| **Calibration Workflow (Boundary-First)** | Refactor the UI wizard to a deterministic 5-step process. Remove manual 'Improve It' logic. Build pure math pruning functions into `src/math/tormek.ts`. | `[READY]` |",
    "| **Calibration Workflow (Boundary-First)** | Refactor the UI wizard to a deterministic 5-step process. Remove manual 'Improve It' logic. Build pure math pruning functions into `src/math/tormek.ts`. | `[COMPLETED]` |"
)

with open('docs/PROJECT_PLAN.md', 'w') as f:
    f.write(plan)

# 2. Update CHANGELOG.md
with open('docs/CHANGELOG.md', 'r') as f:
    changelog = f.read()

new_log = """## [Unreleased]
### Added
- **Live Diagnostics (Geometry Mapper)**: The UI now tracks mapping precision in real-time starting at step 4. Displays clear warnings if the solver detects a human measurement error and mathematically prunes it out of the dataset.
- **Smart Outlier Pruning**: `tormek.ts` now wraps base calibrations in a rigorous leave-one-out algorithm, guaranteeing the single worst data point is safely discarded if it fails to hit the physical noise floor of the calipers.
- **Keyboard Ergonomics**: You can now navigate the Geometry Mapper entirely via keyboard (Tab and Enter), with true auto-focus mapping to the target inputs on step transitions.

### Changed
- **Geometry Mapper Wizard**: Destroyed the manual "Improve It" loop. Replaced it with a Boundary-First determinism track. It automatically establishes the physical envelope, calculates dynamic target gaps, and traps the user in an automatic continuous refinement loop until the math engine confirms precision.
- **Remeasure Strategy**: Pushing 'Re-measure' now executes a mathematically mandatory Hard Reset, requiring fresh boundaries to ensure pristine extrapolation anchoring.

"""

if "## [Unreleased]" in changelog:
    changelog = changelog.replace("## [Unreleased]", new_log)
else:
    changelog = new_log + "\n" + changelog

with open('docs/CHANGELOG.md', 'w') as f:
    f.write(changelog)

print("Docs updated")
