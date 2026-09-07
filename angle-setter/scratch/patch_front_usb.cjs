const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// 1. Update the Header Area
const oldHeader = `<label className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Fixed USB Height</label>`;
const newHeader = `<div className="flex items-center gap-2">
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
code = code.replace(oldHeader, newHeader);

// 2. Update the Front Tab Body to strictly match the Rear Tab Body
const oldFrontBodyRegex = /<div className="flex flex-col gap-3">[\s\S]*?override Auto Front USB[\s\S]*?<\/label>\s*<\/div>/i;

const newFrontBody = `<div className="flex flex-col">
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            className="touch-pan-y w-full bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center focus:outline-none transition-colors disabled:opacity-50 disabled:text-white/30 disabled:bg-transparent text-white focus:text-amber-400"
                            value={global.useCustomFrontUsb ? (global.fixedUsbFront ?? Math.round(suggestedFrontUsb * 100) / 100) : suggestedFrontUsb.toFixed(2)}
                            onFocus={handleInputFocus}
                            onKeyDown={blurOnEnter}
                            disabled={!global.useCustomFrontUsb}
                            onChange={e =>
                              setGlobal(g => ({ ...g, fixedUsbFront: _nz(e.target.value, g.fixedUsbFront ?? suggestedFrontUsb) }))
                            }
                          />
                        </div>
                        <div className={\`flex gap-2 w-full mt-1 transition-opacity duration-300 \${global.useCustomFrontUsb ? 'opacity-100' : 'opacity-20 pointer-events-none'}\`}>
                          <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbFrontStep(-5)}>-5</button>
                          <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbFrontStep(-1)}>-1</button>
                          <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbFrontStep(1)}>+1</button>
                          <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbFrontStep(5)}>+5</button>
                        </div>
                      </div>`;

code = code.replace(oldFrontBodyRegex, newFrontBody);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
