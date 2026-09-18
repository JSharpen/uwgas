const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const regex = /const \[rearResult, setRearResult\] = React\.useState<\{[\s\S]*?\} \| null>\(null\);/g;

code = code.replace(
  'const [rearResult, setRearResult] = React.useState<{',
  "const [solverMode, setSolverMode] = React.useState<'least-squares' | 'legacy'>('least-squares');\n  const [rearResult, setRearResult] = React.useState<{ legacy: SolverOutput | null; ls: SolverOutput | null }>({ legacy: null, ls: null });\n  // old state: const [rearResult, setRearResult] = React.useState<{"
);

code = code.replace(
  'const [frontResult, setFrontResult] = React.useState<{',
  "const [frontResult, setFrontResult] = React.useState<{ legacy: SolverOutput | null; ls: SolverOutput | null }>({ legacy: null, ls: null });\n  // old state: const [frontResult, setFrontResult] = React.useState<{"
);

// We need to just clean up the old definitions.
code = code.replace(/\/\/ old state: const \[rearResult[\s\S]*?null\);/m, "");
code = code.replace(/\/\/ old state: const \[frontResult[\s\S]*?null\);/m, "");

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched states correctly!");
