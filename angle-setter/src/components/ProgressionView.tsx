import type React from 'react';
import type { CalcMode, WheelResult, MachineConfig, UsbConfig } from '../types/core';
import { IconEdgeLeading, IconEdgeTrailing } from '../icons';

type ProgressionViewProps = {
  wheelResults: WheelResult[];
  machines: MachineConfig[];
  defaultMachineId?: string;
  usbs: UsbConfig[];
  globalUsbId: string;
  heightMode: 'hn' | 'hr';
  calcMode?: CalcMode;
  angleSymbol: string;
  angleErrorById?: Record<string, number | null>;
  cardMinHeight?: number;
  bodyPaddingX?: string;
  bodyPaddingY?: string;
  bodyGap?: string;
};

/**
 * View-mode renderer for the progression results grid.
 * Stateless: all calculations are precomputed in App.
 */
function ProgressionView({
  wheelResults,
  machines,
  defaultMachineId,
  usbs,
  globalUsbId,
  heightMode,
  calcMode = 'height',
  angleSymbol,
  angleErrorById,
  cardMinHeight,
  bodyPaddingX = 'px-3',
  bodyPaddingY = 'py-2',
  bodyGap = 'gap-2',
}: ProgressionViewProps) {
  const formatDeg = (val: number) => val.toFixed(2).replace(/\.?0+$/, '');
  const isProjectionMode = calcMode === 'projection';

  return (
    <div className="flex flex-col card-stack text-xs">
      {wheelResults.map((r, index) => {
        const key = r.step?.id ?? r.wheel.id;
        const effectiveMachineId = r.step?.machineId || defaultMachineId;
        const effectiveMachine = machines.find(m => m.id === effectiveMachineId);
        const angleOffset = r.step?.angleOffset ?? 0;
        const hasOffset = angleOffset !== 0;
        const angleError = angleErrorById?.[key] ?? null;
        const angleValueClass = hasOffset
          ? angleOffset > 0
            ? 'text-accent'
            : 'text-danger'
          : 'u-text';

        let deltaInfo: React.ReactNode = null;
        if (index > 0 && r.step && wheelResults[index - 1].step && !isProjectionMode) {
          const prev = wheelResults[index - 1];
          const currUsbId = r.step.usbId || globalUsbId;
          const prevUsbId = prev.step?.usbId || globalUsbId;
          if (currUsbId === prevUsbId) {
            const deltaH = r.hnBase - prev.hnBase;
            const absDelta = Math.abs(deltaH);
            const isUp = deltaH >= 0;
            const usb = usbs.find(u => u.id === currUsbId);
            
            let turnsInfo = '';
            if (usb?.threadPitch && usb.threadPitch > 0) {
              const totalTurns = absDelta / usb.threadPitch;
              const wholeTurns = Math.trunc(totalTurns);
              const remainderTurns = totalTurns - wholeTurns;
              if (usb.microAdjustMarks && usb.microAdjustMarks > 0) {
                 const notches = Math.round(remainderTurns * usb.microAdjustMarks);
                 if (notches === usb.microAdjustMarks) {
                    turnsInfo = `${isUp ? '↑' : '↓'} ${wholeTurns + 1}t 0n`;
                 } else {
                    turnsInfo = `${isUp ? '↑' : '↓'} ${wholeTurns}t ${notches}n`;
                 }
              } else {
                 turnsInfo = `${isUp ? '↑' : '↓'} ${totalTurns.toFixed(2)}t`;
              }
            }

            deltaInfo = (
              <div className="flex flex-col items-center justify-center text-center px-1">
                <span className={`text-[11px] font-mono font-bold ${absDelta > 0.005 ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Δ {deltaH > 0 ? '+' : ''}{deltaH.toFixed(2)} mm
                </span>
                {turnsInfo && absDelta > 0.005 && (
                  <span className="text-[10px] font-mono text-neutral-500 leading-tight">
                    {turnsInfo}
                  </span>
                )}
              </div>
            );
          }
        }
        const formatResidual = (val: number) => {
          if (!Number.isFinite(val)) return '';
          const abs = Math.abs(val);
          if (abs === 0) return '0';
          const fixed = abs.toFixed(12); // ensure fractional part is available without scientific notation
          const [intPart, fracPartRaw = ''] = fixed.split('.');
          const firstIdx = fracPartRaw.split('').findIndex(ch => ch !== '0');

          if (firstIdx === -1) {
            // No fractional significance
            return intPart;
          }

          const dp = firstIdx + 1; // keep through the first non-zero digit
          const rounded = abs.toFixed(dp);
          // Trim trailing ".0" if rounding carried into an integer (e.g., 0.99996 -> 1)
          return rounded.replace(/\.0+$/, '');
        };

        return (
          <div
            key={r.step?.id ?? r.wheel.id}
            className="card-elevated flex flex-col motion-list-item overflow-hidden"
            style={
              {
                '--motion-order': index,
                minHeight: cardMinHeight,
              } as React.CSSProperties
            }
          >
                        {/* ===== Header bar ===== */}
            <div className="card-elevated__header wheel-card__header flex flex-nowrap items-center justify-between gap-1.5 px-2 py-1.5 min-h-[40px]">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Step badge */}
                {r.step && (
                  <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[0.7rem] font-mono text-neutral-50 shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                )}
                {/* Direction Icon */}
                {r.step && (
                  <div className="flex items-center shrink-0" title={r.step.base === 'rear' ? 'Edge Leading' : 'Edge Trailing'}>
                    {r.step.base === 'rear' ? <IconEdgeLeading className="w-4 h-4 text-accent/80" /> : <IconEdgeTrailing className="w-4 h-4 text-sky-400/80" />}
                  </div>
                )}
                {/* Wheel name & badges */}
                <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                  <span className="text-xs text-neutral-100 font-medium truncate leading-none">
                    {r.wheel.name}
                  </span>
                </div>
              </div>
              {hasOffset && (
                <div className="shrink-0 ml-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${angleOffset > 0 ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'}`}>
                    {angleOffset > 0 ? '+' : ''}{angleOffset}°
                  </span>
                </div>
              )}
            </div>

            {/* ===== Wheel Card Body ===== */}
            <div
              className={`card-elevated__body flex-col justify-center ${bodyGap} ${bodyPaddingX} ${bodyPaddingY} u-surface`}
            >
              {/* Top Row: Readout and Angle */}
              <div className="flex items-center justify-between w-full">
                {/* Left: Height or Projection readout */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-base sm:text-lg font-bold u-text tracking-tight leading-none">
                      {isProjectionMode ? (
                        r.isReachable !== false && r.requiredProjectionA != null ? (
                          `A = ${r.requiredProjectionA.toFixed(2)} mm`
                        ) : (
                          <span className="text-danger text-sm sm:text-base">Out of range</span>
                        )
                      ) : heightMode === 'hn' ? (
                        `hn = ${r.hnBase.toFixed(2)} mm`
                      ) : (
                        `hr = ${r.hrWheel.toFixed(2)} mm`
                      )}
                    </span>
                    {isProjectionMode && r.requiredJigAdjustmentMm != null && (
                      <span className="text-[10px] font-mono text-neutral-400 mt-1 uppercase tracking-widest leading-none">
                        JIG: {r.requiredJigAdjustmentMm > 0 ? '+' : ''}{r.requiredJigAdjustmentMm.toFixed(2)} mm
                        {r.requiredJigTurns != null && ` (${r.requiredJigTurns > 0 ? '+' : ''}${r.requiredJigTurns.toFixed(1)} turns)`}
                      </span>
                    )}
                  </div>
                </div>

                {deltaInfo && (
                  <div className="flex-1 flex justify-center shrink-0">
                    {deltaInfo}
                  </div>
                )}

                {/* Right: Effective Angle & Tolerance */}
                <div className="flex flex-col items-end text-right flex-1 shrink-0">
                  <span className="text-sm font-semibold u-text leading-none">
                    {angleSymbol} ={' '}
                    <span className={angleValueClass}>
                      {formatDeg(r.betaEffDeg)}°
                    </span>
                  </span>

                  {angleError != null && (
                    <span className="text-[0.65rem] text-neutral-500 mt-1 leading-none">
                      (calib ±{formatResidual(angleError)}°)
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row: Hardware Overrides / Base Info */}
              <div className="flex items-center justify-between w-full pt-1.5 border-t border-neutral-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] uppercase font-bold text-neutral-400 tracking-wider">
                    {r.step?.base === 'front' ? 'FRONT BASE' : 'REAR BASE'}
                  </span>
                  {effectiveMachine && (
                    <>
                      <span className="text-[0.65rem] text-neutral-600">&bull;</span>
                      <span className="text-[0.65rem] uppercase font-bold text-primary tracking-wider">
                        {effectiveMachine.name}
                      </span>
                    </>
                  )}
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
        );
      })}
    </div>
  );
}

export default ProgressionView;
