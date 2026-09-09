const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

code = code.replace(
  'className="relative flex neu-concave rounded-full border border-black/40 p-1 select-none w-36 cursor-pointer touch-none"',
  'className="relative flex neu-concave rounded-full border border-black/40 p-1.5 select-none w-44 cursor-pointer touch-none"'
);

code = code.replace(
  'className={`flex-1 py-1.5 flex items-center justify-center text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${activeUsbTab === \'rear\' ? \'text-white\' : \'text-white/40\'}`}',
  'className={`flex-1 py-2 flex items-center justify-center text-xs font-bold tracking-wider uppercase transition-colors duration-300 ${activeUsbTab === \'rear\' ? \'text-white\' : \'text-white/40\'}`}'
);

code = code.replace(
  'className={`flex-1 py-1.5 flex items-center justify-center text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${activeUsbTab === \'front\' ? \'text-white\' : \'text-white/40\'}`}',
  'className={`flex-1 py-2 flex items-center justify-center text-xs font-bold tracking-wider uppercase transition-colors duration-300 ${activeUsbTab === \'front\' ? \'text-white\' : \'text-white/40\'}`}'
);

code = code.replace(
  'className="absolute top-1 bottom-1 left-1 right-1 pointer-events-none"',
  'className="absolute top-1.5 bottom-1.5 left-1.5 right-1.5 pointer-events-none"'
);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
