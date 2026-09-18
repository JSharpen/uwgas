const fs = require('fs');
let code = fs.readFileSync('src/components/wheels/WheelManagerView.tsx', 'utf8');

// Remove isEditWheelModalVisible and related edit state hooks
code = code.replace(/const \[editingWheelId, setEditingWheelId\] = React\.useState<string \| null>\(null\);\n/g, '');
code = code.replace(/const \[editingWheelDraft, setEditingWheelDraft\] = React\.useState<WheelFormValue \| null>\(null\);\n/g, '');
code = code.replace(/const \[isEditWheelModalVisible, setIsEditWheelModalVisible\] = React\.useState\(false\);\n/g, '');
code = code.replace(/const \[isEditWheelModalClosing, setIsEditWheelModalClosing\] = React\.useState\(false\);\n/g, '');

// Remove useMemo for editingWheel
code = code.replace(/const editingWheel = React\.useMemo\([\s\S]*?\);\n/m, '');

// Remove Edit window event listeners and handlers
const handleEditRegex = /React\.useEffect\(\(\) => {\n    const handleEdit = \(e: Event\) => {[\s\S]*?return \(\) => window\.removeEventListener\('openEditWheelModal', handleEdit\);\n  }, \[wheels\]\);\n/;
code = code.replace(handleEditRegex, '');

// Remove closeEditWheelModal
const closeEditRegex = /const closeEditWheelModal = \(\) => {[\s\S]*?setEditingWheelId\(null\);\n    }, MODAL_CLOSE_MS\);\n  };\n/;
code = code.replace(closeEditRegex, '');

// Replace Expanded Details Pane with inline `<WheelFormFields>`
const newPane = `                      {/* Expanded Details Pane */}
                      <div 
                        className={\`grid transition-[grid-template-rows] duration-300 ease-in-out relative z-10 \${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}\`}
                      >
                        <div className="overflow-hidden">
                          <div className="p-5 pt-0 flex flex-col gap-4 mt-2" onClick={e => e.stopPropagation()}>
                            <WheelFormFields
                              value={w}
                              onChange={patch => onUpdateWheel(w.id, patch as Partial<import('../../types/core').Wheel>)}
                            />
                          </div>
                        </div>
                      </div>`;

const expandedDetailsRegex = /\{\/\* Expanded Details Pane \*\/\}[\s\S]*?<\/div>\n                      <\/div>/;
code = code.replace(expandedDetailsRegex, newPane);

// Remove the Edit Modal JSX Block
const editModalRegex = /\{\/\* Edit Wheel Modal \*\/\}[\s\S]*?(?=\{\/\* Add Wheel Modal \*\/)/;
code = code.replace(editModalRegex, '');

fs.writeFileSync('src/components/wheels/WheelManagerView.tsx', code);
