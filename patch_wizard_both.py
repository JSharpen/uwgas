with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

text = text.replace("scope === 'both' || ", "")
text = text.replace("const [scope, setScope] = React.useState<Scope>(initialProfile?.scope || 'both');", "const calibratingScope = useUIStore(s => s.calibratingScope);\n  const [scope, setScope] = React.useState<Scope>((calibratingScope as Scope) ?? initialProfile?.scope ?? 'rear');")

# Also the initialProfile.scope is typed as 'both' | 'rear' | 'front' from schema!
# We can just leave it since 'rear' | 'front' is a subset.
# Actually in remeasure: 
# (scope === 'both' && hasRearBounds && hasFrontBounds)
text = text.replace(" || \n                                      (scope === 'both' && hasRearBounds && hasFrontBounds)", "")

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
