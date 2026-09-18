const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// Use UI store step
const replacement = `  const jigs = useStore(useShallow((s) => s.jigs));
  const step = useUIStore(s => s.calibrationStep);
  const setStep = useUIStore(s => s.setCalibrationStep);
  const [scope, setScope] = React.useState<Scope>('both');`;

code = code.replace(
  /const jigs = useStore\(useShallow\(\(s\) => s\.jigs\)\);\n\s*const \[step, setStep\] = React\.useState<WizardStep>\('intro'\);\n\s*const \[scope, setScope\] = React\.useState<Scope>\('both'\);/,
  replacement
);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched CalibrationWizard to use global step!");
