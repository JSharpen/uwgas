const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// Revert 1: Outer wrapper position
code = code.replace(
  'className="fixed top-[88px] bottom-[72px] left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-30 mx-auto pointer-events-none flex flex-col justify-end"',
  'className="fixed bottom-[72px] left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-30 mx-auto pointer-events-none flex flex-col justify-end"'
);

// Revert 2: #global-setup-card min-h-0
code = code.replace(
  'id="global-setup-card" className="relative w-full flex flex-col justify-end pointer-events-none min-h-0"',
  'id="global-setup-card" className="relative w-full flex flex-col justify-end pointer-events-none"'
);

// Revert 3: Drawer body max-h-full and min-h-0 back to 100dvh-300px
code = code.replace(
  /className="(`w-full neu-convex border border-black\/40 shadow-2xl rounded-t-3xl rounded-b-none pb-6 transition-all duration-300 ease-in-out relative overflow-hidden flex flex-col z-0 -mb-6 pt-2 min-h-0 \$\{isSetupPanelOpen \? 'max-h-full opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none border-transparent pt-0 pb-0'\}`)"/,
  'className={`w-full neu-convex border border-black/40 shadow-2xl rounded-t-3xl rounded-b-none pb-6 transition-all duration-300 ease-in-out relative overflow-hidden flex flex-col z-0 -mb-6 pt-2 ${isSetupPanelOpen ? \'max-h-[calc(100dvh-300px)] opacity-100 pointer-events-auto\' : \'max-h-0 opacity-0 pointer-events-none border-transparent pt-0 pb-0\'}`}'
);

// Revert 4: Inner scroll area flex-1 min-h-0 back to calc(100dvh-358px)
code = code.replace(
  /flex-1 min-h-0 overflow-y-auto overscroll-contain/,
  'min-h-0 max-h-[calc(100dvh-358px)] overflow-y-auto overscroll-contain'
);

// Revert 5: Summary Pill shrink-0
code = code.replace(
  /shrink-0 border border-black\/20 rounded-3xl/,
  'border border-black/20 rounded-3xl'
);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
