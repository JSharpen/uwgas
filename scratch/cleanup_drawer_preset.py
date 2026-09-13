import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

old_preset_trigger = """                {/* PRESET TRIGGER */}
                <div className="flex flex-col gap-2.5 mt-2">
                  <button 
                    type="button" 
                    className="flex items-center justify-between p-4 neu-button rounded-2xl transition-all w-full text-left"
                    onClick={() => setActiveSheet('preset')}
                  >
                    <div className="flex flex-col items-start min-w-0 pr-2">
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-0.5">Active Preset</span>
                      <span className={`text-sm font-bold truncate max-w-[220px] ${activePreset ? 'text-white' : 'text-white/40'}`}>
                        {activePreset ? activePreset.name : 'None selected'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-amber-400 px-3.5 py-1.5 neu-concave border border-black/40 rounded-full shrink-0">
                      Change
                    </div>
                  </button>
                  <div className="flex gap-2.5">
                    <button 
                      type="button"
                      className="flex-1 h-11 py-2 text-xs font-bold text-white/70 hover:text-white neu-button rounded-xl transition flex items-center justify-center"
                      onClick={onOpenSavePreset}
                    >
                      Save Current
                    </button>
                    <button 
                      type="button"
                      className="flex-1 h-11 py-2 text-xs font-bold text-white/70 hover:text-white neu-button rounded-xl transition flex items-center justify-center"
                      onClick={onOpenManagePresets}
                    >
                      Manage Presets
                    </button>
                  </div>
                </div>
                <div className="h-px bg-white/5 w-full" />"""

if old_preset_trigger in content:
    content = content.replace(old_preset_trigger, "")
else:
    print("Could not find preset trigger")

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Preset trigger removed from drawer")
