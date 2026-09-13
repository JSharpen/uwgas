import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# Replace Angle Expansion
old_angle_exp = """                        {activeInlineRow === 'angle' && (
                          <div className="flex gap-2 w-full p-2 neu-concave border border-black/40 rounded-2xl">
                            <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-1)}>-1.0°</button>
                            <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-0.5)}>-0.5°</button>
                            <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(0.5)}>+0.5°</button>
                            <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(1)}>+1.0°</button>
                          </div>
                        )}"""

new_angle_exp = """                        {activeInlineRow === 'angle' && (
                          <div className="flex flex-col gap-3 p-3 neu-concave border border-black/40 rounded-2xl w-full">
                            <div className="flex justify-center items-center w-full relative">
                              <input
                                type="number"
                                inputMode="decimal"
                                step="any"
                                className="touch-pan-y w-48 mx-auto bg-transparent text-4xl sm:text-5xl font-extrabold tabular-nums text-center text-amber-400 focus:outline-none focus:text-amber-300 transition-colors"
                                value={_nz(global.targetAngle, 15)}
                                onFocus={handleInputFocus}
                                onKeyDown={blurOnEnter}
                                onChange={e => setGlobal(g => ({ ...g, targetAngle: _nz(e.target.value, 15) }))}
                              />
                              <div className="absolute right-0 flex items-center justify-end w-16 pointer-events-none">
                                <span className="text-xl sm:text-2xl font-bold text-amber-400/50">°</span>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full mt-1">
                              <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-1)}>-1.0°</button>
                              <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-0.5)}>-0.5°</button>
                              <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(0.5)}>+0.5°</button>
                              <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(1)}>+1.0°</button>
                            </div>
                          </div>
                        )}"""

content = content.replace(old_angle_exp, new_angle_exp)


# Replace Projection Expansion
old_proj_exp = """                        {activeInlineRow === 'projection' && (
                          <div className="flex flex-col gap-3 w-full p-3 neu-concave border border-black/40 rounded-2xl">
                            <div className="flex items-center justify-center w-full bg-black/40 p-1 rounded-xl shadow-inner border border-white/5 relative z-10 mx-auto">
                              <button
                                type="button"
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${!isProjectionMode ? 'bg-[#333] text-amber-400 shadow-md border border-white/10' : 'text-white/40 hover:text-white/60'}`}
                                onClick={() => setGlobal(g => ({ ...g, calcMode: 'height' }))}
                              >
                                Projection
                              </button>
                              <button
                                type="button"
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${isProjectionMode ? 'bg-[#333] text-amber-400 shadow-md border border-white/10' : 'text-white/40 hover:text-white/60'}`}
                                onClick={() => setGlobal(g => ({ ...g, calcMode: 'projection' }))}
                              >
                                Fixed USB
                              </button>
                            </div>
                            
                            {isProjectionMode ? (
                                <div className="flex gap-2 w-full mt-1">
                                  <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(-5)}>-5</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(-1)}>-1</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(1)}>+1</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(5)}>+5</button>
                                </div>
                            ) : (
                                <div className="flex gap-2 w-full mt-1">
                                  <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-5)}>-5</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-1)}>-1</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(1)}>+1</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(5)}>+5</button>
                                </div>
                            )}
                          </div>
                        )}"""

