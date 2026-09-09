const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// Replace all 'w-full' with 'w-48 mx-auto' inside these specific massive text-4xl inputs
// We can use a regex to target className="touch-pan-y w-full bg-transparent text-4xl
code = code.replace(/className="touch-pan-y w-full bg-transparent text-4xl/g, 'className="touch-pan-y w-48 mx-auto bg-transparent text-4xl');

// Revert the header to just "Fixed USB Height"
const oldHeader = `<div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
                          {activeUsbTab === 'rear' ? 'Rear Height' : 'Front Height'}
                        </label>
                        {activeUsbTab === 'front' && (
                          <button
                            type="button"
                            onClick={() => setGlobal(g => ({ ...g, useCustomFrontUsb: !g.useCustomFrontUsb, fixedUsbFront: !g.useCustomFrontUsb ? suggestedFrontUsb : g.fixedUsbFront }))}
                            className={\`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase transition-colors border \${global.useCustomFrontUsb ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-black/40 text-white/40 border-black/60 shadow-inner'}\`}
                          >
                            {global.useCustomFrontUsb ? 'Custom' : 'Auto'}
                          </button>
                        )}
                      </div>`;
const newHeader = `<label className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Fixed USB Height</label>`;
code = code.replace(oldHeader, newHeader);

// Now, insert the absolute toggle inside the relative container of the Front input
const frontInputWrapperOld = `<div className="relative">
                          <input
                            type="number"`;

const frontInputWrapperNew = `<div className="relative flex justify-center">
                          <input
                            type="number"`;

// Wait, the container needs to just hold the input and the absolute toggle.
// We'll replace the whole front input block.
const frontInputRegex = /<div className="relative">\s*<input[\s\S]*?\/>\s*<\/div>/;

const frontInputReplacement = `<div className="relative flex justify-center items-center w-full">
                          <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            className="touch-pan-y w-48 mx-auto bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center focus:outline-none transition-colors disabled:opacity-50 disabled:text-white/30 disabled:bg-transparent text-white focus:text-amber-400"
                            value={global.useCustomFrontUsb ? (global.fixedUsbFront ?? Math.round(suggestedFrontUsb * 100) / 100) : suggestedFrontUsb.toFixed(2)}
                            onFocus={handleInputFocus}
                            onKeyDown={blurOnEnter}
                            disabled={!global.useCustomFrontUsb}
                            onChange={e =>
                              setGlobal(g => ({ ...g, fixedUsbFront: _nz(e.target.value, g.fixedUsbFront ?? suggestedFrontUsb) }))
                            }
                          />
                          <div className="absolute right-0 flex items-center justify-end w-16">
                            <button
                              type="button"
                              onClick={() => setGlobal(g => ({ ...g, useCustomFrontUsb: !g.useCustomFrontUsb, fixedUsbFront: !g.useCustomFrontUsb ? suggestedFrontUsb : g.fixedUsbFront }))}
                              className={\`px-2 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase transition-colors border \${global.useCustomFrontUsb ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-black/40 text-white/40 border-black/60 shadow-inner'}\`}
                            >
                              {global.useCustomFrontUsb ? 'Custom' : 'Auto'}
                            </button>
                          </div>
                        </div>`;

code = code.replace(frontInputRegex, frontInputReplacement);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
