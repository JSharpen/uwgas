import re

with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

if "import { Button, Surface }" not in text:
    text = text.replace("import { ModalSelector } from '../ui/ModalSelector';", "import { ModalSelector } from '../ui/ModalSelector';\nimport { Button, Surface } from '../ui';")

# 1. Surface concave
text = text.replace(
    '<div className="neu-concave border border-black/40 shadow-inner rounded-[var(--ui-radius-core)] p-3 flex flex-col gap-3 justify-between">',
    '<Surface variant="concave" padding="md" className="flex flex-col gap-3 justify-between">'
)

# Replace the closing div for those surfaces (this is immediately after the buttons)
text = text.replace(
    '                      </button>\n                    </div>',
    '                      </Button>\n                    </Surface>'
)

# 2. Rear Mappings Button
text = text.replace(
    '''                      <button
                        type="button"
                        className="w-full py-2 px-1 rounded-lg neu-convex border border-black/40 text-[var(--color-accent)] hover:text-white transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer shadow-lg"
                        onClick={(e) => { e.stopPropagation(); setMappingSelectionBase({machineId: m.id, base: 'rear'}); }}
                      >
                        Rear Mappings''',
    '''                      <Button
                        variant="neu-convex" intent="accent" size="sm" fluid
                        onClick={(e) => { e.stopPropagation(); setMappingSelectionBase({machineId: m.id, base: 'rear'}); }}
                      >
                        Rear Mappings'''
)

# 3. Front Mappings Button
text = text.replace(
    '''                      <button
                        type="button"
                        className="w-full py-2 px-1 rounded-lg neu-convex border border-black/40 text-[var(--color-focus)] hover:text-white transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer shadow-lg"
                        onClick={(e) => { e.stopPropagation(); setMappingSelectionBase({machineId: m.id, base: 'front'}); }}
                      >
                        Front Mappings''',
    '''                      <Button
                        variant="neu-convex" intent="focus" size="sm" fluid
                        onClick={(e) => { e.stopPropagation(); setMappingSelectionBase({machineId: m.id, base: 'front'}); }}
                      >
                        Front Mappings'''
)

# 4. Set as Default Button
text = text.replace(
    '''                        <button
                          type="button"
                          className="px-4 py-2 rounded-[var(--ui-radius-core)] neu-button text-xs font-bold text-white/80 uppercase tracking-wider transition active:scale-95 cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); onSetDefaultMachine(m.id); }}
                        >
                          Set as Default
                        </button>''',
    '''                        <Button
                          variant="neu" intent="default" size="sm"
                          onClick={(e) => { e.stopPropagation(); onSetDefaultMachine(m.id); }}
                        >
                          Set as Default
                        </Button>'''
)

# 5. Cancel Button
text = text.replace(
    '''              <button
                type="button"
                className="px-4 h-11 rounded-[var(--ui-radius-core)] neu-button text-white/70 font-semibold text-xs uppercase tracking-wide transition active:scale-95 cursor-pointer flex items-center justify-center"
                onClick={closeAdd}
              >
                Cancel
              </button>''',
    '''              <Button
                variant="neu" intent="default" size="md"
                onClick={closeAdd}
              >
                Cancel
              </Button>'''
)

# 6. Save Button
text = text.replace(
    '''              <button 
                type="button" 
                className="px-6 h-11 rounded-[var(--ui-radius-core)] bg-[var(--color-accent)] text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-[var(--color-accent)]" 
                disabled={!draftName.trim()}
                onClick={() => {
                  onAddMachine({
                    id: generateId(),
                    name: draftName.trim(),
                    axleDiameter: draftAxleDiameter,
                    constants: draftConstants,
                  });
                  closeAdd();
                }}
              >
                Save
              </button>''',
    '''              <Button 
                variant="solid" intent="accent" size="md"
                disabled={!draftName.trim()}
                onClick={() => {
                  onAddMachine({
                    id: generateId(),
                    name: draftName.trim(),
                    axleDiameter: draftAxleDiameter,
                    constants: draftConstants,
                  });
                  closeAdd();
                }}
              >
                Save
              </Button>'''
)

# 7. Map New Base Button in Modal
text = text.replace(
    '''            <button
              type="button"
              className="mt-2 w-full p-3.5 rounded-[var(--ui-radius-core)] neu-button transition active:scale-[0.98] flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider cursor-pointer border"
              style={{ borderColor: `color-mix(in srgb, ${colorVar} 30%, transparent)`, color: colorVar }}
              onClick={() => {
                 setMappingSelectionBase(null);
                 setCalibratingMachineId(selectedMachine.id, null, 'intro', base);
              }}
            >
              + Map New {titleName}
            </button>''',
    '''            <Button
              variant="outline"
              intent={base === 'rear' ? 'accent' : 'focus'}
              fluid
              size="md"
              className="mt-2"
              onClick={() => {
                 setMappingSelectionBase(null);
                 setCalibratingMachineId(selectedMachine.id, null, 'intro', base);
              }}
            >
              + Map New {titleName}
            </Button>'''
)


with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)

