#!/bin/bash
sed -i -e 's|import WheelFormFields from '\''./WheelFormFields'\'';|import WheelFormFields from '\''./WheelFormFields'\'';\nimport ExpandableCard from '\''../ui/ExpandableCard'\'';|' src/components/wheels/WheelManagerView.tsx
