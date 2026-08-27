import * as React from 'react';
import type { GlobalState } from '../../types/core';
import { _nz } from '../../utils/numbers';
import { blurOnEnter } from '../../utils/dom';
import { BTN } from '../../ui/buttons';
import ExpandToggle from '../ExpandToggle';

export type GlobalSetupCardProps = {
  global: GlobalState;
  setGlobal: React.Dispatch<React.SetStateAction<GlobalState>>;
  isSetupPanelOpen: boolean;
  setIsSetupPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  heightMode?: 'hn' | 'hr';
  setHeightMode?: React.Dispatch<React.SetStateAction<'hn' | 'hr'>>;
  targetAngleSymbol?: string;
};

export function GlobalSetupCard({
  global,
  setGlobal,
  isSetupPanelOpen,
  setIsSetupPanelOpen,
  heightMode,
  setHeightMode,
  targetAngleSymbol = '\u03b2',
}: GlobalSetupCardProps) {
  const isProjectionMode = global.calcMode === 'projection';

  const toggleCalcMode = () => {
    setGlobal(g => ({
      ...g,
      calcMode: g.calcMode === 'projection' ? 'height' : 'projection',
    }));
  };

  const handleAngleStep = (delta: number) => {
    setGlobal(g => {
      const current = _nz(g.targetAngle, 15);
      const next = Math.max(1, Math.round((current + delta) * 10) / 10);
      return { ...g, targetAngle: next };
    });
  };

  const handleProjectionStep = (delta: number) => {
    setGlobal(g => {
      const current = _nz(g.projection, 120);
      const next = Math.max(10, Math.round((current + delta) * 100) / 100);
      return { ...g, projection: next };
    });
  };

  const handleFixedUsbRearStep = (delta: number) => {
    setGlobal(g => {
      const current = _nz(g.fixedUsbRear, _nz(g.fixedUsbHeight, 150));
      const next = Math.max(10, Math.round((current + delta) * 100) / 100);
      return { ...g, fixedUsbRear: next, fixedUsbHeight: next };
    });
  };

  const handleFixedUsbFrontStep = (delta: number) => {
    setGlobal(g => {
      const current = _nz(g.fixedUsbFront, _nz(g.fixedUsbHeight, 85));
      const next = Math.max(10, Math.round((current + delta) * 100) / 100);
      return { ...g, fixedUsbFront: next };
    });
  };

  return (
    <section className="panel-card panel-card--strong flex flex-col gap-0 max-w-xl motion-panel">
      <div className="panel-card__header flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold u-text panel-header">Global setup</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`${BTN.base} px-3 text-xs`}
            onClick={toggleCalcMode}
            title={
              isProjectionMode
                ? 'Switch to USB Height solver mode (fixed projection)'
                : 'Switch to Projection solver mode (fixed USB bar)'
            }
          >
            {isProjectionMode ? 'Projection mode' : 'USB height mode'}
          </button>
          <ExpandToggle
            expanded={isSetupPanelOpen}
            onToggle={() => setIsSetupPanelOpen(open => !open)}
            labelExpanded="Collapse setup"
            labelCollapsed="Expand setup"
          />
        </div>
      </div>

      {/* Collapsed Compact Summary View */}
      {!isSetupPanelOpen && (
        <div className="panel-card__body py-2 px-3 flex flex-wrap items-center justify-between gap-y-1 gap-x-3 text-xs u-text-muted select-text">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
            {isProjectionMode ? (
              <>
                <span>
                  <span className="text-neutral-500 font-sans text-[0.7rem] mr-1">
                    Rear {heightMode === 'hr' ? 'hr' : 'hn'}:
                  </span>
                  <span className="text-neutral-200 font-semibold">
                    {(global.fixedUsbRear ?? global.fixedUsbHeight ?? 150).toFixed(2)} mm
                  </span>
                </span>
                <span>
                  <span className="text-neutral-500 font-sans text-[0.7rem] mr-1">
                    Front {heightMode === 'hr' ? 'hr' : 'hn'}:
                  </span>
                  <span className="text-neutral-200 font-semibold">
                    {(global.fixedUsbFront ?? 85).toFixed(2)} mm
                  </span>
                </span>
                <span>
                  <span className="text-neutral-500 font-sans text-[0.7rem] mr-1">Ref:</span>
                  <span className="text-neutral-200">
                    {heightMode === 'hr' ? 'Wheel' : 'Datum'}
                  </span>
                </span>
              </>
            ) : (
              <>
                <span>
                  <span className="text-neutral-500 font-sans text-[0.7rem] mr-1">A:</span>
                  <span className="text-neutral-200 font-semibold">
                    {_nz(global.projection, 120).toFixed(2)} mm
                  </span>
                </span>
                <span>
                  <span className="text-neutral-500 font-sans text-[0.7rem] mr-1">Ref:</span>
                  <span className="text-neutral-200">
                    {heightMode === 'hr' ? 'Wheel' : 'Datum'}
                  </span>
                </span>
              </>
            )}

            <span>
              <span className="text-neutral-500 font-sans text-[0.7rem] mr-1">{targetAngleSymbol}:</span>
              <span className="text-accent font-semibold">
                {_nz(global.targetAngle, 15).toFixed(1)}°
              </span>
            </span>
          </div>

          <div className="text-[0.7rem] text-neutral-500 font-mono hidden sm:inline-flex items-center gap-1.5">
            <span>Ds: {global.usbDiameter} mm</span>
            <span>·</span>
            <span>Dj: {global.jig.Dj} mm</span>
          </div>
        </div>
      )}

      {/* Expanded Full Inputs View */}
      {isSetupPanelOpen && (
        <div className="panel-card__body flex flex-col gap-3">
          {/* Main Inputs */}
          {isProjectionMode ? (
            /* Projection Mode: 3 Inputs (USB Rear, USB Front, Target Angle) */
            <div className="grid grid-cols-2 min-[640px]:grid-cols-3 gap-2 sm:gap-3 text-sm">
              {/* USB Rear Height */}
              <div className="flex flex-col gap-1.5 rounded border u-border u-surface p-2 sm:p-2.5 col-span-1">
                <span className="text-xs font-medium u-text truncate">
                  USB Rear {heightMode === 'hr' ? 'hr' : 'hn'} (mm)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className="w-full rounded border u-border u-surface px-2 py-1 text-base font-mono text-center u-text focus:ring-1 focus:ring-accent"
                  value={global.fixedUsbRear ?? global.fixedUsbHeight ?? 150}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({
                      ...g,
                      fixedUsbRear: _nz(e.target.value, g.fixedUsbRear ?? 150),
                      fixedUsbHeight: _nz(e.target.value, g.fixedUsbRear ?? 150),
                    }))
                  }
                />
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    className="py-1 text-[0.7rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Subtract 5mm"
                    onClick={() => handleFixedUsbRearStep(-5)}
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.7rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Subtract 1mm"
                    onClick={() => handleFixedUsbRearStep(-1)}
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.7rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Add 1mm"
                    onClick={() => handleFixedUsbRearStep(1)}
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.7rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Add 5mm"
                    onClick={() => handleFixedUsbRearStep(5)}
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* USB Front Height */}
              <div className="flex flex-col gap-1.5 rounded border u-border u-surface p-2 sm:p-2.5 col-span-1">
                <span className="text-xs font-medium u-text truncate">
                  USB Front {heightMode === 'hr' ? 'hr' : 'hn'} (mm)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className="w-full rounded border u-border u-surface px-2 py-1 text-base font-mono text-center u-text focus:ring-1 focus:ring-accent"
                  value={global.fixedUsbFront ?? 85}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({
                      ...g,
                      fixedUsbFront: _nz(e.target.value, g.fixedUsbFront ?? 85),
                    }))
                  }
                />
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    className="py-1 text-[0.7rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Subtract 5mm"
                    onClick={() => handleFixedUsbFrontStep(-5)}
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.7rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Subtract 1mm"
                    onClick={() => handleFixedUsbFrontStep(-1)}
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.7rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Add 1mm"
                    onClick={() => handleFixedUsbFrontStep(1)}
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.7rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Add 5mm"
                    onClick={() => handleFixedUsbFrontStep(5)}
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Target Angle */}
              <div className="flex flex-col gap-1.5 rounded border u-border u-surface p-2 sm:p-2.5 col-span-2 min-[640px]:col-span-1">
                <span className="text-xs font-medium u-text truncate">
                  Target angle {targetAngleSymbol}° (/side)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className="w-full rounded border u-border u-surface px-2 py-1 text-base font-mono text-center u-text focus:ring-1 focus:ring-accent"
                  value={global.targetAngle}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({ ...g, targetAngle: _nz(e.target.value, g.targetAngle) }))
                  }
                />
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    className="py-1 text-[0.65rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Subtract 1.0°"
                    onClick={() => handleAngleStep(-1)}
                  >
                    -1°
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.6rem] sm:text-[0.7rem] font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center px-0"
                    title="Subtract 0.5°"
                    onClick={() => handleAngleStep(-0.5)}
                  >
                    -0.5°
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.6rem] sm:text-[0.7rem] font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center px-0"
                    title="Add 0.5°"
                    onClick={() => handleAngleStep(0.5)}
                  >
                    +0.5°
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.65rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Add 1.0°"
                    onClick={() => handleAngleStep(1)}
                  >
                    +1°
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Height Mode: 2 Inputs (Projection A, Target Angle) */
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
              {/* Projection (A) */}
              <div className="flex flex-col gap-1.5 rounded border u-border u-surface p-2 sm:p-2.5">
                <span className="text-xs font-medium u-text truncate">Projection A (mm)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className="w-full rounded border u-border u-surface px-2 py-1 text-base font-mono text-center u-text focus:ring-1 focus:ring-accent"
                  value={global.projection}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({ ...g, projection: _nz(e.target.value, g.projection) }))
                  }
                />
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    className="py-1 text-[0.7rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Subtract 5mm"
                    onClick={() => handleProjectionStep(-5)}
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.7rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Subtract 1mm"
                    onClick={() => handleProjectionStep(-1)}
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.7rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Add 1mm"
                    onClick={() => handleProjectionStep(1)}
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.7rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Add 5mm"
                    onClick={() => handleProjectionStep(5)}
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Target Angle (Beta) */}
              <div className="flex flex-col gap-1.5 rounded border u-border u-surface p-2 sm:p-2.5">
                <span className="text-xs font-medium u-text truncate">
                  Target angle {targetAngleSymbol}° (/side)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className="w-full rounded border u-border u-surface px-2 py-1 text-base font-mono text-center u-text focus:ring-1 focus:ring-accent"
                  value={global.targetAngle}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({ ...g, targetAngle: _nz(e.target.value, g.targetAngle) }))
                  }
                />
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    className="py-1 text-[0.65rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Subtract 1.0°"
                    onClick={() => handleAngleStep(-1)}
                  >
                    -1°
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.6rem] sm:text-[0.7rem] font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center px-0"
                    title="Subtract 0.5°"
                    onClick={() => handleAngleStep(-0.5)}
                  >
                    -0.5°
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.6rem] sm:text-[0.7rem] font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center px-0"
                    title="Add 0.5°"
                    onClick={() => handleAngleStep(0.5)}
                  >
                    +0.5°
                  </button>
                  <button
                    type="button"
                    className="py-1 text-[0.65rem] sm:text-xs font-mono rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 text-center"
                    title="Add 1.0°"
                    onClick={() => handleAngleStep(1)}
                  >
                    +1°
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Setup Options */}
          <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800">
            {/* Height Readout / Reference Mode (hn vs hr) */}
            {heightMode && setHeightMode && (
              <div className="flex items-center justify-between rounded border border-neutral-800 bg-neutral-950/60 p-2 text-xs">
                <div className="flex flex-col">
                  <span className="font-semibold text-neutral-200">
                    {isProjectionMode ? 'Fixed USB reference' : 'USB height reference'}
                  </span>
                  <span className="text-[0.7rem] u-text-muted">
                    {heightMode === 'hn'
                      ? 'Datum (Base to USB top)'
                      : 'Wheel (Perimeter to USB top)'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                      heightMode === 'hn'
                        ? 'border-accent bg-accent-tint text-accent font-semibold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                    }`}
                    onClick={() => {
                      setHeightMode('hn');
                      setGlobal(g => ({ ...g, fixedUsbMode: 'hn' }));
                    }}
                    title="Datum Base Height (hn) - distance from machine datum base to USB top"
                  >
                    Datum
                  </button>
                  <button
                    type="button"
                    className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                      heightMode === 'hr'
                        ? 'border-accent bg-accent-tint text-accent font-semibold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                    }`}
                    onClick={() => {
                      setHeightMode('hr');
                      setGlobal(g => ({ ...g, fixedUsbMode: 'hr' }));
                    }}
                    title="Wheel Top Height (hr) - distance from wheel surface to USB top"
                  >
                    Wheel
                  </button>
                </div>
              </div>
            )}

            {/* Advanced Diameters */}
            <div className="grid grid-cols-2 gap-2 text-sm pt-1 border-t border-neutral-800/80">
              <label className="flex flex-col gap-1">
                <span className="u-text text-xs">USB diameter Ds (mm)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  className="rounded border u-border u-surface px-2 py-1 text-sm font-mono u-text"
                  value={global.usbDiameter}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({
                      ...g,
                      usbDiameter: _nz(e.target.value, g.usbDiameter),
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="u-text text-xs">Jig diameter Dj (mm)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  className="rounded border u-border u-surface px-2 py-1 text-sm font-mono u-text"
                  value={global.jig.Dj}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({
                      ...g,
                      jig: { ...g.jig, Dj: _nz(e.target.value, g.jig.Dj) },
                    }))
                  }
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default GlobalSetupCard;
