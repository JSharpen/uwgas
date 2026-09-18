import * as React from 'react';
import { useStore } from '../../state/store';
import { useShallow } from 'zustand/react/shallow';
import { _nz } from '../../utils/numbers';
import { computeSuggestedFrontUsbHeight } from '../../math/tormek';
import { DEFAULT_CONSTANTS } from '../../state/defaults';
import { blurOnEnter } from '../../utils/dom';
import { StepperButtonGroup } from './StepperButtonGroup';
import { useUIStore } from '../../state/uiStore';

export function GlobalSetupInputs() {
  const global = useStore(s => s.global);
  const setGlobal = useStore(s => s.setGlobal);
  const heightMode = useStore(s => s.heightMode);
  
  const machines = useStore(useShallow(s => s.machines));
  const defaultMachineId = useStore(s => s.defaultMachineId);
  const usbs = useStore(useShallow(s => s.usbs));
  
  const activeUsbTab = useUIStore(s => s.activeUsbTab);
  const setActiveUsbTab = useUIStore(s => s.setActiveUsbTab);

  const isProjectionMode = global.calcMode === 'projection';
  
  const constants = machines.find((m) => m.id === defaultMachineId)?.constants || machines[0]?.constants || DEFAULT_CONSTANTS;
  const effectiveConsts = constants ?? DEFAULT_CONSTANTS;
  const rearVal = _nz(global.fixedUsbRear, _nz(global.fixedUsbHeight, 150));
  const activeUsb = usbs.find(u => u.id === global.activeUsbId) || usbs[0]; 
  const dsVal = _nz(activeUsb?.Ds, 12);
  
  const suggestedFrontUsb = computeSuggestedFrontUsbHeight(
    rearVal,
    effectiveConsts,
    dsVal,
    heightMode === 'hr' ? 'hr' : 'hn'
  );

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
      const current = _nz(g.fixedUsbFront, suggestedFrontUsb);
      const next = Math.max(10, Math.round((current + delta) * 100) / 100);
      return { ...g, fixedUsbFront: next, useCustomFrontUsb: true };
    });
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const angleOptions = [
    { label: '-1°', value: -1 },
    { label: '-.5°', value: -0.5 },
    { label: '+.5°', value: 0.5 },
    { label: '+1°', value: 1 },
  ];

  const standardOptions = [
    { label: '-5', value: -5 },
    { label: '-1', value: -1 },
    { label: '+1', value: 1 },
    { label: '+5', value: 5 },
  ];

  return (
    <>
      {/* TARGET ANGLE */}
      <div className="neu-concave border border-black/40 rounded-2xl p-4 flex flex-col gap-3">
        <div className="text-center">
          <label htmlFor="targetAngleInput" className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Target Angle β°</label>
        </div>
        <input
          id="targetAngleInput"
          type="number"
          inputMode="decimal"
          step="any"
          className="touch-pan-y w-48 mx-auto bg-transparent text-4xl sm:text-5xl font-extrabold tabular-nums text-center text-amber-400 amber-glow focus:outline-none focus:text-amber-300 transition-colors"
          value={global.targetAngle}
          onFocus={handleInputFocus}
          onKeyDown={blurOnEnter}
          onChange={e =>
            setGlobal(g => ({ ...g, targetAngle: e.target.valueAsNumber || _nz(e.target.value, g.targetAngle) }))
          }
        />
        <StepperButtonGroup options={angleOptions} onStep={handleAngleStep} />
      </div>

      <div className="h-px bg-white/5 w-full" />

      {/* PROJECTION OR FIXED USB HEIGHT */}
      {isProjectionMode ? (
        <div className="neu-concave border border-black/40 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase" id="usbTabLabel">Fixed USB Height</span>
            <div 
              role="switch"
              aria-checked={activeUsbTab === 'front'}
              aria-labelledby="usbTabLabel"
              tabIndex={0}
              className="relative flex neu-concave rounded-full border border-black/40 p-1 select-none w-36 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              onClick={() => setActiveUsbTab(activeUsbTab === 'rear' ? 'front' : 'rear')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveUsbTab(activeUsbTab === 'rear' ? 'front' : 'rear');
                }
              }}
            >
              <div className="absolute top-1 bottom-1 left-1 right-1 pointer-events-none">
                <div className={`w-1/2 h-full neu-button rounded-full shadow-sm transition-transform duration-300 ease-out ${activeUsbTab === 'rear' ? 'translate-x-0' : 'translate-x-full'}`} />
              </div>
              <div className="relative z-10 flex w-full">
                <div className={`flex-1 py-2 flex items-center justify-center text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${activeUsbTab === 'rear' ? 'text-white' : 'text-white/40'}`}>
                  Rear
                </div>
                <div className={`flex-1 py-2 flex items-center justify-center text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${activeUsbTab === 'front' ? 'text-white' : 'text-white/40'}`}>
                  Front
                </div>
              </div>
            </div>
          </div>
          
          {activeUsbTab === 'rear' ? (
            <>
              <div className="relative flex justify-center items-center w-full">
                <input
                  aria-label="Rear Fixed USB Height"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className="touch-pan-y w-48 mx-auto bg-transparent text-4xl sm:text-5xl font-extrabold tabular-nums text-center text-white focus:outline-none focus:text-amber-400 transition-colors"
                  value={global.fixedUsbRear ?? global.fixedUsbHeight ?? 150}
                  onFocus={handleInputFocus}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({
                      ...g,
                      fixedUsbRear: e.target.valueAsNumber || _nz(e.target.value, g.fixedUsbRear ?? 150),
                      fixedUsbHeight: e.target.valueAsNumber || _nz(e.target.value, g.fixedUsbRear ?? 150),
                    }))
                  }
                />
              </div>
              <StepperButtonGroup options={standardOptions} onStep={handleFixedUsbRearStep} />
            </>
          ) : (
            <>
              <div className="relative flex justify-center items-center w-full min-h-[56px]">
                <input
                  aria-label="Front Fixed USB Height"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className="touch-pan-y w-48 mx-auto bg-transparent text-4xl sm:text-5xl font-extrabold tabular-nums text-center focus:outline-none transition-colors disabled:opacity-50 disabled:text-white/30 disabled:bg-transparent text-white focus:text-amber-400"
                  value={global.useCustomFrontUsb ? (global.fixedUsbFront ?? Math.round(suggestedFrontUsb * 100) / 100) : suggestedFrontUsb.toFixed(2)}
                  onFocus={handleInputFocus}
                  onKeyDown={blurOnEnter}
                  disabled={!global.useCustomFrontUsb}
                  onChange={e =>
                    setGlobal(g => ({ ...g, fixedUsbFront: e.target.valueAsNumber || _nz(e.target.value, g.fixedUsbFront ?? suggestedFrontUsb) }))
                  }
                />
                <div className="absolute right-0 flex items-center justify-end">
                  <button
                    type="button"
                    aria-pressed={global.useCustomFrontUsb}
                    onClick={() => setGlobal(g => ({ ...g, useCustomFrontUsb: !g.useCustomFrontUsb, fixedUsbFront: !g.useCustomFrontUsb ? suggestedFrontUsb : g.fixedUsbFront }))}
                    className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors border ${global.useCustomFrontUsb ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-black/40 text-white/40 border-black/60 shadow-inner'}`}
                  >
                    {global.useCustomFrontUsb ? 'Custom' : 'Auto'}
                  </button>
                </div>
              </div>
              <div className={`transition-opacity duration-300 w-full ${global.useCustomFrontUsb ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                <StepperButtonGroup options={standardOptions} onStep={handleFixedUsbFrontStep} />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="neu-concave border border-black/40 rounded-2xl p-4 flex flex-col gap-3">
          <div className="text-center">
            <label htmlFor="projectionInput" className={`text-[10px] font-bold tracking-widest uppercase ${global.useProtrusionMode ? 'text-amber-400' : 'text-white/40'}`}>
              {global.useProtrusionMode ? "Blade Protrusion Pb" : "Projection A"}
            </label>
          </div>
          <input
            id="projectionInput"
            type="number"
            inputMode="decimal"
            step="any"
            className={`touch-pan-y w-48 mx-auto bg-transparent text-4xl sm:text-5xl font-extrabold tabular-nums text-center focus:outline-none transition-colors ${global.useProtrusionMode ? 'text-amber-400' : 'text-white focus:text-amber-400'}`}
            value={global.useProtrusionMode ? global.protrusion : global.projection}
            onFocus={handleInputFocus}
            onKeyDown={blurOnEnter}
            onChange={e => {
              const val = e.target.valueAsNumber || _nz(e.target.value, global.useProtrusionMode ? global.protrusion : global.projection);
              if (global.useProtrusionMode) setGlobal(g => ({ ...g, protrusion: val }));
              else setGlobal(g => ({ ...g, projection: val }));
            }}
          />
          <StepperButtonGroup 
            options={standardOptions} 
            onStep={handleProjectionStep} 
            className={global.useProtrusionMode ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20' : undefined} 
          />
        </div>
      )}

      {/* Protrusion Addon in Projection Mode */}
      <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: isProjectionMode && global.useProtrusionMode ? "1fr" : "0fr" }}>
        <div className="overflow-hidden min-h-0">
          <div className="flex flex-col gap-4 pt-4">
            <div className="h-px bg-white/5 w-full" />
            <div className="neu-concave border border-black/40 rounded-2xl p-4 flex flex-col gap-3">
              <div className="text-center">
                <label htmlFor="protrusionAddonInput" className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">Blade Protrusion Pb</label>
              </div>
              <input
                id="protrusionAddonInput"
                type="number"
                inputMode="decimal"
                step="any"
                className="touch-pan-y w-48 mx-auto bg-transparent text-4xl sm:text-5xl font-extrabold tabular-nums text-center text-amber-400 focus:outline-none transition-colors"
                value={global.protrusion}
                onFocus={handleInputFocus}
                onKeyDown={blurOnEnter}
                onChange={e => setGlobal(g => ({ ...g, protrusion: e.target.valueAsNumber || _nz(e.target.value, g.protrusion) }))}
              />
              <StepperButtonGroup 
                options={standardOptions} 
                onStep={handleProjectionStep} 
                className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
