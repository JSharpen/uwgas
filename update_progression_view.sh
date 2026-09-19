#!/bin/bash
sed -i -e 's|import { useUIStore } from '\''../state/uiStore'\'';|import { useUIStore } from '\''../state/uiStore'\'';\nimport ExpandableCard from '\''./ui/ExpandableCard'\'';|' src/components/ProgressionView.tsx
