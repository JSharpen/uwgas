import re

with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

# 1. Add state variable
state_var = "  const [mappingSelectionBase, setMappingSelectionBase] = React.useState<{machineId: string, base: 'rear'|'front'} | null>(null);"
if state_var not in text:
    text = text.replace(
        "  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);",
        "  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);\n" + state_var
    )

# 2. Update the Rear Base display to include error, and fix the click handler
old_rear = """                        {(() => {
                          const latest = m.calibrationProfiles?.filter(p => p.rear).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                          if (!latest) return null;
                          return (
                            <div 
                               className="text-[9px] text-white/50 cursor-pointer hover:text-white mt-1 border-t border-white/5 pt-1.5 flex justify-between items-center transition"
                               onClick={(e) => { e.stopPropagation(); setCalibratingMachineId(m.id, latest.id, 'results'); }}
                            >
                              <span>{new Date(latest.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              <span className="font-mono">max ε: {latest.rear?.diagnostics.maxAbsResidualMm.toFixed(3)}</span>
                            </div>
                          );
                        })()}"""
new_rear = """                        {(() => {
                          const active = m.calibrationProfiles?.find(p => p.rear?.hc === m.constants.rear.hc && p.rear?.o === m.constants.rear.o)
                                      || m.calibrationProfiles?.filter(p => p.rear).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                          if (!active) return null;
                          return (
                            <div 
                               className="text-[9px] text-white/50 cursor-pointer hover:text-white mt-1 border-t border-white/5 pt-1.5 flex justify-between items-center transition"
                               onClick={(e) => { e.stopPropagation(); setMappingSelectionBase({machineId: m.id, base: 'rear'}); }}
                            >
                              <span>{new Date(active.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              <span className="font-mono text-amber-300/80">err: {(active.rear?.angleErrorDeg ?? 0).toFixed(3)}°</span>
                            </div>
                          );
                        })()}"""
text = text.replace(old_rear, new_rear)

# 3. Update Front Base display
old_front = """                        {(() => {
                          const latest = m.calibrationProfiles?.filter(p => p.front).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                          if (!latest) return null;
                          return (
                            <div 
                               className="text-[9px] text-white/50 cursor-pointer hover:text-white mt-1 border-t border-white/5 pt-1.5 flex justify-between items-center transition"
                               onClick={(e) => { e.stopPropagation(); setCalibratingMachineId(m.id, latest.id, 'results'); }}
                            >
                              <span>{new Date(latest.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              <span className="font-mono">max ε: {latest.front?.diagnostics.maxAbsResidualMm.toFixed(3)}</span>
                            </div>
                          );
                        })()}"""
new_front = """                        {(() => {
                          const active = m.calibrationProfiles?.find(p => p.front?.hc === m.constants.front.hc && p.front?.o === m.constants.front.o)
                                      || m.calibrationProfiles?.filter(p => p.front).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                          if (!active) return null;
                          return (
                            <div 
                               className="text-[9px] text-white/50 cursor-pointer hover:text-white mt-1 border-t border-white/5 pt-1.5 flex justify-between items-center transition"
                               onClick={(e) => { e.stopPropagation(); setMappingSelectionBase({machineId: m.id, base: 'front'}); }}
                            >
                              <span>{new Date(active.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              <span className="font-mono text-blue-300/80">err: {(active.front?.angleErrorDeg ?? 0).toFixed(3)}°</span>
                            </div>
                          );
                        })()}"""
text = text.replace(old_front, new_front)

# 4. Insert Modal
modal_code = """
      {/* Mapping History Modal */}
      {mappingSelectionBase && (() => {
        const selectedMachine = machines.find(x => x.id === mappingSelectionBase.machineId);
        if (!selectedMachine) return null;
        
        const base = mappingSelectionBase.base;
        const colorVar = base === 'rear' ? 'var(--color-accent)' : 'var(--color-focus)';
        const titleName = base === 'rear' ? 'Rear Base' : 'Front Base';
        const profiles = (selectedMachine.calibrationProfiles || []).filter(p => p[base]).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const currentHC = selectedMachine.constants[base].hc;
        const currentO = selectedMachine.constants[base].o;

        return (
          <ModalShell
            title={`${titleName} Mappings`}
            subtitle="Select a historical mapping to set as active, or map a new one."
            onClose={() => setMappingSelectionBase(null)}
            overlayStyle={overlayStyle}
            dialogStyle={getDialogStyle({ liftByKeyboard: false })}
          >
            {profiles.length > 0 ? (
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
            )}
          </ModalShell>
        );
      })()}
"""

if "Mapping History Modal" not in text:
    text = text.replace("{isAddModalOpen && (", modal_code + "\n      {isAddModalOpen && (")

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)

