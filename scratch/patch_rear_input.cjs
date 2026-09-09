const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

const rearInputOld = `<input
                          inputMode="decimal"
                          step="any"
                          className="touch-pan-y w-48 mx-auto bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center text-white focus:outline-none focus:text-amber-400 transition-colors"
                          value={global.fixedUsbRear ?? global.fixedUsbHeight ?? 150}
                          onFocus={handleInputFocus}
                          onKeyDown={blurOnEnter}
                          onChange={e =>
                            setGlobal(g => ({
                              ...g,
                              fixedUsbRear: _nz(e.target.value, g.fixedUsbRear ?? 150),
                              fixedUsbHeight: _nz(e.target.value, g.fixedUsbRear ?? 150),
                            }))
                          }
                        />`;

const rearInputNew = `<div className="relative flex justify-center items-center w-full">
                          <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            className="touch-pan-y w-48 mx-auto bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center text-white focus:outline-none focus:text-amber-400 transition-colors"
                            value={global.fixedUsbRear ?? global.fixedUsbHeight ?? 150}
                            onFocus={handleInputFocus}
                            onKeyDown={blurOnEnter}
                            onChange={e =>
                              setGlobal(g => ({
                                ...g,
                                fixedUsbRear: _nz(e.target.value, g.fixedUsbRear ?? 150),
                                fixedUsbHeight: _nz(e.target.value, g.fixedUsbRear ?? 150),
                              }))
                            }
                          />
                        </div>`;

code = code.replace(rearInputOld, rearInputNew);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
