const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

code = code.replace(
  'className={`touch-pan-y w-full bg-transparent text-4xl',
  'className={`touch-pan-y w-48 mx-auto bg-transparent text-4xl'
);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
