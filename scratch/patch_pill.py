import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# The original Summary Pill code
pill_start = """            {/* === SUMMARY PILL (Front Layer, Static) === */}
          <button 
            type="button"
            className={`relative z-10 pointer-events-auto w-full ${isSetupPanelOpen ? 'neu-convex-pressed' : 'neu-convex neu-convex-active'} shrink-0 border border-black/20 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 touch-none transition-all group overflow-hidden`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsSetupPanelOpen(!isSetupPanelOpen)}
          >"""

pill_end = """              </div>
            </div>
          </button>
        </div>
      </div>"""

# I need to find the entire pill block. Let's use regex or string slices.
start_idx = content.find(pill_start)
if start_idx == -1:
    print("Could not find pill start")
    exit(1)

end_idx = content.find(pill_end, start_idx)
if end_idx == -1:
    print("Could not find pill end")
    exit(1)

end_idx += len(pill_end)

original_pill = content[start_idx:end_idx]

# New replacement
new_pill = """            {/* === SUMMARY PILL === */}
            {setupInteractionStyle === 'drawer' ? (
""" + original_pill + """
            ) : (
              <div 
                className="relative z-10 pointer-events-auto w-full neu-convex shrink-0 border border-black/20 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-3xl z-0" />

                {/* Top Row: Preset Name & Hardware Pill Chips */}
                <div className="relative z-10 flex flex-col items-start w-full gap-2 mb-3">
                  <span className={`text-sm sm:text-base font-bold truncate w-full ${activePreset ? 'text-amber-400 font-semibold' : 'text-white/60'}`}>
                    {activePreset ? activePreset.name : 'Custom Setup'}
                  </span>
                  <div className="flex items-center gap-1.5 w-full">
                    <button 
                      type="button"
                      className="flex-1 rounded-lg px-2 py-1.5 neu-button border border-white/5 text-[10px] text-white/90 font-mono font-bold truncate text-center active:scale-95 transition-all"
                      onClick={() => setActiveSheet('machine')}
                    >
                      {activeMachine?.name || 'Default'}
                    </button>
                    <button 
                      type="button"
                      className="flex-1 rounded-lg px-2 py-1.5 neu-button border border-white/5 text-[10px] text-white/90 font-mono font-bold truncate text-center active:scale-95 transition-all"
                      onClick={() => setActiveSheet('usb')}
                    >
                      {activeUsb?.name || 'USB'}
                    </button>
                    <button 
                      type="button"
                      className="flex-1 rounded-lg px-2 py-1.5 neu-button border border-white/5 text-[10px] text-white/90 font-mono font-bold truncate text-center active:scale-95 transition-all"
                      onClick={() => setActiveSheet('jig')}
                    >
                      {activeJig?.name || 'Jig'}
                    </button>
                  </div>
                </div>
                
                {/* Main Readouts Row */}
                <div className="relative z-10 flex flex-col w-full pt-2 border-t border-white/5 gap-2">
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full gap-2">
                    
                    {/* Target Angle */}
                    <button 
                      type="button"
                      className={`flex items-baseline gap-1.5 p-1 -m-1 rounded-lg transition-colors active:scale-95 ${activeInlineRow === 'angle' ? 'bg-white/10' : ''}`}
                      onClick={() => setActiveInlineRow(r => r === 'angle' ? 'none' : 'angle')}
                    >
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Angle</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tabular-nums tracking-tight amber-glow">
                        {_nz(global.targetAngle, 15).toFixed(1)}°
                      </span>
                    </button>

                    <div className="hidden sm:flex items-center gap-1 text-white/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20 neu-concave" />
                    </div>

                    {/* Projection or USB Height */}
                    <button 
                      type="button"
                      className={`flex items-baseline gap-1.5 text-right ml-auto sm:ml-0 p-1 -m-1 rounded-lg transition-colors active:scale-95 ${activeInlineRow === 'projection' ? 'bg-white/10' : ''}`}
                      onClick={() => setActiveInlineRow(r => r === 'projection' ? 'none' : 'projection')}
                    >
                      {isProjectionMode ? (
                        <>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">USB R/F</span>
                          <span className="text-xl sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">
                            {(global.fixedUsbRear ?? global.fixedUsbHeight ?? 150).toFixed(1)}
                            <span className="text-white/40 text-sm font-normal mx-0.5">/</span>
                            {activeFrontUsb.toFixed(1)}
                            <span className="text-xs text-white/40 font-normal ml-0.5">mm</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                            {global.useProtrusionMode ? 'Pb' : 'Proj A'}
                          </span>
                          <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                            {_nz(global.useProtrusionMode ? global.protrusion : global.projection, 120).toFixed(1)}
                            <span className="text-xs text-white/40 font-normal ml-0.5">mm</span>
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Inline Expansion Area */}
                  {setupInteractionStyle === 'inline' && (
                    <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${activeInlineRow !== 'none' ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                      <div className="flex flex-col gap-3 p-3 neu-concave border border-black/40 rounded-2xl w-full">
                        {activeInlineRow === 'angle' && (
                          <div className="flex gap-2 w-full">
                            <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-1)}>-1.0°</button>
                            <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-0.5)}>-0.5°</button>
                            <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(0.5)}>+0.5°</button>
                            <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(1)}>+1.0°</button>
                          </div>
                        )}

                        {activeInlineRow === 'projection' && (
                          <div className="flex flex-col gap-3 w-full">
                            <div className="flex items-center justify-center w-full bg-black/40 p-1 rounded-xl shadow-inner border border-white/5">
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
                                <div className="flex gap-2 w-full">
                                  <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(-5)}>-5</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(-1)}>-1</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(1)}>+1</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(5)}>+5</button>
                                </div>
                            ) : (
                                <div className="flex gap-2 w-full">
                                  <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-5)}>-5</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-1)}>-1</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(1)}>+1</button>
                                  <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(5)}>+5</button>
                                </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>"""

new_content = content[:start_idx] + new_pill + content[end_idx:]

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(new_content)

print("Pill patched!")
