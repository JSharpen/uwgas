#!/bin/bash
sed -i -e 's|import { IconJig } from '\''../../icons'\'';|import { IconJig } from '\''../../icons'\'';\nimport ExpandableCard from '\''../ui/ExpandableCard'\'';|' src/components/settings/JigManagerView.tsx
