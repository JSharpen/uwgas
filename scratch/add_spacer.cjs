const fs = require('fs');

let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// Find the end of the hardware selectors section which is the end of the inner scroll area content.
// Looking for:
//                     <MiniSelect
//                       label="JIG"
//                       value={activeJig.name}
//                       onClick={() => openSheet('jig')}
//                     />
//                   </div>
//                 </div>
//               </div>

// Let's replace the closing tags before the end of the inner scroll area with the tags plus the spacer.
const target = `                    <MiniSelect
                      label="JIG"
                      value={activeJig.name}
                      onClick={() => openSheet('jig')}
                    />
                  </div>
                </div>
              </div>`;

const replacement = `                    <MiniSelect
                      label="JIG"
                      value={activeJig.name}
                      onClick={() => openSheet('jig')}
                    />
                  </div>
                </div>
              </div>
              
              {/* Invisible spacer to ensure scrollable bottom padding (Safari fix) */}
              <div className="h-6 shrink-0 w-full" />`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
