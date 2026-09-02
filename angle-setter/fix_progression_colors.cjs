const fs = require('fs');

let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

// Fix neutral colors mapping to dark/invisible CSS variables
code = code.replace(/text-neutral-500/g, 'text-white/30');
code = code.replace(/text-neutral-400/g, 'text-white/60');
code = code.replace(/text-neutral-300/g, 'text-white');
code = code.replace(/text-neutral-200/g, 'text-white');
code = code.replace(/text-neutral-100/g, 'text-white');

// Fix semantic colors missing or overridden by !important
code = code.replace(/text-primary uppercase/g, 'text-[var(--color-accent)] uppercase');
code = code.replace(/text-accent uppercase tracking-widest font-bold text-sky-400/g, 'text-[var(--color-focus)] uppercase tracking-widest font-bold');

fs.writeFileSync('src/components/ProgressionView.tsx', code);
