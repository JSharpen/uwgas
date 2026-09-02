const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const lines = code.split('\n');
const newLines = lines.map(line => {
  if (line.includes('const isInteractive = target.closest(')) {
    return "      const isInteractive = target.closest('.bg-\\\\[\\\\#262626\\\\], .bg-neutral-900, .action-sheet, button, input, select, [role=\"dialog\"]');";
  }
  return line;
});

fs.writeFileSync('src/App.tsx', newLines.join('\n'));
