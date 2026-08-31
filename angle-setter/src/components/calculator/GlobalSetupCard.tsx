import * as React from 'react';
import type { GlobalState, MachineConstants } from '../../types/core';
import { DEFAULT_CONSTANTS } from '../../state/defaults';
import { computeSuggestedFrontUsbHeight } from '../../math/tormek';
import { _nz } from '../../utils/numbers';
import { blurOnEnter } from '../../utils/dom';
import { BTN } from '../../ui/buttons';
import ExpandToggle from '../ExpandToggle';
import MiniSelect from '../MiniSelect';

import type { JigConfig, UsbConfig, SessionStep } from "../../types/core";
type GlobalSetupCardProps = {
  jigs: JigConfig[];
  usbs: UsbConfig[];
  sessionSteps: SessionStep[];
  global: GlobalState;
  setGlobal: React.Dispatch<React.SetStateAction<GlobalState>>;
  isSetupPanelOpen: boolean;
  setIsSetupPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  heightMode?: 'hn' | 'hr';
  setHeightMode?: React.Dispatch<React.SetStateAction<'hn' | 'hr'>>;
  targetAngleSymbol?: string;
  constants?: MachineConstants;
};

export function GlobalSetupCard({
  global,
  setGlobal,
  jigs,
  usbs,
  isSetupPanelOpen,
  setIsSetupPanelOpen,
  heightMode,
  setHeightMode,
  targetAngleSymbol = '\u03b2',
  constants,
}: GlobalSetupCardProps) {
  const isProjectionMode = global.calcMode === 'projection';
  const effectiveConsts = constants ?? DEFAULT_CONSTANTS;
  const rearVal = _nz(global.fixedUsbRear, _nz(global.fixedUsbHeight, 150));
  const activeUsb = usbs.find(u => u.id === global.activeUsbId); const dsVal = _nz(activeUsb?.Ds, 12);
  const suggestedFrontUsb = computeSuggestedFrontUsbHeight(
    rearVal,
    effectiveConsts,
    dsVal,
    heightMode === 'hr' ? 'hr' : 'hn'
  );
  const activeFrontUsb = global.useCustomFrontUsb
    ? _nz(global.fixedUsbFront, suggestedFrontUsb)
    : suggestedFrontUsb;

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
                    {activeFrontUsb.toFixed(2)} mm
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
            <span>Ds: {usbs.find(u => u.id === global.activeUsbId)?.Ds ?? 12} mm</span>
            <span>·</span>
            <span>Dj: {jigs.find(j => j.id === global.activeJigId)?.Dj ?? 12} mm</span>
          </div>
        </div>
      )}

      {/* Expanded Full Inputs View */}
      {isSetupPanelOpen && (
        <div className="panel-card__body">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
            {/* Top Left: Rear USB (Projection Mode) OR Projection A (Height Mode) */}
            {isProjectionMode ? (
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
            ) : (
              <div className="flex flex-col gap-1.5 rounded border u-border u-surface p-2 sm:p-2.5 col-span-1">
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
            )}

            {/* Top Right: Target Angle (Shared by both modes) */}
            <div className="flex flex-col gap-1.5 rounded border u-border u-surface p-2 sm:p-2.5 col-span-1">
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

            {/* Bottom Left: Front USB (Projection Mode) OR Reference Toggle (Height Mode) */}
            {isProjectionMode ? (
              <div className="flex flex-col gap-1.5 rounded border u-border u-surface p-2 sm:p-2.5 col-span-1 justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium u-text truncate">
                    USB Front {heightMode === 'hr' ? 'hr' : 'hn'} (mm)
                  </span>
                  {global.useCustomFrontUsb ? (
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      className="w-full rounded border u-border u-surface px-2 py-1 text-base font-mono text-center u-text focus:ring-1 focus:ring-accent"
                      value={global.fixedUsbFront ?? Math.round(suggestedFrontUsb * 100) / 100}
                      onKeyDown={blurOnEnter}
                      onChange={e =>
                        setGlobal(g => ({
                          ...g,
                          fixedUsbFront: _nz(e.target.value, g.fixedUsbFront ?? suggestedFrontUsb),
                        }))
                      }
                    />
                  ) : (
                    <div
                      className="w-full rounded border u-border bg-neutral-950/60 px-2 py-1 text-base font-mono text-center u-text select-text flex items-center justify-center font-semibold"
                      title="Suggested front USB height matching rear wheel distance (CA)"
                    >
                      {suggestedFrontUsb.toFixed(2)}
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs u-text-muted hover:text-neutral-200 py-1">
                  <input
                    type="checkbox"
                    className="rounded accent-accent w-3.5 h-3.5"
                    checked={Boolean(global.useCustomFrontUsb)}
                    onChange={e => {
                      const checked = e.target.checked;
                      setGlobal(g => ({
                        ...g,
                        useCustomFrontUsb: checked,
                        ...(checked && g.fixedUsbFront === undefined
                          ? { fixedUsbFront: Math.round(suggestedFrontUsb * 100) / 100 }
                          : {}),
                      }));
                    }}
                  />
                  <span>Custom setting</span>
                </label>
              </div>
            ) : (
              heightMode && setHeightMode && (
                <div className="flex flex-col justify-between gap-1.5 rounded border border-neutral-800 bg-neutral-950/60 p-2 sm:p-2.5 text-xs col-span-1">
                  <div className="flex flex-col">
                    <span className="font-semibold text-neutral-200 truncate">
                      USB height reference
                    </span>
                    <span className="text-[0.7rem] u-text-muted leading-tight mt-0.5">
                      {heightMode === 'hn'
                        ? 'Datum (Base to USB top)'
                        : 'Wheel (Perimeter to USB top)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 w-full mt-auto">
                    <button
                      type="button"
                      className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
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
                      className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
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
              )
            )}

            {/* Bottom Right: Advanced Diameters (Shared by both modes) */}
            <div className="flex flex-col gap-2 rounded border border-neutral-800/80 bg-neutral-950/30 p-2 sm:p-2.5 col-span-1 justify-between">
              <label className="flex flex-col gap-1">
                <span className="u-text text-xs truncate">Support Bar (USB)</span>
                <MiniSelect
                  value={global.activeUsbId || usbs[0]?.id || ''}
                  options={usbs.map(u => ({ value: u.id, label: u.name, meta: `${u.Ds} mm` }))}
                  onChange={val => setGlobal(g => ({ ...g, activeUsbId: val }))}
                  widthClass="w-full"
                  menuWidthClass="w-full"
                  liftOnOpen={true}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="u-text text-xs truncate">Sharpening Jig</span>
                <MiniSelect
                  value={global.activeJigId || jigs[0]?.id || ''}
                  options={jigs.map(j => ({ value: j.id, label: j.name, meta: `${j.Dj} mm` }))}
                  onChange={val => setGlobal(g => ({ ...g, activeJigId: val }))}
                  widthClass="w-full"
                  menuWidthClass="w-full"
                  liftOnOpen={true}
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
