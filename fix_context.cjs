const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');

// 1. Re-add calibratingMachineId to the variable declarations if not present
if (!code.includes('const calibratingMachineId = useUIStore(s => s.calibratingMachineId);')) {
  code = code.replace(
    /const equipmentTab = useUIStore\(s => s\.equipmentTab\);/,
    'const equipmentTab = useUIStore(s => s.equipmentTab);\n  const calibratingMachineId = useUIStore(s => s.calibratingMachineId);'
  );
}

// 2. Re-add the if block for calibratingMachineId
const equipmentBlockRegex = /\} else if \(view === 'equipment'\) \{\n    if \(expandedEquipmentId\) \{/;
const equipmentReplacement = `} else if (view === 'equipment') {
    if (calibratingMachineId) {
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
      centerSlot = (
        <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase truncate text-[var(--color-accent)] mx-2 text-center">
          Geometry Mapper
        </h2>
      );
      rightSlot = <div className="flex-1 flex justify-end min-w-[80px]" />;
    } else if (expandedEquipmentId) {`;

if (code.match(equipmentBlockRegex)) {
  code = code.replace(equipmentBlockRegex, equipmentReplacement);
  fs.writeFileSync('src/components/layout/ContextBar.tsx', code);
  console.log("Restored calibratingMachineId context controls.");
} else {
  console.log("Could not find insertion point.");
}
