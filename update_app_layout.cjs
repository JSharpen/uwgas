const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The progression section currently looks like: <section className="flex flex-col gap-0 w-full">
code = code.replace(
  '<section className="flex flex-col gap-0 w-full">',
  '<section className="flex flex-col gap-0 w-full max-w-[576px] mx-auto">'
);

fs.writeFileSync('src/App.tsx', code);
