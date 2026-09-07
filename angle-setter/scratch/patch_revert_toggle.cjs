const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// Replace the large, gesture-enabled toggle with the exact same look but no gesture, just onClick.
const oldToggleRegex = /<div\s+className="relative flex neu-concave rounded-full border border-black\/40 p-1\.5 select-none w-44 cursor-pointer touch-none"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newToggle = `<div 
                        className="relative flex neu-concave rounded-full border border-black/40 p-1 select-none w-36 cursor-pointer touch-none"
                        onClick={() => setActiveUsbTab(activeUsbTab === 'rear' ? 'front' : 'rear')}
                      >
                        <div className="absolute top-1 bottom-1 left-1 right-1 pointer-events-none">
                          <div className={\`w-1/2 h-full neu-button rounded-full shadow-sm transition-transform duration-300 ease-out \${activeUsbTab === 'rear' ? 'translate-x-0' : 'translate-x-full'}\`} />
                        </div>
                        <div className="relative z-10 flex w-full">
                          <div className={\`flex-1 py-1.5 flex items-center justify-center text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 \${activeUsbTab === 'rear' ? 'text-white' : 'text-white/40'}\`}>
                            Rear
                          </div>
                          <div className={\`flex-1 py-1.5 flex items-center justify-center text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 \${activeUsbTab === 'front' ? 'text-white' : 'text-white/40'}\`}>
                            Front
                          </div>
                        </div>
                      </div>`;

code = code.replace(oldToggleRegex, newToggle);

// Remove the unused toggleStartX ref if it's there
code = code.replace(/\n\s*const toggleStartX = React\.useRef\(0\);/, '');

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
