const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const stateInjection = `const [isGuideExpanded, setIsGuideExpanded] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);`;
code = code.replace(/const \[errorMsg, setErrorMsg\] = React\.useState<string \| null>\(null\);/, stateInjection);

const targetRegex = /<details className="group bg-black\/20 border border-white\/5 rounded-xl transition-all">\n\s*<summary className="text-\[10px\] uppercase tracking-widest font-bold text-amber-400\/80 hover:text-amber-400 cursor-pointer select-none flex items-center justify-between p-3">\n\s*<span>How do I measure these\?<\/span>\n\s*<span className="text-lg leading-none transition-transform group-open:rotate-45">\+<\/span>\n\s*<\/summary>\n\s*<div className="p-3 pt-0 text-xs text-white\/70 flex flex-col gap-3 border-t border-white\/5 mt-2">([\s\S]*?)<\/div>\n\s*<\/details>/;

const replacement = `<div className="bg-black/20 border border-white/5 rounded-xl flex flex-col overflow-hidden transition-all duration-300">
            <div 
              role="button"
              tabIndex={0}
              className="p-3 text-[10px] uppercase tracking-widest font-bold text-amber-400/80 hover:text-amber-400 cursor-pointer select-none flex items-center justify-between hover:bg-white/5 transition-colors"
              onClick={() => setIsGuideExpanded(!isGuideExpanded)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsGuideExpanded(!isGuideExpanded); } }}
            >
              <span>How do I measure these?</span>
              <span className={\`text-lg leading-none transition-transform duration-300 ease-in-out \${isGuideExpanded ? 'rotate-45' : 'rotate-0'}\`}>+</span>
            </div>
            <div className={\`grid transition-[grid-template-rows] duration-300 ease-in-out \${isGuideExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}\`}>
              <div className="overflow-hidden">
                <div className="p-3 pt-0 text-xs text-white/70 flex flex-col gap-3 border-t border-white/5 mt-2">$1</div>
              </div>
            </div>
          </div>`;

code = code.replace(targetRegex, replacement);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched guide into animated grid accordion!");
