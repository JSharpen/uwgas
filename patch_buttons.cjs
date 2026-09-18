const fs = require('fs');

// Map of replacements (from -> to) for button classnames across the equipment views.
const replacements = [
  // General Cancel / secondary buttons
  {
    regex: /className="px-4 h-11 rounded-xl bg-white\/5 hover:bg-white\/10 text-white\/70 font-semibold text-xs uppercase tracking-wide transition cursor-pointer flex items-center justify-center"/g,
    replacement: 'className="px-4 h-11 rounded-xl neu-button text-white/70 font-semibold text-xs uppercase tracking-wide transition active:scale-95 cursor-pointer flex items-center justify-center"'
  },
  // Delete secondary button
  {
    regex: /className="flex-1 h-10 rounded-xl bg-white\/5 hover:bg-white\/10 text-white\/70 font-semibold text-xs uppercase tracking-wide transition flex items-center justify-center cursor-pointer"/g,
    replacement: 'className="flex-1 h-10 rounded-xl neu-button text-white/70 font-semibold text-xs uppercase tracking-wide transition active:scale-95 flex items-center justify-center cursor-pointer"'
  },
  // Delete primary button (Red)
  {
    regex: /className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wide shadow-lg transition flex items-center justify-center cursor-pointer"/g,
    replacement: 'className="flex-1 h-10 rounded-xl bg-red-500/80 text-white font-bold text-xs uppercase tracking-wide shadow-lg transition active:scale-95 flex items-center justify-center cursor-pointer neu-button"'
  },
  // Save / Primary action buttons (Amber)
  {
    regex: /className="px-6 h-11 rounded-xl bg-\[var\(--color-accent\)\] hover:brightness-110 text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"/g,
    replacement: 'className="px-6 h-11 rounded-xl bg-[var(--color-accent)] text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-[var(--color-accent)]"'
  },
  {
    regex: /className="flex-1 h-11 rounded-xl bg-\[var\(--color-accent\)\] hover:brightness-110 text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"/g,
    replacement: 'className="flex-1 h-11 rounded-xl bg-[var(--color-accent)] text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-[var(--color-accent)]"'
  },
  // Set as Default
  {
    regex: /className="px-4 py-2 rounded-xl bg-white\/5 hover:bg-white\/10 border border-white\/5 text-xs font-bold text-white\/80 hover:text-white uppercase tracking-wider transition cursor-pointer"/g,
    replacement: 'className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-white/80 uppercase tracking-wider transition active:scale-95 cursor-pointer"'
  },
  // Active Mapping Box
  {
    regex: /className="w-full flex items-center justify-between p-3.5 bg-black\/40 border border-white\/5 rounded-2xl hover:bg-white\/5 active:bg-white\/10 transition-colors"/g,
    replacement: 'className="w-full flex items-center justify-between p-3.5 neu-button rounded-2xl transition active:scale-[0.98] cursor-pointer"'
  },
  // No Mappings Found empty state box
  {
    regex: /className="mt-2 w-full flex flex-col items-center justify-center p-4 bg-\[var\(--color-accent\)\]\/5 border border-\[var\(--color-accent\)\]\/30 border-dashed rounded-2xl hover:bg-\[var\(--color-accent\)\]\/10 active:bg-\[var\(--color-accent\)\]\/20 transition-colors"/g,
    replacement: 'className="mt-2 w-full flex flex-col items-center justify-center p-4 neu-button border border-[var(--color-accent)]/30 border-dashed rounded-2xl transition active:scale-[0.98] cursor-pointer"'
  },
  // Modal inner selection buttons
  {
    regex: /className=\{\`flex items-center justify-between p-4 text-left rounded-2xl border transition-all cursor-pointer \\\$\{\n\s*isActive\n\s*\? 'border-\[var\(--color-accent\)\]\/50 bg-\[color-mix\\(in_srgb,var\(--color-accent\)_10%,transparent\\)\]'\n\s*: 'border-white\/5 bg-black\/40 hover:bg-white\/5 active:bg-white\/10'\n\s*\}\`\}/g,
    replacement: 'className={`flex items-center justify-between p-4 text-left rounded-2xl transition-all cursor-pointer neu-button active:scale-[0.98] ${isActive ? \'border border-[var(--color-accent)]/50 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]\' : \'border border-transparent\'}`}'
  },
  // Create New Mapping modal bottom button
  {
    regex: /className="mt-2 w-full p-4 rounded-2xl border border-\[var\(--color-accent\)\]\/30 bg-\[var\(--color-accent\)\]\/10 text-\[var\(--color-accent\)\] hover:bg-\[var\(--color-accent\)\]\/20 active:bg-\[var\(--color-accent\)\]\/30 transition-colors flex items-center justify-center gap-2 font-bold text-sm cursor-pointer"/g,
    replacement: 'className="mt-2 w-full p-4 rounded-2xl neu-button border border-[var(--color-accent)]/30 text-[var(--color-accent)] transition active:scale-[0.98] flex items-center justify-center gap-2 font-bold text-sm cursor-pointer"'
  }
];

const files = [
  'src/components/settings/MachineManagerView.tsx',
  'src/components/settings/JigManagerView.tsx',
  'src/components/settings/UsbManagerView.tsx',
  'src/components/wheels/WheelManagerView.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    replacements.forEach(rep => {
      content = content.replace(rep.regex, rep.replacement);
    });
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`Updated buttons in ${file}`);
    }
  }
});
