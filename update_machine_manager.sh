#!/bin/bash
sed -i -e 's|import CalibrationWizard from '\''../CalibrationWizard'\'';|import CalibrationWizard from '\''../CalibrationWizard'\'';\nimport ExpandableCard from '\''../ui/ExpandableCard'\'';|' src/components/settings/MachineManagerView.tsx
