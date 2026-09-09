const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the start of the section
code = code.replace(
  /<section className="panel-card panel-card--allow-overflow motion-panel flex flex-col gap-0 max-w-xl">/g,
  '<section className="flex flex-col gap-0 w-full">'
);

// Replace the header
const oldHeader = `<div
              className="panel-card__header flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold u-text panel-header">Progression</h2>
              </div>
              
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  className={\`\${BTN.base} px-3 text-xs text-danger hover:bg-danger/10 border-danger/20\`}
                  onClick={() => setSessionSteps([])}
                  disabled={sessionSteps.length === 0}
                >
                  Clear All
                </button>
              </div>
            </div>`;

const newHeader = `<div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-lg font-bold text-neutral-200">Progression</h2>
              <button
                type="button"
                className="text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full hover:bg-red-500/20 transition disabled:opacity-50"
                onClick={() => setSessionSteps([])}
                disabled={sessionSteps.length === 0}
              >
                Clear All
              </button>
            </div>`;

code = code.replace(oldHeader, newHeader);

// Replace the panel-card__body wrapping
code = code.replace(
  /<div className="panel-card__body flex flex-col gap-3">\n\s*<div className="mt-1">/g,
  '<div className="flex flex-col gap-3 w-full">\n              <div className="mt-1">'
);

fs.writeFileSync('src/App.tsx', code);
