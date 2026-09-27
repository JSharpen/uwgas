with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

old_button = '''                    {m.id !== defaultMachineId && (
                      <div className="flex justify-end">
                        <Button
                          variant="neu" intent="default" size="md"
                          onClick={(e) => { e.stopPropagation(); onSetDefaultMachine(m.id); }}
                        >
                          Set as Default
                        </Button>
                      </div>
                    )}'''

new_button = '''                    {m.id !== defaultMachineId && (
                      <Button
                        variant="neu" intent="default" size="md" fluid
                        onClick={(e) => { e.stopPropagation(); onSetDefaultMachine(m.id); }}
                      >
                        Set as Default
                      </Button>
                    )}'''

text = text.replace(old_button, new_button)

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)
