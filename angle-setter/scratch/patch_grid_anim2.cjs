const fs = require('fs');

let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// Change `-mb-6` and `mb-0` back to a static `-mb-6` so the pill doesn't jump.
code = code.replace(
  "grid-rows-[1fr] opacity-100 pointer-events-auto -mb-6",
  "grid-rows-[1fr] opacity-100 pointer-events-auto"
);
code = code.replace(
  "grid-rows-[0fr] opacity-0 pointer-events-none mb-0",
  "grid-rows-[0fr] opacity-0 pointer-events-none"
);
// And put `-mb-6` unconditionally on the grid wrapper
code = code.replace(
  "transition-[grid-template-rows,opacity,margin,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 relative",
  "transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 relative -mb-6"
);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
