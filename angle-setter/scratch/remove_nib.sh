#!/bin/bash
sed -i '/<div className="flex items-center justify-center w-full pt-3 pb-2 touch-none shrink-0 cursor-pointer relative z-10" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onClick={onToggleExpand}>/,/<\/div>/d' src/components/ProgressionView.tsx
sed -i '/const handleTouchStart = (e: React.TouchEvent) => {/,/};/d' src/components/ProgressionView.tsx
sed -i '/const touchStartY = React.useRef(0);/d' src/components/ProgressionView.tsx
