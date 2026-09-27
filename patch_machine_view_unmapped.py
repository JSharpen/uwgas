with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

if "import { isMachineUnmapped }" not in text:
    text = text.replace(
        "import { useMachineState } from '../../state/store';",
        "import { useMachineState } from '../../state/store';\nimport { isMachineUnmapped } from '../../utils/machineStatus';"
    )

    text = text.replace(
        '''                    <span className={`text-base font-medium tracking-wide truncate ${isExpanded ? 'text-amber-400/80' : 'text-white'}`}>{m.name}</span>
                  </div>''',
        '''                    <span className={`text-base font-medium tracking-wide truncate ${isExpanded ? 'text-amber-400/80' : 'text-white'}`}>{m.name}</span>
                    {isMachineUnmapped(m) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] ml-auto mr-1 shrink-0" />
                    )}
                  </div>'''
    )

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)
