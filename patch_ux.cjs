const fs = require('fs');
let code = fs.readFileSync('src/components/settings/MachineManagerView.tsx', 'utf8');

// 1. Remove the "New Mapping" button
const titleRegex = /<div className="flex justify-between items-center">\n                        <span className="text-\[10px\] text-white\/40 uppercase tracking-widest font-bold">Geometry Mapping<\/span>\n                        <button[\s\S]*?New Mapping\n                        <\/button>\n                      <\/div>/;
const newTitle = '<span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Geometry Mapping</span>';
code = code.replace(titleRegex, newTitle);

// 2. Modify empty state
const emptyStateRegex = /\}\)\(\) : \(\n                        <p className="text-xs text-white\/40 mt-1 pt-2 border-t border-white\/5">\n                          No geometry mappings saved\. Run the mapper to measure your machine\.\n                        <\/p>\n                      \)\}/;
const newEmptyState = `})() : (
                        <button
                          type="button"
                          className="mt-2 w-full flex flex-col items-center justify-center p-4 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/30 border-dashed rounded-2xl hover:bg-[var(--color-accent)]/10 active:bg-[var(--color-accent)]/20 transition-colors"
                          onClick={(e) => { e.stopPropagation(); setCalibratingMachineId(m.id); }}
                        >
                          <span className="font-bold text-[var(--color-accent)] text-sm mb-1">No mappings found</span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-accent)]/70">+ Tap to measure machine</span>
                        </button>
                      )}`;
code = code.replace(emptyStateRegex, newEmptyState);

// 3. Add 'Create New Mapping' button in modal
const modalBottomRegex = /                \}\)\}\n              <\/div>\n            \) : \(/;
const newModalBottom = `                })}
                <button
                  type="button"
                  className="mt-2 w-full p-4 rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 active:bg-[var(--color-accent)]/30 transition-colors flex items-center justify-center gap-2 font-bold text-sm cursor-pointer"
                  onClick={() => {
                     setMappingSelectionMachineId(null);
                     setCalibratingMachineId(selectedMachine.id);
                  }}
                >
                  + Create New Mapping
                </button>
              </div>
            ) : (`;
code = code.replace(modalBottomRegex, newModalBottom);

fs.writeFileSync('src/components/settings/MachineManagerView.tsx', code);
