const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const regex = /const \[calibName, setCalibName\] = React\.useState\(`Mapping \$\{\(activeMachine\.calibrationProfiles\?\.length \|\| 0\) \+ 1\}`\);/;
const replacement = "const [calibName, setCalibName] = React.useState(`${activeMachine.name} - ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`);";

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
    console.log("Updated CalibrationWizard name prefill.");
} else {
    console.log("Regex didn't match. Here is the line in the file:");
    console.log(code.split('\n').find(l => l.includes('calibName')));
}
