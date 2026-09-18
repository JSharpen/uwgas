const fs = require('fs');
let code = fs.readFileSync('src/components/MiniSelect.tsx', 'utf8');

// 1. Remove the full screen dimensions from the <dialog>
code = code.replace(
  /'backdrop:bg-black\/75 backdrop:backdrop-blur-sm w-full h-full max-h-full max-w-full'/g,
  `'backdrop:bg-black/75 backdrop:backdrop-blur-sm'`
);

// 2. Adjust the inner div dimensions to be a bit tighter like a native picker
code = code.replace(
  /'relative w-full max-w-xs neu-convex rounded-3xl border border-black\/40 shadow-2xl p-2 flex flex-col mx-auto motion-dialog '/g,
  `'relative w-[85vw] max-w-[320px] neu-convex rounded-3xl border border-black/40 shadow-2xl p-2 flex flex-col mx-auto motion-dialog '`
);

fs.writeFileSync('src/components/MiniSelect.tsx', code);
console.log("Fixed MiniSelect centering and width!");
