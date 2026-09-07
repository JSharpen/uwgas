const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// 1. Update the outer fixed wrapper to use top bounds instead of calc!
code = code.replace(
  /className="fixed bottom-\[72px\] left-3 right-3 sm:left-auto sm:right-auto sm:w-\[576px\] z-30 mx-auto pointer-events-none flex flex-col justify-end"/,
  'className="fixed top-[88px] bottom-[72px] left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-30 mx-auto pointer-events-none flex flex-col justify-end"'
);

// 2. Update the drawer body to use max-h-full instead of calc(100dvh-...)
code = code.replace(
  /max-h-\[calc\(100dvh-300px\)\]/g,
  'max-h-full'
);

// 3. Update the inner scroll area to use flex-1 min-h-0 instead of calc(100dvh-...)
code = code.replace(
  /min-h-0 max-h-\[calc\(100dvh-358px\)\]/g,
  'flex-1 min-h-0'
);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
