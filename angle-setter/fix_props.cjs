const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

code = code.replace(/  bodyPaddingX = 'px-3',\n  bodyPaddingY = 'py-2',\n  bodyGap = 'gap-2',\n/g, '');
code = code.replace(/  bodyPaddingX\?: string;\n  bodyPaddingY\?: string;\n  bodyGap\?: string;\n/g, '');

fs.writeFileSync('src/components/ProgressionView.tsx', code);
