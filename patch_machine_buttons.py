with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

# 1. Make the date error row non-clickable for Rear
old_rear_row = """                            <div 
                               className="text-[9px] text-white/50 cursor-pointer hover:text-white mt-1 border-t border-white/5 pt-1.5 flex justify-between items-center transition"
                               onClick={(e) => { e.stopPropagation(); setMappingSelectionBase({machineId: m.id, base: 'rear'}); }}
                            >
                              <span>{new Date(active.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              <span className="font-mono text-amber-300/80">err: {(active.rear?.angleErrorDeg ?? 0).toFixed(3)}°</span>
                            </div>"""
new_rear_row = """                            <div 
                               className="text-[9px] text-white/50 mt-1 border-t border-white/5 pt-1.5 flex justify-between items-center"
                            >
                              <span>{new Date(active.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              <span className="font-mono text-amber-300/80">err: {(active.rear?.angleErrorDeg ?? 0).toFixed(3)}°</span>
                            </div>"""
text = text.replace(old_rear_row, new_rear_row)

# 2. Update Rear Button to open modal
old_rear_btn = """                      <button
                        type="button"
                        className="w-full py-2 px-1 rounded-lg bg-black/40 border border-[var(--color-accent)]/20 text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 hover:border-[var(--color-accent)]/40 transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setMappingSelectionMachineId(null); setCalibratingMachineId(m.id, null, 'intro', 'rear'); }}
                      >
                        + Map Rear
                      </button>"""
new_rear_btn = """                      <button
                        type="button"
                        className="w-full py-2 px-1 rounded-lg bg-black/40 border border-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] hover:border-[var(--color-accent)]/40 transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setMappingSelectionBase({machineId: m.id, base: 'rear'}); }}
                      >
                        Rear Mappings
                      </button>"""
text = text.replace(old_rear_btn, new_rear_btn)

# 3. Make the date error row non-clickable for Front
old_front_row = """                            <div 
                               className="text-[9px] text-white/50 cursor-pointer hover:text-white mt-1 border-t border-white/5 pt-1.5 flex justify-between items-center transition"
                               onClick={(e) => { e.stopPropagation(); setMappingSelectionBase({machineId: m.id, base: 'front'}); }}
                            >
                              <span>{new Date(active.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              <span className="font-mono text-blue-300/80">err: {(active.front?.angleErrorDeg ?? 0).toFixed(3)}°</span>
                            </div>"""
new_front_row = """                            <div 
                               className="text-[9px] text-white/50 mt-1 border-t border-white/5 pt-1.5 flex justify-between items-center"
                            >
                              <span>{new Date(active.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              <span className="font-mono text-blue-300/80">err: {(active.front?.angleErrorDeg ?? 0).toFixed(3)}°</span>
                            </div>"""
text = text.replace(old_front_row, new_front_row)

# 4. Update Front Button to open modal
old_front_btn = """                      <button
                        type="button"
                        className="w-full py-2 px-1 rounded-lg bg-black/40 border border-[var(--color-focus)]/20 text-[var(--color-focus)] hover:text-[var(--color-focus)]/80 hover:border-[var(--color-focus)]/40 transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setMappingSelectionMachineId(null); setCalibratingMachineId(m.id, null, 'intro', 'front'); }}
                      >
                        + Map Front
                      </button>"""
new_front_btn = """                      <button
                        type="button"
                        className="w-full py-2 px-1 rounded-lg bg-black/40 border border-[var(--color-focus)]/20 text-[var(--color-focus)] hover:bg-[color-mix(in_srgb,var(--color-focus)_10%,transparent)] hover:border-[var(--color-focus)]/40 transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setMappingSelectionBase({machineId: m.id, base: 'front'}); }}
                      >
                        Front Mappings
                      </button>"""
text = text.replace(old_front_btn, new_front_btn)

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)
