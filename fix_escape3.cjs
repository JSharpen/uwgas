const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /target\.closest\('.bg-\\\\[\\\\#262626\\\\\],' \.bg-neutral-900, \.action-sheet, button, input, select'\);/g;
code = code.replace(
  regex,
  "target.closest('.bg-\\\\[\\\\#262626\\\\], .bg-neutral-900, .action-sheet, button, input, select, [role=\"dialog\"]');"
);

fs.writeFileSync('src/App.tsx', code);
