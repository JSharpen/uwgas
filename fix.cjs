const fs = require('fs');
const file = 'src/components/calculator/GlobalSetupCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const broken = `            {/* INPUTS AREA */}
            <div 
              className={\`px-5 pb-8 pt-2 flex flex-col gap-4 max-h-[60vh] overflow-y-auto overscroll-contain transition-opacity duration-300 relative z-10 \${isSetupPanelOpen ? 'opacity-100 delay-150' : 'opacity-0'}\`}
                <div className="flex flex-col gap-2.5 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setActiveSheet('preset')}
                  >
                    <div className="flex flex-col items-start min-w-0 pr-2">
                      <span className={\`text-sm font-bold truncate max-w-[220px] \${activePreset ? 'text-white' : 'text-white/40'}\`}>
                        {activePreset ? activePreset.name : 'None selected'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-amber-400 px-3.5 py-1.5 neu-concave border border-black/40 rounded-full shrink-0">
                      Change
                    </div>
                  </button>
                  <div className="flex gap-2.5">
                      type="button"
                      className="flex-1 h-11 py-2 text-xs font-bold text-white/70 hover:text-white neu-button rounded-xl transition flex items-center justify-center"
                      onClick={onOpenSavePreset}
                    >
                      Save Current
                    </button>
                    <button 
                      className="flex-1 h-11 py-2 text-xs font-bold text-white/70 hover:text-white neu-button rounded-xl transition flex items-center justify-center"
                      onClick={onOpenManagePresets}
                    >
                      Manage Presets
                    </button>
                  </div>
                </div>`;

const fixed = `            {/* INPUTS AREA */}
            <div 
              className={\`px-5 pb-8 pt-2 flex flex-col gap-4 max-h-[60vh] overflow-y-auto overscroll-contain transition-opacity duration-300 relative z-10 \${isSetupPanelOpen ? 'opacity-100 delay-150' : 'opacity-0'}\`}
              style={{ maskImage: 'linear-gradient(to bottom, transparent, black 12px, black calc(100% - 12px), transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12px, black calc(100% - 12px), transparent)' }}
            >
                {/* PRESET TRIGGER */}
                <div className="flex flex-col gap-2.5 mt-2">
                  <button 
                    type="button" 
                    className="flex items-center justify-between p-4 neu-button rounded-2xl transition-all w-full text-left"
                    onClick={() => setActiveSheet('preset')}
                  >
                    <div className="flex flex-col items-start min-w-0 pr-2">
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-0.5">Active Preset</span>
                      <span className={\`text-sm font-bold truncate max-w-[220px] \${activePreset ? 'text-white' : 'text-white/40'}\`}>
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
                </div>`;

if (content.includes(broken)) {
  content = content.replace(broken, fixed);
  fs.writeFileSync(file, content);
  console.log('Fixed block successfully.');
} else {
  console.log('Broken block not found.');
}
