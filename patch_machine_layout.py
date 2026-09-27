with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

# 1. Update the grid-cols-2
old_grid = """                  <div className="grid grid-cols-2 gap-3">
                    <div className="neu-concave border border-black/40 shadow-inner rounded-[var(--ui-radius-core)] p-3 flex flex-col gap-1">
                      <span className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest font-bold">Rear Base</span>
                      <span className="font-mono text-xs text-white/80">
                        hc: <b className="text-white font-bold">{m.constants.rear.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.rear.o.toFixed(1)}</b>
                      </span>
                    </div>
                    <div className="neu-concave border border-black/40 shadow-inner rounded-[var(--ui-radius-core)] p-3 flex flex-col gap-1">
                      <span className="text-[10px] text-[var(--color-focus)] uppercase tracking-widest font-bold">Front Base</span>
                      <span className="font-mono text-xs text-white/80">
                        hc: <b className="text-white font-bold">{m.constants.front.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.front.o.toFixed(1)}</b>
                      </span>
                    </div>
                  </div>"""

new_grid = """                  <div className="grid grid-cols-2 gap-3">
                    {/* Rear */}
                    <div className="neu-concave border border-black/40 shadow-inner rounded-[var(--ui-radius-core)] p-3 flex flex-col gap-3 justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest font-bold">Rear Base</span>
                        <span className="font-mono text-[11px] text-white/80 whitespace-nowrap">
                          hc: <b className="text-white font-bold">{m.constants.rear.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.rear.o.toFixed(1)}</b>
                        </span>
                      </div>
                      <button
                        type="button"
                        className="w-full py-2 px-1 rounded-lg bg-black/40 border border-[var(--color-accent)]/20 text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 hover:border-[var(--color-accent)]/40 transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setMappingSelectionMachineId(null); setCalibratingMachineId(m.id, null, 'intro', 'rear'); }}
                      >
                        + Map Rear
                      </button>
                    </div>

                    {/* Front */}
                    <div className="neu-concave border border-black/40 shadow-inner rounded-[var(--ui-radius-core)] p-3 flex flex-col gap-3 justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--color-focus)] uppercase tracking-widest font-bold">Front Base</span>
                        <span className="font-mono text-[11px] text-white/80 whitespace-nowrap">
                          hc: <b className="text-white font-bold">{m.constants.front.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.front.o.toFixed(1)}</b>
                        </span>
                      </div>
                      <button
                        type="button"
                        className="w-full py-2 px-1 rounded-lg bg-black/40 border border-[var(--color-focus)]/20 text-[var(--color-focus)] hover:text-[var(--color-focus)]/80 hover:border-[var(--color-focus)]/40 transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setMappingSelectionMachineId(null); setCalibratingMachineId(m.id, null, 'intro', 'front'); }}
                      >
                        + Map Front
                      </button>
                    </div>
                  </div>"""
text = text.replace(old_grid, new_grid)

# 2. Remove bottom buttons
old_bottom_buttons = """                <div className="flex flex-col gap-2 mt-2">
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
text = text.replace(old_bottom_buttons, "")

# 3. Remove "No Rear/Front Mapping" big buttons block
old_no_mappings = """                        <div className="flex flex-col gap-2 mt-2" onClick={e => e.stopPropagation()}>
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

new_no_mappings = """                        <div className="mt-2 w-full flex flex-col items-center justify-center p-4 neu-button border border-[var(--color-accent)]/30 border-dashed rounded-[var(--ui-radius-core)]">
                          <span className="font-bold text-[var(--color-accent)] text-sm mb-1">No saved profiles</span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-accent)]/70">Map a base to begin</span>
                        </div>"""
text = text.replace(old_no_mappings, new_no_mappings)

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)
