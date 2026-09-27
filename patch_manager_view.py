import re

with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

if "import { ModalSelector } from '../ui/ModalSelector';" not in text:
    text = text.replace("import ModalShell from '../ModalShell';", "import ModalShell from '../ModalShell';\nimport { ModalSelector } from '../ui/ModalSelector';")

old_modal = """        return (
          <ModalShell
            title={`${titleName} Mappings`}
            subtitle="Select a historical mapping to set as active, or map a new one."
            onClose={() => setMappingSelectionBase(null)}
            overlayStyle={overlayStyle}
            dialogStyle={getDialogStyle({ liftByKeyboard: false })}
          >
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto px-2 -mx-2 py-2 -my-2">
              {profiles.map(p => {
                const data = p[base]!;
                const isActive = data.hc === currentHC && data.o === currentO;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`w-full flex items-center justify-between p-3.5 text-left rounded-[var(--ui-radius-core)] transition-all cursor-pointer active:scale-[0.98] ${isActive ? 'neu-button-active border border-[var(--color-accent)]/30' : 'neu-button border border-black/40'}`}
                    style={isActive ? { borderColor: `color-mix(in srgb, ${colorVar} 30%, transparent)`, backgroundColor: `color-mix(in srgb, ${colorVar} 5%, transparent)` } : {}}
                    onClick={() => {
                      if (!isActive) {
                        const newConstants = { ...selectedMachine.constants };
                        newConstants[base] = { hc: data.hc, o: data.o };
                        onUpdateMachine(selectedMachine.id, { constants: newConstants });
                      }
                      setMappingSelectionBase(null);
                    }}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-bold text-[13px] text-white truncate">{p.name}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: `color-mix(in srgb, ${colorVar} 80%, white)` }}>
                        Err: {(data.angleErrorDeg ?? 0).toFixed(3)}°
                      </span>
                    </div>
                    
                    {isActive ? (
                      <div className="flex items-center gap-1.5 px-2 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorVar, boxShadow: `0 0 8px ${colorVar}` }}></div>
                        <span className="font-bold text-[10px] uppercase tracking-wider" style={{ color: colorVar }}>Active</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-white/10 shrink-0 ml-4"></div>
                    )}
                  </button>
                );
              })}
              
              {profiles.length === 0 && (
                <div className="p-4 text-center text-xs text-white/50 mb-2">
                  No {titleName.toLowerCase()} mappings found.
                </div>
              )}

              <button
                type="button"
                className="mt-2 w-full p-3.5 rounded-[var(--ui-radius-core)] neu-button transition active:scale-[0.98] flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider cursor-pointer border"
                style={{ borderColor: `color-mix(in srgb, ${colorVar} 30%, transparent)`, color: colorVar }}
                onClick={() => {
                   setMappingSelectionBase(null);
                   setCalibratingMachineId(selectedMachine.id, null, 'intro', base);
                }}
              >
                + Map New {titleName}
              </button>
            </div>
          </ModalShell>
        );"""

new_modal = """        return (
          <ModalSelector
            isOpen={true}
            onClose={() => setMappingSelectionBase(null)}
            title={`${titleName} Mappings`}
            subtitle="Select a historical mapping to set as active, or map a new one."
          >
            {profiles.map(p => {
              const data = p[base]!;
              const isActive = data.hc === currentHC && data.o === currentO;
              return (
                <ModalSelector.Item
                  key={p.id}
                  selected={isActive}
                  intent={base === 'rear' ? 'accent' : 'focus'}
                  meta={`Err: ${(data.angleErrorDeg ?? 0).toFixed(3)}°`}
                  onClick={() => {
                    if (!isActive) {
                      const newConstants = { ...selectedMachine.constants };
                      newConstants[base] = { hc: data.hc, o: data.o };
                      onUpdateMachine(selectedMachine.id, { constants: newConstants });
                    }
                    setMappingSelectionBase(null);
                  }}
                >
                  {p.name}
                </ModalSelector.Item>
              );
            })}
            
            {profiles.length === 0 && (
              <div className="p-4 text-center text-xs text-white/50 mb-2">
                No {titleName.toLowerCase()} mappings found.
              </div>
            )}

            <button
              type="button"
              className="mt-2 w-full p-3.5 rounded-[var(--ui-radius-core)] neu-button transition active:scale-[0.98] flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider cursor-pointer border"
              style={{ borderColor: `color-mix(in srgb, ${colorVar} 30%, transparent)`, color: colorVar }}
              onClick={() => {
                 setMappingSelectionBase(null);
                 setCalibratingMachineId(selectedMachine.id, null, 'intro', base);
              }}
            >
              + Map New {titleName}
            </button>
          </ModalSelector>
        );"""

if old_modal in text:
    text = text.replace(old_modal, new_modal)
else:
    print("WARNING: Could not find exact modal block to replace.")

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)

