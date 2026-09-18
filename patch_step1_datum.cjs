const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

code = code.replace(
  '<span>Measure the height from the machine casing to the top of the USB bar (<strong className="text-white">hₙ</strong>).</span>',
  '<span>Measure the height from your chosen datum to the top of the USB bar (<strong className="text-white">hₙ</strong>).</span>'
);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched Step 1 datum text!");
