const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// Replace the `<div className="flex flex-col">` with `<>` and the closing `</div>` with `</>`
// Note: the opening div has no other classes.
code = code.replace(
  ') : (\n                      <div className="flex flex-col">\n                        <div className="relative flex justify-center items-center w-full">',
  ') : (\n                      <>\n                        <div className="relative flex justify-center items-center w-full">'
);

// We must also replace the closing `</div>` that matches that `flex flex-col`.
// Let's find it. It's right before `)}` and `</div>` for the main card.
// We can use a regex.
code = code.replace(
  '                        </div>\n                      </div>\n                    )}',
  '                        </div>\n                      </>\n                    )}'
);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
