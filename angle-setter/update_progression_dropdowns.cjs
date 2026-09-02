const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

// 1. Add import for ActionSheetPicker and remove MiniSelect
code = code.replace("import MiniSelect from './MiniSelect';", "import ActionSheetPicker from './calculator/ActionSheetPicker';");

// 2. Add state
const stateInsertionPoint = "const [expandedStepId, setExpandedStepId] = React.useState<string | null>(null);";
code = code.replace(
  stateInsertionPoint,
  stateInsertionPoint + "\n  const [sheetConfig, setSheetConfig] = React.useState<{ type: 'wheel' | 'machine' | 'usb'; stepId: string } | null>(null);"
);

// 3. Replace Wheel MiniSelect with Button
const oldWheelSelect = `<MiniSelect
                          value={r.step.wheelId}
                          options={[
                            { value: '', label: 'Select wheel...' },
                            ...wheels.map(w => ({ value: w.id, label: w.name, meta: \`D:\${w.D}mm\` }))
                          ]}
                          onChange={(val) => onUpdateStep(stepId, { wheelId: val })}
                        />`;
const newWheelSelect = `<button
                          type="button"
                          className="flex items-center justify-between w-full p-2.5 bg-neutral-800/80 hover:bg-neutral-800 active:bg-neutral-700 border border-neutral-700/50 rounded-lg text-xs font-semibold text-neutral-200 transition-colors"
                          onClick={() => setSheetConfig({ type: 'wheel', stepId })}
                        >
                          <span className="truncate">{wheels.find(w => w.id === r.step!.wheelId)?.name || 'Select wheel...'}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>`;
code = code.replace(oldWheelSelect, newWheelSelect);

// 4. Replace Machine and USB MiniSelects
const oldMachineSelect = `<MiniSelect
                          value={r.step.machineId || ''}
                          options={[
                            { value: '', label: 'Default Machine' },
                            ...machines.map(m => ({ value: m.id, label: m.name }))
                          ]}
                          onChange={(val) => onUpdateStep(stepId, { machineId: val || undefined })}
                        />`;
const newMachineSelect = `<button
                          type="button"
                          className="flex items-center justify-between w-full p-2 bg-neutral-800/80 hover:bg-neutral-800 active:bg-neutral-700 border border-neutral-700/50 rounded-lg text-xs font-semibold text-neutral-200 transition-colors"
                          onClick={() => setSheetConfig({ type: 'machine', stepId })}
                        >
                          <span className="truncate">{machines.find(m => m.id === r.step!.machineId)?.name || 'Default Machine'}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>`;
code = code.replace(oldMachineSelect, newMachineSelect);

const oldUsbSelect = `<MiniSelect
                          value={r.step.usbId || ''}
                          options={[
                            { value: '', label: 'Default USB' },
                            ...usbs.map(u => ({ value: u.id, label: u.name }))
                          ]}
                          onChange={(val) => onUpdateStep(stepId, { usbId: val || undefined })}
                        />`;
const newUsbSelect = `<button
                          type="button"
                          className="flex items-center justify-between w-full p-2 bg-neutral-800/80 hover:bg-neutral-800 active:bg-neutral-700 border border-neutral-700/50 rounded-lg text-xs font-semibold text-neutral-200 transition-colors"
                          onClick={() => setSheetConfig({ type: 'usb', stepId })}
                        >
                          <span className="truncate">{usbs.find(u => u.id === r.step!.usbId)?.name || 'Default USB'}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>`;
code = code.replace(oldUsbSelect, newUsbSelect);

// 5. Append ActionSheetPickers at the end
const endOfComponent = `    </div>
  );
}`;
const actionSheets = `      
      {/* Action Sheets for Inline Editing */}
      {sheetConfig && onUpdateStep && (
        <>
          <ActionSheetPicker
            isOpen={sheetConfig.type === 'wheel'}
            onClose={() => setSheetConfig(null)}
            title="Select Wheel"
            options={[
              ...wheels.map(w => ({ value: w.id, label: w.name, meta: \`D:\${w.D}mm\` }))
            ]}
            value={wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.wheelId || ''}
            onChange={val => {
              onUpdateStep(sheetConfig.stepId, { wheelId: val });
              setSheetConfig(null);
            }}
          />
          <ActionSheetPicker
            isOpen={sheetConfig.type === 'machine'}
            onClose={() => setSheetConfig(null)}
            title="Override Machine"
            options={[
              { value: '', label: 'Default Machine' },
              ...machines.map(m => ({ value: m.id, label: m.name }))
            ]}
            value={wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.machineId || ''}
            onChange={val => {
              onUpdateStep(sheetConfig.stepId, { machineId: val || undefined });
              setSheetConfig(null);
            }}
          />
          <ActionSheetPicker
            isOpen={sheetConfig.type === 'usb'}
            onClose={() => setSheetConfig(null)}
            title="Override Support Bar"
            options={[
              { value: '', label: 'Default USB' },
              ...usbs.map(u => ({ value: u.id, label: u.name }))
            ]}
            value={wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.usbId || ''}
            onChange={val => {
              onUpdateStep(sheetConfig.stepId, { usbId: val || undefined });
              setSheetConfig(null);
            }}
          />
        </>
      )}
    </div>
  );
}`;
code = code.replace(endOfComponent, actionSheets);

fs.writeFileSync('src/components/ProgressionView.tsx', code);
