#!/bin/bash
sed -i 's/          onTouchStart={handleTouchStart}/          /' src/components/ProgressionView.tsx
sed -i 's/          onTouchEnd={handleTouchEnd}/          /' src/components/ProgressionView.tsx
sed -i 's/<div className="w-full flex justify-center pt-2 pb-1 opacity-20">/<div className="w-full flex justify-center py-2 opacity-20 cursor-pointer touch-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onClick={onToggleExpand}>/' src/components/ProgressionView.tsx
sed -i 's/<div className="p-5 flex flex-col gap-4">/<div className="px-5 pb-5 pt-1 flex flex-col gap-4">/' src/components/ProgressionView.tsx
