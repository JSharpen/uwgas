import * as React from 'react';
import type { GlobalState, MachineConstants } from '../../types/core';
import { DEFAULT_CONSTANTS } from '../../state/defaults';
import { computeSuggestedFrontUsbHeight } from '../../math/tormek';
import { _nz } from '../../utils/numbers';
import { blurOnEnter } from '../../utils/dom';
import ActionSheetPicker from './ActionSheetPicker';
import type { JigConfig, UsbConfig, SessionStep, SessionPreset, MachineConfig } from "../../types/core";

type GlobalSetupCardProps = {
  jigs: JigConfig[];
  usbs: UsbConfig[];
  machines: MachineConfig[];
  defaultMachineId?: string;
  setDefaultMachineId: (id: string) => void;
  sessionSteps: SessionStep[];
  sessionPresets: SessionPreset[];
  selectedPresetId: string | null;
  onLoadPreset: (id: string) => void;
  onOpenSavePreset: () => void;
  onOpenManagePresets: () => void;
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
  machines,
  defaultMachineId,
  setDefaultMachineId,
  sessionPresets,
  selectedPresetId,
  onLoadPreset,
  onOpenSavePreset,
  onOpenManagePresets,
  isSetupPanelOpen,
  setIsSetupPanelOpen,
  heightMode,
  targetAngleSymbol = '\u03b2',
  constants,
}: GlobalSetupCardProps) {
  const isProjectionMode = global.calcMode === 'projection';
  const [activeUsbTab, setActiveUsbTab] = React.useState<'rear' | 'front'>('rear');
  const [activeSheet, setActiveSheet] = React.useState<'none' | 'jig' | 'usb' | 'preset' | 'machine'>('none');
  
  const effectiveConsts = constants ?? DEFAULT_CONSTANTS;
  const rearVal = _nz(global.fixedUsbRear, _nz(global.fixedUsbHeight, 150));
  const activeUsb = usbs.find(u => u.id === global.activeUsbId) || usbs[0]; 
  const activeJig = jigs.find(j => j.id === global.activeJigId) || jigs[0];
  const activePreset = sessionPresets.find(p => p.id === selectedPresetId);
  const dsVal = _nz(activeUsb?.Ds, 12);
  
  const suggestedFrontUsb = computeSuggestedFrontUsbHeight(
    rearVal,
    effectiveConsts,
    dsVal,
    heightMode === 'hr' ? 'hr' : 'hn'
  );
  const activeFrontUsb = global.useCustomFrontUsb
    ? _nz(global.fixedUsbFront, suggestedFrontUsb)
    : suggestedFrontUsb;

  React.useEffect(() => {
    if (isSetupPanelOpen || activeSheet !== 'none') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSetupPanelOpen, activeSheet]);

  const touchStartY = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    
    // Swipe down to close
    if (isSetupPanelOpen && deltaY > 30) {
      setIsSetupPanelOpen(false);
    } 
    // Swipe up to open
    else if (!isSetupPanelOpen && deltaY < -30) {
      setIsSetupPanelOpen(true);
    }
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
      const current = _nz(g.fixedUsbFront, suggestedFrontUsb);
      const next = Math.max(10, Math.round((current + delta) * 100) / 100);
      return { ...g, fixedUsbFront: next, useCustomFrontUsb: true };
    });
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <>
      <div 
        className="fixed bottom-[72px] left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-30 mx-auto pointer-events-none flex flex-col justify-end"
      >
        <div className="relative w-full flex flex-col justify-end pointer-events-none">
          {/* === DRAWER BODY (Expands upwards from behind the pill) === */}
          <div 
            className={`w-full neu-convex border border-black/40 shadow-2xl rounded-t-3xl rounded-b-none pb-6 transition-all duration-300 ease-in-out relative overflow-hidden flex flex-col z-0 -mb-6 pt-2 ${isSetupPanelOpen ? 'max-h-[calc(100dvh-300px)] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none border-transparent pt-0 pb-0'}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* NIB AREA (Drag handle to close) */}
            <div 
              className="flex items-center justify-center w-full pt-2 pb-2 touch-none shrink-0 cursor-pointer relative z-10"
              onClick={() => setIsSetupPanelOpen(false)}
            >
              <div className="w-12 h-1.5 rounded-full bg-white/10 neu-concave mx-auto mb-1" />
            </div>

            {/* INPUTS AREA */}
            <div 
              className={`px-5 pb-0 pt-2 flex flex-col gap-4 min-h-0 max-h-[calc(100dvh-358px)] overflow-y-auto overscroll-contain transition-opacity duration-300 relative z-10 ${isSetupPanelOpen ? 'opacity-100 delay-150' : 'opacity-0'}`}
              style={{ maskImage: 'linear-gradient(to bottom, transparent, black 12px, black 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12px, black 100%)' }}
            >
                {/* PRESET TRIGGER */}
                <div className="flex flex-col gap-2.5 mt-2">
                  <button 
                    type="button" 
                    className="flex items-center justify-between p-4 neu-button rounded-2xl transition-all w-full text-left"
                    onClick={() => setActiveSheet('preset')}
                  >
                    <div className="flex flex-col items-start min-w-0 pr-2">
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-0.5">Active Preset</span>
                      <span className={`text-sm font-bold truncate max-w-[220px] ${activePreset ? 'text-white' : 'text-white/40'}`}>
                        {activePreset ? activePreset.name : 'None selected'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-amber-400 px-3.5 py-1.5 neu-concave border border-black/40 rounded-full shrink-0">
                      Change
                    </div>
                  </button>
                  <div className="flex gap-2.5">
                    <button 
                      type="button"
                      className="flex-1 h-11 py-2 text-xs font-bold text-white/70 hover:text-white neu-button rounded-xl transition flex items-center justify-center"
                      onClick={onOpenSavePreset}
                    >
                      Save Current
                    </button>
                    <button 
                      type="button"
                      className="flex-1 h-11 py-2 text-xs font-bold text-white/70 hover:text-white neu-button rounded-xl transition flex items-center justify-center"
                      onClick={onOpenManagePresets}
                    >
                      Manage Presets
                    </button>
                  </div>
                </div>
                <div className="h-px bg-white/5 w-full" />

                {/* TARGET ANGLE */}
                <div className="neu-concave border border-black/40 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="text-center">
                    <label className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Target Angle {targetAngleSymbol}°</label>
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    className="w-full bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center text-amber-400 amber-glow focus:outline-none focus:text-amber-300 transition-colors"
                    value={global.targetAngle}
                    onFocus={handleInputFocus}
                    onKeyDown={blurOnEnter}
                    onChange={e =>
                      setGlobal(g => ({ ...g, targetAngle: _nz(e.target.value, g.targetAngle) }))
                    }
                  />
                  <div className="flex gap-2 w-full mt-1">
                    <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-1)}>-1°</button>
                    <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(-0.5)}>-.5°</button>
                    <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(0.5)}>+.5°</button>
                    <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleAngleStep(1)}>+1°</button>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full" />

                {/* PROJECTION OR FIXED USB HEIGHT */}
                {isProjectionMode ? (
                  <div className="neu-concave border border-black/40 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Fixed USB Height</label>
                      <div className="flex neu-concave rounded-full border border-black/40 p-1 select-none w-36">
                        <button
                          type="button"
                          className={`flex-1 rounded-full text-[10px] font-bold tracking-wider py-1.5 uppercase transition ${activeUsbTab === 'rear' ? 'neu-button text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                          onClick={() => setActiveUsbTab('rear')}
                        >
                          Rear
                        </button>
                        <button
                          type="button"
                          className={`flex-1 rounded-full text-[10px] font-bold tracking-wider py-1.5 uppercase transition ${activeUsbTab === 'front' ? 'neu-button text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                          onClick={() => setActiveUsbTab('front')}
                        >
                          Front
                        </button>
                      </div>
                    </div>
                    
                    {activeUsbTab === 'rear' ? (
                      <>
                        <input
                          inputMode="decimal"
                          step="any"
                          className="w-full bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center text-white focus:outline-none focus:text-amber-400 transition-colors"
                          value={global.fixedUsbRear ?? global.fixedUsbHeight ?? 150}
                          onFocus={handleInputFocus}
                          onKeyDown={blurOnEnter}
                          onChange={e =>
                            setGlobal(g => ({
                              ...g,
                              fixedUsbRear: _nz(e.target.value, g.fixedUsbRear ?? 150),
                              fixedUsbHeight: _nz(e.target.value, g.fixedUsbRear ?? 150),
                            }))
                          }
                        />
                        <div className="flex gap-2 w-full mt-1">
                          <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(-5)}>-5</button>
                          <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(-1)}>-1</button>
                          <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(1)}>+1</button>
                          <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbRearStep(5)}>+5</button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-3">
                         <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            className="w-full bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center focus:outline-none transition-colors disabled:opacity-40 disabled:text-white/40 disabled:bg-transparent text-white focus:text-amber-400"
                            value={global.useCustomFrontUsb ? (global.fixedUsbFront ?? Math.round(suggestedFrontUsb * 100) / 100) : suggestedFrontUsb.toFixed(2)}
                            onFocus={handleInputFocus}
                            onKeyDown={blurOnEnter}
                            disabled={!global.useCustomFrontUsb}
                            onChange={e =>
                              setGlobal(g => ({ ...g, fixedUsbFront: _nz(e.target.value, g.fixedUsbFront ?? suggestedFrontUsb) }))
                            }
                          />
                          {global.useCustomFrontUsb ? (
                             <div className="flex gap-2 w-full mt-1">
                               <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbFrontStep(-5)}>-5</button>
                               <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbFrontStep(-1)}>-1</button>
                               <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbFrontStep(1)}>+1</button>
                               <button type="button" className="flex-1 h-12 rounded-xl neu-button text-white/80 font-bold font-mono text-sm flex items-center justify-center active:scale-95 transition-all" onClick={() => handleFixedUsbFrontStep(5)}>+5</button>
                             </div>
                          ) : (
                            <div className="w-full text-center py-4 bg-black/40 rounded-xl border border-dashed border-white/10 text-xs text-white/40 uppercase tracking-wider font-bold">Auto computed from rear</div>
                          )}
                          <label className="flex items-center justify-center gap-2 mt-2 cursor-pointer select-none text-xs font-semibold text-white/60 hover:text-white">
                            <input
                              type="checkbox"
                              className="rounded accent-amber-400 w-4 h-4"
                              checked={Boolean(global.useCustomFrontUsb)}
                              onChange={e => setGlobal(g => ({ ...g, useCustomFrontUsb: e.target.checked, fixedUsbFront: e.target.checked ? suggestedFrontUsb : g.fixedUsbFront }))}
                            />
                            <span>Override Auto Front USB</span>
                          </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="neu-concave border border-black/40 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="text-center">
                      <label className={`text-[10px] font-bold tracking-widest uppercase ${global.useProtrusionMode ? 'text-amber-400' : 'text-white/40'}`}>
                        {global.useProtrusionMode ? "Blade Protrusion Pb" : "Projection A"}
                      </label>
                    </div>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      className={`w-full bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center focus:outline-none transition-colors ${global.useProtrusionMode ? 'text-amber-400' : 'text-white focus:text-amber-400'}`}
                      value={global.useProtrusionMode ? global.protrusion : global.projection}
                      onFocus={handleInputFocus}
                      onKeyDown={blurOnEnter}
                      onChange={e => {
                        const val = _nz(e.target.value, global.useProtrusionMode ? global.protrusion : global.projection);
                        if (global.useProtrusionMode) setGlobal(g => ({ ...g, protrusion: val }));
                        else setGlobal(g => ({ ...g, projection: val }));
                      }}
                    />
                    <div className="flex gap-2 w-full mt-1">
                      <button type="button" className={`flex-1 h-12 rounded-xl text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all ${global.useProtrusionMode ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20' : 'neu-button text-white/80'}`} onClick={() => handleProjectionStep(-5)}>-5</button>
                      <button type="button" className={`flex-1 h-12 rounded-xl text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all ${global.useProtrusionMode ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20' : 'neu-button text-white/80'}`} onClick={() => handleProjectionStep(-1)}>-1</button>
                      <button type="button" className={`flex-1 h-12 rounded-xl text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all ${global.useProtrusionMode ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20' : 'neu-button text-white/80'}`} onClick={() => handleProjectionStep(1)}>+1</button>
                      <button type="button" className={`flex-1 h-12 rounded-xl text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all ${global.useProtrusionMode ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20' : 'neu-button text-white/80'}`} onClick={() => handleProjectionStep(5)}>+5</button>
                    </div>
                  </div>
                )}

                {/* Protrusion Addon in Projection Mode */}
                {isProjectionMode && global.useProtrusionMode && (
                  <>
                    <div className="h-px bg-white/5 w-full" />
                    <div className="neu-concave border border-black/40 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="text-center">
                        <label className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">Blade Protrusion Pb</label>
                      </div>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        className="w-full bg-transparent text-4xl sm:text-5xl font-extrabold font-mono text-center text-amber-400 focus:outline-none transition-colors"
                        value={global.protrusion}
                        onFocus={handleInputFocus}
                        onKeyDown={blurOnEnter}
                        onChange={e => setGlobal(g => ({ ...g, protrusion: _nz(e.target.value, g.protrusion) }))}
                      />
                      <div className="flex gap-2 w-full mt-1">
                        <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-5)}>-5</button>
                        <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(-1)}>-1</button>
                        <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(1)}>+1</button>
                        <button type="button" className="flex-1 h-12 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-sm font-bold font-mono flex items-center justify-center active:scale-95 transition-all" onClick={() => handleProjectionStep(5)}>+5</button>
                      </div>
                    </div>
                  </>
                )}

                <div className="h-px bg-white/5 w-full" />
                {/* Hardware Selection Action Sheet Triggers */}
                <div className="flex flex-row-reverse flex-wrap-reverse gap-2.5 w-full">
                  <button 
                    type="button" 
                    className="flex-auto min-w-[90px] flex flex-col items-center justify-center p-3.5 neu-button rounded-2xl transition-all min-h-[56px] overflow-hidden" 
                    onClick={() => setActiveSheet('jig')}
                  >
                    <span className="text-[10px] uppercase font-bold text-white/40 mb-1 tracking-widest text-center w-full truncate">Jig</span>
                    <span className="text-xs font-bold text-white/90 truncate w-full text-center font-mono">{activeJig?.name}</span>
                  </button>
                  <button 
                    type="button" 
                    className="flex-auto min-w-[90px] flex flex-col items-center justify-center p-3.5 neu-button rounded-2xl transition-all min-h-[56px] overflow-hidden" 
                    onClick={() => setActiveSheet('usb')}
                  >
                    <span className="text-[10px] uppercase font-bold text-white/40 mb-1 tracking-widest text-center w-full truncate">USB</span>
                    <span className="text-xs font-bold text-white/90 truncate w-full text-center font-mono">{activeUsb?.name}</span>
                  </button>
                  <button 
                    type="button" 
                    className="flex-auto min-w-[90px] flex flex-col items-center justify-center p-3.5 neu-button rounded-2xl transition-all min-h-[56px] overflow-hidden" 
                    onClick={() => setActiveSheet('machine')}
                  >
                    <span className="text-[10px] uppercase font-bold text-white/40 mb-1 tracking-widest text-center w-full truncate">Machine</span>
                    <span className="text-xs font-bold text-white/90 truncate w-full text-center font-mono">{machines.find(m => m.id === defaultMachineId)?.name || 'Default'}</span>
                  </button>
                </div>
              </div>
            </div>

          {/* === SUMMARY PILL (Front Layer, Static) === */}
          <button 
            type="button"
            className={`relative z-10 pointer-events-auto w-full ${isSetupPanelOpen ? 'neu-convex-pressed' : 'neu-convex neu-convex-active'} border border-black/20 rounded-3xl flex flex-col items-center justify-center p-4 sm:p-5 touch-none transition-all group overflow-hidden`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsSetupPanelOpen(!isSetupPanelOpen)}
          >
            {/* Subtle Edge Highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-3xl z-0" />

            {/* Top Row: Preset Name & Hardware Pill Chips */}
            <div className="relative z-10 flex flex-col items-start w-full gap-2 mb-3">
              <span className={`text-sm sm:text-base font-bold truncate w-full ${activePreset ? 'text-amber-400 font-semibold' : 'text-white/60'}`}>
                {activePreset ? activePreset.name : 'Custom Setup'}
              </span>
              <div className="grid grid-cols-3 gap-1.5 w-full">
                <span className="rounded px-2 py-0.5 neu-concave border border-white/5 text-[9px] text-white/70 font-mono truncate text-center">
                  {machines.find(m => m.id === defaultMachineId)?.name || 'Default'}
                </span>
                <span className="rounded px-2 py-0.5 neu-concave border border-white/5 text-[9px] text-white/70 font-mono truncate text-center">
                  {activeUsb?.name || 'USB'}
                </span>
                <span className="rounded px-2 py-0.5 neu-concave border border-white/5 text-[9px] text-white/70 font-mono truncate text-center">
                  {activeJig?.name || 'Jig'}
                </span>
              </div>
            </div>
            
            {/* Main Readouts Row: Massive Monospace Angle & Projection */}
            <div className="relative z-10 flex items-center justify-between w-full pt-2 border-t border-white/5">
              {/* Target Angle */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Angle</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight amber-glow">
                  {_nz(global.targetAngle, 15).toFixed(1)}°
                </span>
              </div>

              {/* Separator / Drag Cue */}
              <div className="flex items-center gap-1 text-white/20">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20 neu-concave" />
              </div>

              {/* Projection or USB Height */}
              <div className="flex items-baseline gap-1.5 text-right">
                {isProjectionMode ? (
                  <>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">USB R/F</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
                      {(global.fixedUsbRear ?? global.fixedUsbHeight ?? 150).toFixed(1)}
                      <span className="text-white/40 text-sm font-normal"> / </span>
                      {activeFrontUsb.toFixed(1)}
                      <span className="text-xs text-white/40 font-normal ml-0.5">mm</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                      {global.useProtrusionMode ? 'Pb' : 'Proj A'}
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                      {_nz(global.useProtrusionMode ? global.protrusion : global.projection, 120).toFixed(1)}
                      <span className="text-xs text-white/40 font-normal ml-0.5">mm</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Action Sheets for Hardware */}
      <ActionSheetPicker
        isOpen={activeSheet === 'machine'}
        onClose={() => setActiveSheet('none')}
        title="Select Machine"
        options={machines.map(m => ({ value: m.id, label: m.name }))}
        value={defaultMachineId || ''}
        onChange={val => {
          if (val) setDefaultMachineId(val);
        }}
      />

      <ActionSheetPicker
        isOpen={activeSheet === 'usb'}
        onClose={() => setActiveSheet('none')}
        title="Select Support Bar (USB)"
        options={usbs.map(u => ({ value: u.id, label: u.name, meta: `Ds: ${u.Ds}mm` }))}
        value={global.activeUsbId || ''}
        onChange={val => setGlobal(g => ({ ...g, activeUsbId: val }))}
      />

      <ActionSheetPicker
        isOpen={activeSheet === 'jig'}
        onClose={() => setActiveSheet('none')}
        title="Select Sharpening Jig"
        options={jigs.map(j => ({ value: j.id, label: j.name, meta: `Length: ${j.length || j.Dj}mm` }))}
        value={global.activeJigId || ''}
        onChange={val => setGlobal(g => ({ ...g, activeJigId: val }))}
      />

      <ActionSheetPicker
        isOpen={activeSheet === 'preset'}
        onClose={() => setActiveSheet('none')}
        title="Select Preset"
        options={[
          { value: '', label: 'None (Clear selection)' },
          ...sessionPresets.map(p => ({
            value: p.id,
            label: p.name,
            meta: `${p.steps.length} step${p.steps.length === 1 ? '' : 's'}`,
          }))
        ]}
        value={selectedPresetId || ''}
        onChange={val => {
          if (val) {
            onLoadPreset(val);
          } else {
            onLoadPreset('');
          }
        }}
      />
    </>
  );
}

export default GlobalSetupCard;
