const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// 1. Update Imports
code = code.replace(
    "import { calibrateBase } from '../math/tormek';",
    "import { calibrateBase, calibrateBaseTrueLeastSquares } from '../math/tormek';"
);

// 2. Add Result Type
const typeDef = `
type SolverOutput = {
  hc: number;
  o: number;
  diagnostics: any;
  angleErrorDeg: number | null;
};
`;
code = code.replace("type Scope = 'both' | 'rear' | 'front';", "type Scope = 'both' | 'rear' | 'front';" + typeDef);

// 3. Update States
const oldStates = `  const [rearResult, setRearResult] = React.useState<{
    hc: number;
    o: number;
    diagnostics: any;
    angleErrorDeg: number | null;
  } | null>(null);
  const [frontResult, setFrontResult] = React.useState<{
    hc: number;
    o: number;
    diagnostics: any;
    angleErrorDeg: number | null;
  } | null>(null);`;

const newStates = `  const [solverMode, setSolverMode] = React.useState<'least-squares' | 'legacy'>('least-squares');
  const [rearResult, setRearResult] = React.useState<{ legacy: SolverOutput | null; ls: SolverOutput | null }>({ legacy: null, ls: null });
  const [frontResult, setFrontResult] = React.useState<{ legacy: SolverOutput | null; ls: SolverOutput | null }>({ legacy: null, ls: null });`;

code = code.replace(oldStates, newStates);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched imports and state!");
