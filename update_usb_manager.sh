#!/bin/bash
sed -i -e 's|import { IconUSB } from '\''../../icons'\'';|import { IconUSB } from '\''../../icons'\'';\nimport ExpandableCard from '\''../ui/ExpandableCard'\'';|' src/components/settings/UsbManagerView.tsx
