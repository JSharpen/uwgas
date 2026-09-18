const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// I am missing a closing </div> for the inner "The Process" div!
code = code.replace(
  '</ul>\n            </div>\n          </details>',
  '</ul>\n            </div>\n            </div>\n          </details>'
);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Fixed missing div tag!");
