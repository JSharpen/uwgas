const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// 1. Wrapper 2 (#global-setup-card) - Add max-h-[calc(100dvh-150px)] min-h-0
code = code.replace(
  'id="global-setup-card" className="relative w-full flex flex-col justify-end pointer-events-none"',
  'id="global-setup-card" className="relative w-full flex flex-col justify-end pointer-events-none max-h-[calc(100dvh-150px)] min-h-0"'
);

// 2. Drawer Body
code = code.replace(
  "max-h-[calc(100dvh-300px)]",
  "max-h-[100dvh]"
);
code = code.replace(
  "-mb-6 pt-2 ${isSetupPanelOpen",
  "-mb-6 pt-2 min-h-0 ${isSetupPanelOpen"
);

// 3. Inner Scroll Area
code = code.replace(
  "min-h-0 max-h-[calc(100dvh-358px)]",
  "flex-1 min-h-0"
);

// 4. Summary Pill
code = code.replace(
  "border border-black/20 rounded-3xl flex flex-col",
  "shrink-0 border border-black/20 rounded-3xl flex flex-col"
);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
