import * as React from 'react';
import type { WheelResult } from '../types/core';
import { IconEdgeLeading, IconEdgeTrailing } from '../icons';
import ActionSheetPicker from './calculator/ActionSheetPicker';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../state/store';
import { useWheelResults } from '../services/calculationService';

export type ProgressionViewProps = Record<string, never>;

type StepCardProps = {
  r: WheelResult;
  index: number;
  totalSteps: number;
  prevR?: WheelResult;
  isExpanded: boolean;
  onToggleExpand: () => void;
  setSheetConfig: (conf: { type: 'wheel' | 'machine' | 'usb' | 'base'; stepId: string } | null) => void;
};

const StepCard = React.memo(function StepCard({
  r,
  index,
  totalSteps,
  prevR,
  isExpanded,
  onToggleExpand,
  setSheetConfig,
}: StepCardProps) {
  const heightMode = useStore((s) => s.heightMode);
  const isProjectionMode = useStore((s) => s.global.calcMode === 'projection');
  const showAdvancedStepOverrides = useStore((s) => s.global.showAdvancedStepOverrides);
  const globalUsbId = useStore((s) => s.global.activeUsbId);
  const globalJigId = useStore((s) => s.global.activeJigId);
  const defaultMachineId = useStore((s) => s.defaultMachineId);
  const machines = useStore(useShallow((s) => s.machines));
  const usbs = useStore(useShallow((s) => s.usbs));
  const jigs = useStore(useShallow((s) => s.jigs));
  const onUpdateStep = useStore((s) => s.updateStep);
  const onDeleteStep = useStore((s) => s.deleteStep);
  const onMoveStep = useStore((s) => s.moveStep);
  const onUpdateWheel = useStore((s) => s.updateWheel);
  const stepId = r.step?.id ?? r.wheel.id;
  const cardRef = React.useRef<HTMLDivElement>(null);
  const touchStartY = React.useRef(0);

  const formatDeg = (val: number) => val.toFixed(2).replace(/\.?0+$/, '');

  React.useEffect(() => {
    if (isExpanded && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [isExpanded]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (isExpanded && deltaY < -30) {
      // Swipe up to close (similar to dragging the drawer down, but here the edit area is below)
      onToggleExpand();
    }
  };

  const effectiveMachine = r.step?.machineId
    ? machines.find(m => m.id === r.step!.machineId)
    : machines.find(m => m.id === defaultMachineId);

  const angleOffset = r.step?.angleOffset ?? 0;
  const hasOffset = angleOffset !== 0;
  const effectiveUsb = usbs.find(u => u.id === (r.step?.usbId || globalUsbId));
  const effectiveJig = jigs?.find(j => j.id === globalJigId);

  let deltaText = null;
  let deltaTurnsText = null;

  if (prevR) {
    if (!isProjectionMode) {
      const currH = heightMode === 'hn' ? r.hnBase : r.hrWheel;
      const prevH = heightMode === 'hn' ? prevR.hnBase : prevR.hrWheel;
      const diff = currH - prevH;
      if (Math.abs(diff) >= 0.01) {
        deltaText = `Δ ${diff > 0 ? '+' : ''}${diff.toFixed(2)} MM`;
        if (effectiveUsb?.threadPitch) {
          const turns = Math.abs(diff) / effectiveUsb.threadPitch;
          if (effectiveUsb.microAdjustMarks) {
            const fullTurns = Math.floor(turns);
            const marks = Math.round((turns - fullTurns) * effectiveUsb.microAdjustMarks);
            if (fullTurns > 0) {
                deltaTurnsText = `${diff > 0 ? 'UP' : 'DOWN'} ${fullTurns}T ${marks}M`;
            } else {
                deltaTurnsText = `${diff > 0 ? 'UP' : 'DOWN'} ${marks}M`;
            }
          } else {
            deltaTurnsText = `${diff > 0 ? 'UP' : 'DOWN'} ${turns.toFixed(1)}T`;
          }
        }
      }
    } else {
      if (r.requiredProjectionA != null && prevR.requiredProjectionA != null) {
        const diff = r.requiredProjectionA - prevR.requiredProjectionA;
        if (Math.abs(diff) >= 0.01) {
          deltaText = `Δ ${diff > 0 ? '+' : ''}${diff.toFixed(2)} MM`;
          if (effectiveJig?.isAdjustableLength && effectiveJig?.threadPitch) {
            const turns = Math.abs(diff) / effectiveJig.threadPitch;
            deltaTurnsText = `${diff > 0 ? 'OUT' : 'IN'} ${turns.toFixed(1)}T`;
          }
        }
      }
    }
  }

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col motion-list-item transition-all duration-300 group scroll-m-[120px] sm:scroll-m-[160px]"
      style={{ '--motion-order': index } as React.CSSProperties}
    >
      {/* ===== View State (Clickable to Expand) ===== */}
      <div 
        className={`flex justify-between items-center px-4 py-5 sm:p-6 relative z-20 cursor-pointer ${isExpanded ? 'neu-convex-pressed' : 'neu-convex neu-convex-active'} transition-all duration-300 rounded-3xl border border-black/40 shadow-lg select-none`}
        onClick={onToggleExpand}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col gap-1 min-w-0 flex-1 pr-3 sm:pr-4 relative z-10">
          <div className="flex items-center gap-2 w-full">
            <span className="text-base font-medium text-white tracking-wide truncate">
              {r.wheel.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            {r.step && (
              <div className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-[10px] font-bold tabular-nums text-white border border-black/60 shadow-inner shrink-0">
                {index + 1}
              </div>
            )}
            {hasOffset && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 shadow-sm ${angleOffset > 0 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/20' : 'bg-danger/20 text-danger border border-danger/20'}`}>
                {angleOffset > 0 ? '+' : ''}{angleOffset.toFixed(1)}°
              </span>
            )}
            {r.step && (
              <div className="flex items-center shrink-0 ml-1" title={r.step.base === 'rear' ? 'Edge Leading' : 'Edge Trailing'}>
                {r.step.base === 'rear' ? <IconEdgeLeading className="w-3.5 h-3.5 text-[var(--color-accent)] opacity-80" /> : <IconEdgeTrailing className="w-3.5 h-3.5 text-sky-400 opacity-80" />}
              </div>
            )}
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold truncate">
              {formatDeg(r.betaEffDeg)}° / {r.step?.base === 'front' ? 'FRONT' : 'REAR'}
            </span>
          </div>
        </div>

        {/* Massive USB/Projection Output */}
        <div className="flex flex-col items-end shrink-0 relative z-10">
          <span className="text-2xl sm:text-3xl font-bold text-amber-400 tracking-tight amber-glow tabular-nums">
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
          
          <div className="flex flex-col items-end mt-1">
            {deltaTurnsText ? (
               <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{deltaText}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded neu-concave border border-black/40 text-amber-400 font-bold tracking-widest">{deltaTurnsText}</span>
               </div>
            ) : deltaText ? (
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
                {deltaText}
              </span>
            ) : null}
            
            {(showAdvancedStepOverrides || r.step?.usbId) && effectiveUsb && (
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-0.5">
                {effectiveUsb.name}
              </span>
            )}
            {(showAdvancedStepOverrides || r.step?.machineId) && effectiveMachine && (
              <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold mt-0.5">
                {effectiveMachine.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== Edit State (Collapsible) ===== */}
      {r.step && onUpdateStep && (
        <div 
          className={`relative z-10 neu-concave overflow-hidden transition-all duration-300 ease-in-out border border-black/40 border-t-0 rounded-b-3xl -mt-6 pt-6 ${isExpanded ? 'max-h-[500px] opacity-100 pointer-events-auto shadow-inner' : 'max-h-0 opacity-0 border-transparent pointer-events-none'}`}
          
        >
          <div className="px-4 sm:px-5 pb-5 pt-3 flex flex-col gap-4">
            
            {/* Steppers */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 flex flex-col gap-2 w-full">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1 flex justify-between">
                  <span>Wheel Diameter</span>
                  <span className="text-white/30 hover:text-white cursor-pointer" onClick={() => setSheetConfig({ type: 'wheel', stepId })}>Change</span>
                </label>
                <div className="neu-concave border border-black/40 rounded-2xl flex items-center justify-between p-1 shadow-inner">
                  <button 
                    className="w-12 h-10 rounded-xl neu-button flex items-center justify-center text-white/80 font-bold transition active:scale-95"
                    onClick={() => onUpdateWheel?.(r.wheel.id, { D: Math.max(100, (r.wheel.D || 250) - 1) })}
                  >-</button>
                  <span className="text-sm tabular-nums font-bold text-white tracking-wider">{r.wheel.D?.toFixed(1) || 250} mm</span>
                  <button 
                    className="w-12 h-10 rounded-xl neu-button flex items-center justify-center text-white/80 font-bold transition active:scale-95"
                    onClick={() => onUpdateWheel?.(r.wheel.id, { D: Math.min(300, (r.wheel.D || 250) + 1) })}
                  >+</button>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2 w-full">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1 flex justify-between">
                  <span>Micro-bevel (Δ°)</span>
                  <span className="text-white/30 hover:text-white cursor-pointer" onClick={() => onUpdateStep(stepId, { angleOffset: 0 })}>Reset</span>
                </label>
                <div className="neu-concave border border-black/40 rounded-2xl flex items-center justify-between p-1 shadow-inner">
                  <button 
                    className="w-12 h-10 rounded-xl neu-button flex items-center justify-center text-white/80 font-bold transition active:scale-95"
                    onClick={() => onUpdateStep(stepId, { angleOffset: Math.max(-5, (r.step!.angleOffset || 0) - 0.5) })}
                  >-</button>
                  <span className="text-sm tabular-nums font-bold text-white tracking-wider">{(r.step!.angleOffset || 0) > 0 ? '+' : ''}{(r.step!.angleOffset || 0).toFixed(1)}°</span>
                  <button 
                    className="w-12 h-10 rounded-xl neu-button flex items-center justify-center text-white/80 font-bold transition active:scale-95"
                    onClick={() => onUpdateStep(stepId, { angleOffset: Math.min(5, (r.step!.angleOffset || 0) + 0.5) })}
                  >+</button>
                </div>
              </div>
            </div>

            {/* Base Override */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Sharpening Base</label>
              <button 
                className="flex items-center justify-between w-full p-3.5 neu-button rounded-2xl text-xs font-semibold text-white/90 transition active:scale-[0.98]"
                onClick={() => setSheetConfig({ type: 'base', stepId })}
              >
                <span className="truncate tracking-wide">{r.step?.base === 'front' ? 'Front Base (Edge Trailing)' : 'Rear Base (Edge Leading)'}</span>
                <span className="text-white/30 ml-2">▼</span>
              </button>
            </div>

            {/* Advanced Step Overrides */}
            {showAdvancedStepOverrides && (
              <div className="flex items-center gap-4 pt-1">
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Machine Override</label>
                  <button 
                    className="flex items-center justify-between w-full p-3 neu-button rounded-2xl text-[11px] font-semibold text-white/80 transition active:scale-[0.98]"
                    onClick={() => setSheetConfig({ type: 'machine', stepId })}
                  >
                    <span className="truncate">{effectiveMachine?.name || 'Default Machine'}</span>
                    <span className="text-white/30 ml-2">▼</span>
                  </button>
                </div>
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Support Bar</label>
                  <button 
                    className="flex items-center justify-between w-full p-3 neu-button rounded-2xl text-[11px] font-semibold text-white/80 transition active:scale-[0.98]"
                    onClick={() => setSheetConfig({ type: 'usb', stepId })}
                  >
                    <span className="truncate">{effectiveUsb?.name || 'Default USB'}</span>
                    <span className="text-white/30 ml-2">▼</span>
                  </button>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex justify-between items-center mt-3 pt-5 border-t border-black/40">
              <div className="flex gap-3">
                <button 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${index === 0 ? 'bg-black/20 opacity-30 cursor-not-allowed text-white/30' : 'neu-button text-white active:scale-95'}`}
                  onClick={(e) => { e.stopPropagation(); onMoveStep?.(index, -1); }}
                  disabled={index === 0}
                >↑</button>
                <button 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${index === totalSteps - 1 ? 'bg-black/20 opacity-30 cursor-not-allowed text-white/30' : 'neu-button text-white active:scale-95'}`}
                  onClick={(e) => { e.stopPropagation(); onMoveStep?.(index, 1); }}
                  disabled={index === totalSteps - 1}
                >↓</button>
              </div>
              <button 
                className="px-5 h-12 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 font-bold text-xs transition active:scale-95 tracking-widest uppercase"
                onClick={(e) => { e.stopPropagation(); onDeleteStep?.(stepId); }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export function ProgressionView() {
  const wheelResults = useWheelResults();
  const wheels = useStore(useShallow((s) => s.wheels));
  const machines = useStore(useShallow((s) => s.machines));
  const usbs = useStore(useShallow((s) => s.usbs));
  const onUpdateStep = useStore((s) => s.updateStep);

  const [expandedStepId, setExpandedStepId] = React.useState<string | null>(null);
  const [sheetConfig, setSheetConfig] = React.useState<{ type: 'wheel' | 'machine' | 'usb' | 'base'; stepId: string } | null>(null);

  React.useEffect(() => {
    const handleCollapseAll = () => setExpandedStepId(null);
    window.addEventListener('collapseAll', handleCollapseAll);
    return () => window.removeEventListener('collapseAll', handleCollapseAll);
  }, []);

  return (
    <div className="flex flex-col gap-5 text-xs pb-10 w-full">
      {wheelResults.length === 0 && (
        <div className="text-xs text-white/60 border border-dashed border-white/10 rounded-3xl p-6 flex flex-col gap-3 items-center text-center neu-concave shadow-inner">
          <p>No sharpening steps defined yet.</p>
        </div>
      )}
      
      {wheelResults.map((r, index) => {
        const stepId = r.step?.id ?? r.wheel.id;
        const isExpanded = expandedStepId === stepId;
        const prevR = index > 0 ? wheelResults[index - 1] : undefined;

        return (
          <StepCard
            key={stepId}
            r={r}
            index={index}
            totalSteps={wheelResults.length}
            prevR={prevR}
            isExpanded={isExpanded}
            onToggleExpand={() => setExpandedStepId(isExpanded ? null : stepId)}
            setSheetConfig={setSheetConfig}
          />
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
