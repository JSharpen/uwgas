const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// Fix Intro block
code = code.replace(
  '</ul>\n            </div>\n              </div>\n            </div>\n          </div>\n          {/* Profile Name Field */}',
  '</ul>\n            </div>\n              </div>\n            </div>\n          </div>\n          </div>\n          {/* Profile Name Field */}'
);

// Check Guide block (How do I measure these?)
// Original replacement ended with: 
// <div className="p-3 pt-0 text-xs text-white/70 flex flex-col gap-3 border-t border-white/5 mt-2">$1</div>
// </div></div></div>
// If $1 contained 0 unclosed divs, it should be fine. But let's check what $1 was.
// In the original, $1 was:
// <div className="flex flex-col gap-1">...</div>
// <div className="flex flex-col gap-1">...</div>
// So $1 was perfectly balanced. Let's verify Guide block just in case.

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Fixed Intro block tags!");
