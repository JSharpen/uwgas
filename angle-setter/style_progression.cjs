const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

// Modernize Card Container
// Old: className="card-elevated flex flex-col motion-list-item overflow-hidden transition-all duration-300"
code = code.replace(
  'className="card-elevated flex flex-col motion-list-item overflow-hidden transition-all duration-300"',
  'className="bg-[#262626] border border-neutral-700/50 rounded-3xl flex flex-col motion-list-item overflow-hidden transition-all duration-300 shadow-md"'
);

// Modernize Header
// Old: className="card-elevated__header wheel-card__header flex flex-nowrap items-center justify-between gap-1.5 px-2 py-1.5 min-h-[40px]"
code = code.replace(
  'className="card-elevated__header wheel-card__header flex flex-nowrap items-center justify-between gap-1.5 px-2 py-1.5 min-h-[40px]"',
  'className="flex flex-nowrap items-center justify-between gap-3 px-4 py-3 min-h-[48px] bg-neutral-800/40 border-b border-neutral-800/50"'
);

// Update step badge in header
// Old: bg-neutral-800 flex items-center justify-center text-[0.7rem]
code = code.replace(
  'w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[0.7rem] font-mono text-neutral-50 shrink-0 shadow-sm',
  'w-6 h-6 rounded-full bg-neutral-950 flex items-center justify-center text-xs font-bold font-mono text-neutral-300 shrink-0 border border-neutral-800'
);

// Update wheel name in header
// Old: text-xs text-neutral-100 font-medium truncate leading-none
code = code.replace(
  'text-xs text-neutral-100 font-medium truncate leading-none',
  'text-sm font-bold text-white truncate leading-none tracking-wide'
);

// Modernize Card Body (View Outputs)
// Old: className={`card-elevated__body flex-col justify-center ${bodyGap} ${bodyPaddingX} ${bodyPaddingY} u-surface`}
code = code.replace(
  /className=\{`card-elevated__body flex-col justify-center \$\{bodyGap\} \$\{bodyPaddingX\} \$\{bodyPaddingY\} u-surface`\}/g,
  'className={`flex flex-col justify-center gap-3 px-4 py-4 bg-transparent`}'
);

// Update primary readouts (hn/hr)
// Old: font-mono text-base sm:text-lg font-bold u-text tracking-tight leading-none
code = code.replace(
  'font-mono text-base sm:text-lg font-bold u-text tracking-tight leading-none',
  'font-mono text-xl font-bold text-white tracking-tight leading-none'
);

// Update angle value
// Old: text-sm font-semibold u-text leading-none
code = code.replace(
  'text-sm font-semibold u-text leading-none',
  'text-sm font-bold text-neutral-300 leading-none tracking-wide'
);

// Update Accordion Background
// Old: bg-neutral-900/50
code = code.replace(
  'bg-neutral-900/50 ${isExpanded ? \'max-h-[300px] opacity-100 border-t border-neutral-800\' : \'max-h-0 opacity-0\'}',
  'bg-neutral-900 ${isExpanded ? \'max-h-[300px] opacity-100 border-t border-neutral-800\' : \'max-h-0 opacity-0\'}'
);

fs.writeFileSync('src/components/ProgressionView.tsx', code);
