const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');

const regex = /centerSlot = \([\s\S]*?<h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase truncate text-\[var\(--color-accent\)\] mx-2 text-center\">\n\s*Geometry Mapper\n\s*<\/h2>\n\s*\);/;

const replacement = `const calibratingMachine = useStore.getState().machines?.find(m => m.id === calibratingMachineId);
      centerSlot = (
        <div className="flex flex-col items-center justify-center mx-2 overflow-hidden">
          <h2 className="text-xs font-bold tracking-widest uppercase truncate text-[var(--color-accent)] leading-tight">
            Geometry Mapper
          </h2>
          {calibratingMachine && (
            <span className="text-[10px] text-white/50 truncate font-mono">
              {calibratingMachine.name}
            </span>
          )}
        </div>
      );`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/layout/ContextBar.tsx', code);
console.log("Safely Patched ContextBar!");
