const fs = require('fs');

let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// 1. Change Drawer Body pb-6 to pb-0 (or rather, just remove pb-6)
// Wait, if it's pb-0, the transition classes also have `pb-0` when closed.
code = code.replace(
  "rounded-b-none pb-6 transition-all",
  "rounded-b-none transition-all"
);

// 2. Increase the invisible spacer from h-6 (24px) to h-12 (48px)
// So it accounts for the 24px hidden behind the pill PLUS 24px of actual breathing room!
code = code.replace(
  '<div className="h-6 shrink-0 w-full" />',
  '<div className="h-12 shrink-0 w-full" />'
);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
