const fs = require('fs');
let code = fs.readFileSync('src/components/CalibrationWizard.tsx', 'utf8');

// 1. Update State
code = code.replace(
  /const \[calibDa, setCalibDa\] = React\.useState\(12\);\n\s*const \[calibDs, setCalibDs\] = React\.useState\(usbs\.find\(u => u\.id === global\.activeUsbId\)\?\.Ds \?\? 12\);/,
  `const [selectedUsbId, setSelectedUsbId] = React.useState(global.activeUsbId);
  const calibDa = activeMachine.axleDiameter ?? 12;
  const calibDs = usbs.find(u => u.id === selectedUsbId)?.Ds ?? 12;`
);

// 2. Insert USB Selector
const profileNameSection = `            />
          </div>

          {/* Scope Selector */}`;
          
const newUsbSection = `            />
          </div>

          {/* USB Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
              USB Bar Hardware
            </label>
            <MiniSelect
              value={selectedUsbId}
              options={usbs.map(u => ({ value: u.id, label: \`\${u.name} (Ø \${u.Ds}mm)\` }))}
              onChange={val => setSelectedUsbId(val)}
              widthClass="w-full"
            />
          </div>

          {/* Scope Selector */}`;
          
code = code.replace(profileNameSection, newUsbSection);

// 3. Remove grid block in Advanced Settings
const gridBlockRegex = /<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/details>/;
code = code.replace(gridBlockRegex, '</div>\n          </details>');

fs.writeFileSync('src/components/CalibrationWizard.tsx', code);
console.log("Patched USB selection successfully!");
