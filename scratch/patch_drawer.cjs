const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// 1. Update Outer Drawer Container
// Find: max-h-[calc(100dvh-300px)]
// Replace with: max-h-[calc(100dvh-150px)]
code = code.replace(/max-h-\[calc\(100dvh-300px\)\]/g, 'max-h-[calc(100dvh-150px)]');

// 2. Update Inner Scroll Container
// Find: min-h-0 max-h-[calc(100dvh-358px)]
// Replace with: flex-1 min-h-0
code = code.replace(/min-h-0 max-h-\[calc\(100dvh-358px\)\]/g, 'flex-1 min-h-0');

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
