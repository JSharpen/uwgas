const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// 1. Restore pb-6 to Drawer Body
// Find: className={`w-full neu-convex border border-black/40 shadow-2xl rounded-t-3xl rounded-b-none transition-all
// Replace: className={`w-full neu-convex border border-black/40 shadow-2xl rounded-t-3xl rounded-b-none pb-6 transition-all
code = code.replace(
  "rounded-b-none transition-all",
  "rounded-b-none pb-6 transition-all"
);

// 2. Remove the wrongly placed h-12 spacer
const wrongSpacer = `              {/* Invisible spacer to ensure scrollable bottom padding (Safari fix) */}
              <div className="h-12 shrink-0 w-full" />`;
code = code.replace(wrongSpacer + '\n', '');

// 3. Insert the correct h-6 spacer INSIDE the Inputs Area.
// We know the Hardware Buttons end with:
//                   </button>
//                 </div>
//               </div>
// And the second </div> (the one with 14 spaces indentation) is line 397 which closes Inputs Area.
// We want to insert it AFTER the Hardware Buttons (line 396 `</div>`) and BEFORE line 397 `</div>`.

const target = `                  </button>
                </div>
              </div>`;
              
const replacement = `                  </button>
                </div>
                {/* Invisible spacer to ensure scrollable bottom padding (Safari fix) */}
                <div className="h-6 shrink-0 w-full" />
              </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
