import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# I need to add custom modals and action sheets at the end of the return statement
end_block = """      <ActionSheetPicker
        isOpen={activeSheet === 'preset'}"""

new_blocks = """      {/* ANGLE: Action Sheet & Modal */}
      <ActionSheet
        isOpen={activeSheet === 'angle'}
        onClose={() => setActiveSheet('none')}
      >
        <div className="p-4 flex flex-col gap-4 w-full">
          <h3 className="text-white font-bold mb-2">Adjust Target Angle</h3>
          <div className="flex gap-2 w-full">
            <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-1)}>-1.0°</button>
            <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-0.5)}>-0.5°</button>
            <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(0.5)}>+0.5°</button>
            <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(1)}>+1.0°</button>
          </div>
        </div>
      </ActionSheet>

      <ModalShell
        isOpen={activeModal === 'angle'}
        onClose={() => setActiveModal('none')}
        title="Target Angle"
      >
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-baseline justify-center gap-2 mb-4">
            <span className="text-5xl font-extrabold text-amber-400 tabular-nums tracking-tight amber-glow">{_nz(global.targetAngle, 15).toFixed(1)}°</span>
          </div>
          <div className="flex gap-2 w-full">
            <button type="button" className="flex-1 h-14 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-1)}>-1.0°</button>
            <button type="button" className="flex-1 h-14 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-0.5)}>-0.5°</button>
            <button type="button" className="flex-1 h-14 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(0.5)}>+0.5°</button>
            <button type="button" className="flex-1 h-14 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(1)}>+1.0°</button>
          </div>
        </div>
      </ModalShell>

      {/* PROJECTION: Action Sheet & Modal */}
      <ActionSheet
        isOpen={activeSheet === 'projection'}
        onClose={() => setActiveSheet('none')}
      >
        <div className="p-4 flex flex-col gap-4 w-full">
          <h3 className="text-white font-bold mb-2">Adjust {isProjectionMode ? 'Fixed USB' : 'Projection'}</h3>
          <div className="flex items-center justify-center w-full bg-black/40 p-1 rounded-xl shadow-inner border border-white/5 relative z-10 mx-auto">
            <button type="button" className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${!isProjectionMode ? 'bg-[#333] text-amber-400 shadow-md border border-white/10' : 'text-white/40 hover:text-white/60'}`} onClick={() => setGlobal(g => ({ ...g, calcMode: 'height' }))}>Projection</button>
            <button type="button" className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${isProjectionMode ? 'bg-[#333] text-amber-400 shadow-md border border-white/10' : 'text-white/40 hover:text-white/60'}`} onClick={() => setGlobal(g => ({ ...g, calcMode: 'projection' }))}>Fixed USB</button>
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
      </ActionSheet>

      <ModalShell
        isOpen={activeModal === 'projection'}
        onClose={() => setActiveModal('none')}
        title={isProjectionMode ? 'Fixed USB' : 'Projection'}
      >
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-baseline justify-center gap-2 mb-4">
            <span className="text-5xl font-extrabold text-white tabular-nums tracking-tight">
              {isProjectionMode ? (global.fixedUsbRear ?? global.fixedUsbHeight ?? 150).toFixed(1) : _nz(global.useProtrusionMode ? global.protrusion : global.projection, 120).toFixed(1)}
              <span className="text-xl text-white/40 ml-1">mm</span>
            </span>
          </div>
          <div className="flex items-center justify-center w-full bg-black/40 p-1 rounded-xl shadow-inner border border-white/5 relative z-10 mx-auto">
            <button type="button" className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${!isProjectionMode ? 'bg-[#333] text-amber-400 shadow-md border border-white/10' : 'text-white/40 hover:text-white/60'}`} onClick={() => setGlobal(g => ({ ...g, calcMode: 'height' }))}>Projection</button>
            <button type="button" className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${isProjectionMode ? 'bg-[#333] text-amber-400 shadow-md border border-white/10' : 'text-white/40 hover:text-white/60'}`} onClick={() => setGlobal(g => ({ ...g, calcMode: 'projection' }))}>Fixed USB</button>
          </div>
          {isProjectionMode ? (
            <div className="flex gap-2 w-full mt-1">
              <button type="button" className="flex-1 h-14 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(-5)}>-5</button>
              <button type="button" className="flex-1 h-14 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(-1)}>-1</button>
              <button type="button" className="flex-1 h-14 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(1)}>+1</button>
              <button type="button" className="flex-1 h-14 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(5)}>+5</button>
            </div>
          ) : (
            <div className="flex gap-2 w-full mt-1">
              <button type="button" className="flex-1 h-14 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-5)}>-5</button>
              <button type="button" className="flex-1 h-14 rounded-xl neu-button text-white/80 font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-1)}>-1</button>
              <button type="button" className="flex-1 h-14 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(1)}>+1</button>
              <button type="button" className="flex-1 h-14 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold tabular-nums flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(5)}>+5</button>
            </div>
          )}
        </div>
      </ModalShell>

      <ActionSheetPicker
        isOpen={activeSheet === 'preset'}"""

content = content.replace(end_block, new_blocks)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Modals and Sheets added!")
