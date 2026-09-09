const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

// 1. Add showAdvancedStepOverrides to Props
code = code.replace(
  "onAddStep?: () => void;",
  "onAddStep?: () => void;\n  showAdvancedStepOverrides?: boolean;"
);
code = code.replace(
  "  onAddStep,\n}: ProgressionViewProps) {",
  "  onAddStep,\n  showAdvancedStepOverrides,\n}: ProgressionViewProps) {"
);

// 2. Add Machine & USB to Footer
const oldFooter = `                <div className="flex items-center justify-between w-full pt-1.5 border-t border-neutral-800/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] uppercase font-bold text-neutral-400 tracking-wider">
                      {r.step?.base === 'front' ? 'FRONT BASE' : 'REAR BASE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.step?.usbId && r.step.usbId !== globalUsbId && usbs.find(u => u.id === r.step!.usbId) && (
                      <span className="text-[0.65rem] uppercase font-bold text-accent tracking-wider font-mono truncate max-w-[120px]">
                        {usbs.find(u => u.id === r.step!.usbId)!.name}
                      </span>
                    )}
                    <span className="text-[0.65rem] uppercase font-bold text-neutral-400 tracking-wider font-mono">
                      D={r.wheel.D?.toFixed(2)}
                    </span>
                  </div>
                </div>`;

const newFooter = `                <div className="flex items-center justify-between w-full pt-1.5 border-t border-neutral-800/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] uppercase font-bold text-neutral-400 tracking-wider">
                      {r.step?.base === 'front' ? 'FRONT BASE' : 'REAR BASE'}
                    </span>
                    {(showAdvancedStepOverrides || r.step?.machineId) && effectiveMachine && (
                      <>
                        <span className="text-[0.65rem] text-neutral-600">&bull;</span>
                        <span className="text-[0.65rem] uppercase font-bold text-primary tracking-wider">
                          {effectiveMachine.name}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(showAdvancedStepOverrides || r.step?.usbId) && (
                      <span className="text-[0.65rem] uppercase font-bold text-accent tracking-wider font-mono truncate max-w-[120px]">
                        {usbs.find(u => u.id === (r.step?.usbId || globalUsbId))?.name || 'Unknown USB'}
                      </span>
                    )}
                    <span className="text-[0.65rem] uppercase font-bold text-neutral-400 tracking-wider font-mono">
                      D={r.wheel.D?.toFixed(2)}
                    </span>
                  </div>
                </div>`;

code = code.replace(oldFooter, newFooter);

// 3. Add overrides to Accordion
const accordionEnd = `{/* Action Bar */}`;
const accordionOverrides = `
                  {showAdvancedStepOverrides && (
                    <div className="flex gap-3">
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Machine</label>
                        <MiniSelect
                          value={r.step.machineId || ''}
                          options={[
                            { value: '', label: 'Default Machine' },
                            ...machines.map(m => ({ value: m.id, label: m.name }))
                          ]}
                          onChange={(val) => onUpdateStep(stepId, { machineId: val || undefined })}
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Support Bar</label>
                        <MiniSelect
                          value={r.step.usbId || ''}
                          options={[
                            { value: '', label: 'Default USB' },
                            ...usbs.map(u => ({ value: u.id, label: u.name }))
                          ]}
                          onChange={(val) => onUpdateStep(stepId, { usbId: val || undefined })}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Action Bar */}`;

code = code.replace(accordionEnd, accordionOverrides);

fs.writeFileSync('src/components/ProgressionView.tsx', code);
