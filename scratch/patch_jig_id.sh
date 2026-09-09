#!/bin/bash
sed -i 's/j.id === (r.step?.jigId || globalJigId)/j.id === globalJigId/' src/components/ProgressionView.tsx
