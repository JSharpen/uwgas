import { StepperControl } from "./ui/StepperControl";
import { useUIStore } from "../state/uiStore";
import * as React from 'react';
import type { WheelResult } from '../types/core';
import { IconEdgeLeading, IconEdgeTrailing } from '../icons';
import { ModalSelector } from './ui/ModalSelector';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../state/store';
import { useWheelResults } from '../services/calculationService';
import ExpandableCard from './ui/ExpandableCard';
import { Tag } from './ui';
import { isWheelOverdue, getMeasurementCountdownText } from '../utils/wheelWear';
import { computeNutAdjustment } from '../math/tormek';

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
  
  prevR,
  isExpanded,
  onToggleExpand,
  setSheetConfig,
}: StepCardProps) {
  const heightMode = useStore((s) => s.heightMode);
  const isProjectionMode = useStore((s) => s.global.calcMode === 'projection');
  const showMachineOverrides = useStore((s) => s.global.showMachineOverrides);
  const showUsbOverrides = useStore((s) => s.global.showUsbOverrides);
  const globalMachineId = useStore((s) => s.global.activeMachineId);
  const globalUsbId = useStore((s) => s.global.activeUsbId);
  const globalJigId = useStore((s) => s.global.activeJigId);
  const defaultMachineId = useStore((s) => s.defaultMachineId);
  const machines = useStore(useShallow((s) => s.machines));
  const usbs = useStore(useShallow((s) => s.usbs));
  const jigs = useStore(useShallow((s) => s.jigs));
  const onUpdateStep = useStore((s) => s.updateStep);
  const onUpdateWheel = useStore((s) => s.updateWheel);
  const stepId = r.step?.id ?? r.wheel.id;
  const cardRef = React.useRef<HTMLDivElement>(null);
  const formatDeg = (val: number) => val.toFixed(2).replace(/\.?0+$/, '');

  const effectiveSessionMachineId = globalMachineId || defaultMachineId;

  const effectiveMachine = r.step?.machineId
    ? machines.find(m => m.id === r.step!.machineId)
    : machines.find(m => m.id === effectiveSessionMachineId);

  const angleOffset = r.step?.angleOffset ?? 0;
  const hasOffset = angleOffset !== 0;
  const effectiveUsb = usbs.find(u => u.id === (r.step?.usbId || globalUsbId));
  const effectiveJig = jigs?.find(j => j.id === globalJigId);
  const countdownText = getMeasurementCountdownText(r.wheel);

  const prevEffectiveMachineId = index === 0 ? null : (prevR?.step?.machineId || effectiveSessionMachineId);
  const currEffectiveMachineId = r.step?.machineId || effectiveSessionMachineId;
  const isMachineChanged = currEffectiveMachineId !== prevEffectiveMachineId;

  const prevEffectiveUsbId = index === 0 ? null : (prevR?.step?.usbId || globalUsbId);
  const currEffectiveUsbId = r.step?.usbId || globalUsbId;
  const isUsbChanged = currEffectiveUsbId !== prevEffectiveUsbId;

  let deltaText = null;
  let deltaTurnsText = null;

  if (prevR) {
    if (!isProjectionMode) {
      // Relative nut adjustment is valid on the same USB, even across base transitions or machine swaps
      if (!isUsbChanged) {
        if (prevR.tonInput && r.tonInput) {
          const threadPitch = effectiveUsb?.threadPitch || 1;
          const nutAdj = computeNutAdjustment(prevR.tonInput, r.tonInput, threadPitch);
          
          if (Math.abs(nutAdj.distanceMm) >= 0.01) {
            const diffHn = nutAdj.distanceMm;
            deltaText = `Δ ${diffHn > 0 ? '+' : ''}${diffHn.toFixed(2)} MM`;
            
            if (effectiveUsb?.threadPitch) {
              const turns = nutAdj.turns;
              if (effectiveUsb.microAdjustMarks) {
                let fullTurns = Math.floor(turns);
                let marks = Math.round((turns - fullTurns) * effectiveUsb.microAdjustMarks * 2) / 2;
                if (marks === effectiveUsb.microAdjustMarks) {
                  fullTurns += 1;
                  marks = 0;
                }
                if (fullTurns > 0 && marks > 0) {
                  deltaTurnsText = `${nutAdj.direction} ${fullTurns}T ${marks}M`;
                } else if (fullTurns > 0) {
                  deltaTurnsText = `${nutAdj.direction} ${fullTurns}T`;
                } else if (marks > 0) {
                  deltaTurnsText = `${nutAdj.direction} ${marks}M`;
                }
              } else {
                deltaTurnsText = `${nutAdj.direction} ${turns.toFixed(1)}T`;
              }
            }
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
    <ExpandableCard
      ref={cardRef}
      isExpanded={isExpanded}
      scrollOnExpand
      onToggle={onToggleExpand}
      index={index}
      className="relative motion-list-item scroll-m-[120px] sm:scroll-m-[160px]"
      style={{ viewTransitionName: `step-${stepId}` } as React.CSSProperties}
      headerClassName="flex flex-col p-3.5 relative z-10 w-full"
      headerStyle={{ minHeight: 'var(--step-card-height, 6.75rem)' }}
      header={
        <>
          {/* Top Row: Identity (Step Number, Wheel Name, Grit) */}
          <div className="flex items-center gap-2 min-w-0 w-full mb-1.5">
            {r.step && (
              <div className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-[10px] font-bold tabular-nums text-white border border-black/60 shadow-inner shrink-0">
                {index + 1}
              </div>
            )}
            <span className={`text-base font-semibold tracking-wide truncate transition-colors ${isExpanded ? 'text-amber-400' : 'text-white'}`}>
              {r.wheel.name}
            </span>
            {r.wheel.grit && (
              <Tag intent="default" appearance="outline" className="shrink-0 border-white/20 text-white/70">
                {r.wheel.grit.startsWith('#') ? r.wheel.grit : `#${r.wheel.grit}`}
              </Tag>
            )}
          </div>

          {/* Main Content Row */}
          <div className="flex items-end justify-between w-full mt-2">
            {/* Left Column: Stacked Hardware Tags + Angle Properties */}
            <div className="flex flex-col items-start gap-1.5 flex-1 min-w-0 pr-3 sm:pr-3.5 pb-0.5">
              
              {/* Hardware Tags */}
              {(showMachineOverrides || showUsbOverrides || r.step?.machineId || r.step?.usbId) && (
                <div className="flex items-center gap-1.5 flex-wrap w-full">
                  {(showMachineOverrides || r.step?.machineId) && effectiveMachine && (
                    <Tag 
                      intent={isMachineChanged ? 'warning' : 'default'} 
                      appearance={isMachineChanged ? 'solid' : 'ghost'} bold
                      uppercase={false}
                      className="shrink-0"
                    >
                      {effectiveMachine.name}
                    </Tag>
                  )}
                  {(showUsbOverrides || r.step?.usbId) && effectiveUsb && (
                    <Tag 
                      intent={isUsbChanged ? 'warning' : 'default'} 
                      appearance={isUsbChanged ? 'solid' : 'ghost'}
                      uppercase={false}
                      className="shrink-0"
                    >
                      {effectiveUsb.name}
                    </Tag>
                  )}
                </div>
              )}

              {/* Angle and Diameter */}
              <div className="flex items-center gap-2 flex-wrap w-full">
                {hasOffset && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 shadow-sm ${angleOffset > 0 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/20' : 'bg-danger/20 text-danger border border-danger/20'}`}>
                    {angleOffset > 0 ? '+' : ''}{angleOffset.toFixed(1)}°
                  </span>
                )}
                {r.step && (
                  <div className="flex items-center shrink-0 ml-0.5" title={r.step.base === 'rear' ? 'Edge Leading' : 'Edge Trailing'}>
                    {r.step.base === 'rear' ? <IconEdgeLeading className="w-3.5 h-3.5 text-[var(--color-accent)] opacity-80" /> : <IconEdgeTrailing className="w-3.5 h-3.5 text-sky-400 opacity-80" />}
                  </div>
                )}
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold truncate">
                  {formatDeg(r.betaEffDeg)}° / {r.step?.base === 'front' ? 'FRONT' : 'REAR'}
                </span>
                <Tag 
                  intent="default" 
                  appearance="ghost"
                  badge={countdownText}
                  badgeIntent={isWheelOverdue(r.wheel) ? 'warning' : 'accent'}
                  className="shrink-0"
                >
                  Ø {r.wheel.D}mm
                </Tag>
              </div>
            </div>

            {/* Right Column: Output Gauge Pillar */}
            <div className="flex flex-col items-end justify-center shrink-0 pl-3 sm:pl-3.5 relative z-10 min-w-[88px] sm:min-w-[104px]">
              <span className="text-2xl sm:text-3xl font-bold text-amber-400 tracking-tight amber-glow tabular-nums leading-none">
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
              
              {(deltaTurnsText || deltaText) && (
                <div className="flex flex-col items-end mt-1.5">
                  {deltaTurnsText ? (
                    <Tag intent="warning" appearance="concave" numeric>{deltaTurnsText}</Tag>
                  ) : deltaText ? (
                    <span className="text-[10px] text-amber-400 uppercase tracking-wide font-bold">
                      {deltaText}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </>
      }
    >
      {r.step && onUpdateStep && (
        <div className="px-3.5 pb-5 pt-0 flex flex-col gap-4 mt-2" onClick={e => e.stopPropagation()}>
              
              {/* Row 1: Wheel & Base Selection */}
              <div className="flex items-center gap-4">
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Wheel</label>
                  <button 
                    className="flex items-center justify-between w-full p-3.5 neu-button rounded-2xl text-[11px] sm:text-xs font-semibold text-white/90 transition active:scale-[0.98]"
                    onClick={() => setSheetConfig({ type: 'wheel', stepId })}
                  >
                    <span className="truncate tracking-wide">Change Wheel</span>
                    <span className="text-white/30 ml-2">▼</span>
                  </button>
                </div>

                <div className="flex-1 flex flex-col gap-2 w-full">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Sharpening Base</label>
                  <button 
                    className="flex items-center justify-between w-full p-3.5 neu-button rounded-2xl text-[11px] sm:text-xs font-semibold text-white/90 transition active:scale-[0.98]"
                    onClick={() => setSheetConfig({ type: 'base', stepId })}
                  >
                    <span className="truncate tracking-wide">{r.step?.base === 'front' ? 'Front (Trailing)' : 'Rear (Leading)'}</span>
                    <span className="text-white/30 ml-2">▼</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Steppers */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <StepperControl
                  label="Wheel Diameter"
                  value={r.wheel.D || 250}
                  min={100}
                  max={300}
                  step={1}
                  onChange={(val) => onUpdateWheel?.(r.wheel.id, { D: val })}
                  unit="mm"
                  displayDecimals={1}
                />

                <StepperControl
                  label="Micro-bevel (Δ°)"
                  value={r.step!.angleOffset || 0}
                  min={-5}
                  max={5}
                  step={0.5}
                  onChange={(val) => onUpdateStep(stepId, { angleOffset: val })}
                  onReset={() => onUpdateStep(stepId, { angleOffset: 0 })}
                  unit="°"
                  displayDecimals={1}
                />
              </div>

              {/* Advanced Step Overrides */}
              {(showMachineOverrides || showUsbOverrides) && (
                <div className="flex items-center gap-4 pt-1">
                  {showMachineOverrides && (
                    <div className="flex-1 flex flex-col gap-2 w-full">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Machine Override</label>
                      <button 
                        className="flex items-center justify-between w-full p-3 neu-button rounded-2xl text-[11px] font-semibold text-white/80 transition active:scale-[0.98]"
                        onClick={() => setSheetConfig({ type: 'machine', stepId })}
                      >
                        <span className="truncate">
                          {r.step?.machineId ? <span className="text-amber-400">Override: </span> : <span className="text-white/40">Inherit: </span>}
                          {effectiveMachine?.name || 'Default Machine'}
                        </span>
                        <span className="text-white/30 ml-2">▼</span>
                      </button>
                    </div>
                  )}
                  {showUsbOverrides && (
                    <div className="flex-1 flex flex-col gap-2 w-full">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Support Bar</label>
                      <button 
                        className="flex items-center justify-between w-full p-3 neu-button rounded-2xl text-[11px] font-semibold text-white/80 transition active:scale-[0.98]"
                        onClick={() => setSheetConfig({ type: 'usb', stepId })}
                      >
                        <span className="truncate">
                          {r.step?.usbId ? <span className="text-amber-400">Override: </span> : <span className="text-white/40">Inherit: </span>}
                          {effectiveUsb?.name || 'Default USB'}
                        </span>
                        <span className="text-white/30 ml-2">▼</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
      )}
    </ExpandableCard>
  );
});

export function ProgressionView() {
  const wheelResults = useWheelResults();
  const wheels = useStore(useShallow((s) => s.wheels));
  const machines = useStore(useShallow((s) => s.machines));
  const usbs = useStore(useShallow((s) => s.usbs));
  const onUpdateStep = useStore((s) => s.updateStep);

  const expandedStepId = useUIStore(s => s.expandedStepId);
  const [sheetConfig, setSheetConfig] = React.useState<{ type: 'wheel' | 'machine' | 'usb' | 'base'; stepId: string } | null>(null);

  React.useEffect(() => {
    const handleCollapseAll = () => useUIStore.getState().setExpandedStepId(null);
    window.addEventListener('collapseAll', handleCollapseAll);
    return () => window.removeEventListener('collapseAll', handleCollapseAll);
  }, []);

  return (
    <div className="flex flex-col text-xs w-full" style={{ gap: 'var(--card-stack-gap, 1.25rem)' }}>
      {wheelResults.length === 0 && (
        <div className="text-xs text-white/60 border border-dashed border-white/5 rounded-[var(--ui-radius-mid)] p-[var(--ui-gap)] flex flex-col gap-3 items-center text-center neu-concave shadow-inner">
          <p>No sharpening steps defined yet.</p>
        </div>
      )}
      
      {wheelResults.map((r, index) => {
        const stepId = r.step?.id || `synthetic-${index}`;
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
            onToggleExpand={() => useUIStore.getState().setExpandedStepId(isExpanded ? null : stepId)}
            setSheetConfig={setSheetConfig}
          />
        );
      })}
      
      {/* Action Sheets for Inline Editing */}
      {sheetConfig && onUpdateStep && (
        <>
          <ModalSelector isOpen={sheetConfig.type === 'wheel'} onClose={() => setSheetConfig(null)} title="Select Wheel">
            
                {wheels.map(w => (
                  <ModalSelector.Item 
                    key={w.id} 
                    selected={wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.wheelId === w.id}
                    meta={
                      <span className="flex items-center gap-2">
                        {isWheelOverdue(w) && (
                          <Tag intent="warning" appearance="solid" className="px-1.5 leading-none">
                            Overdue
                          </Tag>
                        )}
                        <span>D:{w.D}mm</span>
                      </span>
                    }
                    onClick={() => {
                      onUpdateStep(sheetConfig.stepId, { wheelId: w.id });
                      setSheetConfig(null);
                    }}
                  >
                    {w.name}
                  </ModalSelector.Item>
                ))}
              </ModalSelector>
          
          <ModalSelector isOpen={sheetConfig.type === 'machine'} onClose={() => setSheetConfig(null)} title="Override Machine">
            
                <ModalSelector.Item 
                  selected={!wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.machineId}
                  onClick={() => {
                    onUpdateStep(sheetConfig.stepId, { machineId: undefined });
                    setSheetConfig(null);
                  }}
                >
                  Default Machine
                </ModalSelector.Item>
                {machines.map(m => (
                  <ModalSelector.Item 
                    key={m.id} 
                    selected={wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.machineId === m.id}
                    onClick={() => {
                      onUpdateStep(sheetConfig.stepId, { machineId: m.id });
                      setSheetConfig(null);
                    }}
                  >
                    {m.name}
                  </ModalSelector.Item>
                ))}
              </ModalSelector>

          <ModalSelector isOpen={sheetConfig.type === 'usb'} onClose={() => setSheetConfig(null)} title="Override Support Bar">
            
                <ModalSelector.Item 
                  selected={!wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.usbId}
                  onClick={() => {
                    onUpdateStep(sheetConfig.stepId, { usbId: undefined });
                    setSheetConfig(null);
                  }}
                >
                  Default USB
                </ModalSelector.Item>
                {usbs.map(u => (
                  <ModalSelector.Item 
                    key={u.id} 
                    selected={wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.usbId === u.id}
                    onClick={() => {
                      onUpdateStep(sheetConfig.stepId, { usbId: u.id });
                      setSheetConfig(null);
                    }}
                  >
                    {u.name}
                  </ModalSelector.Item>
                ))}
              </ModalSelector>

          <ModalSelector isOpen={sheetConfig.type === 'base'} onClose={() => setSheetConfig(null)} title="Sharpening Base">
            
                <ModalSelector.Item 
                  selected={wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.base !== 'rear'}
                  onClick={() => {
                    onUpdateStep(sheetConfig.stepId, { base: 'front' });
                    setSheetConfig(null);
                  }}
                >
                  Front Base (Edge Trailing)
                </ModalSelector.Item>
                <ModalSelector.Item 
                  selected={wheelResults.find(r => (r.step?.id ?? r.wheel.id) === sheetConfig.stepId)?.step?.base === 'rear'}
                  onClick={() => {
                    onUpdateStep(sheetConfig.stepId, { base: 'rear' });
                    setSheetConfig(null);
                  }}
                >
                  Rear Base (Edge Leading)
                </ModalSelector.Item>
              </ModalSelector>
        </>
      )}
    </div>
  );
}

export default ProgressionView;
