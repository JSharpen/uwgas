const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');

// 1. Add missing state selectors (some might exist so we check)
if (!code.includes('const calibratingMachineId')) {
  code = code.replace(
    /const settingsView = useUIStore\(s => s\.settingsView\);/,
    `const settingsView = useUIStore(s => s.settingsView);
  const equipmentTab = useUIStore(s => s.equipmentTab);
  const calibratingMachineId = useUIStore(s => s.calibratingMachineId);
  const calibrationStep = useUIStore(s => s.calibrationStep);
  const expandedEquipmentId = useUIStore(s => s.expandedEquipmentId);
  const expandedStepId = useUIStore(s => s.expandedStepId);`
  );
}

// 2. Add the if logic right before view === 'calculator'
const targetRegex = /  if \(view === 'calculator'\) \{/;
const replacement = `  if (calibratingMachineId) {
    if (calibrationStep === 'measuring') {
      leftSlot = (
        <div className="flex-1 flex justify-start min-w-[80px]">
          <button
            type="button"
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer"
            onClick={() => window.dispatchEvent(new CustomEvent('wizard-back'))}
          >
            Back
          </button>
        </div>
      );
      rightSlot = (
        <div className="flex-1 flex justify-end min-w-[80px]">
          <button
            type="button"
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center justify-center active:scale-95 cursor-pointer shrink-0"
            onClick={() => window.dispatchEvent(new CustomEvent('wizard-next'))}
          >
            Next
          </button>
        </div>
      );
    } else {
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
    }
    
    const calibratingMachine = useStore.getState().machines?.find(m => m.id === calibratingMachineId);
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
    );
  } else if (expandedEquipmentId) {
    leftSlot = (
      <div className="flex-1 flex justify-start min-w-[80px]">
        <button
          type="button"
          className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer"
          onClick={() => {
            useUIStore.getState().setTopBarConfirmation({
              message: \`Delete \${equipmentTab === 'jigs' ? 'Jig' : equipmentTab === 'usbs' ? 'USB' : equipmentTab === 'machines' ? 'Machine' : 'Wheel'}?\`,
              confirmLabel: 'Delete',
              cancelLabel: 'Cancel',
              onConfirm: () => {
                const id = expandedEquipmentId;
                if (equipmentTab === 'jigs') useStore.getState().deleteJig(id);
                else if (equipmentTab === 'usbs') useStore.getState().deleteUsb(id);
                else if (equipmentTab === 'machines') useStore.getState().deleteMachine(id);
                else if (equipmentTab === 'wheels') useStore.getState().deleteWheel(id);
                useUIStore.getState().setExpandedEquipmentId(null);
              }
            });
          }}
        >
          Delete
        </button>
      </div>
    );

    centerSlot = (
      <h2 className="text-[10px] sm:text-xs font-bold tracking-widest uppercase truncate text-white/40 mx-2 text-center">
        Edit {equipmentTab === 'jigs' ? 'Jig' : equipmentTab === 'usbs' ? 'USB' : equipmentTab === 'machines' ? 'Machine' : 'Wheel'}
      </h2>
    );

    rightSlot = <div className="flex-1 flex justify-end min-w-[80px]" />;
  } else if (expandedStepId) {
    const stepIndex = sessionSteps.findIndex(s => s.id === expandedStepId);
    
    const handleDelete = () => {
      const action = () => {
        useStore.getState().deleteStep(expandedStepId);
        useUIStore.getState().setExpandedStepId(null);
      };
      if (document.startViewTransition) document.startViewTransition(action);
      else action();
    };

    const handleMove = (dir) => {
      const action = () => {
        useStore.getState().moveStep(stepIndex, dir);
      };
      if (document.startViewTransition) document.startViewTransition(action);
      else action();
    };

    leftSlot = (
      <div className="flex-1 flex justify-start min-w-[80px]">
        <button
          type="button"
          className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 active:scale-95 transition flex items-center justify-center cursor-pointer"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    );

    centerSlot = (
      <h2 className="text-[10px] sm:text-xs font-bold tracking-widest uppercase truncate text-white/40 mx-2 text-center">
        Edit Step {stepIndex + 1}
      </h2>
    );

    rightSlot = (
      <div className="flex-1 flex justify-end min-w-[80px]">
        <button
          type="button"
          className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer"
          onClick={() => useUIStore.getState().setExpandedStepId(null)}
        >
          Done
        </button>
      </div>
    );
  } else if (view === 'calculator') {`;

code = code.replace(targetRegex, replacement);

fs.writeFileSync('src/components/layout/ContextBar.tsx', code);
console.log("Fully restored and patched ContextBar!");
