const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// The spacer is currently h-6 (24px)
// We want the total space to be 16px. 
// Since it receives gap-4 (16px), changing the height to 0 or 1px makes the total space 16px.
// Let's use h-px (1px) to be safe against 0-height flex item bugs in Safari.
code = code.replace(
  '<div className="h-6 shrink-0 w-full" />',
  '<div className="h-px shrink-0 w-full" />'
);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
