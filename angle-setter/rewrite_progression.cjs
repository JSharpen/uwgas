const fs = require('fs');

let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

const mapStart = code.indexOf('wheelResults.map((r, index) => {');
const mapEnd = code.indexOf('{/* Action Sheets for Inline Editing */}');

if (mapStart === -1 || mapEnd === -1) {
  console.error("Could not find boundaries.");
  process.exit(1);
}

const beforeMap = code.substring(0, mapStart);
const afterMap = code.substring(mapEnd);

const newMapping = `wheelResults.map((r, index) => {
        const stepId = r.step?.id ?? r.wheel.id;
        const isExpanded = expandedStepId === stepId;
        
        const effectiveMachine = r.step?.machineId
          ? machines.find(m => m.id === r.step!.machineId)
          : machines.find(m => m.id === defaultMachineId);

        const angleOffset = r.step?.angleOffset ?? 0;
        const hasOffset = angleOffset !== 0;

        const effectiveUsb = usbs.find(u => u.id === (r.step?.usbId || globalUsbId));

        return (
          <div
            key={stepId}
            className="bg-[#262626] rounded-3xl border border-white/10 shadow-lg relative flex flex-col motion-list-item transition-all duration-300 group"
            style={{ '--motion-order': index } as React.CSSProperties}
          >
            {/* Subtle Edge Highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0"></div>
            
            {/* ===== View State (Clickable to Expand) ===== */}
            <div 
              className="flex justify-between items-center p-5 relative z-10 cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors rounded-3xl"
              onClick={() => setExpandedStepId(isExpanded ? null : stepId)}
            >
              <div className="flex flex-col gap-1 min-w-0 flex-1 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {r.step && (
                    <div className="w-6 h-6 rounded-full bg-neutral-950 flex items-center justify-center text-xs font-bold font-mono text-neutral-300 border border-neutral-800 shrink-0">
                      {index + 1}
                    </div>
                  )}
                  <span className="text-lg font-semibold text-neutral-100 tracking-wide truncate">
                    {r.wheel.name}
                  </span>
                  {hasOffset && (
                    <span className={\`text-[10px] px-2 py-0.5 rounded font-bold \${angleOffset > 0 ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'}\`}>
                      {angleOffset > 0 ? '+' : ''}{angleOffset.toFixed(1)}°
                    </span>
                  )}
                </div>
                {/* Secondary readout: Angle and Base */}
                <div className="flex items-center gap-2 pl-8">
                  {r.step && (
                    <div className="flex items-center shrink-0" title={r.step.base === 'rear' ? 'Edge Leading' : 'Edge Trailing'}>
                      {r.step.base === 'rear' ? <IconEdgeLeading className="w-3.5 h-3.5 text-accent/80" /> : <IconEdgeTrailing className="w-3.5 h-3.5 text-sky-400/80" />}
                    </div>
                  )}
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    {formatDeg(r.betaEffDeg)}° / {r.step?.base === 'front' ? 'FRONT BASE' : 'REAR BASE'}
                  </span>
                </div>
              </div>

              {/* Massive USB/Projection Output */}
              <div className="flex flex-col items-end shrink-0">
                <span className="text-4xl font-extrabold text-white tracking-tighter">
                  {isProjectionMode ? (
                    r.isReachable !== false && r.requiredProjectionA != null ? (
                      <>{r.requiredProjectionA.toFixed(2)}<span className="text-lg text-white/50 font-medium ml-1">mm</span></>
                    ) : (
                      <span className="text-danger text-2xl">OOR</span>
                    )
                  ) : heightMode === 'hn' ? (
                    <>{r.hnBase.toFixed(2)}<span className="text-lg text-white/50 font-medium ml-1">mm</span></>
                  ) : (
                    <>{r.hrWheel.toFixed(2)}<span className="text-lg text-white/50 font-medium ml-1">mm</span></>
                  )}
                </span>
                
                {/* Hardware Overrides / Deltas */}
                <div className="flex flex-col items-end mt-1">
                  {(showAdvancedStepOverrides || r.step?.usbId) && effectiveUsb && (
                    <span className="text-[10px] text-accent uppercase tracking-widest font-bold text-sky-400">
                      {effectiveUsb.name}
                    </span>
                  )}
                  {(showAdvancedStepOverrides || r.step?.machineId) && effectiveMachine && (
                    <span className="text-[10px] text-primary uppercase tracking-widest font-bold">
                      {effectiveMachine.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ===== Expanded Edit Controls ===== */}
            {r.step && onUpdateStep && (
              <div 
                className={\`relative z-10 bg-black/20 overflow-hidden transition-all duration-300 ease-in-out \${isExpanded ? 'max-h-[500px] opacity-100 border-t border-white/5' : 'max-h-0 opacity-0'}\`}
              >
                <div className="p-5 flex flex-col gap-4">
                  
                  {/* Steppers */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 flex flex-col gap-1.5 w-full">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1 flex justify-between">
                        <span>Wheel Diameter</span>
                        <span className="text-neutral-500 hover:text-white cursor-pointer" onClick={() => setSheetConfig({ type: 'wheel', stepId })}>Change</span>
                      </label>
                      <div className="bg-black/30 border border-white/5 rounded-2xl flex items-center justify-between p-1">
                        <button 
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 font-bold transition"
                          onClick={() => onUpdateWheel?.(r.wheel.id, { D: Math.max(100, (r.wheel.D || 250) - 1) })}
                        >-</button>
                        <span className="text-sm font-mono font-bold text-white">{r.wheel.D?.toFixed(1) || 250} mm</span>
                        <button 
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 font-bold transition"
                          onClick={() => onUpdateWheel?.(r.wheel.id, { D: Math.min(300, (r.wheel.D || 250) + 1) })}
                        >+</button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5 w-full">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1 flex justify-between">
                        <span>Micro-bevel (Δ°)</span>
                        <span className="text-neutral-500 hover:text-white cursor-pointer" onClick={() => onUpdateStep(stepId, { angleOffset: 0 })}>Reset</span>
                      </label>
                      <div className="bg-black/30 border border-white/5 rounded-2xl flex items-center justify-between p-1">
                        <button 
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 font-bold transition"
                          onClick={() => onUpdateStep(stepId, { angleOffset: Math.max(-5, (r.step!.angleOffset || 0) - 0.5) })}
                        >-</button>
                        <span className="text-sm font-mono font-bold text-white">{(r.step!.angleOffset || 0) > 0 ? '+' : ''}{(r.step!.angleOffset || 0).toFixed(1)}°</span>
                        <button 
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 font-bold transition"
                          onClick={() => onUpdateStep(stepId, { angleOffset: Math.min(5, (r.step!.angleOffset || 0) + 0.5) })}
                        >+</button>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Step Overrides (Conditionally rendered) */}
                  {showAdvancedStepOverrides && (
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Machine Override</label>
                        <button 
                          className="flex items-center justify-between w-full p-2.5 bg-black/30 hover:bg-white/5 border border-white/5 rounded-2xl text-xs font-semibold text-neutral-200 transition"
                          onClick={() => setSheetConfig({ type: 'machine', stepId })}
                        >
                          <span className="truncate">{effectiveMachine?.name || 'Default Machine'}</span>
                          <span className="text-white/30 ml-2">▼</span>
                        </button>
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Support Bar</label>
                        <button 
                          className="flex items-center justify-between w-full p-2.5 bg-black/30 hover:bg-white/5 border border-white/5 rounded-2xl text-xs font-semibold text-neutral-200 transition"
                          onClick={() => setSheetConfig({ type: 'usb', stepId })}
                        >
                          <span className="truncate">{effectiveUsb?.name || 'Default USB'}</span>
                          <span className="text-white/30 ml-2">▼</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex justify-between items-center mt-2 pt-4 border-t border-white/5">
                    <div className="flex gap-2">
                      <button 
                        className={\`w-10 h-10 rounded-xl flex items-center justify-center transition \${index === 0 ? 'bg-white/5 opacity-30 cursor-not-allowed text-neutral-500' : 'bg-white/10 hover:bg-white/20 text-white'}\`}
                        onClick={(e) => { e.stopPropagation(); onMoveStep?.(index, -1); }}
                        disabled={index === 0}
                      >↑</button>
                      <button 
                        className={\`w-10 h-10 rounded-xl flex items-center justify-center transition \${index === wheelResults.length - 1 ? 'bg-white/5 opacity-30 cursor-not-allowed text-neutral-500' : 'bg-white/10 hover:bg-white/20 text-white'}\`}
                        onClick={(e) => { e.stopPropagation(); onMoveStep?.(index, 1); }}
                        disabled={index === wheelResults.length - 1}
                      >↓</button>
                    </div>
                    <button 
                      className="px-4 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold text-xs transition"
                      onClick={(e) => { e.stopPropagation(); onDeleteStep?.(stepId); }}
                    >
                      Delete Step
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })}
      
`;

fs.writeFileSync('src/components/ProgressionView.tsx', beforeMap + newMapping + afterMap);
