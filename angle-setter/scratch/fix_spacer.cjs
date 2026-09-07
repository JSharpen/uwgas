const fs = require('fs');

let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// Remove the wrongly placed spacer
const wrongSpacer = `              {/* Invisible spacer to ensure scrollable bottom padding (Safari fix) */}
              <div className="h-6 shrink-0 w-full" />`;
code = code.replace(wrongSpacer + '\n', '');

// Insert it BEFORE the closing </div> of the INPUTS AREA.
// The INPUTS AREA closing div is right before the SUMMARY PILL.
const rightBeforePill = `            </div>

            {/* === SUMMARY PILL`;

const replacement = `              {/* Invisible spacer to ensure scrollable bottom padding (Safari fix) */}
              <div className="h-6 shrink-0 w-full" />
            </div>

            {/* === SUMMARY PILL`;

code = code.replace(rightBeforePill, replacement);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
