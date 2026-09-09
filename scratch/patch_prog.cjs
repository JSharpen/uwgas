const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

// 1. Add scroll margin
code = code.replace(
  'className="relative flex flex-col motion-list-item transition-all duration-300 group"',
  'className="relative flex flex-col motion-list-item transition-all duration-300 group scroll-m-[120px] sm:scroll-m-[160px]"'
);

// 2. Remove jigId from effectiveJig
code = code.replace(
  'const effectiveJig = jigs?.find(j => j.id === (r.step?.jigId || globalJigId));',
  'const effectiveJig = jigs?.find(j => j.id === globalJigId);'
);

// 3. Remove all touch handlers and nib completely
code = code.replace(
  /const touchStartY = React\.useRef\(0\);\n\n.*?const handleTouchEnd = [^}]+};\n\n/s,
  ''
);

code = code.replace(
  /onTouchStart={handleTouchStart}\n\s+onTouchEnd={handleTouchEnd}/,
  ''
);

code = code.replace(
  /{\/\* Subtle Nib for dragging indicator \*\/}.*?<div className="p-5 flex flex-col gap-4">/s,
  '<div className="px-5 pb-5 pt-3 flex flex-col gap-4">'
);

fs.writeFileSync('src/components/ProgressionView.tsx', code);
