import type React from 'react';
import type { WheelResult } from '../types/core';

type ProgressionViewProps = {
  wheelResults: WheelResult[];
  heightMode: 'hn' | 'hr';
  angleSymbol: string;
  angleErrorById?: Record<string, number | null>;
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
}: ProgressionViewProps) {
  const formatDeg = (val: number) => val.toFixed(2).replace(/\.?0+$/, '');

  return (
    <div className="grid gap-1 md:grid-cols-2">
      {wheelResults.map((r, index) => {
        const key = r.step?.id ?? r.wheel.id;
        const angleOffset = r.step?.angleOffset ?? 0;
        const hasOffset = angleOffset !== 0;
        const notesText = r.step?.notes?.trim() ?? '';
        const angleError = angleErrorById?.[key] ?? null;
        const betaValueClass = hasOffset
          ? angleOffset > 0
            ? 'text-accent'
            : 'text-danger'
          : 'text-neutral-500';
        const betaLabelClass = hasOffset ? 'u-text-muted' : 'text-neutral-500';
        const offsetSign = angleOffset > 0 ? '+' : '';

        return (
          <div
            key={r.step?.id ?? r.wheel.id}
            className="border border-neutral-700 rounded bg-neutral-950/40 overflow-hidden motion-list-item"
            style={{ '--motion-order': index } as React.CSSProperties}
          >
            {/* ===== Header bar ===== */}
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 px-2 py-1.5 bg-neutral-900/70 min-h-[44px]">
              <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                {/* Step badge */}
                {r.step && (
                  <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[0.7rem] font-mono text-neutral-100 -ml-1">
                    {index + 1}
                  </div>
                )}
                {/* Wheel name */}
                <span className="text-[0.7rem] text-neutral-200 font-medium truncate leading-none">
                  {r.wheel.name}
                </span>
              </div>

              {/* Right side: diameter display */}
              <div className="flex items-center gap-1 flex-nowrap ml-auto text-[0.7rem] text-neutral-300 font-mono whitespace-nowrap">
                <span>D=</span>
                <span>{r.wheel.D?.toFixed(2)}</span>
                <span>mm</span>
              </div>
            </div>

            {/* ===== Wheel Card Body ===== */}
            <div className="px-2 py-2 flex flex-row flex-wrap items-stretch gap-2">
              {heightMode === 'hn' ? (
                <div className="border border-neutral-700 rounded p-2 flex flex-col gap-1 w-[9rem] min-h-[40px] self-start shrink-0">
                  <div className="flex items-center text-[0.75rem] text-neutral-300">
                    <span>
                      {r.step?.base === 'front'
                        ? `Base F <-> USB top`
                        : `Base R <-> USB top`}
                    </span>
                  </div>
                  <div className="font-mono text-sm text-neutral-100">
                    hn = {r.hnBase.toFixed(2)} mm
                  </div>
                  <div className={`text-[0.7rem] ${betaLabelClass}`}>
                    {angleSymbol} ={' '}
                    <span className={betaValueClass}>
                      {formatDeg(r.betaEffDeg)}°
                    </span>
                    {hasOffset && (
                      <span className={betaValueClass}>
                        {' '}
                        ({offsetSign}
                        {formatDeg(angleOffset)}°)
                      </span>
                    )}
                    {angleError != null && (
                      <span className="ml-1 text-neutral-500">
                        (calib +/-{formatDeg(angleError)}°)
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-neutral-700 rounded p-2 flex flex-col gap-1 w-[9rem] min-h-[40px] self-start shrink-0">
                  <div className="flex items-center text-[0.75rem] text-neutral-300">
                    <span>{`Wheel <-> USB top`}</span>
                  </div>
                  <div className="font-mono text-sm text-neutral-100">
                    hr = {r.hrWheel.toFixed(2)} mm
                  </div>
                  <div className={`text-[0.7rem] ${betaLabelClass}`}>
                    {angleSymbol} ={' '}
                    <span className={betaValueClass}>
                      {formatDeg(r.betaEffDeg)}°
                    </span>
                    {hasOffset && (
                      <span className={betaValueClass}>
                        {' '}
                        ({offsetSign}
                        {formatDeg(angleOffset)}°)
                      </span>
                    )}
                    {angleError != null && (
                      <span className="ml-1 text-neutral-500">
                        (calib +/-{formatDeg(angleError)}°)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Notes panel (view mode) */}
              <div className="flex-1 border border-neutral-700 rounded p-2 min-h-[40px] bg-neutral-950/20">
                {notesText ? (
                  <div className="text-[0.8rem] text-neutral-100 whitespace-pre-wrap break-words">
                    {notesText}
                  </div>
                ) : (
                  <div className="text-[0.8rem] text-neutral-500">No notes</div>
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
