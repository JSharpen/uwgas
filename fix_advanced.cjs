const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

const regex = /<div className="bg-black\/20 border border-white\/5 rounded-2xl flex flex-col overflow-hidden transition-all duration-300">[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/;

const replacement = `<div className="bg-black/20 border border-white/5 rounded-2xl flex flex-col overflow-hidden transition-all duration-300">
            <div 
              role="button"
              tabIndex={0}
              className="p-4 text-xs font-bold text-white/70 hover:text-white cursor-pointer select-none flex items-center justify-between hover:bg-white/5 transition-colors"
              onClick={() => setIsAdvExpanded(!isAdvExpanded)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsAdvExpanded(!isAdvExpanded); } }}
            >
              <span>Advanced Geometry Parameters</span>
              <span className={\`text-xs text-white/40 transition-transform duration-300 ease-in-out \${isAdvExpanded ? 'rotate-180' : 'rotate-0'}\`}>▼</span>
            </div>
            <div className={\`grid transition-[grid-template-rows] duration-300 ease-in-out \${isAdvExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}\`}>
              <div className="overflow-hidden">
                <div className="px-4 pb-4 flex flex-col gap-4 border-t border-white/5 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
                      Measurements per base
                    </label>
                    <MiniSelect
                      value={String(calibCount)}
                      options={[
                        { value: '3', label: '3 Measurements (Fastest)' },
                        { value: '4', label: '4 Measurements (Recommended / High Accuracy)' },
                        { value: '5', label: '5 Measurements (Maximum Precision)' },
                      ]}
                      onChange={val => setCalibCount(parseInt(val, 10))}
                      widthClass="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Fixed Advanced Geometry tags!");
