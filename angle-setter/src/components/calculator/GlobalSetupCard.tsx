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
          {/* CLIPPER SLOT (Hides the drawer when it slides down) */}
          <div className="overflow-hidden w-full relative z-0 -mb-6 pointer-events-none">
            {/* === DRAWER BODY (Slides up from the slot) === */}
            <div 
              className={`w-full bg-neutral-900 border border-neutral-700/60 border-b-0 shadow-[0_-12px_40px_rgba(0,0,0,0.6)] rounded-t-3xl rounded-b-none pb-12 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSetupPanelOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-[101%] pointer-events-none'}`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* NIB AREA (Moves with Drawer) */}
              <div 
                className="flex items-center justify-center w-full pt-4 pb-3 touch-none shrink-0 cursor-pointer"
                onClick={() => setIsSetupPanelOpen(false)}
              >
                <div className="w-10 h-1.5 bg-neutral-500/40 rounded-full shrink-0" />
              </div>

              {/* INPUTS AREA */}
              <div className={`px-5 pb-2 flex flex-col gap-6 max-h-[60vh] overflow-y-auto overscroll-contain transition-opacity duration-300 ${isSetupPanelOpen ? 'opacity-100 delay-150' : 'opacity-0'}`}>
                
                {/* PRESET TRIGGER */}
                <div className="flex flex-col gap-2">
                  <button 
                    type="button" 
                    className="flex items-center justify-between p-4 bg-neutral-800/40 hover:bg-neutral-800 active:bg-neutral-700 rounded-2xl border border-neutral-700/50 transition-colors w-full" 
                    onClick={() => setActiveSheet('preset')}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest mb-0.5">Active Preset</span>
                      <span className={`text-sm font-bold truncate max-w-[200px] ${activePreset ? 'text-white' : 'text-neutral-400'}`}>
                        {activePreset ? activePreset.name : 'None selected'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-accent px-3 py-1.5 bg-accent/10 rounded-full">
                      Change
                    </div>
                  </button>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      className="flex-1 py-2 text-xs font-bold text-neutral-400 hover:text-white bg-neutral-800/30 hover:bg-neutral-800 active:bg-neutral-700 border border-neutral-700/50 rounded-xl transition-colors"
                      onClick={onOpenSavePreset}
                    >
                      Save Current
                    </button>
                    <button 
                      type="button"
                      className="flex-1 py-2 text-xs font-bold text-neutral-400 hover:text-white bg-neutral-800/30 hover:bg-neutral-800 active:bg-neutral-700 border border-neutral-700/50 rounded-xl transition-colors"
                      onClick={onOpenManagePresets}
                    >
                      Manage Presets
                    </button>
                  </div>
                </div>

                <div className="h-px bg-neutral-800/80 w-full" />

                {/* TARGET ANGLE */}
                <div className="flex flex-col gap-3">
                  <div className="text-center">
                    <label className="text-[11px] font-bold text-neutral-400 tracking-widest uppercase">Target Angle {targetAngleSymbol}°</label>
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    className="w-full bg-transparent text-5xl font-bold font-mono text-center text-white focus:outline-none focus:text-accent transition-colors"
                    value={global.targetAngle}
                    onFocus={handleInputFocus}
                    onKeyDown={blurOnEnter}
                    onChange={e =>
                      setGlobal(g => ({ ...g, targetAngle: _nz(e.target.value, g.targetAngle) }))
                    }
                  />
                  <div className="flex gap-1.5 w-full mt-2">
                    <button type="button" className="flex-1 py-3 bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-sm font-bold text-neutral-300 transition-colors" onClick={() => handleAngleStep(-1)}>-1°</button>
                    <button type="button" className="flex-1 py-3 bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-sm font-bold text-neutral-300 transition-colors" onClick={() => handleAngleStep(-0.5)}>-.5°</button>
                    <button type="button" className="flex-1 py-3 bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-sm font-bold text-neutral-300 transition-colors" onClick={() => handleAngleStep(0.5)}>+.5°</button>
                    <button type="button" className="flex-1 py-3 bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-sm font-bold text-neutral-300 transition-colors" onClick={() => handleAngleStep(1)}>+1°</button>
                  </div>
                </div>

                <div className="h-px bg-neutral-800/80 w-full" />

                {/* PROJECTION OR FIXED USB HEIGHT */}
                {isProjectionMode ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-neutral-400 tracking-widest uppercase">Fixed USB Height</label>
                      <div className="flex bg-neutral-950 rounded-full border border-neutral-800/60 p-0.5 select-none w-32">
                        <button
                          className={`flex-1 rounded-full text-[10px] font-bold tracking-wider py-1 uppercase ${activeUsbTab === 'rear' ? 'bg-neutral-800 text-neutral-200 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                          onClick={() => setActiveUsbTab('rear')}
                        >
                          Rear
                        </button>
                        <button
                          className={`flex-1 rounded-full text-[10px] font-bold tracking-wider py-1 uppercase ${activeUsbTab === 'front' ? 'bg-neutral-800 text-neutral-200 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                          onClick={() => setActiveUsbTab('front')}
                        >
                          Front
                        </button>
                      </div>
                    </div>
                    
                    {activeUsbTab === 'rear' ? (
                      <>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          className="w-full bg-transparent text-5xl font-bold font-mono text-center text-white focus:outline-none focus:text-accent transition-colors"
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
                        <div className="flex gap-1.5 w-full mt-2">
                          <button type="button" className="flex-1 py-3 bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-sm font-bold text-neutral-300 transition-colors" onClick={() => handleFixedUsbRearStep(-5)}>-5</button>
                          <button type="button" className="flex-1 py-3 bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-sm font-bold text-neutral-300 transition-colors" onClick={() => handleFixedUsbRearStep(-1)}>-1</button>
                          <button type="button" className="flex-1 py-3 bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-sm font-bold text-neutral-300 transition-colors" onClick={() => handleFixedUsbRearStep(1)}>+1</button>
                          <button type="button" className="flex-1 py-3 bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-sm font-bold text-neutral-300 transition-colors" onClick={() => handleFixedUsbRearStep(5)}>+5</button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-3">
                         <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            className="w-full bg-transparent text-5xl font-bold font-mono text-center focus:outline-none transition-colors disabled:opacity-50 disabled:text-neutral-500 disabled:bg-transparent text-white focus:text-accent"
                            value={global.useCustomFrontUsb ? (global.fixedUsbFront ?? Math.round(suggestedFrontUsb * 100) / 100) : suggestedFrontUsb.toFixed(2)}
                            onFocus={handleInputFocus}
                            onKeyDown={blurOnEnter}
                            disabled={!global.useCustomFrontUsb}
                            onChange={e =>
                              setGlobal(g => ({ ...g, fixedUsbFront: _nz(e.target.value, g.fixedUsbFront ?? suggestedFrontUsb) }))
                            }
                          />
                          {global.useCustomFrontUsb ? (
                             <div className="flex gap-1.5 w-full mt-2">
                               <button type="button" className="flex-1 py-3 bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-sm font-bold text-neutral-300 transition-colors" onClick={() => handleFixedUsbFrontStep(-5)}>-5</button>
                               <button type="button" className="flex-1 py-3 bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-sm font-bold text-neutral-300 transition-colors" onClick={() => handleFixedUsbFrontStep(-1)}>-1</button>
                               <button type="button" className="flex-1 py-3 bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-sm font-bold text-neutral-300 transition-colors" onClick={() => handleFixedUsbFrontStep(1)}>+1</button>
                               <button type="button" className="flex-1 py-3 bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-sm font-bold text-neutral-300 transition-colors" onClick={() => handleFixedUsbFrontStep(5)}>+5</button>
                             </div>
                          ) : (
                            <div className="w-full text-center py-4 bg-neutral-900/50 rounded-xl border border-dashed border-neutral-700 text-xs text-neutral-500 uppercase tracking-wider font-bold">Auto computed from rear</div>
                          )}
                          <label className="flex items-center justify-center gap-2 mt-2 cursor-pointer select-none text-sm font-semibold u-text-muted hover:text-neutral-200">
                            <input
                              type="checkbox"
                              className="rounded accent-accent w-4 h-4"
                              checked={Boolean(global.useCustomFrontUsb)}
                              onChange={e => setGlobal(g => ({ ...g, useCustomFrontUsb: e.target.checked, fixedUsbFront: e.target.checked ? suggestedFrontUsb : g.fixedUsbFront }))}
                            />
                            <span>Override Auto Front USB</span>
                          </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="text-center">
                      <label className={`text-[11px] font-bold tracking-widest uppercase ${global.useProtrusionMode ? 'text-accent' : 'text-neutral-400'}`}>
                        {global.useProtrusionMode ? "Blade Protrusion Pb" : "Projection A"}
                      </label>
                    </div>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      className={`w-full bg-transparent text-5xl font-bold font-mono text-center focus:outline-none transition-colors ${global.useProtrusionMode ? 'text-accent' : 'text-white focus:text-accent'}`}
                      value={global.useProtrusionMode ? global.protrusion : global.projection}
                      onFocus={handleInputFocus}
                      onKeyDown={blurOnEnter}
                      onChange={e => {
                        const val = _nz(e.target.value, global.useProtrusionMode ? global.protrusion : global.projection);
                        if (global.useProtrusionMode) setGlobal(g => ({ ...g, protrusion: val }));
                        else setGlobal(g => ({ ...g, projection: val }));
                      }}
                    />
                    <div className="flex gap-1.5 w-full mt-2">
                      <button type="button" className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${global.useProtrusionMode ? 'bg-accent/10 hover:bg-accent/20 text-accent' : 'bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-300'}`} onClick={() => handleProjectionStep(-5)}>-5</button>
                      <button type="button" className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${global.useProtrusionMode ? 'bg-accent/10 hover:bg-accent/20 text-accent' : 'bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-300'}`} onClick={() => handleProjectionStep(-1)}>-1</button>
                      <button type="button" className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${global.useProtrusionMode ? 'bg-accent/10 hover:bg-accent/20 text-accent' : 'bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-300'}`} onClick={() => handleProjectionStep(1)}>+1</button>
                      <button type="button" className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${global.useProtrusionMode ? 'bg-accent/10 hover:bg-accent/20 text-accent' : 'bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-300'}`} onClick={() => handleProjectionStep(5)}>+5</button>
                    </div>
                  </div>
                )}

                {/* Protrusion Addon in Projection Mode */}
                {isProjectionMode && global.useProtrusionMode && (
                  <>
                    <div className="h-px bg-neutral-800/80 w-full" />
                    <div className="flex flex-col gap-3">
                      <div className="text-center">
                        <label className="text-[11px] font-bold text-accent tracking-widest uppercase">Blade Protrusion Pb</label>
                      </div>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        className="w-full bg-transparent text-5xl font-bold font-mono text-center text-accent focus:outline-none transition-colors"
                        value={global.protrusion}
                        onFocus={handleInputFocus}
                        onKeyDown={blurOnEnter}
                        onChange={e => setGlobal(g => ({ ...g, protrusion: _nz(e.target.value, g.protrusion) }))}
                      />
                      <div className="flex gap-1.5 w-full mt-2">
                        <button type="button" className="flex-1 py-3 bg-accent/10 hover:bg-accent/20 rounded-xl text-sm font-bold text-accent transition-colors" onClick={() => handleProjectionStep(-5)}>-5</button>
                        <button type="button" className="flex-1 py-3 bg-accent/10 hover:bg-accent/20 rounded-xl text-sm font-bold text-accent transition-colors" onClick={() => handleProjectionStep(-1)}>-1</button>
                        <button type="button" className="flex-1 py-3 bg-accent/10 hover:bg-accent/20 rounded-xl text-sm font-bold text-accent transition-colors" onClick={() => handleProjectionStep(1)}>+1</button>
                        <button type="button" className="flex-1 py-3 bg-accent/10 hover:bg-accent/20 rounded-xl text-sm font-bold text-accent transition-colors" onClick={() => handleProjectionStep(5)}>+5</button>
                      </div>
                    </div>
                  </>
                )}

                <div className="h-px bg-neutral-800/80 w-full" />

                {/* Hardware Selection Action Sheet Triggers */}
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    className="flex-1 flex flex-col items-center justify-center p-3 bg-neutral-800/60 hover:bg-neutral-800 active:bg-neutral-700 rounded-2xl border border-neutral-700/50 transition-colors" 
                    onClick={() => setActiveSheet('machine')}
                  >
                    <span className="text-[10px] uppercase font-bold text-neutral-500 mb-1 tracking-widest text-center w-full">Machine</span>
                    <span className="text-xs font-bold text-white truncate w-full text-center">{machines.find(m => m.id === defaultMachineId)?.name || 'Default'}</span>
                  </button>
                  <button 
                    type="button" 
                    className="flex-1 flex flex-col items-center justify-center p-3 bg-neutral-800/60 hover:bg-neutral-800 active:bg-neutral-700 rounded-2xl border border-neutral-700/50 transition-colors" 
                    onClick={() => setActiveSheet('usb')}
                  >
                    <span className="text-[10px] uppercase font-bold text-neutral-500 mb-1 tracking-widest text-center w-full">USB</span>
                    <span className="text-xs font-bold text-white truncate w-full text-center">{activeUsb?.name}</span>
                  </button>
                  <button 
                    type="button" 
                    className="flex-1 flex flex-col items-center justify-center p-3 bg-neutral-800/60 hover:bg-neutral-800 active:bg-neutral-700 rounded-2xl border border-neutral-700/50 transition-colors" 
                    onClick={() => setActiveSheet('jig')}
                  >
                    <span className="text-[10px] uppercase font-bold text-neutral-500 mb-1 tracking-widest text-center w-full">Jig</span>
                    <span className="text-xs font-bold text-white truncate w-full text-center">{activeJig?.name}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* === SUMMARY PILL (Front Layer, Static) === */}
          <button 
            className="relative z-10 pointer-events-auto w-full bg-[#262626] border border-neutral-600 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-3xl flex flex-col items-center justify-center pt-4 pb-4 touch-none transition-transform active:scale-[0.98]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* PRESET NAME (Own Line) */}
            <div className={`text-sm font-bold truncate max-w-full px-4 mb-1.5 ${activePreset ? 'text-neutral-200' : 'text-neutral-500'}`}>
              {activePreset ? activePreset.name : 'No Preset Active'}
            </div>
            
            {/* VARIABLES */}
            <div className="flex items-center justify-center w-full px-4 text-[13px] font-bold text-white font-mono truncate">
              <span className="text-accent shrink-0">{targetAngleSymbol}: {_nz(global.targetAngle, 15).toFixed(1)}°</span>
              <span className="mx-3 text-neutral-600 shrink-0">|</span>
              {isProjectionMode ? (
                <span className="text-neutral-300 shrink-0">Rear {(global.fixedUsbRear ?? global.fixedUsbHeight ?? 150).toFixed(1)} · Front {activeFrontUsb.toFixed(1)}</span>
              ) : (
                <span className="text-neutral-300 shrink-0">{global.useProtrusionMode ? 'Pb' : 'A'}: {_nz(global.useProtrusionMode ? global.protrusion : global.projection, 120).toFixed(1)} mm</span>
              )}
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
