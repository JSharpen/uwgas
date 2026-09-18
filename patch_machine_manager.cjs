const fs = require('fs');
let code = fs.readFileSync('src/components/settings/MachineManagerView.tsx', 'utf8');

// replace local state with global store call
const localRegex = /const \[calibratingMachineId, setCalibratingMachineId\] = React\.useState<string \| null>\(null\);/;
const globalReplacement = `const calibratingMachineId = useUIStore(s => s.calibratingMachineId);\n  const setCalibratingMachineId = useUIStore(s => s.setCalibratingMachineId);`;
code = code.replace(localRegex, globalReplacement);

fs.writeFileSync('src/components/settings/MachineManagerView.tsx', code);
