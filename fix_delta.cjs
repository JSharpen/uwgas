const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

const hookCode = `        const effectiveUsb = usbs.find(u => u.id === (r.step?.usbId || globalUsbId));
        
        let deltaText = null;
        if (index > 0 && !isProjectionMode) {
          const prev = wheelResults[index - 1];
          const currH = heightMode === 'hn' ? r.hnBase : r.hrWheel;
          const prevH = heightMode === 'hn' ? prev.hnBase : prev.hrWheel;
          const diff = currH - prevH;
          if (Math.abs(diff) >= 0.01) {
            deltaText = \`Δ \${diff > 0 ? '+' : ''}\${diff.toFixed(2)} MM\`;
          }
        }

        return (`;

code = code.replace("        const effectiveUsb = usbs.find(u => u.id === (r.step?.usbId || globalUsbId));\n\n        return (", hookCode);

const displayCode = `                  ) : heightMode === 'hn' ? (
                    <>{r.hnBase.toFixed(2)}<span className="text-lg text-white/50 font-medium ml-1">mm</span></>
                  ) : (
                    <>{r.hrWheel.toFixed(2)}<span className="text-lg text-white/50 font-medium ml-1">mm</span></>
                  )}
                </span>
                
                {/* Hardware Overrides / Deltas */}
                <div className="flex flex-col items-end mt-1">
                  {deltaText && (
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                      {deltaText}
                    </span>
                  )}`;

code = code.replace(`                  ) : heightMode === 'hn' ? (
                    <>{r.hnBase.toFixed(2)}<span className="text-lg text-white/50 font-medium ml-1">mm</span></>
                  ) : (
                    <>{r.hrWheel.toFixed(2)}<span className="text-lg text-white/50 font-medium ml-1">mm</span></>
                  )}
                </span>
                
                {/* Hardware Overrides / Deltas */}
                <div className="flex flex-col items-end mt-1">`, displayCode);

fs.writeFileSync('src/components/ProgressionView.tsx', code);
