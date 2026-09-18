const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const regex = /<button\n\s*type="button"\n\s*className="w-11 h-11 rounded-full bg-white\/5 hover:bg-white\/10 active:bg-white\/20 text-white\/60 hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer"\n\s*onClick=\{onCancel\}\n\s*aria-label="Cancel calibration"\n\s*>\n\s*<IconClose className="w-5 h-5" \/>\n\s*<\/button>/;

if(regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
    console.log("Removed inner close button.");
} else {
    console.log("Could not find inner close button.");
}
