const fs = require('fs');
let code = fs.readFileSync('src/views/EquipmentView.tsx', 'utf8');

const regex = /export default function EquipmentView\(\) \{\n  const equipmentTab = useUIStore\(\(s\) => s\.equipmentTab\);\n  const setEquipmentTab = useUIStore\(\(s\) => s\.setEquipmentTab\);/;

const replacement = `export default function EquipmentView() {
  const equipmentTab = useUIStore((s) => s.equipmentTab);
  const setEquipmentTab = useUIStore((s) => s.setEquipmentTab);
  const calibratingMachineId = useUIStore((s) => s.calibratingMachineId);`;

code = code.replace(regex, replacement);

const returnRegex = /return \(\n    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-200 max-w-3xl mx-auto w-full">\n      <div className="neu-convex rounded-full border border-black\/40 p-1 flex bg-neutral-950 shadow-lg relative z-20 shrink-0">/;

const returnReplacement = `return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-200 max-w-3xl mx-auto w-full">
      {!calibratingMachineId && (
        <div className="neu-convex rounded-full border border-black/40 p-1 flex bg-neutral-950 shadow-lg relative z-20 shrink-0">`;

code = code.replace(returnRegex, returnReplacement);

const closingRegex = /        <\/button>\n      <\/div>\n\n      \{equipmentTab === 'machines' && <MachineManagerView \/>\}/;

const closingReplacement = `        </button>
      </div>
      )}

      {equipmentTab === 'machines' && <MachineManagerView />}`;

code = code.replace(closingRegex, closingReplacement);

fs.writeFileSync('src/views/EquipmentView.tsx', code);
