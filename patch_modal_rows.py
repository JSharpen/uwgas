with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

old_modal_content = """            {profiles.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
                {profiles.map(p => {
                  const data = p[base]!;
                  const isActive = data.hc === currentHC && data.o === currentO;
                  return (
                    <div key={p.id} className="flex gap-2 items-stretch">
                      <button
                        type="button"
                        className={`flex-1 flex items-center justify-between p-4 text-left rounded-[var(--ui-radius-core)] transition-all cursor-pointer neu-button active:scale-[0.98] ${isActive ? `border border-[${colorVar}]/50 bg-[color-mix(in_srgb,${colorVar}_10%,transparent)]` : 'border border-transparent'}`}
                        style={isActive ? { borderColor: `color-mix(in srgb, ${colorVar} 50%, transparent)`, backgroundColor: `color-mix(in srgb, ${colorVar} 10%, transparent)` } : {}}
                        onClick={() => {
                          const newConstants = { ...selectedMachine.constants };
                          newConstants[base] = { hc: data.hc, o: data.o };
                          onUpdateMachine(selectedMachine.id, {
                            constants: newConstants
                          });
                          setMappingSelectionBase(null);
                        }}
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white truncate">{p.name}</span>
                          </div>
                          <span className="text-xs text-white/60 font-mono">
                            {new Date(p.createdAt).toLocaleDateString()} &middot; err: {(data.angleErrorDeg ?? 0).toFixed(3)}°
                          </span>
                        </div>
                        
                        {isActive ? (
                          <span className="font-bold text-xs uppercase tracking-wider px-2 shrink-0" style={{ color: colorVar }}>Active</span>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0 ml-4"></div>
                        )}
                      </button>
                      <button
                        type="button"
                        className="p-4 h-full shrink-0 neu-button rounded-[var(--ui-radius-core)] transition active:scale-[0.98] cursor-pointer flex items-center justify-center border border-white/5 text-white/50 hover:text-white"
                        onClick={() => {
                          setMappingSelectionBase(null);
                          setCalibratingMachineId(selectedMachine.id, p.id, 'results', base);
                        }}
                        title="Edit Measurements"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="mt-2 w-full p-4 rounded-[var(--ui-radius-core)] neu-button transition active:scale-[0.98] flex items-center justify-center gap-2 font-bold text-sm cursor-pointer border"
                  style={{ borderColor: `color-mix(in srgb, ${colorVar} 30%, transparent)`, color: colorVar }}
                  onClick={() => {
                     setMappingSelectionBase(null);
                     setCalibratingMachineId(selectedMachine.id, null, 'intro', base);
                  }}
                >
                  + Map New {titleName}
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-white/50">
                No profiles available.
              </div>
            )}"""

new_modal_content = """            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1 -mr-1 pb-1">
              {profiles.map(p => {
                const data = p[base]!;
                const isActive = data.hc === currentHC && data.o === currentO;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`w-full flex items-center justify-between p-3.5 text-left rounded-[var(--ui-radius-core)] transition-all cursor-pointer active:scale-[0.98] ${isActive ? 'neu-button-active border border-[var(--color-accent)]/30' : 'neu-button border border-black/40'}`}
                    style={isActive ? { borderColor: `color-mix(in srgb, ${colorVar} 30%, transparent)`, backgroundColor: `color-mix(in srgb, ${colorVar} 5%, transparent)` } : {}}
                    onClick={() => {
                      if (!isActive) {
                        const newConstants = { ...selectedMachine.constants };
                        newConstants[base] = { hc: data.hc, o: data.o };
                        onUpdateMachine(selectedMachine.id, { constants: newConstants });
                      }
                      setMappingSelectionBase(null);
                    }}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-bold text-[13px] text-white truncate">{p.name}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: `color-mix(in srgb, ${colorVar} 80%, white)` }}>
                        Err: {(data.angleErrorDeg ?? 0).toFixed(3)}°
                      </span>
                    </div>
                    
                    {isActive ? (
                      <div className="flex items-center gap-1.5 px-2 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorVar, boxShadow: `0 0 8px ${colorVar}` }}></div>
                        <span className="font-bold text-[10px] uppercase tracking-wider" style={{ color: colorVar }}>Active</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-white/10 shrink-0 ml-4"></div>
                    )}
                  </button>
                );
              })}
              
              {profiles.length === 0 && (
                <div className="p-4 text-center text-xs text-white/50 mb-2">
                  No {titleName.toLowerCase()} mappings found.
                </div>
              )}

              <button
                type="button"
                className="mt-2 w-full p-3.5 rounded-[var(--ui-radius-core)] neu-button transition active:scale-[0.98] flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider cursor-pointer border"
                style={{ borderColor: `color-mix(in srgb, ${colorVar} 30%, transparent)`, color: colorVar }}
                onClick={() => {
                   setMappingSelectionBase(null);
                   setCalibratingMachineId(selectedMachine.id, null, 'intro', base);
                }}
              >
                + Map New {titleName}
              </button>
            </div>"""

import sys
if old_modal_content in text:
    text = text.replace(old_modal_content, new_modal_content)
else:
    print("WARNING: Could not find exact modal block to replace.")

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)

