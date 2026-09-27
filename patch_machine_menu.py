with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

old_create_button = """                <button
                  type="button"
                  className="mt-2 w-full p-4 rounded-[var(--ui-radius-core)] neu-button border border-[var(--color-accent)]/30 text-[var(--color-accent)] transition active:scale-[0.98] flex items-center justify-center gap-2 font-bold text-sm cursor-pointer"
                  onClick={() => {
                     setMappingSelectionMachineId(null);
                     setCalibratingMachineId(selectedMachine.id);
                  }}
                >
                  + Create New Mapping
                </button>"""

new_create_buttons = """                <div className="flex flex-col gap-2 mt-2">
                  <button
                    type="button"
                    className="w-full p-3.5 rounded-[var(--ui-radius-core)] neu-button border border-blue-500/30 text-blue-400 hover:text-blue-300 hover:border-blue-400/50 transition active:scale-[0.98] flex items-center justify-center gap-2 font-bold text-sm cursor-pointer"
                    onClick={() => {
                       setMappingSelectionMachineId(null);
                       setCalibratingMachineId(selectedMachine.id, null, 'intro', 'rear');
                    }}
                  >
                    + Map Rear Base (Edge Leading)
                  </button>
                  <button
                    type="button"
                    className="w-full p-3.5 rounded-[var(--ui-radius-core)] neu-button border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:border-emerald-400/50 transition active:scale-[0.98] flex items-center justify-center gap-2 font-bold text-sm cursor-pointer"
                    onClick={() => {
                       setMappingSelectionMachineId(null);
                       setCalibratingMachineId(selectedMachine.id, null, 'intro', 'front');
                    }}
                  >
                    + Map Front Base (Edge Trailing)
                  </button>
                </div>"""

text = text.replace(old_create_button, new_create_buttons)

old_no_mappings = """                        <button
                          type="button"
                          className="mt-2 w-full flex flex-col items-center justify-center p-4 neu-button border border-[var(--color-accent)]/30 border-dashed rounded-[var(--ui-radius-core)] transition active:scale-[0.98] cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); setCalibratingMachineId(m.id); }}
                        >
                          <span className="font-bold text-[var(--color-accent)] text-sm mb-1">No mappings found</span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-accent)]/70">+ Tap to measure machine</span>
                        </button>"""

new_no_mappings = """                        <div className="flex flex-col gap-2 mt-2" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            className="w-full flex flex-col items-center justify-center p-3 neu-button border border-blue-500/30 border-dashed rounded-[var(--ui-radius-core)] transition active:scale-[0.98] cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); setCalibratingMachineId(m.id, null, 'intro', 'rear'); }}
                          >
                            <span className="font-bold text-blue-400 text-xs mb-0.5">No Rear Mapping</span>
                            <span className="text-[9px] uppercase tracking-wider font-bold text-blue-400/70">+ Map Rear Base</span>
                          </button>
                          <button
                            type="button"
                            className="w-full flex flex-col items-center justify-center p-3 neu-button border border-emerald-500/30 border-dashed rounded-[var(--ui-radius-core)] transition active:scale-[0.98] cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); setCalibratingMachineId(m.id, null, 'intro', 'front'); }}
                          >
                            <span className="font-bold text-emerald-400 text-xs mb-0.5">No Front Mapping</span>
                            <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-400/70">+ Map Front Base</span>
                          </button>
                        </div>"""
text = text.replace(old_no_mappings, new_no_mappings)


with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)
