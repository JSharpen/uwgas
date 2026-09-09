const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// Update max-h-[calc(100dvh-150px)] to max-h-[calc(100dvh-220px)]
code = code.replace(
  'max-h-[calc(100dvh-150px)]',
  'max-h-[calc(100dvh-220px)]'
);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
