import * as React from 'react';
import type { CalcMode, WheelResult, MachineConfig, UsbConfig, Wheel, SessionStep } from '../types/core';
import { IconEdgeLeading, IconEdgeTrailing } from '../icons';
import ActionSheetPicker from './calculator/ActionSheetPicker';

type ProgressionViewProps = {
  wheelResults: WheelResult[];
  machines: MachineConfig[];
  defaultMachineId?: string;
  usbs: UsbConfig[];
  wheels?: Wheel[];
  globalUsbId: string;
  heightMode: 'hn' | 'hr';
  calcMode?: CalcMode;
  angleErrorById?: Record<string, number | null>;
  onUpdateStep?: (id: string, patch: Partial<SessionStep>) => void;
  onUpdateWheel?: (id: string, patch: Partial<Wheel>) => void;
  onDeleteStep?: (id: string) => void;
  onMoveStep?: (index: number, direction: -1 | 1) => void;
  showAdvancedStepOverrides?: boolean;
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
  onUpdateStep,
  onUpdateWheel,
  onDeleteStep,
  onMoveStep,
  showAdvancedStepOverrides,
}: ProgressionViewProps) {
  const formatDeg = (val: number) => val.toFixed(2).replace(/\.?0+$/, '');
  const [expandedStepId, setExpandedStepId] = React.useState<string | null>(null);
  const [sheetConfig, setSheetConfig] = React.useState<{ type: 'wheel' | 'machine' | 'usb' | 'base'; stepId: string } | null>(null);

  React.useEffect(() => {
    const handleCollapseAll = () => setExpandedStepId(null);
    window.addEventListener('collapseAll', handleCollapseAll);
    return () => window.removeEventListener('collapseAll', handleCollapseAll);
  }, []);

  const isProjectionMode = calcMode === 'projection';

  return (
    <div className="flex flex-col gap-4 text-xs pb-10 w-full">
      {wheelResults.length === 0 && (
        <div className="text-xs text-white/60 border border-dashed u-border rounded p-4 flex flex-col gap-3 items-center text-center">
          <p>No sharpening steps defined yet.</p>
        </div>
      )}
      
      {wheelResults.map((r, index) => {
        const stepId = r.step?.id ?? r.wheel.id;
        const isExpanded = expandedStepId === stepId;
        
        const effectiveMachine = r.step?.machineId
          ? machines.find(m => m.id === r.step!.machineId)
          : machines.find(m => m.id === defaultMachineId);

        const angleOffset = r.step?.angleOffset ?? 0;
        const hasOffset = angleOffset !== 0;

        const effectiveUsb = usbs.find(u => u.id === (r.step?.usbId || globalUsbId));
        
        let deltaText = null;
        if (index > 0 && !isProjectionMode) {
          const prev = wheelResults[index - 1];
          const currH = heightMode === 'hn' ? r.hnBase : r.hrWheel;
          const prevH = heightMode === 'hn' ? prev.hnBase : prev.hrWheel;
          const diff = currH - prevH;
          if (Math.abs(diff) >= 0.01) {
            deltaText = `Δ ${diff > 0 ? '+' : ''}${diff.toFixed(2)} MM`;
          }
        }

        return (
          <div
            key={stepId}
            className="relative flex flex-col motion-list-item transition-all duration-300 group"
            style={{ '--motion-order': index } as React.CSSProperties}
          >
            {/* ===== View State (Clickable to Expand) ===== */}
            <div 
              className="flex justify-between items-center p-6 relative z-20 cursor-pointer bg-[#262626] hover:bg-white/5 active:bg-white/10 transition-colors rounded-3xl border border-white/10 shadow-lg"
              onClick={() => setExpandedStepId(isExpanded ? null : stepId)}
            >
              {/* Subtle Edge Highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-3xl z-0"></div>
              
              <div className="flex flex-col gap-1 min-w-0 flex-1 pr-4 relative z-10">
                {/* Primary readout: Wheel Name */}
                <div className="flex items-center gap-2 w-full">
                  <span className="text-base font-medium text-white tracking-wide truncate">
                    {r.wheel.name}
                  </span>
                </div>
                
                {/* Secondary readout: Step Badge, Angle, and Base */}
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  {r.step && (
                    <div className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-[10px] font-bold font-mono text-white border border-neutral-800 shrink-0">
                      {index + 1}
                    </div>
                  )}
                  {hasOffset && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${angleOffset > 0 ? 'bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)]' : 'bg-danger/20 text-danger'}`}>
                      {angleOffset > 0 ? '+' : ''}{angleOffset.toFixed(1)}°
                    </span>
                  )}
                  {r.step && (
                    <div className="flex items-center shrink-0 ml-1" title={r.step.base === 'rear' ? 'Edge Leading' : 'Edge Trailing'}>
                      {r.step.base === 'rear' ? <IconEdgeLeading className="w-3.5 h-3.5 text-[var(--color-accent)] opacity-80" /> : <IconEdgeTrailing className="w-3.5 h-3.5 text-[var(--color-focus)] opacity-80" />}
                    </div>
                  )}
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold truncate">
                    {formatDeg(r.betaEffDeg)}° / {r.step?.base === 'front' ? 'FRONT' : 'REAR'}
                  </span>
                </div>
              </div>

              {/* Massive USB/Projection Output */}
              <div className="flex flex-col items-end shrink-0 relative z-10">
                <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {isProjectionMode ? (
                    r.isReachable !== false && r.requiredProjectionA != null ? (
                      <>{r.requiredProjectionA.toFixed(2)}<span className="text-sm sm:text-base text-white/50 font-medium ml-1">mm</span></>
                    ) : (
                      <span className="text-danger text-xl">OOR</span>
                    )
                  ) : heightMode === 'hn' ? (
                    <>{r.hnBase.toFixed(2)}<span className="text-sm sm:text-base text-white/50 font-medium ml-1">mm</span></>
                  ) : (
                    <>{r.hrWheel.toFixed(2)}<span className="text-sm sm:text-base text-white/50 font-medium ml-1">mm</span></>
                  )}
                </span>
                
                {/* Hardware Overrides / Deltas */}
                <div className="flex flex-col items-end mt-1">
                  {deltaText && (
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                      {deltaText}
                    </span>
                  )}
                  {(showAdvancedStepOverrides || r.step?.usbId) && effectiveUsb && (
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                      {effectiveUsb.name}
                    </span>
                  )}
                  {(showAdvancedStepOverrides || r.step?.machineId) && effectiveMachine && (
                    <span className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest font-bold">
                      {effectiveMachine.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ===== Edit State (Collapsible) ===== */}
            {r.step && onUpdateStep && (
              <div 
                className={`relative z-10 bg-zinc-900 overflow-hidden transition-all duration-300 ease-in-out border border-white/5 border-t-0 rounded-b-3xl -mt-6 pt-6 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 border-transparent'}`}
              >
                <div className="p-6 flex flex-col gap-4">
                  
                  {/* Steppers */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 flex flex-col gap-1.5 w-full">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1 flex justify-between">
                        <span>Wheel Diameter</span>
                        <span className="text-white/30 hover:text-white cursor-pointer" onClick={() => setSheetConfig({ type: 'wheel', stepId })}>Change</span>
                      </label>
                      <div className="bg-black/30 border border-white/5 rounded-2xl flex items-center justify-between p-1">
                        <button 
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition"
                          onClick={() => onUpdateWheel?.(r.wheel.id, { D: Math.max(100, (r.wheel.D || 250) - 1) })}
                        >-</button>
                        <span className="text-sm font-mono font-bold text-white">{r.wheel.D?.toFixed(1) || 250} mm</span>
                        <button 
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition"
                          onClick={() => onUpdateWheel?.(r.wheel.id, { D: Math.min(300, (r.wheel.D || 250) + 1) })}
                        >+</button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5 w-full">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1 flex justify-between">
                        <span>Micro-bevel (Δ°)</span>
                        <span className="text-white/30 hover:text-white cursor-pointer" onClick={() => onUpdateStep(stepId, { angleOffset: 0 })}>Reset</span>
                      </label>
                      <div className="bg-black/30 border border-white/5 rounded-2xl flex items-center justify-between p-1">
                        <button 
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition"
                          onClick={() => onUpdateStep(stepId, { angleOffset: Math.max(-5, (r.step!.angleOffset || 0) - 0.5) })}
                        >-</button>
                        <span className="text-sm font-mono font-bold text-white">{(r.step!.angleOffset || 0) > 0 ? '+' : ''}{(r.step!.angleOffset || 0).toFixed(1)}°</span>
                        <button 
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition"
                          onClick={() => onUpdateStep(stepId, { angleOffset: Math.min(5, (r.step!.angleOffset || 0) + 0.5) })}
                        >+</button>
                      </div>
                    </div>
                  </div>

                  {/* Base Override */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Sharpening Base</label>
                    <button 
                      className="flex items-center justify-between w-full p-3 bg-black/30 hover:bg-white/5 border border-white/5 rounded-2xl text-xs font-semibold text-white transition"
                      onClick={() => setSheetConfig({ type: 'base', stepId })}
                    >
                      <span className="truncate">{r.step?.base === 'front' ? 'Front Base (Edge Trailing)' : 'Rear Base (Edge Leading)'}</span>
                      <span className="text-white/30 ml-2">▼</span>
                    </button>
                  </div>

                  {/* Advanced Step Overrides (Conditionally rendered) */}
                  {showAdvancedStepOverrides && (
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Machine Override</label>
                        <button 
                          className="flex items-center justify-between w-full p-2.5 bg-black/30 hover:bg-white/5 border border-white/5 rounded-2xl text-xs font-semibold text-white transition"
                          onClick={() => setSheetConfig({ type: 'machine', stepId })}
                        >
                          <span className="truncate">{effectiveMachine?.name || 'Default Machine'}</span>
                          <span className="text-white/30 ml-2">▼</span>
                        </button>
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Support Bar</label>
                        <button 
                          className="flex items-center justify-between w-full p-2.5 bg-black/30 hover:bg-white/5 border border-white/5 rounded-2xl text-xs font-semibold text-white transition"
                          onClick={() => setSheetConfig({ type: 'usb', stepId })}
                        >
                          <span className="truncate">{effectiveUsb?.name || 'Default USB'}</span>
                          <span className="text-white/30 ml-2">▼</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex justify-between items-center mt-2 pt-4 border-t border-white/5">
                    <div className="flex gap-2">
                      <button 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${index === 0 ? 'bg-white/5 opacity-30 cursor-not-allowed text-white/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        onClick={(e) => { e.stopPropagation(); onMoveStep?.(index, -1); }}
                        disabled={index === 0}
                      >↑</button>
                      <button 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${index === wheelResults.length - 1 ? 'bg-white/5 opacity-30 cursor-not-allowed text-white/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        onClick={(e) => { e.stopPropagation(); onMoveStep?.(index, 1); }}
                        disabled={index === wheelResults.length - 1}
                      >↓</button>
                    </div>
                    <button 
                      className="px-4 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold text-xs transition"
                      onClick={(e) => { e.stopPropagation(); onDeleteStep?.(stepId); }}
                    >
                      Delete Step
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })}
      
{/* Action Sheets for Inline Editing */}
      {sheetConfig && onUpdateStep && (
        <>
          <ActionSheetPicker
            isOpen={sheetConfig.type === 'wheel'}
            onClose={() => setSheetConfig(null)}
            title="Select Wheel"
            options={[
              ...wheels.map(w => ({ value: w.id, label: w.name, meta: `D:${w.D}mm` }))
            ]}
            value={wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.wheelId || ''}
            onChange={val => {
              onUpdateStep(sheetConfig.stepId, { wheelId: val });
              setSheetConfig(null);
            }}
          />
          <ActionSheetPicker
            isOpen={sheetConfig.type === 'machine'}
            onClose={() => setSheetConfig(null)}
            title="Override Machine"
            options={[
              { value: '', label: 'Default Machine' },
              ...machines.map(m => ({ value: m.id, label: m.name }))
            ]}
            value={wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.machineId || ''}
            onChange={val => {
              onUpdateStep(sheetConfig.stepId, { machineId: val || undefined });
              setSheetConfig(null);
            }}
          />
          <ActionSheetPicker
            isOpen={sheetConfig.type === 'usb'}
            onClose={() => setSheetConfig(null)}
            title="Override Support Bar"
            options={[
              { value: '', label: 'Default USB' },
              ...usbs.map(u => ({ value: u.id, label: u.name }))
            ]}
            value={wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.usbId || ''}
            onChange={val => {
              onUpdateStep(sheetConfig.stepId, { usbId: val || undefined });
              setSheetConfig(null);
            }}
          />
          <ActionSheetPicker
            isOpen={sheetConfig.type === 'base'}
            onClose={() => setSheetConfig(null)}
            title="Sharpening Base"
            options={[
              { value: 'front', label: 'Front Base (Edge Trailing)' },
              { value: 'rear', label: 'Rear Base (Edge Leading)' }
            ]}
            value={wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.base || 'front'}
            onChange={val => {
              onUpdateStep(sheetConfig.stepId, { base: val as 'front' | 'rear' });
              setSheetConfig(null);
            }}
          />
        </>
      )}
    </div>
  );
}

export default ProgressionView;
