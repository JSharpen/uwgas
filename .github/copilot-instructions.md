# Copilot Instructions for AI Agents

## Project Overview
This codebase is a minimal React app for the "Tormek USB Height Multi‑wheel Calculator." It restores core math and wheel handling logic for Tormek sharpening systems, focusing on a stable, single-file foundation. Advanced features (wizard, presets, dual calibration) are intended to be layered on top of this baseline.

## Architecture & Key Files
- `src/math engine completed.jsx`: Main React app, contains all core logic, UI, and helper functions. This is the starting point for any feature or bug work.
- `archive/angle_setter_light.html`, `archive/tormek_calibration_wizard.html`: Legacy or reference HTML files. Useful for understanding previous UI/logic implementations.
- `modules/`: Currently empty; reserved for future modularization.

## Patterns & Conventions
- **Single-file React**: All logic and UI are in one file. Use functional components and hooks.
- **TypeScript Types (in JS)**: Type annotations are present for clarity, but the file is `.jsx` and not strictly typed.
- **Helpers**: Utility functions for math, localStorage, and conversions are defined at the top of the main file.
- **Wheel Objects**: Central to calculations. Each wheel has an `id`, `name`, `D` (diameter), `angleOffset`, `baseForHn`, and `isHoning`.
- **SessionStep Objects**: Used for workflow steps (see type definitions in main file).

## Developer Workflows
- **No build system detected**: Directly edit `.jsx` and open in a React-compatible environment. No custom build/test commands found.
- **Debugging**: Use browser dev tools. LocalStorage is used for state persistence.
- **Testing**: No automated tests found. Manual testing via UI is expected.

## Integration Points
- **LocalStorage**: Used for saving/loading session state. See `_save` and `_load` helpers.
- **No external APIs**: All logic is self-contained. No network requests or backend integration.

## Project-Specific Guidance
- When adding features, keep the single-file structure unless modularization is required.
- Reference archived HTML files for legacy logic or UI ideas.
- Maintain the minimal, stable foundation before layering advanced features.
- Use the provided helper functions for math and persistence.

## Example: Adding a New Wheel
1. Update the wheels array/object in `math engine completed.jsx`.
2. Ensure new wheel properties match the `Wheel` type.
3. Use helpers for calculations and persistence.

---

If any section is unclear or missing, please provide feedback or specify which workflows, patterns, or integrations need more detail.