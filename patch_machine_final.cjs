const fs = require('fs');
let code = fs.readFileSync('src/components/settings/MachineManagerView.tsx', 'utf8');

const newPane = `              {/* Expanded Details Pane */}
              <div 
                className={\`grid transition-[grid-template-rows] duration-300 ease-in-out relative z-10 \${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}\`}
              >
                <div className="overflow-hidden">
                  <div className="p-5 pt-0 flex flex-col gap-4 mt-2" onClick={e => e.stopPropagation()}>
                    
                    <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Machine Name</span>
                        <input
                          type="text"
                          className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                          defaultValue={m.name}
                          onBlur={e => onUpdateMachine(m.id, { name: e.target.value.trim() })}
                        />
                      </label>
                      
                      <label className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Axle Diameter (mm)</span>
                        <input
                          type="number"
                          step="0.1"
                          className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                          defaultValue={m.axleDiameter ?? 12}
                          onBlur={e => onUpdateMachine(m.id, { axleDiameter: Number(e.target.value) })}
                        />
                      </label>
                    </div>

                    <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Geometry Mapping</span>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-[var(--color-accent)] hover:brightness-110 text-neutral-950 font-bold text-xs uppercase tracking-wide transition cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCalibratingMachineId(m.id);
                          }}
                        >
                          New Mapping
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                          <span className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest font-bold">Rear Base</span>
                          <span className="font-mono text-xs text-white/80">
                            hc: <b className="text-white font-bold">{m.constants.rear.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.rear.o.toFixed(1)}</b>
                          </span>
                        </div>
                        <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                          <span className="text-[10px] text-[var(--color-focus)] uppercase tracking-widest font-bold">Front Base</span>
                          <span className="font-mono text-xs text-white/80">
                            hc: <b className="text-white font-bold">{m.constants.front.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.front.o.toFixed(1)}</b>
                          </span>
                        </div>
                      </div>
                      
                      {m.calibrationProfiles && m.calibrationProfiles.length > 0 ? (
                        <div className="mt-1 flex flex-col gap-2 border-t border-white/5 pt-3">
                          {m.calibrationProfiles.map(p => {
                            const isActive = m.activeCalibrationId === p.id;
                            const isBest = getBestProfile(m.calibrationProfiles) === p.id;
                            return (
                              <div
                                key={p.id}
                                className={\`flex items-center justify-between p-3.5 text-xs rounded-2xl border transition-all \${
                                  isActive
                                    ? 'border-[var(--color-accent)]/50 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]'
                                    : 'border-white/5 bg-black/40'
                                }\`}
                              >
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white truncate">{p.name}</span>
                                    {isBest && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-bold shrink-0">
                                        Best
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-white/40 font-mono">
                                    {new Date(p.createdAt).toLocaleDateString()} &middot; {p.scope === 'both' ? 'Dual Base' : p.scope === 'rear' ? 'Rear Only' : 'Front Only'}
                                  </span>
                                </div>
                                
                                {isActive ? (
                                  <span className="text-[var(--color-accent)] font-bold text-xs uppercase tracking-wider px-2">Active</span>
                                ) : (
                                  <button
                                    type="button"
                                    className="text-[var(--color-accent)] font-bold text-xs uppercase tracking-wider hover:underline px-2 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newConstants = { ...m.constants };
                                      if (p.rear) newConstants.rear = { hc: p.rear.hc, o: p.rear.o };
                                      if (p.front) newConstants.front = { hc: p.front.hc, o: p.front.o };
                                      onUpdateMachine(m.id, {
                                        activeCalibrationId: p.id,
                                        constants: newConstants
                                      });
                                    }}
                                  >
                                    Activate
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-white/40 mt-1">
                          No geometry mappings saved. Run the mapper to measure your machine.
                        </p>
                      )}
                    </div>

                    {m.id !== defaultMachineId && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-white/80 hover:text-white uppercase tracking-wider transition cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); onSetDefaultMachine(m.id); }}
                        >
                          Set as Default
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>`;

const regex = /\{\/\* Expanded Details Pane \*\/\}[\s\S]*?(?=            <\/div>\n          \)\);\n        }\)}\n      <\/div>)/;
code = code.replace(regex, newPane + '\n');

fs.writeFileSync('src/components/settings/MachineManagerView.tsx', code);
