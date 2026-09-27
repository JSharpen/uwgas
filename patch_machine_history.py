with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

# 1. We will use regex or string replace to drop the Active Mapping block.
start_str = "                      {m.calibrationProfiles && m.calibrationProfiles.length > 0 ? (() => {"
end_str = """                      )}
                    </div>"""

# find indices
import re
start_idx = text.find(start_str)
end_idx = text.find(end_str) + len(end_str)

if start_idx != -1 and end_idx != -1:
    text = text[:start_idx] + "                    </div>" + text[end_idx:]


# 2. Add the dynamic latest mapping to the rear and front boxes.
old_rear_box = """                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest font-bold">Rear Base</span>
                        <span className="font-mono text-[11px] text-white/80 whitespace-nowrap">
                          hc: <b className="text-white font-bold">{m.constants.rear.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.rear.o.toFixed(1)}</b>
                        </span>
                      </div>"""
new_rear_box = """                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest font-bold">Rear Base</span>
                        <span className="font-mono text-[11px] text-white/80 whitespace-nowrap">
                          hc: <b className="text-white font-bold">{m.constants.rear.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.rear.o.toFixed(1)}</b>
                        </span>
                        {(() => {
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
                        })()}
                      </div>"""
text = text.replace(old_rear_box, new_rear_box)


old_front_box = """                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--color-focus)] uppercase tracking-widest font-bold">Front Base</span>
                        <span className="font-mono text-[11px] text-white/80 whitespace-nowrap">
                          hc: <b className="text-white font-bold">{m.constants.front.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.front.o.toFixed(1)}</b>
                        </span>
                      </div>"""
new_front_box = """                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--color-focus)] uppercase tracking-widest font-bold">Front Base</span>
                        <span className="font-mono text-[11px] text-white/80 whitespace-nowrap">
                          hc: <b className="text-white font-bold">{m.constants.front.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.front.o.toFixed(1)}</b>
                        </span>
                        {(() => {
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
                        })()}
                      </div>"""
text = text.replace(old_front_box, new_front_box)


# 3. Remove the entire "Select Geometry Mapping" modal
start_modal = "{/* Add Modal */}"
end_modal = "      {/* Create Machine Modal */}"
start_idx_modal = text.find(start_modal)
end_idx_modal = text.find(end_modal)

if start_idx_modal != -1 and end_idx_modal != -1:
    text = text[:start_idx_modal] + text[end_idx_modal:]


# 4. Remove `mappingSelectionMachineId` state
text = text.replace("const [mappingSelectionMachineId, setMappingSelectionMachineId] = React.useState<string | null>(null);", "")
text = text.replace("setMappingSelectionMachineId(null); ", "")
text = text.replace("onClick={(e) => { e.stopPropagation(); setMappingSelectionMachineId(m.id); }}", "onClick={(e) => { e.stopPropagation(); }}")

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)
