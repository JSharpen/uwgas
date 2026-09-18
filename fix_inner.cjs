const fs = require('fs');
let code = fs.readFileSync('src/components/settings/MachineManagerView.tsx', 'utf8');

const target = "className={`flex items-center justify-between p-4 text-left rounded-2xl border transition-all cursor-pointer ${\n                        isActive\n                          ? 'border-[var(--color-accent)]/50 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]'\n                          : 'border-white/5 bg-black/40 hover:bg-white/5 active:bg-white/10'\n                      }`}";

const replacement = "className={`flex items-center justify-between p-4 text-left rounded-2xl transition-all cursor-pointer neu-button active:scale-[0.98] ${isActive ? 'border border-[var(--color-accent)]/50 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]' : 'border border-transparent'}`}";

if(code.indexOf(target) !== -1) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/settings/MachineManagerView.tsx', code);
    console.log("Fixed!");
} else {
    console.log("String didn't match.");
}
