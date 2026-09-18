const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// Add state
const stateInjection = `const [isIntroExpanded, setIsIntroExpanded] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);`;
code = code.replace(/const \[errorMsg, setErrorMsg\] = React\.useState<string \| null>\(null\);/, stateInjection);

const targetRegex = /<details className="group bg-amber-400\/10 border border-amber-400\/20 rounded-2xl shadow-sm transition-all">\n\s*<summary className="text-sm font-bold text-amber-400 flex items-center justify-between p-4 cursor-pointer select-none">\n\s*<span className="flex items-center gap-2"><span className="text-lg">📏<\/span> What is Geometry Mapping\?<\/span>\n\s*<span className="text-lg leading-none transition-transform group-open:rotate-45">\+<\/span>\n\s*<\/summary>\n\s*<div className="p-4 pt-0 flex flex-col gap-3 border-t border-amber-400\/10 mt-1">([\s\S]*?)<\/div>\n\s*<\/div>\n\s*<\/details>/;

const replacement = `<div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300">
            <div 
              role="button"
              tabIndex={0}
              className="text-sm font-bold text-amber-400 flex items-center justify-between p-4 cursor-pointer select-none hover:bg-amber-400/5 transition-colors"
              onClick={() => setIsIntroExpanded(!isIntroExpanded)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsIntroExpanded(!isIntroExpanded); } }}
            >
              <span className="flex items-center gap-2"><span className="text-lg">📏</span> What is Geometry Mapping?</span>
              <span className={\`text-lg leading-none transition-transform duration-300 ease-in-out \${isIntroExpanded ? 'rotate-45' : 'rotate-0'}\`}>+</span>
            </div>
            <div className={\`grid transition-[grid-template-rows] duration-300 ease-in-out \${isIntroExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}\`}>
              <div className="overflow-hidden">
                <div className="p-4 pt-0 flex flex-col gap-3 border-t border-amber-400/10 mt-1">$1</div>
              </div>
            </div>
          </div>`;

code = code.replace(targetRegex, replacement);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched into animated grid accordion!");
