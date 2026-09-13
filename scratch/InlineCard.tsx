import * as React from 'react';

// This is just a draft of the new conditional block to inject before the main return

  if (setupInteractionStyle === 'inline') {
    return (
      <div className="w-full relative z-10 flex flex-col items-stretch max-w-[576px] mx-auto">
        <div className="neu-convex border border-black/20 rounded-3xl p-4 sm:p-5 flex flex-col gap-4">
          {/* Top Row: Hardware Pill Chips (Click to open action sheets) */}
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
          
          <div className="w-full h-px bg-white/5" />

          {/* Target Angle Row */}
          <div className="flex flex-col w-full">
            <button 
              type="button"
              className={`flex items-center justify-between w-full px-2 py-2 rounded-xl transition-colors ${activeInlineRow === 'angle' ? 'bg-amber-400/10' : 'hover:bg-white/5 active:bg-white/10'}`}
              onClick={() => setActiveInlineRow(r => r === 'angle' ? 'none' : 'angle')}
            >
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Angle</span>
              <span className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight transition-colors ${activeInlineRow === 'angle' ? 'text-amber-400 amber-glow' : 'text-white'}`}>
                {_nz(global.targetAngle, 15).toFixed(1)}°
              </span>
            </button>

            {/* Angle Expansion */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeInlineRow === 'angle' ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
              {/* Steppers for Angle */}
              {/* Note: I will copy the angle steppers from the drawer here */}
              <div className="flex gap-2 w-full p-2 neu-concave border border-black/40 rounded-2xl">
                 <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-1)}>-1.0°</button>
                 <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-0.5)}>-0.5°</button>
                 <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(0.5)}>+0.5°</button>
                 <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(1)}>+1.0°</button>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="w-full h-px bg-white/5" />

          {/* Projection Row */}
          <div className="flex flex-col w-full">
            <button 
              type="button"
              className={`flex items-center justify-between w-full px-2 py-2 rounded-xl transition-colors ${activeInlineRow === 'projection' ? 'bg-amber-400/10' : 'hover:bg-white/5 active:bg-white/10'}`}
              onClick={() => setActiveInlineRow(r => r === 'projection' ? 'none' : 'projection')}
            >
              <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                  {isProjectionMode ? 'USB R/F' : (global.useProtrusionMode ? 'Pb' : 'Proj A')}
                </span>
              </div>
              <span className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight transition-colors ${activeInlineRow === 'projection' ? 'text-amber-400 amber-glow' : 'text-white'}`}>
                {isProjectionMode ? (
                  <>
                    {(global.fixedUsbRear ?? global.fixedUsbHeight ?? 150).toFixed(1)}
                    <span className="text-white/40 text-sm font-normal mx-0.5">/</span>
                    {activeFrontUsb.toFixed(1)}
                  </>
                ) : (
                  <>
                    {_nz(global.useProtrusionMode ? global.protrusion : global.projection, 120).toFixed(1)}
                  </>
                )}
                <span className="text-xs text-white/40 font-normal ml-0.5">mm</span>
              </span>
            </button>

            {/* Projection Expansion */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeInlineRow === 'projection' ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
              <div className="flex flex-col gap-3 p-3 neu-concave border border-black/40 rounded-2xl">
                {/* Steppers for Projection/USB (Copy from drawer) */}
                <div className="flex items-center justify-center w-full bg-black/40 p-1 rounded-xl shadow-inner border border-white/5 relative z-10 mx-auto">
                    <button
                      type="button"
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${!isProjectionMode ? 'bg-[#333] text-amber-400 shadow-md border border-white/10' : 'text-white/40 hover:text-white/60'}`}
                      onClick={() => setGlobal(g => ({ ...g, calcMode: 'standard' }))}
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
            </div>
          </div>
        </div>
      </div>
    );
  }

