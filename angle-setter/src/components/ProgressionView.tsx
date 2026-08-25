import type React from 'react';
import type { WheelResult } from '../types/core';

type ProgressionViewProps = {
  wheelResults: WheelResult[];
  heightMode: 'hn' | 'hr';
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
  angleSymbol,
  angleErrorById,
  cardMinHeight,
  bodyPaddingX = 'px-3',
  bodyPaddingY = 'py-2',
  bodyGap = 'gap-2',
}: ProgressionViewProps) {
  const formatDeg = (val: number) => val.toFixed(2).replace(/\.?0+$/, '');

  return (
    <div className="grid card-grid md:grid-cols-2">
      {wheelResults.map((r, index) => {
        const key = r.step?.id ?? r.wheel.id;
        const angleOffset = r.step?.angleOffset ?? 0;
        const hasOffset = angleOffset !== 0;
        const notesText = r.step?.notes?.trim() ?? '';
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
            className="card-elevated overflow-hidden motion-list-item"
            style={
              {
                '--motion-order': index,
                minHeight: cardMinHeight,
              } as React.CSSProperties
            }
          >
            {/* ===== Header bar ===== */}
            <div className="card-elevated__header wheel-card__header flex flex-wrap items-center gap-x-1 gap-y-1 px-2 py-1.5 min-h-[44px]">
              <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                {/* Step badge */}
                {r.step && (
                  <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[0.7rem] font-mono text-neutral-50 -ml-1 shadow-sm">
                    {index + 1}
                  </div>
                )}
                {/* Wheel name */}
                <span className="text-[0.7rem] text-neutral-100 font-medium truncate leading-none">
                  {r.wheel.name}
                </span>
              </div>

              {/* Right side: diameter display */}
              <div className="flex items-center gap-1 flex-nowrap ml-auto text-[0.7rem] text-neutral-100 font-mono whitespace-nowrap">
                <span>D=</span>
                <span>{r.wheel.D?.toFixed(2)}</span>
                <span>mm</span>
              </div>
            </div>

            {/* ===== Wheel Card Body ===== */}
            <div
              className={`${bodyPaddingX} ${bodyPaddingY} flex flex-row flex-wrap items-stretch ${bodyGap} u-surface`}
            >
              {heightMode === 'hn' ? (
                <div className="border u-border rounded p-2 flex flex-col gap-1 w-[9rem] min-h-[40px] self-start shrink-0 u-surface">
                  <div className="flex items-center text-[0.75rem] u-text-muted">
                    <span>
                      {r.step?.base === 'front'
                        ? `Base F <-> USB top`
                        : `Base R <-> USB top`}
                    </span>
                  </div>
                  <div className="font-mono text-sm u-text">
                    hn = {r.hnBase.toFixed(2)} mm
                  </div>
                  <div className="text-[0.7rem] u-text-muted">
                    {angleSymbol} ={' '}
                    <span className={angleValueClass}>
                      {formatDeg(r.betaEffDeg)}°
                    </span>
                    {angleError != null && (
                      <span className="ml-1 text-neutral-500">
                        (calib ±{formatResidual(angleError)}°)
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border u-border rounded p-2 flex flex-col gap-1 w-[9rem] min-h-[40px] self-start shrink-0 u-surface">
                  <div className="flex items-center text-[0.75rem] u-text-muted">
                    <span>{`Wheel <-> USB top`}</span>
                  </div>
                  <div className="font-mono text-sm u-text">
                    hr = {r.hrWheel.toFixed(2)} mm
                  </div>
                  <div className="text-[0.7rem] u-text-muted">
                    {angleSymbol} ={' '}
                    <span className={angleValueClass}>
                      {formatDeg(r.betaEffDeg)}°
                    </span>
                    {angleError != null && (
                      <span className="ml-1 text-neutral-500">
                        (calib ±{formatResidual(angleError)}°)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Notes panel (view mode) */}
              <div className="flex-1 border u-border rounded p-2 min-h-[40px] u-surface">
                {notesText ? (
                  <div className="text-[0.8rem] u-text whitespace-pre-wrap break-words">
                    {notesText}
                  </div>
                ) : (
                  <div className="text-[0.8rem] u-text-muted">No notes</div>
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
