const fs = require('fs');

let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

const oldDrawerBody = `          {/* === DRAWER BODY (Expands upwards from behind the pill) === */}
          <div 
            className={\`w-full neu-convex border border-black/40 shadow-2xl rounded-t-3xl rounded-b-none pb-6 transition-all duration-300 ease-in-out relative overflow-hidden flex flex-col z-0 -mb-6 pt-2 min-h-0 \$\{isSetupPanelOpen ? 'max-h-[100dvh] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none border-transparent pt-0 pb-0'}\`}
          >`;

// Match the grid wrapper and its inner div
const regex = /\{\/\* === DRAWER BODY \(Expands upwards from behind the pill\) === \*\/\}\s*<div\s*className=\{`grid min-h-0 w-full transition-\[grid-template-rows,opacity\] duration-500 ease-\[cubic-bezier\(0\.16,1,0\.3,1\)\] z-0 relative -mb-6 \$\{isSetupPanelOpen \? 'grid-rows-\[1fr\] opacity-100 pointer-events-auto' : 'grid-rows-\[0fr\] opacity-0 pointer-events-none'\}`\}\s*>\s*<div className="overflow-hidden min-h-0 flex flex-col w-full neu-convex border border-black\/40 shadow-2xl rounded-t-3xl rounded-b-none pb-12 pt-2 relative">/;

code = code.replace(regex, oldDrawerBody);

// Match the closing div that we added before the SUMMARY PILL
// It should be the single </div> right before the comment.
const closeRegex = /  <\/div>\s*\{\/\* === SUMMARY PILL \(Front Layer, Static\) === \*\/\}/;
code = code.replace(closeRegex, '  {/* === SUMMARY PILL (Front Layer, Static) === */}');

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
