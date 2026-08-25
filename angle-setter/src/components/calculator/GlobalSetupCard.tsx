import * as React from 'react';
import type { GlobalState } from '../../types/core';
import { _nz } from '../../utils/numbers';
import { blurOnEnter } from '../../utils/dom';
import ExpandToggle from '../ExpandToggle';

export type GlobalSetupCardProps = {
  global: GlobalState;
  setGlobal: React.Dispatch<React.SetStateAction<GlobalState>>;
  isSetupPanelOpen: boolean;
  setIsSetupPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  targetAngleSymbol?: string;
};

const COMMON_ANGLES = [12, 15, 17, 20, 22.5, 25];

export function GlobalSetupCard({
  global,
  setGlobal,
  isSetupPanelOpen,
  setIsSetupPanelOpen,
  targetAngleSymbol = '\u03b2',
}: GlobalSetupCardProps) {
  const microBump = global.microBump || { enabled: false, bumpDeg: 0 };

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

  const handleQuickAngle = (angle: number) => {
    setGlobal(g => ({ ...g, targetAngle: angle }));
  };

  const handleToggleMicroBump = (enabled: boolean) => {
    setGlobal(g => ({
      ...g,
      microBump: {
        enabled,
        bumpDeg: enabled ? (g.microBump?.bumpDeg || 0.2) : 0,
      },
    }));
  };

  const handleMicroBumpDegree = (bumpDeg: number) => {
    setGlobal(g => ({
      ...g,
      microBump: {
        enabled: true,
        bumpDeg: Math.max(0, Math.round(bumpDeg * 10) / 10),
      },
    }));
  };

  return (
    <section className="panel-card panel-card--strong flex flex-col gap-0 max-w-xl motion-panel">
      <div className="panel-card__header">
        <h2 className="text-sm font-semibold u-text panel-header">Global setup</h2>
        <div className="ml-auto">
          <ExpandToggle
            expanded={isSetupPanelOpen}
            onToggle={() => setIsSetupPanelOpen(open => !open)}
            labelExpanded="Hide setup panel"
            labelCollapsed="Show setup panel"
          />
        </div>
      </div>

      <div className="panel-card__body flex flex-col gap-3">
        {/* Main Projection & Target Angle Controls with Touch Steppers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* Projection (A) */}
          <div className="flex flex-col gap-1.5 rounded border u-border u-surface p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium u-text">Projection A (mm)</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="px-1.5 py-0.5 text-[0.7rem] rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white"
                  title="Subtract 5mm"
                  onClick={() => handleProjectionStep(-5)}
                >
                  -5
                </button>
                <button
                  type="button"
                  className="px-1.5 py-0.5 text-[0.7rem] rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white"
                  title="Subtract 1mm"
                  onClick={() => handleProjectionStep(-1)}
                >
                  -1
                </button>
                <button
                  type="button"
                  className="px-1.5 py-0.5 text-[0.7rem] rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white"
                  title="Add 1mm"
                  onClick={() => handleProjectionStep(1)}
                >
                  +1
                </button>
                <button
                  type="button"
                  className="px-1.5 py-0.5 text-[0.7rem] rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white"
                  title="Add 5mm"
                  onClick={() => handleProjectionStep(5)}
                >
                  +5
                </button>
              </div>
            </div>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              className="rounded border u-border u-surface px-2.5 py-1.5 text-base font-mono u-text focus:ring-1 focus:ring-accent"
              value={global.projection}
              onKeyDown={blurOnEnter}
              onChange={e =>
                setGlobal(g => ({ ...g, projection: _nz(e.target.value, g.projection) }))
              }
            />
          </div>

          {/* Target Angle (Beta) */}
          <div className="flex flex-col gap-1.5 rounded border u-border u-surface p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium u-text">
                Target angle {targetAngleSymbol}° (/side)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="px-1.5 py-0.5 text-[0.7rem] rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white"
                  title="Subtract 1.0°"
                  onClick={() => handleAngleStep(-1)}
                >
                  -1°
                </button>
                <button
                  type="button"
                  className="px-1.5 py-0.5 text-[0.7rem] rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white"
                  title="Subtract 0.5°"
                  onClick={() => handleAngleStep(-0.5)}
                >
                  -0.5°
                </button>
                <button
                  type="button"
                  className="px-1.5 py-0.5 text-[0.7rem] rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white"
                  title="Add 0.5°"
                  onClick={() => handleAngleStep(0.5)}
                >
                  +0.5°
                </button>
                <button
                  type="button"
                  className="px-1.5 py-0.5 text-[0.7rem] rounded border u-border bg-neutral-900 text-neutral-300 hover:text-white"
                  title="Add 1.0°"
                  onClick={() => handleAngleStep(1)}
                >
                  +1°
                </button>
              </div>
            </div>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              className="rounded border u-border u-surface px-2.5 py-1.5 text-base font-mono u-text focus:ring-1 focus:ring-accent"
              value={global.targetAngle}
              onKeyDown={blurOnEnter}
              onChange={e =>
                setGlobal(g => ({ ...g, targetAngle: _nz(e.target.value, g.targetAngle) }))
              }
            />
          </div>
        </div>

        {/* Quick Angle Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[0.7rem] u-text-muted mr-1">Quick angles:</span>
          {COMMON_ANGLES.map(ang => {
            const isSelected = global.targetAngle === ang;
            return (
              <button
                key={ang}
                type="button"
                className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent-tint text-accent font-semibold'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                }`}
                onClick={() => handleQuickAngle(ang)}
              >
                {ang}°
              </button>
            );
          })}
        </div>

        {/* MicroBump / Micro-Bevel Control */}
        <div className="flex items-center justify-between rounded border border-neutral-800 bg-neutral-950/60 p-2 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="global-microbump-toggle"
              checked={microBump.enabled}
              onChange={e => handleToggleMicroBump(e.target.checked)}
              className="rounded border-neutral-700 bg-neutral-900 text-accent focus:ring-accent"
            />
            <label htmlFor="global-microbump-toggle" className="cursor-pointer text-neutral-200">
              <span className="font-semibold">MicroBump</span>
              <span className="text-[0.7rem] u-text-muted ml-1.5">(Global angle bump Δβ)</span>
            </label>
          </div>

          {microBump.enabled && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className={`px-1.5 py-0.5 text-[0.7rem] rounded border ${
                  microBump.bumpDeg === 0.2
                    ? 'border-accent bg-accent text-neutral-950 font-bold'
                    : 'border-neutral-700 bg-neutral-900 text-neutral-300'
                }`}
                onClick={() => handleMicroBumpDegree(0.2)}
              >
                +0.2°
              </button>
              <button
                type="button"
                className={`px-1.5 py-0.5 text-[0.7rem] rounded border ${
                  microBump.bumpDeg === 0.4
                    ? 'border-accent bg-accent text-neutral-950 font-bold'
                    : 'border-neutral-700 bg-neutral-900 text-neutral-300'
                }`}
                onClick={() => handleMicroBumpDegree(0.4)}
              >
                +0.4°
              </button>
              <div className="flex items-center gap-1 text-[0.75rem]">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  className="w-14 rounded border border-neutral-700 bg-neutral-900 px-1.5 py-0.5 text-right font-mono text-xs text-neutral-100"
                  value={microBump.bumpDeg}
                  onKeyDown={blurOnEnter}
                  onChange={e => handleMicroBumpDegree(_nz(e.target.value, microBump.bumpDeg))}
                />
                <span className="text-neutral-400">°</span>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Advanced Diameters */}
        <div className={'collapsible ' + (isSetupPanelOpen ? 'collapsible--open' : '')}>
          <div className="grid grid-cols-2 gap-2 text-sm pt-1 border-t border-neutral-800">
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
    </section>
  );
}

export default GlobalSetupCard;
