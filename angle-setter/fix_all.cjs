const fs = require('fs');
const file = 'src/components/calculator/GlobalSetupCard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1: USB tabs
const brokenUsbTabs = `                        <button
                          type="button"
                          className={\`flex-1 rounded-full text-[10px] font-bold tracking-wider py-1.5 uppercase transition \${activeUsbTab === 'rear' ? 'neu-button text-white shadow-sm' : 'text-white/40 hover:text-white'}\`}
                          onClick={() => setActiveUsbTab('rear')}
                          Rear
                        </button>
                        <button
                          className={\`flex-1 rounded-full text-[10px] font-bold tracking-wider py-1.5 uppercase transition \${activeUsbTab === 'front' ? 'neu-button text-white shadow-sm' : 'text-white/40 hover:text-white'}\`}
                          onClick={() => setActiveUsbTab('front')}
                        >
                        </button>`;

const fixedUsbTabs = `                        <button
                          type="button"
                          className={\`flex-1 rounded-full text-[10px] font-bold tracking-wider py-1.5 uppercase transition \${activeUsbTab === 'rear' ? 'neu-button text-white shadow-sm' : 'text-white/40 hover:text-white'}\`}
                          onClick={() => setActiveUsbTab('rear')}
                        >
                          Rear
                        </button>
                        <button
                          type="button"
                          className={\`flex-1 rounded-full text-[10px] font-bold tracking-wider py-1.5 uppercase transition \${activeUsbTab === 'front' ? 'neu-button text-white shadow-sm' : 'text-white/40 hover:text-white'}\`}
                          onClick={() => setActiveUsbTab('front')}
                        >
                          Front
                        </button>`;

if (content.includes(brokenUsbTabs)) {
  content = content.replace(brokenUsbTabs, fixedUsbTabs);
  console.log('Fixed USB tabs.');
} else {
  console.log('USB tabs not found.');
}

// Fix 2: Front USB input attributes
const brokenFrontUsb = `                         <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            className="w-full bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center focus:outline-none transition-colors disabled:opacity-40 disabled:text-white/40 disabled:bg-transparent text-white focus:text-amber-400"
                            value={global.useCustomFrontUsb ? (global.fixedUsbFront ?? Math.round(suggestedFrontUsb * 100) / 100) : suggestedFrontUsb.toFixed(2)}
                            onFocus={handleInputFocus}
                            }
                          />`;
const fixedFrontUsb = `                         <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            className="w-full bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center focus:outline-none transition-colors disabled:opacity-40 disabled:text-white/40 disabled:bg-transparent text-white focus:text-amber-400"
                            value={global.useCustomFrontUsb ? (global.fixedUsbFront ?? Math.round(suggestedFrontUsb * 100) / 100) : suggestedFrontUsb.toFixed(2)}
                            onFocus={handleInputFocus}
                            onKeyDown={blurOnEnter}
                            disabled={!global.useCustomFrontUsb}
                            onChange={e =>
                              setGlobal(g => ({ ...g, fixedUsbFront: _nz(e.target.value, g.fixedUsbFront ?? suggestedFrontUsb) }))
                            }
                          />`;

if (content.includes(brokenFrontUsb)) {
  content = content.replace(brokenFrontUsb, fixedFrontUsb);
  console.log('Fixed Front USB attributes.');
} else {
  console.log('Front USB attributes not found.');
}

// Fix 3: Projection Mode syntax
const brokenProjection = `                    )}
                      <label className={\`text-[10px] font-bold tracking-widest uppercase \${global.useProtrusionMode ? 'text-amber-400' : 'text-white/40'}\`}>`;

const fixedProjection = `                    )}
                  </div>
                ) : (
                  <div className="neu-concave border border-black/40 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="text-center">
                      <label className={\`text-[10px] font-bold tracking-widest uppercase \${global.useProtrusionMode ? 'text-amber-400' : 'text-white/40'}\`}>`;

if (content.includes(brokenProjection)) {
  content = content.replace(brokenProjection, fixedProjection);
  console.log('Fixed Projection syntax.');
} else {
  console.log('Projection syntax not found.');
}

// Fix 4: Projection Buttons div
const brokenProjButtons = `                      <button type="button" className={\`flex-1 h-12 rounded-xl text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all \${global.useProtrusionMode ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20' : 'neu-button text-white/80'}\`} onClick={() => handleProjectionStep(-5)}>-5</button>
                      <button type="button" className={\`flex-1 h-12 rounded-xl text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all \${global.useProtrusionMode ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20' : 'neu-button text-white/80'}\`} onClick={() => handleProjectionStep(-1)}>-1</button>`;

const fixedProjButtons = `                    <div className="flex gap-2 w-full mt-1">
                      <button type="button" className={\`flex-1 h-12 rounded-xl text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all \${global.useProtrusionMode ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20' : 'neu-button text-white/80'}\`} onClick={() => handleProjectionStep(-5)}>-5</button>
                      <button type="button" className={\`flex-1 h-12 rounded-xl text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all \${global.useProtrusionMode ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20' : 'neu-button text-white/80'}\`} onClick={() => handleProjectionStep(-1)}>-1</button>`;

if (content.includes(brokenProjButtons)) {
  content = content.replace(brokenProjButtons, fixedProjButtons);
  console.log('Fixed Projection Buttons.');
} else {
  console.log('Projection Buttons not found.');
}

// Fix 5: Protrusion Addon syntax
const brokenProtrusion = `                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        className="w-full bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center text-amber-400 focus:outline-none transition-colors"
                        value={global.protrusion}
                        onFocus={handleInputFocus}
                        onKeyDown={blurOnEnter}
                        <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-1)}>-1</button>
                        <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(1)}>+1</button>
                        <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(5)}>+5</button>
                      </div>`;

const fixedProtrusion = `                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        className="w-full bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center text-amber-400 focus:outline-none transition-colors"
                        value={global.protrusion}
                        onFocus={handleInputFocus}
                        onKeyDown={blurOnEnter}
                        onChange={e => setGlobal(g => ({ ...g, protrusion: _nz(e.target.value, g.protrusion) }))}
                      />
                      <div className="flex gap-2 w-full mt-1">
                        <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-5)}>-5</button>
                        <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-1)}>-1</button>
                        <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(1)}>+1</button>
                        <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(5)}>+5</button>
                      </div>`;

if (content.includes(brokenProtrusion)) {
  content = content.replace(brokenProtrusion, fixedProtrusion);
  console.log('Fixed Protrusion syntax.');
} else {
  console.log('Protrusion syntax not found.');
}

fs.writeFileSync(file, content);
