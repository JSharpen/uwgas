const fs = require('fs');

let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// The current Drawer Body is:
// <div 
//   className={`w-full neu-convex border border-black/40 shadow-2xl rounded-t-3xl rounded-b-none pb-6 transition-all duration-300 ease-in-out relative overflow-hidden flex flex-col z-0 -mb-6 pt-2 min-h-0 ${isSetupPanelOpen ? 'max-h-full opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none border-transparent pt-0 pb-0'}`}
// >

const drawerStart = `          {/* === DRAWER BODY (Expands upwards from behind the pill) === */}
          <div 
            className={\`grid min-h-0 w-full transition-[grid-template-rows,opacity,margin,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 relative \${isSetupPanelOpen ? 'grid-rows-[1fr] opacity-100 pointer-events-auto -mb-6' : 'grid-rows-[0fr] opacity-0 pointer-events-none mb-0'}\`}
          >
            <div className="overflow-hidden min-h-0 flex flex-col w-full neu-convex border border-black/40 shadow-2xl rounded-t-3xl rounded-b-none pb-12 pt-2 relative">`;

// We need to replace the old <div className={`w-full neu-convex ...`}> with this new structure.
// But we have to make sure we close the extra <div> at the end of the drawer body.

code = code.replace(
  /\{\/\* === DRAWER BODY \(Expands upwards from behind the pill\) === \*\/\}\s*<div\s*className=\{`w-full neu-convex border border-black\/40 shadow-2xl rounded-t-3xl rounded-b-none pb-6 transition-all duration-300 ease-in-out relative overflow-hidden flex flex-col z-0 -mb-6 pt-2 min-h-0 \$\{isSetupPanelOpen \? 'max-h-full opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none border-transparent pt-0 pb-0'\}`\}\s*>/,
  drawerStart
);

// We need to find where the Drawer Body closes to add the closing div for the grid wrapper.
// The Drawer Body ends right before `{/* === SUMMARY PILL (Front Layer, Static) === */}`
code = code.replace(
  /(\s*)(?=\{\/\* === SUMMARY PILL \(Front Layer, Static\) === \*\/\})/,
  `$1  </div>\n$1`
);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
