import type React from 'react';
import type { CalcMode, WheelResult } from '../types/core';

type ProgressionViewProps = {
  wheelResults: WheelResult[];
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
        const angleOffset = r.step?.angleOffset ?? 0;
        const hasOffset = angleOffset !== 0;
        const angleError = angleErrorById?.[key] ?? null;
        const angleValueClass = hasOffset
          ? angleOffset > 0
            ? 'text-accent'
            : 'text-danger'
          : 'u-text';
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
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {/* Step badge */}
                {r.step && (
                  <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[0.7rem] font-mono text-neutral-50 shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                )}
                {/* Wheel name */}
                <span className="text-xs text-neutral-100 font-medium truncate leading-none min-w-0 flex-1">
                  {r.wheel.name}
                </span>
              </div>

              {/* Right side: diameter display */}
              <div className="flex items-center gap-1 flex-nowrap shrink-0 text-xs text-neutral-100 font-mono whitespace-nowrap ml-2">
                <span className="text-neutral-400 text-[0.7rem]">D=</span>
                <span>{r.wheel.D?.toFixed(2)}</span>
                <span className="text-neutral-400 text-[0.7rem]">mm</span>
              </div>
            </div>

            {/* ===== Wheel Card Body ===== */}
            <div
              className={`card-elevated__body ${bodyPaddingX} ${bodyPaddingY} flex items-center justify-between ${bodyGap} u-surface`}
            >
              {/* Left: Height or Projection readout */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[0.7rem] u-text-muted">
                  {isProjectionMode
                    ? heightMode === 'hr'
                      ? r.step?.base === 'front'
                        ? 'Required projection A (Front · Wheel)'
                        : 'Required projection A (Rear · Wheel)'
                      : r.step?.base === 'front'
                      ? 'Required projection A (Front · Datum)'
                      : 'Required projection A (Rear · Datum)'
                    : heightMode === 'hn'
                    ? r.step?.base === 'front'
                      ? 'Datum (Front) ↔ USB top'
                      : 'Datum (Rear) ↔ USB top'
                    : 'Wheel ↔ USB top'}
                </span>
                <span className="font-mono text-base sm:text-lg font-bold u-text tracking-tight">
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
              </div>

              {/* Right: Effective Angle & Tolerance */}
              <div className="flex flex-col items-end gap-0.5 text-right shrink-0">
                <span className="text-xs u-text-muted">
                  {angleSymbol} ={' '}
                  <span className={`font-semibold ${angleValueClass}`}>
                    {formatDeg(r.betaEffDeg)}°
                  </span>
                </span>
                {angleError != null && (
                  <span className="text-[0.65rem] text-neutral-500">
                    (calib ±{formatResidual(angleError)}°)
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProgressionView;
