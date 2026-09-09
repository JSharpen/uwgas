const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// 1. Add min-h-0 to wrapper 2 (#global-setup-card)
code = code.replace(
  'id="global-setup-card" className="relative w-full flex flex-col justify-end pointer-events-none"',
  'id="global-setup-card" className="relative w-full flex flex-col justify-end pointer-events-none min-h-0"'
);

// 2. Add min-h-0 to drawer body
code = code.replace(
  /className="(`w-full neu-convex border border-black\/40 shadow-2xl rounded-t-3xl rounded-b-none pb-6 transition-all duration-300 ease-in-out relative overflow-hidden flex flex-col z-0 -mb-6 pt-2 \$\{isSetupPanelOpen \? 'max-h-full opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none border-transparent pt-0 pb-0'\}`)"/,
  'className={`w-full neu-convex border border-black/40 shadow-2xl rounded-t-3xl rounded-b-none pb-6 transition-all duration-300 ease-in-out relative overflow-hidden flex flex-col z-0 -mb-6 pt-2 min-h-0 ${isSetupPanelOpen ? \'max-h-full opacity-100 pointer-events-auto\' : \'max-h-0 opacity-0 pointer-events-none border-transparent pt-0 pb-0\'}`}'
);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
