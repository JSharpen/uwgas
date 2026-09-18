const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const stateInjection = `const [isAdvExpanded, setIsAdvExpanded] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);`;
code = code.replace(/const \[errorMsg, setErrorMsg\] = React\.useState<string \| null>\(null\);/, stateInjection);

const targetRegex = /<details className="group bg-black\/20 border border-white\/5 rounded-2xl p-4 transition-all">\n\s*<summary className="text-xs font-bold text-white\/70 hover:text-white cursor-pointer select-none flex items-center justify-between">\n\s*<span>Advanced Geometry Parameters<\/span>\n\s*<span className="text-xs text-white\/40 group-open:rotate-180 transition-transform">▼<\/span>\n\s*<\/summary>\n\s*<div className="flex flex-col gap-4 mt-4 pt-4 border-t border-white\/5">([\s\S]*?)<\/div>\n\s*<\/details>/;

const replacement = `<div className="bg-black/20 border border-white/5 rounded-2xl flex flex-col overflow-hidden transition-all duration-300">
            <div 
              role="button"
              tabIndex={0}
              className="p-4 text-xs font-bold text-white/70 hover:text-white cursor-pointer select-none flex items-center justify-between hover:bg-white/5 transition-colors"
              onClick={() => setIsAdvExpanded(!isAdvExpanded)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsAdvExpanded(!isAdvExpanded); } }}
            >
              <span>Advanced Geometry Parameters</span>
              <span className={\`text-xs text-white/40 transition-transform duration-300 ease-in-out \${isAdvExpanded ? 'rotate-180' : 'rotate-0'}\`}>▼</span>
            </div>
            <div className={\`grid transition-[grid-template-rows] duration-300 ease-in-out \${isAdvExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}\`}>
              <div className="overflow-hidden">
                <div className="px-4 pb-4 flex flex-col gap-4 border-t border-white/5 pt-4">$1</div>
              </div>
            </div>
          </div>`;

code = code.replace(targetRegex, replacement);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched advanced params into animated grid accordion!");
