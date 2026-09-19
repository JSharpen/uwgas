#!/bin/bash
# Append to decision log in PROJECT_PLAN.md
sed -i 's/| \*\*2026-09-06\*\*/| **'"$(date +%Y-%m-%d)"'** | Abstracted ExpandableCard shared component | Refactored duplicated accordion logic from ProgressionView and Equipment views into a unified `<ExpandableCard>` component to ensure zero design drift. |\n| **2026-09-06**/' docs/PROJECT_PLAN.md

# Prepend to CHANGELOG.md (after the header)
sed -i '/## \[Unreleased\]/a \
\n### Refactored\n- Abstracted expanding accordion cards (`ProgressionView`, `MachineManagerView`, etc.) into a unified `ExpandableCard` shared component, enforcing design language rules.\n' docs/CHANGELOG.md
