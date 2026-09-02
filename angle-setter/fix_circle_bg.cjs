const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

// Replace bg-neutral-950 with bg-black/40
code = code.replace(/bg-neutral-950/g, 'bg-black/40');

// Replace bg-neutral-800/40 with bg-transparent (for the header bar, though we removed it)
code = code.replace(/bg-neutral-800\/40/g, 'bg-transparent');

fs.writeFileSync('src/components/ProgressionView.tsx', code);
