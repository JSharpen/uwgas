const fs = require('fs');
let code = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// Add the new ref
code = code.replace(
  'const touchStartY = React.useRef(0);',
  'const touchStartY = React.useRef(0);\n  const toggleStartX = React.useRef(0);'
);

// Replace the old toggle with the new fluid one
const oldToggle = `<div className="flex neu-concave rounded-full border border-black/40 p-1 select-none w-36">
                        <button
                          type="button"
                          className={\`flex-1 rounded-full text-[10px] font-bold tracking-wider py-1.5 uppercase transition \${activeUsbTab === 'rear' ? 'neu-button text-white shadow-sm' : 'text-white/40 hover:text-white'}\`}
                          onClick={() => setActiveUsbTab('rear')}
                        >
                          Rear
                        </button>
                        <button
                          type="button"
                          className={\`flex-1 rounded-full text-[10px] font-bold tracking-wider py-1.5 uppercase transition \${activeUsbTab === 'front' ? 'neu-button text-white shadow-sm' : 'text-white/40 hover:text-white'}\`}
                          onClick={() => setActiveUsbTab('front')}
                        >
                          Front
                        </button>
                      </div>`;

const newToggle = `<div 
                        className="relative flex neu-concave rounded-full border border-black/40 p-1 select-none w-36 cursor-pointer touch-none"
                        onPointerDown={(e) => {
                          e.currentTarget.setPointerCapture(e.pointerId);
                          toggleStartX.current = e.clientX;
                        }}
                        onPointerUp={(e) => {
                          e.currentTarget.releasePointerCapture(e.pointerId);
                          const deltaX = e.clientX - toggleStartX.current;
                          if (Math.abs(deltaX) > 15) {
                            setActiveUsbTab(deltaX > 0 ? 'front' : 'rear');
                          } else {
                            setActiveUsbTab(activeUsbTab === 'rear' ? 'front' : 'rear');
                          }
                        }}
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

code = code.replace(oldToggle, newToggle);

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', code);
