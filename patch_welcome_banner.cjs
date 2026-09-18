const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const regex = /\{\/\* Welcome \/ Context Banner \*\/\}\n\s*<div className="p-4 sm:p-5 bg-amber-400\/10 border border-amber-400\/20 rounded-2xl flex flex-col gap-3 shadow-sm">\n\s*<h3 className="text-sm sm:text-base font-bold text-amber-400 flex items-center gap-2">\n\s*<span className="text-lg">📏<\/span> What is Geometry Mapping\?\n\s*<\/h3>([\s\S]*?)<\/ul>\n\s*<\/div>\n\s*<\/div>/;

const replacement = `{/* Welcome / Context Banner */}
          <details className="group bg-amber-400/10 border border-amber-400/20 rounded-2xl shadow-sm transition-all">
            <summary className="text-sm font-bold text-amber-400 flex items-center justify-between p-4 cursor-pointer select-none">
              <span className="flex items-center gap-2"><span className="text-lg">📏</span> What is Geometry Mapping?</span>
              <span className="text-lg leading-none transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="p-4 pt-0 flex flex-col gap-3 border-t border-amber-400/10 mt-1">$1</ul>
            </div>
          </details>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched Welcome Banner to be an accordion!");
