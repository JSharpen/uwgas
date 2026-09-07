#!/bin/bash
sed -i '/const handleTouchEnd = (e: React.TouchEvent) => {/,/};/d' src/components/ProgressionView.tsx
