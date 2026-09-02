const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "target.closest('.bg-\\[\\#262626\\],' .bg-neutral-900, .action-sheet, button, input, select');",
  "target.closest('.bg-\\\\[\\\\#262626\\\\], .bg-neutral-900, .action-sheet, button, input, select, [role=\"dialog\"]');"
);

fs.writeFileSync('src/App.tsx', code);
