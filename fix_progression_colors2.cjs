const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

code = code.replace(/text-accent\/80/g, 'text-[var(--color-accent)] opacity-80');
code = code.replace(/text-sky-400\/80/g, 'text-[var(--color-focus)] opacity-80');
code = code.replace(/bg-accent\/20 text-accent/g, 'bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)]');

fs.writeFileSync('src/components/ProgressionView.tsx', code);
