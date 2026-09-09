const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

code = code.replace(/  angleSymbol: string;\n/g, '');
code = code.replace(/  angleErrorById\?: Record<string, number>;\n/g, '');
code = code.replace(/  cardMinHeight\?: number;\n/g, '');
code = code.replace(/  onAddStep\?: \(\) => void;\n/g, '');

code = code.replace(/  angleSymbol,\n/g, '');
code = code.replace(/  angleErrorById,\n/g, '');
code = code.replace(/  cardMinHeight,\n/g, '');
code = code.replace(/  onAddStep,\n/g, '');

fs.writeFileSync('src/components/ProgressionView.tsx', code);
