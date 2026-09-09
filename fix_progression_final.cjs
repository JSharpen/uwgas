const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

// 1. Remove Delta turns logic (it doesn't exist on MachineConstants)
// 2. Fix the wheel diameter editing (use onUpdateWheel)

const newCode = `import * as React from 'react';
import type { CalcMode, WheelResult, MachineConfig, UsbConfig, Wheel, SessionStep } from '../types/core';
import { IconEdgeLeading, IconEdgeTrailing, IconTrash } from '../icons';
import MiniSelect from './MiniSelect';
import GrindDirToggle from './GrindDirToggle';

type ProgressionViewProps = {
  wheelResults: WheelResult[];
  machines: MachineConfig[];
  defaultMachineId?: string;
  usbs: UsbConfig[];
  wheels?: Wheel[];
  globalUsbId: string;
  heightMode: 'hn' | 'hr';
  calcMode?: CalcMode;
  angleSymbol: string;
  angleErrorById?: Record<string, number | null>;
  cardMinHeight?: number;
  bodyPaddingX?: string;
  bodyPaddingY?: string;
  bodyGap?: string;
  onUpdateStep?: (id: string, patch: Partial<SessionStep>) => void;
  onUpdateWheel?: (id: string, patch: Partial<Wheel>) => void;
  onDeleteStep?: (id: string) => void;
  onMoveStep?: (index: number, direction: -1 | 1) => void;
  onAddStep?: () => void;
};

function ProgressionView({
  wheelResults,
  machines,
  defaultMachineId,
  usbs,
  wheels = [],
  globalUsbId,
  heightMode,
  calcMode = 'height',
  angleSymbol,
  angleErrorById,
  cardMinHeight,
  bodyPaddingX = 'px-3',
  bodyPaddingY = 'py-2',
  bodyGap = 'gap-2',
  onUpdateStep,
  onUpdateWheel,
  onDeleteStep,
  onMoveStep,
  onAddStep,
}: ProgressionViewProps) {
  const formatDeg = (val: number) => val.toFixed(2).replace(/\\.?0+$/, '');
  const [expandedStepId, setExpandedStepId] = React.useState<string | null>(null);
  const isProjectionMode = calcMode === 'projection';

  return (
    <div className="flex flex-col card-stack text-xs pb-10">
      {wheelResults.length === 0 && (
        <div className="text-xs text-neutral-400 border border-dashed u-border rounded p-4 flex flex-col gap-3 items-center text-center">
          <p>No sharpening steps defined yet.</p>
        </div>
      )}
      
      {wheelResults.map((r, index) => {
        const stepId = r.step?.id ?? r.wheel.id;
        const isExpanded = expandedStepId === stepId;
        
        const effectiveMachine = r.step?.machineId
          ? machines.find(m => m.id === r.step!.machineId)
          : defaultMachineId
          ? machines.find(m => m.id === defaultMachineId)
          : machines[0];

        const hasOffset = r.step && r.step.angleOffset !== 0;
        const angleOffset = r.step?.angleOffset ?? 0;
        const angleError = angleErrorById ? angleErrorById[stepId] : null;

        const isExact = angleError == null || Math.abs(angleError) < 0.005;
        const angleValueClass = isExact ? 'text-accent' : 'text-danger';

        let deltaInfo = null;
        if (!isProjectionMode && index > 0) {
          const prev = wheelResults[index - 1];
          let deltaH = 0;
          if (heightMode === 'hn') {
            deltaH = r.hnBase - prev.hnBase;
          } else {
            deltaH = r.hrWheel - prev.hrWheel;
          }
          const absDelta = Math.abs(deltaH);
          if (absDelta > 0.005) {
            deltaInfo = (
              <div className="flex flex-col items-center justify-center text-center px-1">
                <span className={\`text-[11px] font-mono font-bold \${absDelta > 0.005 ? 'text-neutral-300' : 'text-neutral-500'}\`}>
                  Δ {deltaH > 0 ? '+' : ''}{deltaH.toFixed(2)} mm
                </span>
              </div>
            );
          }
        }
        
        const formatResidual = (val: number) => {
          if (!Number.isFinite(val)) return '';
          const abs = Math.abs(val);
          if (abs === 0) return '0';
          const fixed = abs.toFixed(12);
          const [intPart, fracPartRaw = ''] = fixed.split('.');
          const firstIdx = fracPartRaw.split('').findIndex(ch => ch !== '0');
          if (firstIdx === -1) return intPart;
          const dp = firstIdx + 1;
          const rounded = abs.toFixed(dp);
          return rounded.replace(/\\.0+$/, '');
        };

        return (
          <div
            key={stepId}
            className="card-elevated flex flex-col motion-list-item overflow-hidden transition-all duration-300"
            style={{ '--motion-order': index, minHeight: cardMinHeight } as React.CSSProperties}
          >
            {/* CLICKABLE HITBOX FOR ACCORDION EXPANSION */}
            <div 
              className="cursor-pointer active:bg-neutral-800/50 transition-colors"
              onClick={() => setExpandedStepId(isExpanded ? null : stepId)}
            >
              {/* ===== Header bar ===== */}
              <div className="card-elevated__header wheel-card__header flex flex-nowrap items-center justify-between gap-1.5 px-2 py-1.5 min-h-[40px]">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {r.step && (
                    <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[0.7rem] font-mono text-neutral-50 shrink-0 shadow-sm">
                      {index + 1}
                    </div>
                  )}
                  {r.step && (
                    <div className="flex items-center shrink-0" title={r.step.base === 'rear' ? 'Edge Leading' : 'Edge Trailing'}>
                      {r.step.base === 'rear' ? <IconEdgeLeading className="w-4 h-4 text-accent/80" /> : <IconEdgeTrailing className="w-4 h-4 text-sky-400/80" />}
                    </div>
                  )}
                  <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                    <span className="text-xs text-neutral-100 font-medium truncate leading-none">
                      {r.wheel.name}
                    </span>
                  </div>
                </div>
                {hasOffset && (
                  <div className="shrink-0 ml-1">
                    <span className={\`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono \${angleOffset > 0 ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'}\`}>
                      {angleOffset > 0 ? '+' : ''}{angleOffset}°
                    </span>
                  </div>
                )}
                
                {/* Chevron indicating expansibility */}
                <div className="shrink-0 ml-1 text-neutral-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className={\`w-4 h-4 transition-transform duration-300 \${isExpanded ? 'rotate-180' : ''}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* ===== Wheel Card Body (View Outputs) ===== */}
              <div className={\`card-elevated__body flex-col justify-center \${bodyGap} \${bodyPaddingX} \${bodyPaddingY} u-surface\`}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-base sm:text-lg font-bold u-text tracking-tight leading-none">
                        {isProjectionMode ? (
                          r.isReachable !== false && r.requiredProjectionA != null ? (
                            \`A = \${r.requiredProjectionA.toFixed(2)} mm\`
                          ) : (
                            <span className="text-danger text-sm sm:text-base">Out of range</span>
                          )
                        ) : heightMode === 'hn' ? (
                          \`hn = \${r.hnBase.toFixed(2)} mm\`
                        ) : (
                          \`hr = \${r.hrWheel.toFixed(2)} mm\`
                        )}
                      </span>
                    </div>
                  </div>

                  {deltaInfo && (
                    <div className="flex-1 flex justify-center shrink-0">
                      {deltaInfo}
                    </div>
                  )}

                  <div className="flex flex-col items-end text-right flex-1 shrink-0">
                    <span className="text-sm font-semibold u-text leading-none">
                      {angleSymbol} = <span className={angleValueClass}>{formatDeg(r.betaEffDeg)}°</span>
                    </span>
                    {angleError != null && (
                      <span className="text-[0.65rem] text-neutral-500 mt-1 leading-none">
                        (calib ±{formatResidual(angleError)}°)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full pt-1.5 border-t border-neutral-800/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] uppercase font-bold text-neutral-400 tracking-wider">
                      {r.step?.base === 'front' ? 'FRONT BASE' : 'REAR BASE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.step?.usbId && r.step.usbId !== globalUsbId && usbs.find(u => u.id === r.step!.usbId) && (
                      <span className="text-[0.65rem] uppercase font-bold text-accent tracking-wider font-mono truncate max-w-[120px]">
                        {usbs.find(u => u.id === r.step!.usbId)!.name}
                      </span>
                    )}
                    <span className="text-[0.65rem] uppercase font-bold text-neutral-400 tracking-wider font-mono">
                      D={r.wheel.D?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Accordion Editor ===== */}
            {r.step && onUpdateStep && (
              <div 
                className={\`overflow-hidden transition-all duration-300 ease-in-out bg-neutral-900/50 \${isExpanded ? 'max-h-[300px] opacity-100 border-t border-neutral-800' : 'max-h-0 opacity-0'}\`}
              >
                <div className="p-3 flex flex-col gap-3">
                  <div className="flex gap-2 items-center">
                     <div className="flex-1">
                        <MiniSelect
                          value={r.step.wheelId}
                          options={[
                            { value: '', label: 'Select wheel...' },
                            ...wheels.map(w => ({ value: w.id, label: w.name, meta: \`D:\${w.D}mm\` }))
                          ]}
                          onChange={(val) => onUpdateStep(stepId, { wheelId: val })}
                        />
                     </div>
                     <GrindDirToggle
                        base={r.step.base}
                        isHoning={false}
                        canToggle={true}
                        onToggle={() => onUpdateStep(stepId, { base: r.step!.base === 'rear' ? 'front' : 'rear' })}
                      />
                  </div>
                  
                  <div className="flex gap-3">
                     <div className="flex-1 flex flex-col gap-1">
                       <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Diameter (Wheel)</label>
                       <input
                          type="number"
                          step="0.5"
                          min="100"
                          max="300"
                          value={r.wheel.D ?? ''}
                          placeholder={r.wheel.D?.toString()}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (onUpdateWheel) {
                              onUpdateWheel(r.wheel.id, { D: isNaN(val) ? undefined : val });
                            }
                          }}
                          className="w-full bg-neutral-800/80 border border-neutral-700/50 rounded-lg p-2 text-xs font-mono"
                        />
                     </div>
                     <div className="flex-1 flex flex-col gap-1">
                       <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Micro-bevel (°)</label>
                       <input
                          type="number"
                          step="0.5"
                          value={r.step.angleOffset === 0 ? '' : r.step.angleOffset}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            onUpdateStep(stepId, { angleOffset: isNaN(val) ? 0 : val });
                          }}
                          className="w-full bg-neutral-800/80 border border-neutral-700/50 rounded-lg p-2 text-xs font-mono"
                        />
                     </div>
                  </div>
                  
                  {/* Action Bar */}
                  <div className="flex gap-2 justify-between mt-1 pt-3 border-t border-neutral-800/50">
                    <div className="flex gap-1">
                      <button 
                        type="button" 
                        onClick={() => onMoveStep?.(index, -1)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => onMoveStep?.(index, 1)}
                        disabled={index === wheelResults.length - 1}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" transform="rotate(180 12 12)" /></svg>
                      </button>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => onDeleteStep?.(stepId)}
                      className="p-1.5 px-3 flex gap-1 items-center rounded-lg bg-danger/10 text-danger hover:bg-danger/20 font-bold text-xs"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Add Step Button */}
      {onAddStep && (
        <button
          type="button"
          className="mt-2 w-full border border-dashed border-neutral-700 rounded-xl p-4 text-neutral-400 font-bold text-sm hover:bg-neutral-800/50 hover:border-neutral-500 transition-colors"
          onClick={onAddStep}
        >
          + Add Wheel Step
        </button>
      )}
    </div>
  );
}

export default ProgressionView;
`;

fs.writeFileSync('src/components/ProgressionView.tsx', newCode);
