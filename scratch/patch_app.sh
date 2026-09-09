#!/bin/bash
sed -i 's/<ProgressionView/<ProgressionView\n                      jigs={jigs}\n                      globalJigId={global.activeJigId}/' src/App.tsx
