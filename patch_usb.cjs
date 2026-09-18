const fs = require('fs');
let code = fs.readFileSync('src/components/settings/UsbManagerView.tsx', 'utf8');

// Remove isEditModalOpen, editingUsbId
code = code.replace(/const \[isEditModalOpen, setIsEditModalOpen\] = React\.useState\(false\);\n/g, '');
code = code.replace(/const \[editingUsbId, setEditingUsbId\] = React\.useState<string \| null>\(null\);\n/g, '');

// Remove event listener handleEdit
code = code.replace(/React\.useEffect\(\(\) => {\n    const handleEdit = \(e: Event\) => {\n[\s\S]*?return \(\) => window\.removeEventListener\('openEditUsbModal', handleEdit\);\n  }, \[usbs\]\);\n/m, '');

// Modify closeModals
code = code.replace(/const closeModals = \(\) => {[\s\S]*?setEditingUsbId\(null\);\n  };\n/m, 'const closeModals = () => {\n    setIsAddModalOpen(false);\n  };\n');

// Remove handleSaveEdit
code = code.replace(/const handleSaveEdit = \(\) => {[\s\S]*?closeModals\(\);\n  };\n/m, '');

// Modify Modal conditions
code = code.replace(/\{\(isEditModalOpen \|\| isAddModalOpen\) && \(/, '{isAddModalOpen && (');
code = code.replace(/title=\{isEditModalOpen \? "Edit USB" : "Add USB"\}/, 'title="Add USB"');
code = code.replace(/onClick=\{isEditModalOpen \? handleSaveEdit : handleSaveAdd\}/, 'onClick={handleSaveAdd}');

// Replace Expanded Details Pane
const newPane = `              {/* Expanded Details Pane */}
              <div 
                className={\`grid transition-[grid-template-rows] duration-300 ease-in-out relative z-10 \${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}\`}
              >
                <div className="overflow-hidden">
                  <div className="p-5 pt-0 flex flex-col gap-4 mt-2" onClick={e => e.stopPropagation()}>
                    <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">USB Name</span>
                        <input
                          type="text"
                          className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                          defaultValue={item.name}
                          onBlur={e => onUpdateUsb(item.id, { name: e.target.value.trim() })}
                        />
                      </label>
                    </div>

                    <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Diameter (Ds) in mm</span>
                        <input
                          type="number"
                          step="0.01"
                          className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                          defaultValue={item.Ds}
                          onBlur={e => onUpdateUsb(item.id, { Ds: Number(e.target.value) })}
                        />
                      </label>
                      
                      <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                        <label className="flex flex-col gap-1.5 flex-1">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Thread pitch (mm)</span>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 1.5"
                            className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white placeholder-white/20 focus:border-[var(--color-accent)] outline-none transition w-full"
                            defaultValue={item.threadPitch || ''}
                            onBlur={e => onUpdateUsb(item.id, { threadPitch: e.target.value ? Number(e.target.value) : undefined })}
                          />
                        </label>

                        <label className="flex flex-col gap-1.5 flex-1">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Micro-adjust marks</span>
                          <input
                            type="number"
                            step="1"
                            placeholder="e.g. 6"
                            className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white placeholder-white/20 focus:border-[var(--color-accent)] outline-none transition w-full"
                            defaultValue={item.microAdjustMarks || ''}
                            onBlur={e => onUpdateUsb(item.id, { microAdjustMarks: e.target.value ? Number(e.target.value) : undefined })}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`;

const expandedDetailsRegex = /\{\/\* Expanded Details Pane \*\/\}[\s\S]*?<\/div>\n              <\/div>/;
code = code.replace(expandedDetailsRegex, newPane);

fs.writeFileSync('src/components/settings/UsbManagerView.tsx', code);
