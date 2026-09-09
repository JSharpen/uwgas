const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

// Replace card-stack with tailwind gap
code = code.replace(
  /<div className="flex flex-col card-stack text-xs pb-10" style=\{\{ '--card-stack-gap': '1rem' \} as React\.CSSProperties\}>/g,
  '<div className="flex flex-col gap-4 text-xs pb-10 w-full">'
);

// Replace p-5 with p-6 for internal padding
code = code.replace(/p-5 /g, 'p-6 ');
code = code.replace(/"p-5"/g, '"p-6"');
code = code.replace(/'p-5'/g, "'p-6'");

fs.writeFileSync('src/components/ProgressionView.tsx', code);
