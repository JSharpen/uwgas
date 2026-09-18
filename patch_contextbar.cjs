const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');

const target = `    } else {
      leftSlot = (
        <div className="flex-1 flex justify-start min-w-[80px]">
          <button
            type="button"
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer"
            onClick={() => useUIStore.getState().setCalibratingMachineId(null)}
          >
            Cancel
          </button>
        </div>
      );
      rightSlot = <div className="flex-1 flex justify-end min-w-[80px]" />;
    }`;

const replacement = `    } else {
      leftSlot = (
        <div className="flex-1 flex justify-start min-w-[80px]">
          <button
            type="button"
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer"
            onClick={() => useUIStore.getState().setCalibratingMachineId(null)}
          >
            Cancel
          </button>
        </div>
      );
      if (calibrationStep === 'setup') {
        rightSlot = (
          <div className="flex-1 flex justify-end min-w-[80px]">
            <button
              type="button"
              className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center justify-center active:scale-95 cursor-pointer shrink-0"
              onClick={() => window.dispatchEvent(new CustomEvent('wizard-start'))}
            >
              Begin
            </button>
          </div>
        );
      } else {
        rightSlot = <div className="flex-1 flex justify-end min-w-[80px]" />;
      }
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/layout/ContextBar.tsx', code);
console.log("Patched ContextBar!");
