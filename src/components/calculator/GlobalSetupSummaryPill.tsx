import * as React from 'react';

import { useStore } from '../../state/store';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../state/uiStore';
import { useDevStore } from '../../state/devStore';
import { computeSuggestedFrontUsbHeight } from '../../math/tormek';
import { _nz } from '../../utils/numbers';
import { DEFAULT_CONSTANTS } from '../../state/defaults';
import { Tag } from '../ui/Tag';

export function GlobalSetupSummaryPill() {
  const maskBottomFade = useDevStore((s) => s.maskBottomFade);
  
  const isSetupPanelOpen = useUIStore((s) => s.isSetupPanelOpen);
  const setIsSetupPanelOpen = useUIStore((s) => s.setSetupPanelOpen);

  const {
    targetAngle,
    calcMode,
    fixedUsbRear,
    fixedUsbHeight,
    fixedUsbFront,
    useCustomFrontUsb,
    useProtrusionMode,
    protrusion,
    projection,
    activeUsbId,
    activeJigId
  } = useStore(useShallow(s => s.global));

  const heightMode = useStore((s) => s.heightMode);
  
  const machines = useStore(useShallow((s) => s.machines));
  const defaultMachineId = useStore((s) => s.defaultMachineId);
  const jigs = useStore(useShallow((s) => s.jigs));
  const usbs = useStore(useShallow((s) => s.usbs));

  const constants =
    machines.find((m) => m.id === defaultMachineId)?.constants ||
    machines[0]?.constants ||
    DEFAULT_CONSTANTS;
  const isProjectionMode = calcMode === 'projection';
  
  const effectiveConsts = constants ?? DEFAULT_CONSTANTS;
  const rearVal = _nz(fixedUsbRear, _nz(fixedUsbHeight, 150));
  const activeUsb = usbs.find(u => u.id === activeUsbId) || usbs[0]; 
  const activeJig = jigs.find(j => j.id === activeJigId) || jigs[0];
  const dsVal = _nz(activeUsb?.Ds, 12);
  
  const suggestedFrontUsb = computeSuggestedFrontUsbHeight(
    rearVal,
    effectiveConsts,
    dsVal,
    heightMode === 'hr' ? 'hr' : 'hn'
  );
  
  const activeFrontUsb = useCustomFrontUsb
    ? _nz(fixedUsbFront, suggestedFrontUsb)
    : suggestedFrontUsb;

  // --- SWIPE TO OPEN GESTURE (For the Summary Pill) ---
  const touchStartY = React.useRef(0);
  
  const handlePillTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = e.clientY;
    }
  };

  const handlePillTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    let touchEndY = 0;
    if ('changedTouches' in e) {
      touchEndY = e.changedTouches[0].clientY;
    } else {
      touchEndY = e.clientY;
    }
    const deltaY = touchStartY.current - touchEndY;
    
    // deltaY > 40 means swiped UP.
    if (!isSetupPanelOpen && deltaY > 40) {
      setIsSetupPanelOpen(true);
    }
  };

  return (
    <div className="relative w-full shrink-0 rounded-[var(--ui-radius-mid)]">
      {/* Shadow Caster */}
      <div 
        className="absolute inset-0 rounded-[var(--ui-radius-mid)] z-[-1]" 
        style={{ boxShadow: maskBottomFade > 0 ? `0 -8px 32px rgba(0,0,0,0.4), 0 0px ${maskBottomFade}px ${maskBottomFade / 2}px #09090b` : '0 -8px 32px rgba(0,0,0,0.4)' }}
      />
      
      {/* Pill Content */}
      <div className="relative z-20">
        <button 
          type="button"
          className={`relative z-10 pointer-events-auto w-full ${isSetupPanelOpen ? 'neu-convex-pressed' : 'neu-convex neu-convex-active'} shrink-0 border border-amber-500/30 ring-1 ring-amber-500/20 rounded-[var(--ui-radius-mid)] flex flex-col items-center justify-center p-[var(--ui-gap)] touch-none group overflow-hidden`}
          onClick={() => setIsSetupPanelOpen(!isSetupPanelOpen)}
          onTouchStart={handlePillTouchStart}
          onTouchEnd={handlePillTouchEnd}
          onMouseDown={handlePillTouchStart}
          onMouseUp={handlePillTouchEnd}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-[var(--ui-radius-mid)] z-0" />

          {/* Top Row: Hardware Pill Chips */}
          <div className="relative z-10 flex flex-col items-start w-full gap-2 mb-3">
            <div className="grid grid-cols-3 gap-1.5 w-full">
              <Tag>{machines.find(m => m.id === defaultMachineId)?.name || 'Default'}</Tag>
              <Tag>{activeUsb?.name || 'USB'}</Tag>
              <Tag>{activeJig?.name || 'Jig'}</Tag>
            </div>
          </div>
          
          {/* Main Readouts Row */}
          <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-center justify-between w-full pt-2 border-t border-white/5 gap-2">
            {/* Target Angle */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Angle</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tabular-nums tracking-tight amber-glow">
                {_nz(targetAngle, 15).toFixed(1)}°
              </span>
            </div>

            {/* Separator / Drag Cue */}
            <div className="hidden sm:flex items-center gap-1 text-white/20">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 neu-concave" />
            </div>

            {/* Projection or USB Height */}
            <div className="flex items-baseline gap-1.5 text-right ml-auto sm:ml-0">
              {isProjectionMode ? (
                <>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">USB R/F</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">
                    {(fixedUsbRear ?? fixedUsbHeight ?? 150).toFixed(1)}
                    <span className="text-white/40 text-sm font-normal mx-0.5">/</span>
                    {activeFrontUsb.toFixed(1)}
                    <span className="text-xs text-white/40 font-normal ml-0.5">mm</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    {useProtrusionMode ? 'Pb' : 'Proj A'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                    {_nz(useProtrusionMode ? protrusion : projection, 120).toFixed(1)}
                    <span className="text-xs text-white/40 font-normal ml-0.5">mm</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

