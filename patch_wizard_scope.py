with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

# 1. Update type
old_type = "type Scope = 'both' | 'rear' | 'front';"
new_type = "type Scope = 'rear' | 'front';"
text = text.replace(old_type, new_type)

# 2. Update initial scope reading
old_scope_state = "const [scope, setScope] = React.useState<Scope>(initialProfile?.scope ?? 'both');"
new_scope_state = """const calibratingScope = useUIStore(s => s.calibratingScope);
  const [scope, setScope] = React.useState<Scope>((calibratingScope as Scope) ?? initialProfile?.scope ?? 'rear');"""
text = text.replace(old_scope_state, new_scope_state)

# 3. Remove Scope Selector from intro
old_selector = """          {/* Scope Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
              Calibration Scope
            </label>
            <MiniSelect
              value={scope}
              options={[
                { value: 'both', label: 'Both Bases (Recommended: Rear + Front)' },
                { value: 'rear', label: 'Rear Base Only (Edge Leading)' },
                { value: 'front', label: 'Front Base Only (Edge Trailing)' },
              ]}
              onChange={val => setScope(val as Scope)}
              widthClass="w-full"
            />
          </div>"""
text = text.replace(old_selector, "")

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
