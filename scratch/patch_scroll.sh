#!/bin/bash
sed -i 's/className="relative flex flex-col motion-list-item transition-all duration-300 group"/className="relative flex flex-col motion-list-item transition-all duration-300 group scroll-m-[120px] sm:scroll-m-[160px]"/' src/components/ProgressionView.tsx
