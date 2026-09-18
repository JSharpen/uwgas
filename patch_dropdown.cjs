const fs = require('fs');
let code = fs.readFileSync('src/components/settings/MachineManagerView.tsx', 'utf8');

// Inject new state
const stateInjection = `const [calibratingMachineId, setCalibratingMachineId] = React.useState<string | null>(null);
  const [mappingSelectionMachineId, setMappingSelectionMachineId] = React.useState<string | null>(null);`;
code = code.replace(/const \[calibratingMachineId, setCalibratingMachineId\] = React\.useState<string \| null>\(null\);/, stateInjection);

// Replace mapping block
const inlineMappingBlockRegex = /\{m\.calibrationProfiles && m\.calibrationProfiles\.length > 0 \? \([\s\S]*?\) : \(\n                        <p className="text-xs text-white\/40 mt-1">\n                          No geometry mappings saved\. Run the mapper to measure your machine\.\n                        <\/p>\n                      \)\}/;

const newTrigger = `{m.calibrationProfiles && m.calibrationProfiles.length > 0 ? (() => {
                        const activeProfile = m.calibrationProfiles.find(p => p.id === m.activeCalibrationId);
                        const isBest = activeProfile && getBestProfile(m.calibrationProfiles) === activeProfile.id;
                        return (
                          <div className="mt-2 flex flex-col gap-1">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Active Mapping</span>
                            <button
                              type="button"
                              className="w-full flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
                              onClick={(e) => { e.stopPropagation(); setMappingSelectionMachineId(m.id); }}
                            >
                              <div className="flex flex-col items-start gap-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm truncate">
                                    {activeProfile ? activeProfile.name : "None selected"}
                                  </span>
                                  {isBest && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-bold shrink-0">
                                      Best
                                    </span>
                                  )}
                                </div>
                                {activeProfile && (
                                  <span className="text-[10px] text-white/40 font-mono">
                                    {activeProfile.scope === 'both' ? 'Dual Base' : activeProfile.scope === 'rear' ? 'Rear Only' : 'Front Only'}
                                  </span>
                                )}
                              </div>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 shrink-0 ml-2">
                                <path d="m6 9 6 6 6-6"/>
                              </svg>
                            </button>
                          </div>
                        );
                      })() : (
                        <p className="text-xs text-white/40 mt-1 pt-2 border-t border-white/5">
                          No geometry mappings saved. Run the mapper to measure your machine.
                        </p>
                      )}`;

code = code.replace(inlineMappingBlockRegex, newTrigger);

// Add the Mapping Selection Modal to the bottom
const modalRegex = /\{isAddModalOpen && \(/;

const newModal = `{mappingSelectionMachineId && (() => {
        const selectedMachine = machines.find(x => x.id === mappingSelectionMachineId);
        if (!selectedMachine) return null;
        
        return (
          <ModalShell
            title="Select Geometry Mapping"
            subtitle="Choose a saved geometry mapping for the pure math engine."
            onClose={() => setMappingSelectionMachineId(null)}
            overlayStyle={overlayStyle}
            dialogStyle={getDialogStyle({ liftByKeyboard: false })}
          >
            {selectedMachine.calibrationProfiles && selectedMachine.calibrationProfiles.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
                {selectedMachine.calibrationProfiles.map(p => {
                  const isActive = selectedMachine.activeCalibrationId === p.id;
                  const isBest = getBestProfile(selectedMachine.calibrationProfiles) === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={\`flex items-center justify-between p-4 text-left rounded-2xl border transition-all cursor-pointer \${
                        isActive
                          ? 'border-[var(--color-accent)]/50 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]'
                          : 'border-white/5 bg-black/40 hover:bg-white/5 active:bg-white/10'
                      }\`}
                      onClick={() => {
                        const newConstants = { ...selectedMachine.constants };
                        if (p.rear) newConstants.rear = { hc: p.rear.hc, o: p.rear.o };
                        if (p.front) newConstants.front = { hc: p.front.hc, o: p.front.o };
                        onUpdateMachine(selectedMachine.id, {
                          activeCalibrationId: p.id,
                          constants: newConstants
                        });
                        setMappingSelectionMachineId(null);
                      }}
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate">{p.name}</span>
                          {isBest && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-bold shrink-0">
                              Best
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-white/40 font-mono">
                          {new Date(p.createdAt).toLocaleDateString()} &middot; {p.scope === 'both' ? 'Dual Base' : p.scope === 'rear' ? 'Rear Only' : 'Front Only'}
                        </span>
                      </div>
                      
                      {isActive ? (
                        <span className="text-[var(--color-accent)] font-bold text-xs uppercase tracking-wider px-2 shrink-0">Active</span>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0 ml-4"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-white/50">
                No profiles available.
              </div>
            )}
          </ModalShell>
        );
      })()}

      {isAddModalOpen && (`;

code = code.replace(modalRegex, newModal);

fs.writeFileSync('src/components/settings/MachineManagerView.tsx', code);