new_proj_exp = """                        {activeInlineRow === 'projection' && (
                          <div className="flex flex-col gap-3 w-full p-3 neu-concave border border-black/40 rounded-2xl">
                            {isProjectionMode ? (
                              <>
                                <div className="flex items-center justify-between px-2">
                                  <label className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Fixed USB Height</label>
                                  <div 
                                    className="relative flex neu-concave rounded-full border border-black/40 p-1 select-none w-36 cursor-pointer"
                                    onClick={() => setActiveUsbTab(activeUsbTab === 'rear' ? 'front' : 'rear')}
                                  >
                                    <div className="absolute top-1 bottom-1 left-1 right-1 pointer-events-none">
                                      <div className={`w-1/2 h-full neu-button rounded-full shadow-sm transition-transform duration-300 ease-out ${activeUsbTab === 'rear' ? 'translate-x-0' : 'translate-x-full'}`} />
                                    </div>
                                    <div className="relative z-10 flex w-full">
                                      <div className={`flex-1 py-1 flex items-center justify-center text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${activeUsbTab === 'rear' ? 'text-white' : 'text-white/40'}`}>
                                        Rear
                                      </div>
                                      <div className={`flex-1 py-1 flex items-center justify-center text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${activeUsbTab === 'front' ? 'text-white' : 'text-white/40'}`}>
                                        Front
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {activeUsbTab === 'rear' ? (
                                  <>
                                    <div className="relative flex justify-center items-center w-full">
                                      <input
                                        type="number"
                                        inputMode="decimal"
                                        step="any"
                                        className="touch-pan-y w-48 mx-auto bg-transparent text-4xl sm:text-5xl font-extrabold tabular-nums text-center text-white focus:outline-none focus:text-amber-400 transition-colors"
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
                                      <div className="absolute right-0 flex items-center justify-end w-16 pointer-events-none">
                                        <span className="text-xl sm:text-2xl font-bold text-white/20">mm</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 w-full mt-1">
                                      <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(-5)}>-5</button>
                                      <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(-1)}>-1</button>
                                      <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(1)}>+1</button>
                                      <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(5)}>+5</button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="relative flex justify-center items-center w-full">
                                      <input
                                        type="number"
                                        inputMode="decimal"
                                        step="any"
                                        className="touch-pan-y w-48 mx-auto bg-transparent text-4xl sm:text-5xl font-extrabold tabular-nums text-center focus:outline-none transition-colors disabled:opacity-50 disabled:text-white/30 disabled:bg-transparent text-white focus:text-amber-400"
                                        value={global.useCustomFrontUsb ? (global.fixedUsbFront ?? Math.round(suggestedFrontUsb * 100) / 100) : suggestedFrontUsb.toFixed(2)}
                                        onFocus={handleInputFocus}
                                        onKeyDown={blurOnEnter}
                                        disabled={!global.useCustomFrontUsb}
                                        onChange={e =>
                                          setGlobal(g => ({ ...g, fixedUsbFront: _nz(e.target.value, g.fixedUsbFront ?? suggestedFrontUsb) }))
                                        }
                                      />
                                      <div className="absolute right-0 flex flex-col items-end justify-center w-16 gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setGlobal(g => ({ ...g, useCustomFrontUsb: !g.useCustomFrontUsb, fixedUsbFront: !g.useCustomFrontUsb ? suggestedFrontUsb : g.fixedUsbFront }))}
                                          className={`px-2 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase transition-colors border ${global.useCustomFrontUsb ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-black/40 text-white/40 border-black/60 shadow-inner'}`}
                                        >
                                          {global.useCustomFrontUsb ? 'Custom' : 'Auto'}
                                        </button>
                                      </div>
                                    </div>
                                    <div className={`flex gap-2 w-full mt-1 transition-opacity duration-300 ${global.useCustomFrontUsb ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                                      <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbFrontStep(-5)}>-5</button>
                                      <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbFrontStep(-1)}>-1</button>
                                      <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbFrontStep(1)}>+1</button>
                                      <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbFrontStep(5)}>+5</button>
                                    </div>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between px-2">
                                  <label className="text-[10px] font-bold text-white/40 tracking-widest uppercase">{global.useProtrusionMode ? 'Protrusion (Pb)' : 'Projection (A)'}</label>
                                  <button
                                    type="button"
                                    onClick={() => setGlobal(g => ({ ...g, useProtrusionMode: !g.useProtrusionMode }))}
                                    className="px-2 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase bg-black/40 text-white/40 border border-black/60 shadow-inner active:scale-95 transition-all"
                                  >
                                    Toggle Mode
                                  </button>
                                </div>
                                <div className="relative flex justify-center items-center w-full">
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    step="any"
                                    className="touch-pan-y w-48 mx-auto bg-transparent text-4xl sm:text-5xl font-extrabold tabular-nums text-center text-white focus:outline-none focus:text-amber-400 transition-colors"
                                    value={_nz(global.useProtrusionMode ? global.protrusion : global.projection, 120)}
                                    onFocus={handleInputFocus}
                                    onKeyDown={blurOnEnter}
                                    onChange={e =>
                                      setGlobal(g => {
                                        const val = _nz(e.target.value, 120);
                                        return g.useProtrusionMode
                                          ? { ...g, protrusion: val }
                                          : { ...g, projection: val };
                                      })
                                    }
                                  />
                                  <div className="absolute right-0 flex items-center justify-end w-16 pointer-events-none">
                                    <span className="text-xl sm:text-2xl font-bold text-white/20">mm</span>
                                  </div>
                                </div>
                                <div className="flex gap-2 w-full mt-1">
                                  <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-5)}>-5</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-1)}>-1</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(1)}>+1</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(5)}>+5</button>
                                </div>
                              </>
                            )}
                          </div>
                        )}"""

content = content.replace(old_proj_exp, new_proj_exp)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Expansion logic patched!")
