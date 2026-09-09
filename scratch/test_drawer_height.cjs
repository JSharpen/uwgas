const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

code = code.replace(/max-h-\[calc\(100dvh-300px\)\]/g, 'max-h-[calc(100dvh-140px)]');
code = code.replace(/max-h-\[calc\(100dvh-358px\)\]/g, 'max-h-[calc(100dvh-198px)]');

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
