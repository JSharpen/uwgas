with open('src/state/uiStore.ts', 'r') as f:
    text = f.read()

old_state = """  calibratingMachineId: string | null;
  calibratingProfileId: string | null;
  calibrationStep: 'intro' | 'measuring' | 'review' | 'results';"""
new_state = """  calibratingMachineId: string | null;
  calibratingProfileId: string | null;
  calibratingScope: 'rear' | 'front' | null;
  calibrationStep: 'intro' | 'measuring' | 'review' | 'results';"""
text = text.replace(old_state, new_state)

old_def = "setCalibratingMachineId: (id: string | null, profileId?: string | null, initialStep?: 'intro' | 'measuring' | 'review' | 'results') => void;"
new_def = "setCalibratingMachineId: (id: string | null, profileId?: string | null, initialStep?: 'intro' | 'measuring' | 'review' | 'results', initialScope?: 'rear' | 'front' | null) => void;"
text = text.replace(old_def, new_def)

old_impl = """  setCalibratingMachineId: (id, profileId = null, initialStep = 'intro') => 
    set({ calibratingMachineId: id, calibratingProfileId: profileId, calibrationStep: initialStep }),"""
new_impl = """  setCalibratingMachineId: (id, profileId = null, initialStep = 'intro', initialScope = null) => 
    set({ calibratingMachineId: id, calibratingProfileId: profileId, calibratingScope: initialScope, calibrationStep: initialStep }),"""
text = text.replace(old_impl, new_impl)

old_init = "calibratingMachineId: null,\n  calibratingProfileId: null,\n  calibrationStep: 'intro',"
new_init = "calibratingMachineId: null,\n  calibratingProfileId: null,\n  calibratingScope: null,\n  calibrationStep: 'intro',"
text = text.replace(old_init, new_init)

with open('src/state/uiStore.ts', 'w') as f:
    f.write(text)
