

// Tormek USB Height Multi‑wheel Calculator – Rebuilt Baseline
// -----------------------------------------------------------
// This is a minimal, but fully working, single‑file React app
// that restores core Ton/Dutchman math, wheel handling and a
// basic UI so you can run and iterate again. Advanced features
// (wizard, presets, dual calibration, etc.) can be layered back
// on top of this stable foundation.


//================Imports=================
import * as React from 'react';
import { IconKebab, IconTrash } from './icons';
import type {
  BaseSide,
  CalibrationDiagnostics,
  CalibrationMeasurement,
  GlobalState,
  MachineConfig,
  MachineConstants,
  PresetStepRef,
  SessionPreset,
  SessionStep,
  Wheel,
} from './types/core';
import { _nz } from './utils/numbers';
import { blurOnEnter } from './utils/dom';
import { _load, _save } from './state/storage';
import { DEFAULT_CONSTANTS, DEFAULT_GLOBAL, DEFAULT_WHEELS } from './state/defaults';
import {
  calibrateBase,
  computeWheelResults,
  estimateMaxAngleErrorDeg,
} from './math/tormek';

// =============== Helpers ===============

// helpers moved to utils/state modules

// =============== Core Types ===============

// =============== Defaults ===============

// =============== Ton/Dutchman Math Core ===============

function GrindDirToggle({
  base,
  isHoning,
  canToggle,
  onToggle,
}: {
  base: BaseSide;
  isHoning: boolean;
  canToggle: boolean; // edit-mode control
  onToggle: () => void;
}) {
  const label = base === 'rear' ? 'R' : 'F'; // Rear / Front

  // Click lock: honing OR view-mode (canToggle=false)
  const effectiveLocked = isHoning || !canToggle;

  const title = isHoning
    ? 'Honing wheel: fixed to Edge Trailing (front base)'
    : !canToggle
    ? base === 'rear'
      ? 'Edge Leading (rear base)'
      : 'Edge Trailing (front base)'
    : base === 'rear'
    ? 'Edge Leading (rear base) – click to switch to Edge Trailing'
    : 'Edge Trailing (front base) – click to switch to Edge Leading';

  const baseClasses =
    'px-2 py-1 text-[0.65rem] rounded border text-neutral-50 transition-colors';

  let stateClasses: string;

  // 🔹 Styling: ONLY honing is grey. Non-honing is coloured, even if locked.
  if (isHoning) {
    stateClasses =
      'border-neutral-700 bg-neutral-900 text-neutral-500 opacity-60 cursor-not-allowed';
  } else if (base === 'rear') {
    // Edge leading
    stateClasses = 'border-emerald-500 bg-emerald-900/40 text-emerald-200';
  } else {
    // Edge trailing
    stateClasses = 'border-sky-500 bg-sky-900/40 text-sky-200';
  }

  return (
    <button
      type="button"
      title={title}
      onClick={() => {
        if (effectiveLocked) return; // still locked in view mode / honing
        onToggle();
      }}
      className={baseClasses + ' ' + stateClasses}
    >
      {label}
    </button>
  );
}
// =============== Wheel Selector Dropdown===============
function WheelSelect({
  wheels,
  value,
  onChange,
}: {
  wheels: Wheel[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const [isMenuClosing, setIsMenuClosing] = React.useState(false);
  const menuCloseTimerRef = React.useRef<number | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const touchMovedRef = React.useRef(false);

  const selected = wheels.find(w => w.id === value) || null;

  const handleSelect = (id: string) => {
    onChange(id);
    closeMenu();
  };

  const openMenu = React.useCallback(() => {
    if (menuCloseTimerRef.current) {
      window.clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
    setIsMenuVisible(true);
    setIsMenuClosing(false);
    setOpen(true);
  }, []);

  const closeMenu = React.useCallback(() => {
    if (!isMenuVisible && !open) return;
    if (menuCloseTimerRef.current) {
      window.clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
    setOpen(false);
    setIsMenuClosing(true);
    menuCloseTimerRef.current = window.setTimeout(() => {
      setIsMenuVisible(false);
      setIsMenuClosing(false);
      menuCloseTimerRef.current = null;
    }, 160);
  }, [isMenuVisible, open]);

    React.useEffect(() => {
    if (!isMenuVisible) return;

    const handlePointer = (event: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      const t = event.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY };
      touchMovedRef.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = event.touches[0];
      const dx = Math.abs(t.clientX - touchStartRef.current.x);
      const dy = Math.abs(t.clientY - touchStartRef.current.y);
      if (dx > 8 || dy > 8) {
        touchMovedRef.current = true; // scrolling/dragging
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchMovedRef.current) return;
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [closeMenu, isMenuVisible]);

  React.useEffect(() => {
    return () => {
      if (menuCloseTimerRef.current) {
        window.clearTimeout(menuCloseTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="relative text-xs min-w-[9rem] max-w-[9rem]">
      {/* Shell / trigger */}
      <button
        type="button"
        className={
           'inline-flex w-full items-center justify-between gap-1 rounded border px-2 py-1 text-xs ' +
          (isMenuVisible
            ? 'border-sky-400 bg-neutral-900 shadow-md'
            : 'border-neutral-700 bg-neutral-950 hover:bg-neutral-900')
        }
        onClick={() => {
          if (isMenuVisible && !isMenuClosing) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
      >
        <span className="truncate text-left">
          {selected ? selected.name : 'Select wheel...'}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={
            'w-3 h-3 transition-transform ' + (isMenuVisible ? 'rotate-180' : 'rotate-0')
          }
          aria-hidden="true"
        >
          <path
            d="M7 10l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Menu */}
      {isMenuVisible && (
        <div
          className="absolute left-0 mt-1 z-20 w-44 max-h-36 overflow-auto rounded border border-neutral-700 bg-neutral-950 shadow-lg"
          style={{
            animation: `${isMenuClosing ? 'dropdownOut 140ms ease-in forwards' : 'dropdownIn 160ms ease-out forwards'}`,
            transformOrigin: 'top left',
          }}
        >
          {wheels.length === 0 && (
            <div className="px-2 py-1 text-[0.7rem] text-neutral-500">
              No wheels defined
            </div>
          )}

          <button
            type="button"
            className="w-full px-2 py-1 text-left text-[0.75rem] bg-neutral-950 text-neutral-300 hover:bg-neutral-900"
            onClick={() => handleSelect('')}
          >
            Select wheel...
          </button>

          {wheels.map(w => {
            const isActive = w.id === value;
            return (
              <button
                key={w.id}
                type="button"
                className={
                  'w-full px-2 py-1 text-left text-[0.75rem] ' +
                  (isActive
                    ? 'bg-emerald-900/40 text-emerald-100'
                    : 'bg-neutral-950 text-neutral-100 hover:bg-neutral-900')
                }
                onClick={() => handleSelect(w.id)}
              >
                {w.name}
                {w.isHoning && (
                  <span className="ml-1 text-[0.65rem] text-emerald-300">• honing</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============== Preset Selector Dropdown===============
function PresetSelect({
  presets,
  value,
  onChange,
}: {
  presets: SessionPreset[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const [isMenuClosing, setIsMenuClosing] = React.useState(false);
  const menuCloseTimerRef = React.useRef<number | null>(null);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const touchMovedRef = React.useRef(false);

  const selected = presets.find(p => p.id === value) || null;

  const handleSelect = (id: string) => {
    onChange(id);  // parent will load the preset
    closeMenu();
  };

  const openMenu = React.useCallback(() => {
    if (menuCloseTimerRef.current) {
      window.clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
    setIsMenuVisible(true);
    setIsMenuClosing(false);
    setOpen(true);
  }, []);

  const closeMenu = React.useCallback(() => {
    if (!isMenuVisible && !open) return;
    if (menuCloseTimerRef.current) {
      window.clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
    setOpen(false);
    setIsMenuClosing(true);
    menuCloseTimerRef.current = window.setTimeout(() => {
      setIsMenuVisible(false);
      setIsMenuClosing(false);
      menuCloseTimerRef.current = null;
    }, 160);
  }, [isMenuVisible, open]);

  React.useEffect(() => {
    if (!isMenuVisible) return;

    const handlePointer = (event: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      const t = event.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY };
      touchMovedRef.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = event.touches[0];
      const dx = Math.abs(t.clientX - touchStartRef.current.x);
      const dy = Math.abs(t.clientY - touchStartRef.current.y);
      if (dx > 8 || dy > 8) {
        touchMovedRef.current = true; // scrolling/dragging
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchMovedRef.current) return;
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [closeMenu, isMenuVisible]);

  React.useEffect(() => {
    return () => {
      if (menuCloseTimerRef.current) {
        window.clearTimeout(menuCloseTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="relative inline-block text-xs">

      {/* Trigger */}
      <button
        type="button"
        className={
          'inline-flex items-center justify-between gap-1 rounded border px-2 py-1.5 min-w-[8rem] text-xs ' +
          (isMenuVisible
            ? 'border-sky-400 bg-neutral-900 shadow-md'
            : 'border-neutral-700 bg-neutral-950 hover:bg-neutral-900')
        }
        onClick={() => {
          if (isMenuVisible && !isMenuClosing) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
      >
        <span className="truncate text-left">
          {selected ? selected.name : 'Presets…'}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={
            'w-3 h-3 transition-transform ' + (isMenuVisible ? 'rotate-180' : 'rotate-0')
          }
          aria-hidden="true"
        >
          <path
            d="M7 10l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Menu */}
      {isMenuVisible && (
        <div
          className="absolute right-0 mt-1 z-20 w-48 max-h-36 overflow-auto rounded border border-neutral-700 bg-neutral-950 shadow-lg"
          style={{
            animation: `${isMenuClosing ? 'dropdownOut 140ms ease-in forwards' : 'dropdownIn 160ms ease-out forwards'}`,
            transformOrigin: 'top right',
          }}
        >
          {presets.length === 0 && (
            <div className="px-2 py-1 text-[0.7rem] text-neutral-500">
              No presets saved
            </div>
          )}
          {presets.map(p => {
            const isActive = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                className={
                  'w-full px-2 py-1 text-left text-[0.75rem] ' +
                  (isActive
                    ? 'bg-emerald-900/40 text-emerald-100'
                    : 'bg-neutral-950 text-neutral-100 hover:bg-neutral-900')
                }
                onClick={() => handleSelect(p.id)}
              >
                <span className="truncate">{p.name}</span>
                <span className="ml-1 text-[0.65rem] text-neutral-500">
                  · {p.steps.length} step{p.steps.length === 1 ? '' : 's'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================== App =======================================

function App() {
  const [global, setGlobal] = React.useState<GlobalState>(() =>
    _load('t_global', DEFAULT_GLOBAL)
  );
  const [constants, setConstants] = React.useState<MachineConstants>(() =>
    _load('t_constants', DEFAULT_CONSTANTS)
  );
  const [wheels, setWheels] = React.useState<Wheel[]>(() =>
    _load('t_wheels', DEFAULT_WHEELS)
  );
  const [sessionSteps, setSessionSteps] = React.useState<SessionStep[]>(() =>
    _load('t_sessionSteps', [])
  );
  const [sessionPresets, setSessionPresets] = React.useState<SessionPreset[]>(() =>
    _load('t_sessionPresets', [])
  );
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>('');
  const [isPresetDialogOpen, setIsPresetDialogOpen] = React.useState(false);
  const [presetNameDraft, setPresetNameDraft] = React.useState('');
  const [isPresetManagerOpen, setIsPresetManagerOpen] = React.useState(false);
  const [heightMode, setHeightMode] = React.useState<'hn' | 'hr'>(() => {
    const val = _load<'hn' | 'hr'>('t_heightMode', 'hn');
    return val === 'hr' ? 'hr' : 'hn';
  });
  const [isProgressionMenuOpen, setIsProgressionMenuOpen] = React.useState(false);
  const [isProgressionMenuVisible, setIsProgressionMenuVisible] = React.useState(false);
  const [isProgressionMenuClosing, setIsProgressionMenuClosing] = React.useState(false);
  const progressionMenuRef = React.useRef<HTMLDivElement | null>(null);
  const progressionMenuCloseTimerRef = React.useRef<number | null>(null);

  const [view, setView] = React.useState<
  'calculator' | 'wheels' | 'settings'
>('calculator');
  const [settingsView, setSettingsView] = React.useState<'machine' | 'calibration'>('machine');

  const [isWheelConfigOpen, setIsWheelConfigOpen] = React.useState(false);

  const openProgressionMenu = React.useCallback(() => {
    if (progressionMenuCloseTimerRef.current) {
      window.clearTimeout(progressionMenuCloseTimerRef.current);
      progressionMenuCloseTimerRef.current = null;
    }
    setIsProgressionMenuVisible(true);
    setIsProgressionMenuClosing(false);
    setIsProgressionMenuOpen(true);
  }, []);

  const closeProgressionMenu = React.useCallback(() => {
    if (!isProgressionMenuVisible && !isProgressionMenuOpen) return;
    if (progressionMenuCloseTimerRef.current) {
      window.clearTimeout(progressionMenuCloseTimerRef.current);
      progressionMenuCloseTimerRef.current = null;
    }
    setIsProgressionMenuOpen(false);
    setIsProgressionMenuClosing(true);
    progressionMenuCloseTimerRef.current = window.setTimeout(() => {
      setIsProgressionMenuVisible(false);
      setIsProgressionMenuClosing(false);
      progressionMenuCloseTimerRef.current = null;
    }, 160);
  }, [isProgressionMenuOpen, isProgressionMenuVisible]);


    // Track which wheel should auto-focus in the Wheel Manager
  const focusWheelIdRef = React.useRef<string | null>(null);

    // Scroll target for newly added progression steps
  const progressionEndRef = React.useRef<HTMLDivElement | null>(null);

  // Track last loaded preset and its steps
const lastLoadedPresetIdRef = React.useRef<string | null>(null);
const lastLoadedStepsRef = React.useRef<string | null>(null);


  // 🔒 Safety net: de-duplicate wheels by id (keep first, drop duplicates)
  React.useEffect(() => {
    const seen = new Set<string>();
    const deduped = wheels.filter(w => {
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });

    if (deduped.length !== wheels.length) {
      setWheels(deduped);
    }
  }, []); // run once on mount

  // Calibration wizard state (single-base)
  const [calibBase, setCalibBase] = React.useState<BaseSide>('rear');
  const [calibDa, setCalibDa] = React.useState<number>(12); // axle diameter
  const [calibDs, setCalibDs] = React.useState<number>(DEFAULT_GLOBAL.usbDiameter);
  const [calibCount, setCalibCount] = React.useState<number>(4); // 3/4/5, default 4 (recommended)
  const [calibRows, setCalibRows] = React.useState<CalibrationMeasurement[]>(() => []);
  const [calibResult, setCalibResult] = React.useState<{
    hc: number;
    o: number;
    diagnostics: CalibrationDiagnostics;
    angleErrorDeg: number | null;
  } | null>(null);
  const [calibError, setCalibError] = React.useState<string | null>(null);

  const activeMachine: MachineConfig = {
    id: 'machine-1',
    name: 'Default machine',
    constants,
    usbDiameter: global.usbDiameter,
    jigDiameter: global.jig.Dj,
  };
  const angleSymbol = 'θ';

  // Persist basic state
  React.useEffect(() => {
    _save('t_global', global);
  }, [global]);

  React.useEffect(() => {
    _save('t_constants', constants);
  }, [constants]);

  React.useEffect(() => {
    _save('t_wheels', wheels);
  }, [wheels]);

  React.useEffect(() => {
    _save('t_sessionSteps', sessionSteps);
  }, [sessionSteps]);

  React.useEffect(() => {
    _save('t_sessionPresets', sessionPresets);
  }, [sessionPresets]);

  React.useEffect(() => {
    _save('t_heightMode', heightMode);
  }, [heightMode]);

  React.useEffect(() => {
    return () => {
      if (progressionMenuCloseTimerRef.current) {
        window.clearTimeout(progressionMenuCloseTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!isProgressionMenuVisible) return;
    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const el = progressionMenuRef.current;
      if (el && !el.contains(event.target as Node)) {
        closeProgressionMenu();
      }
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
    };
  }, [closeProgressionMenu, isProgressionMenuVisible]);


  // Keep preset dropdown in sync when the progression is edited
  React.useEffect(() => {
    // If no preset is currently selected, nothing to sync
    if (!selectedPresetId) {
      lastLoadedStepsRef.current = null;
      return;
    }

    // Build a minimal snapshot of the current progression configuration
    const currentSnapshot = JSON.stringify(
      sessionSteps.map(s => ({
        wheelId: s.wheelId,
        base: s.base,
        angleOffset: s.angleOffset,
      }))
    );

    // If we don't yet have a snapshot for this selection, initialise it once
    if (lastLoadedStepsRef.current === null) {
      lastLoadedStepsRef.current = currentSnapshot;
      return;
    }

    // If the current progression no longer matches the snapshot,
    // the user has modified the config → clear the preset selection.
    if (currentSnapshot !== lastLoadedStepsRef.current) {
      lastLoadedStepsRef.current = null;
      setSelectedPresetId('');
    }
  }, [sessionSteps, selectedPresetId]);


  // Ensure calibRows length matches calibCount
  const ensureCalibRowsLength = (count: number) => {
    setCalibRows(prev => {
      const next = [...prev];
      while (next.length < count) {
        next.push({ hn: '', CAo: '' });
      }
      return next;
    });
  };

  const handleRunCalibration = () => {
    setCalibError(null);
    setCalibResult(null);

    const Da = calibDa || 12;
    const Ds = calibDs || global.usbDiameter;

    const rowsToUse = calibRows.slice(0, calibCount);
    const result = calibrateBase(rowsToUse, Da, Ds);
    if (!result) {
      setCalibError('Need at least two valid hn + CAo rows with numeric values.');
      return;
    }

    const proposedConstants: MachineConstants = {
      ...activeMachine.constants,
      [calibBase]: {
        hc: result.hc,
        o: result.o,
      },
    } as MachineConstants;

    const machineLike: MachineConfig = {
      ...activeMachine,
      constants: proposedConstants,
    };

    const angleErr = estimateMaxAngleErrorDeg(
      result.diagnostics,
      calibBase,
      global,
      machineLike,
      wheels
    );

    setCalibResult({
      hc: result.hc,
      o: result.o,
      diagnostics: result.diagnostics,
      angleErrorDeg: angleErr,
    });
  };

  const handleApplyCalibration = () => {
    if (!calibResult) return;
    setConstants(prev => ({
      ...prev,
      [calibBase]: {
        ...prev[calibBase],
        hc: calibResult.hc,
        o: calibResult.o,
      },
    }) as MachineConstants);
  };

  const wheelResults = computeWheelResults(wheels, sessionSteps, global, activeMachine);
  const presetNameTrimmed = presetNameDraft.trim();
  const isPresetNameDuplicate =
    presetNameTrimmed.length > 0 &&
    sessionPresets.some(p => p.name.toLowerCase() === presetNameTrimmed.toLowerCase());

  const updateWheel = (id: string, patch: Partial<Wheel>) => {
    setWheels(prev => prev.map(w => (w.id === id ? { ...w, ...patch } : w)));
  };

  const addWheel = () => {
    const id = `wheel-${Date.now()}`;
    const w: Wheel = {
      id,
      name: 'New wheel',
      D: 250,
      DText: '250',
      angleOffset: 0,
      baseForHn: 'rear',
      isHoning: false,
    };

    // Tell the Wheel Manager to auto-focus this wheel's name input
    focusWheelIdRef.current = id;

    setWheels(prev => [...prev, w]);
  };

  const deleteWheel = (id: string) => {
    const target = wheels.find(w => w.id === id);
    const label = target
      ? `Delete wheel "${target.name}"?`
      : 'Delete this wheel?';

    if (!window.confirm(label)) {
      return;
    }

    // Remove the wheel itself
    setWheels(prev => prev.filter(w => w.id !== id));

    // Also remove any progression steps that referenced this wheel
    setSessionSteps(prev => prev.filter(step => step.wheelId !== id));
  };
const addStep = () => {
  if (wheels.length === 0) return;

  const step: SessionStep = {
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    wheelId: '', // start unselected
    base: 'rear',
    angleOffset: 0,
  };

  setSessionSteps(prev => {
    const next = [...prev, step];

    // Auto-scroll after DOM update
    window.requestAnimationFrame(() => {
      if (progressionEndRef.current) {
        progressionEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }
    });

    return next;
  });
};

const updateStep = (id: string, patch: Partial<SessionStep>) => {
  setSessionSteps(prev =>
    prev.map(s => (s.id === id ? { ...s, ...patch } : s))
  );
};

const moveStep = (index: number, delta: number) => {
  setSessionSteps(prev => {
    const next = [...prev];
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= next.length) return prev;
    const [item] = next.splice(index, 1);
    next.splice(newIndex, 0, item);
    return next;
  });
};

const handleSavePreset = () => {
  const name = presetNameDraft.trim();
  if (!name) return;
  if (sessionSteps.length === 0) return;
  if (sessionPresets.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    window.alert('A preset with that name already exists. Choose a different name.');
    return;
  }

  // Build preset steps from current session steps
  const presetSteps: PresetStepRef[] = sessionSteps
    .map(step => {
      const wheel = wheels.find(w => w.id === step.wheelId);
      if (!wheel) return null;
      return {
        wheelId: wheel.id,
        wheelName: wheel.name,
        base: step.base,
        angleOffset: step.angleOffset,
      } as PresetStepRef;
    })
    .filter((x): x is PresetStepRef => x !== null);

  if (presetSteps.length === 0) return;

  const newPreset: SessionPreset = {
    id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    notes: undefined,
    createdAt: new Date().toISOString(),
    version: 1,
    steps: presetSteps,
  };

  setSessionPresets(prev => [...prev, newPreset]);
  setSelectedPresetId(newPreset.id);

  // Close dialog + clear draft
  setIsPresetDialogOpen(false);
  setPresetNameDraft('');
};

const handleLoadPreset = (presetId: string) => {
  const preset = sessionPresets.find(p => p.id === presetId);
  if (!preset) return;

  const resolvedSteps: SessionStep[] = [];

  for (const ref of preset.steps) {
    // Prefer ID, fall back to matching by name
    const wheel =
      wheels.find(w => w.id === ref.wheelId) ||
      wheels.find(w => w.name === ref.wheelName);

    if (!wheel) continue;

    resolvedSteps.push({
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      wheelId: wheel.id,
      base: ref.base,
      angleOffset: ref.angleOffset,
    });
  }

  if (resolvedSteps.length === 0) return;
  setSessionSteps(resolvedSteps);

  // Remember that this preset is now the active one
  lastLoadedPresetIdRef.current = preset.id;
  lastLoadedStepsRef.current = JSON.stringify(
    resolvedSteps.map(s => ({
      wheelId: s.wheelId,
      base: s.base,
      angleOffset: s.angleOffset,
    }))
  );
  setSelectedPresetId(preset.id);
};

  const clearSteps = () => {
    setSessionSteps([]);
  };

  const progressionMenuItems = React.useMemo(
    () => [
      {
        label: 'Manage presets',
        disabled: false,
        action: () => setIsPresetManagerOpen(true),
      },
      {
        label: 'Save as preset',
        disabled: sessionSteps.length === 0,
        action: () => {
          setPresetNameDraft('');
          setIsPresetDialogOpen(true);
        },
      },
      {
        label: 'Clear progression',
        disabled: sessionSteps.length === 0,
        action: () => clearSteps(),
      },
      {
        label:
          heightMode === 'hn' ? 'Show hr only (rear ref)' : 'Show hn only (base ref)',
        disabled: false,
        action: () => setHeightMode(mode => (mode === 'hn' ? 'hr' : 'hn')),
      },
    ],
    [sessionSteps.length, heightMode]
  );

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100 p-4 flex flex-col gap-4">
      <h1 className="text-lg font-semibold">UWGAS Dev build</h1>

<div className="flex gap-2 text-sm mb-2">
  <button
    type="button"
    className={
      'px-2 py-1 rounded border ' +
      (view === 'calculator'
        ? 'border-emerald-500 bg-emerald-900/40'
        : 'border-neutral-700 bg-neutral-900')
    }
    onClick={() => setView('calculator')}
  >
    Calculator
  </button>

  <button
    type="button"
    className={
      'px-2 py-1 rounded border ' +
      (view === 'wheels'
        ? 'border-emerald-500 bg-emerald-900/40'
        : 'border-neutral-700 bg-neutral-900')
    }
    onClick={() => setView('wheels')}
  >
    Wheel Manager
  </button>

  <button
    type="button"
    className={
      'px-2 py-1 rounded border ' +
      (view === 'settings'
        ? 'border-emerald-500 bg-emerald-900/40'
        : 'border-neutral-700 bg-neutral-900')
    }
    onClick={() => setView('settings')}
  >
    Settings
  </button>
</div>

      {view === 'calculator' && (
        <>
          {/* Global controls */}
          <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/40 flex flex-col gap-2 max-w-xl">
            <h2 className="text-sm font-semibold text-neutral-200">Global setup</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex flex-col gap-1">
                <span className="text-neutral-300">Projection A (mm)</span>
                <input
                  type="number"
                  className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
                  value={global.projection}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({ ...g, projection: _nz(e.target.value, g.projection) }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-neutral-300">Target angle {angleSymbol}° (/side)</span>
                <input
                  type="number"
                  className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
                  value={global.targetAngle}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({ ...g, targetAngle: _nz(e.target.value, g.targetAngle) }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-neutral-300">USB diameter Ds (mm)</span>
                <input
                  type="number"
                  className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
                  value={global.usbDiameter}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({ ...g, usbDiameter: _nz(e.target.value, g.usbDiameter) }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-neutral-300">Jig diameter Dj (mm)</span>
                <input
                  type="number"
                  className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
                  value={global.jig.Dj}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({ ...g, jig: { ...g.jig, Dj: _nz(e.target.value, g.jig.Dj) } }))
                  }
                />
              </label>
            </div>
          </section>

          {/*Progression View*/}
          <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/20 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-sm font-semibold text-neutral-200">Progression</h2>

              <div className="flex items-center gap-3 ml-auto">
                <PresetSelect
                  presets={sessionPresets}
                  value={selectedPresetId || ''}
                  onChange={id => {
                    setSelectedPresetId(id);
                    if (id) {
                      handleLoadPreset(id); // auto-load on selection
                    }
                  }}
                />

                {/*Edit <-> Back toggle*/}
                <button
                  type="button"
                  className="w-12 px-2 py-1 text-center rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs"
                  onClick={() => setIsWheelConfigOpen(open => !open)}
                >
                  {isWheelConfigOpen ? 'Back' : 'Edit'}
                </button>

                {/*Kebab menu Progression*/}
                <div ref={progressionMenuRef} className="relative">
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded bg-transparent text-xs text-neutral-300 focus-visible:outline-none active:bg-transparent"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    title="Progression menu"
                    onClick={() => {
                      if (isProgressionMenuVisible && !isProgressionMenuClosing) {
                        closeProgressionMenu();
                      } else {
                        openProgressionMenu();
                      }
                    }}
                  >
                    <IconKebab className="w-4 h-4" />
                  </button>

                  {isProgressionMenuVisible && (
                    <div
                      className="absolute right-0 mt-1 w-52 rounded border border-neutral-700 bg-neutral-950 shadow-lg text-xs z-30"
                      style={{
                        animation: `${isProgressionMenuClosing ? 'menuFadeSlideOut 100ms ease-in forwards' : 'menuFadeSlideIn 100ms ease-out forwards'}`,
                        transformOrigin: 'top right',
                      }}
                    >
                      {progressionMenuItems.map(item => (
                        <button
                          key={item.label}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-neutral-900 disabled:opacity-40"
                          disabled={item.disabled}
                          onClick={() => {
                            if (item.disabled) return;
                            item.action();
                            closeProgressionMenu();
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* TOGGLE: math vs progression cards */}
            {/* Shared wrapper so cards start at the exact same vertical position in both modes */}
            <div className="mt-2">
              {isWheelConfigOpen ? (
                // EDIT MODE – progression controls
                <div className="flex flex-col gap-3 text-xs">
                  {/* Empty state when no steps exist */}
                  {sessionSteps.length === 0 && (
                    <div className="text-xs text-neutral-400 border border-dashed border-neutral-700 rounded p-2">
                      No steps defined yet. Click <span className="font-semibold">+ Add step</span> to
                      start building a progression. When at least one step exists, the calculator
                      view will follow this sequence.
                    </div>
                  )}

                  {/* Steps list */}
                  {sessionSteps.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {sessionSteps.map((step, index) => {
                        const wheel =
                          wheels.find(w => w.id === step.wheelId) || {
                            id: '',
                            name: 'Select wheel...',
                            D: 0,
                            DText: '',
                            angleOffset: 0,
                            baseForHn: 'rear',
                            isHoning: false,
                          };
                        const isHoning = wheel.isHoning;

                        return (
                          <div
                            key={step.id}
                            className="border border-neutral-700 rounded bg-neutral-950/40 flex flex-col"
                          >
                            {/* === Header bar: step badge + wheel selector + grind direction + delete === */}
                            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 px-2 py-1.5 bg-neutral-900/80 min-h-[44px]">
                              {/* LEFT: step badge + grind direction + wheel select */}
                              <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                                {/* Step badge */}
                                <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[0.7rem] font-mono text-neutral-100 -ml-1">
                                  {index + 1}
                                </div>

                                {/* Grind direction toggle – EL/ET, interactive in edit mode for non-honing */}
                                <GrindDirToggle
                                  base={step.base}
                                  isHoning={isHoning}
                                  canToggle={!isHoning}
                                  onToggle={() =>
                                    updateStep(step.id, {
                                      base: step.base === 'rear' ? 'front' : 'rear',
                                    })
                                  }
                                />

                                {/* Wheel selector – now grouped immediately to the right of the toggle */}
                                <WheelSelect
                                  wheels={wheels}
                                  value={step.wheelId}
                                  onChange={id => {
                                    const newWheel = wheels.find(w => w.id === id);
                                    if (!newWheel) return;
                                    updateStep(step.id, {
                                      wheelId: newWheel.id,
                                      base: newWheel.isHoning ? 'front' : step.base,
                                    });
                                  }}
                                />
                              </div>

                              {/* RIGHT: D editor + delete */}
                              <div className="flex items-center gap-0.5 flex-nowrap ml-auto">
                                {/* Diameter editor */}
                                <label className="flex items-center gap-1 text-[0.7rem] text-neutral-300">
                                  <span>D</span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    className="w-[64px] rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-[0.8rem] font-mono mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!wheel.id}
                                    value={
                                      wheel.DText !== undefined
                                        ? wheel.DText
                                        : Number.isNaN(wheel.D)
                                        ? ''
                                        : String(wheel.D)
                                    }
                                    onKeyDown={blurOnEnter}
                                    onFocus={e => e.target.select()}
                                    onChange={e => {
                                      const text = e.target.value;
                                      const patch: Partial<Wheel> = { DText: text };

                                      const trimmed = text.trim();
                                      if (trimmed === '') {
                                        patch.D = NaN as unknown as number;
                                        updateWheel(wheel.id, patch);
                                        return;
                                      }

                                      const normalised = trimmed.replace(',', '.');
                                      const val = Number(normalised);

                                      if (!Number.isNaN(val)) {
                                        patch.D = Math.round(val * 100) / 100;
                                      }
                                      updateWheel(wheel.id, patch);
                                    }}
                                  />
                                  <span>mm</span>
                                </label>

                                {/* Delete step button*/}
                                <button
                                  type="button"
                                  className="text-red-400 hover:text-red-300 active:scale-95 transition-transform ml-1"
                                  onClick={() =>
                                    setSessionSteps(prev => prev.filter(s => s.id !== step.id))
                                  }
                                  title="Delete step"
                                >
                                  <IconTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* === Body: angle offset + sort controls anchored at bottom === */}
                            <div className="px-2 py-2 flex items-stretch gap-2">
                              {/* Left: angle offset */}
                              <div className="flex-1 flex flex-col gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-neutral-400 text-[0.7rem]">
                                    {angleSymbol} offset (deg)
                                  </span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    className="w-10 rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-right text-xs"
                                    onKeyDown={blurOnEnter}
                                    value={step.angleOffset === 0 ? '' : step.angleOffset}
                                    placeholder="0"
                                    onFocus={e => {
                                      // Select only if non-empty for quick overwrite
                                      if (e.target.value !== '') {
                                        e.target.select();
                                      }
                                    }}
                                    onChange={e => {
                                      const text = e.target.value;
                                      if (text.trim() === '') {
                                        // Empty input = treat as 0 (no offset)
                                        updateStep(step.id, { angleOffset: 0 });
                                        return;
                                      }
                                      const val = Number(text);
                                      if (!Number.isNaN(val)) {
                                        updateStep(step.id, { angleOffset: val });
                                      }
                                    }}
                                  />
                                  <span className="text-neutral-400 text-[0.7rem]">°</span>
                                </div>
                              </div>

                              {/* Right: sort controls, anchored to the bottom */}
                              <div className="flex flex-col justify-end items-end gap-2">
                                <div className="flex flex-col gap-1 items-end">
                                  <button
                                    type="button"
                                    className="px-2 py-2 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs disabled:opacity-40 active:scale-95 transition-transform"
                                    onClick={() => moveStep(index, -1)}
                                    disabled={index === 0}
                                    title="Move up"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    className="px-2 py-2 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs disabled:opacity-40 active:scale-95 transition-transform"
                                    onClick={() => moveStep(index, 1)}
                                    disabled={index === sessionSteps.length - 1}
                                    title="Move down"
                                  >
                                    ↓
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add step button — same width and spacing as cards */}
                  <button
                    type="button"
                    className="w-full px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs text-center disabled:opacity-40"
                    onClick={addStep}
                    disabled={wheels.length === 0}
                  >
                    + Add step
                  </button>

                  {/* Scroll anchor */}
                  <div ref={progressionEndRef} />
                </div>
              ) : (
                // VIEW MODE – if no progression, show prompt instead of default wheels
                sessionSteps.length === 0 ? (
                  <div className="text-xs text-neutral-400 border border-dashed border-neutral-700 rounded p-2">
                    No progression steps defined yet. Click{' '}
                    <span className="font-semibold">Edit progression</span> above to add wheels and
                    steps for this calculator.
                  </div>
                ) : (
                  <>
                    {/* Calc panel: progression results */}
                    <div className="grid gap-1 md:grid-cols-2">
                    {wheelResults.map((r, index) => {
                      const angleOffset = r.step?.angleOffset ?? 0;
                      const hasOffset = angleOffset !== 0;
                      const formatDeg = (val: number) => val.toFixed(2).replace(/\.?0+$/, '');
                      const betaValueClass = hasOffset
                        ? angleOffset > 0
                          ? 'text-emerald-300'
                          : 'text-rose-300'
                        : 'text-neutral-500';
                      const betaLabelClass = hasOffset ? 'text-neutral-300' : 'text-neutral-500';
                      const offsetSign = angleOffset > 0 ? '+' : '';

                      return (
                        <div
                          key={r.step?.id ?? r.wheel.id}
                          className="border border-neutral-700 rounded bg-neutral-950/40 overflow-hidden"
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

                              {/* Grind direction indicator - read-only in view mode */}
                              {r.step && (
                                <GrindDirToggle
                                  base={r.step.base}
                                  isHoning={r.wheel.isHoning}
                                  canToggle={false}
                                  onToggle={() => {}}
                                />
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
                          <div className="px-2 py-2 flex flex-col gap-2">
                            {heightMode === 'hn' ? (
                              <div className="border border-neutral-700 rounded p-2 flex flex-col gap-1">
                                <div className="flex items-center text-[0.75rem] text-neutral-300">
                                  <span>
                                    {r.step?.base === 'front'
                                      ? 'Front base USB height'
                                      : 'Rear base USB height'}
                                  </span>
                                </div>
                                <div className="font-mono text-sm text-neutral-100">
                                  hn = {r.hnBase.toFixed(2)} mm
                                </div>
                                <div className={`text-[0.7rem] ${betaLabelClass}`}>
                                  {angleSymbol} eff ={' '}
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
                                </div>
                              </div>
                            ) : (
                              <div className="border border-neutral-700 rounded p-2 flex flex-col gap-1">
                                <div className="flex items-center text-[0.75rem] text-neutral-300">
                                  <span>Wheel to USB height (hr)</span>
                                </div>
                                <div className="font-mono text-sm text-neutral-100">
                                  hr = {r.hrWheel.toFixed(2)} mm
                                </div>
                                <div className={`text-[0.7rem] ${betaLabelClass}`}>
                                  {angleSymbol} eff ={' '}
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
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </>
                )
              )}
            </div>
          </section>
        </>
      )}

{view === 'wheels' && (
  <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/30 flex flex-col gap-3 max-w-3xl mx-auto">
    <div className="flex justify-between items-center">
      <h2 className="text-sm font-semibold text-neutral-200">Wheel Manager</h2>
      <button
        type="button"
        className="px-2 py-1 text-xs rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
        onClick={addWheel}
      >
        + Add Wheel
      </button>
    </div>

    <p className="text-xs text-neutral-300">
      Configure your grinding and honing wheels here. These settings are shared with
      the calculator view and saved to your browser.
    </p>

    <div className="grid gap-2 md:grid-cols-2">
      {wheels.map(w => (
        <div
          key={w.id}
          className="border border-neutral-700 rounded-md p-2 bg-neutral-950/40 flex flex-col gap-2"
        >
          {/* Name */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">Wheel name</span>
            <input
              className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
              value={w.name}
              ref={el => {
                if (el && focusWheelIdRef.current === w.id && view === 'wheels') {
                  el.focus();
                  el.select();
                  // one-shot: don't refocus on every render
                  focusWheelIdRef.current = null;
                }
              }}
              onKeyDown={blurOnEnter}
              onFocus={e => e.target.select()}
              onChange={e => updateWheel(w.id, { name: e.target.value })}
            />
          </div>

        {/* Diameter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-300">D</span>
          <input
            type="text"
            inputMode="decimal"
            className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-right text-sm appearance-none"
            value={
              w.DText !== undefined
                ? w.DText
                : Number.isNaN(w.D)
                ? ''
                : String(w.D)
            }
            onKeyDown={blurOnEnter}
            onFocus={e => e.target.select()}
            onChange={e => {
              const text = e.target.value;

              // Always store the raw text so the user sees exactly what they typed
              const patch: Partial<Wheel> = { DText: text };

              const trimmed = text.trim();
              if (trimmed === '') {
                // Empty: clear numeric value as well
                patch.D = NaN as unknown as number;
                updateWheel(w.id, patch);
                return;
              }

              const normalised = trimmed.replace(',', '.');
              const val = Number(normalised);

              if (!Number.isNaN(val)) {
                // Valid number: store rounded to 2 dp for the math side
                patch.D = Math.round(val * 100) / 100;
              }
              // If it's not a valid number yet (e.g. "2."), we still keep DText
              // but don't touch D, so the last good numeric value remains.

              updateWheel(w.id, patch);
            }}
          />
          <span className="text-neutral-400 text-[0.65rem]">mm</span>
        </div>

          {/* Honing flag + base */}
          <div className="flex flex-col gap-1 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={w.isHoning}
                onChange={e =>
                  updateWheel(w.id, {
                    isHoning: e.target.checked,
                    baseForHn: e.target.checked ? 'front' : w.baseForHn,
                  })
                }
              />
              <span className="text-neutral-300">Honing wheel? (Locks to Front base)</span>
            </label>

            {!w.isHoning && (
              <div className="flex items-center gap-3 text-xs text-neutral-300">
                <span>Default base for hₙ:</span>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={w.baseForHn === 'rear'}
                    onChange={() => updateWheel(w.id, { baseForHn: 'rear' })}
                  />
                  <span>Rear (edge leading)</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={w.baseForHn === 'front'}
                    onChange={() => updateWheel(w.id, { baseForHn: 'front' })}
                  />
                  <span>Front (edge trailing)</span>
                </label>
              </div>
            )}
          </div>

          {/* Delete */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-red-400 text-xs border border-red-400 rounded px-2 py-1 hover:bg-red-900/30"
              onClick={() => deleteWheel(w.id)}
            >
              Delete wheel
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
)}

      {/* Settings view */}
      {view === 'settings' && (
        <>
          <div className="flex gap-2 mb-2 text-xs">
            <button
              type="button"
              className={
                'px-2 py-1 rounded border ' +
                (settingsView === 'machine'
                  ? 'border-emerald-500 bg-emerald-900/40'
                  : 'border-neutral-700 bg-neutral-900')
              }
              onClick={() => setSettingsView('machine')}
            >
              Machine &amp; constants
            </button>
            <button
              type="button"
              className={
                'px-2 py-1 rounded border ' +
                (settingsView === 'calibration'
                  ? 'border-emerald-500 bg-emerald-900/40'
                  : 'border-neutral-700 bg-neutral-900')
              }
              onClick={() => setSettingsView('calibration')}
            >
              Calibration wizard
            </button>
          </div>

          {/* Machine constants view */}
          {settingsView === 'machine' && (
            <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/30 flex flex-col gap-2 max-w-xl">
              <h2 className="text-sm font-semibold text-neutral-200">Machine constants</h2>
              <p className="text-xs text-neutral-300 mb-2">
                Rear and front base geometry for the active machine. Calibration will update these
                values; you can also tweak them manually.
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-400 text-xs">Rear base</span>
                  <label className="flex items-center gap-2">
                    <span className="w-10 text-neutral-300 text-xs">hc</span>
                    <input
                      type="number"
                      className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right"
                      value={constants.rear.hc}
                      onKeyDown={blurOnEnter}
                      onChange={e =>
                        setConstants(c => ({
                          ...c,
                          rear: { ...c.rear, hc: _nz(e.target.value, c.rear.hc) },
                        }))
                      }
                    />
                  </label>

                  <label className="flex items-center gap-2">
                    <span className="w-10 text-neutral-300 text-xs">o</span>
                    <input
                      type="number"
                      className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right"
                      value={constants.rear.o}
                      onKeyDown={blurOnEnter}
                      onChange={e =>
                        setConstants(c => ({
                          ...c,
                          rear: { ...c.rear, o: _nz(e.target.value, c.rear.o) },
                        }))
                      }
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-400 text-xs">Front base</span>
                  <label className="flex items-center gap-2">
                    <span className="w-10 text-neutral-300 text-xs">hc</span>
                    <input
                      type="number"
                      className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right"
                      value={constants.front.hc}
                      onKeyDown={blurOnEnter}
                      onChange={e =>
                        setConstants(c => ({
                          ...c,
                          front: { ...c.front, hc: _nz(e.target.value, c.front.hc) },
                        }))
                      }
                    />
                  </label>

                  <label className="flex items-center gap-2">
                    <span className="w-10 text-neutral-300 text-xs">o</span>
                    <input
                      type="number"
                      className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right"
                      value={constants.front.o}
                      onKeyDown={blurOnEnter}
                      onChange={e =>
                        setConstants(c => ({
                          ...c,
                          front: { ...c.front, o: _nz(e.target.value, c.front.o) },
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* Calibration wizard view */}
          {settingsView === 'calibration' && (
            <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/30 flex flex-col gap-3 max-w-xl">
              <h2 className="text-sm font-semibold text-neutral-200">Calibration wizard (single base)</h2>
              <p className="text-xs text-neutral-300">
                Measure from your chosen datum to USB top (hₙ) and from axle outer surface to USB outer surface as the full outer-to-outer span CAo at several heights. The wizard will solve hc and o for the selected base
                and estimate the worst-case angle error over your wheels.
              </p>

              {/* Base selection */}
              <div className="flex items-center gap-4 text-xs">
                <span className="text-neutral-300">Base to calibrate:</span>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={calibBase === 'rear'}
                    onChange={() => setCalibBase('rear')}
                  />
                  <span>Rear (edge leading)</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={calibBase === 'front'}
                    onChange={() => setCalibBase('front')}
                  />
                  <span>Front (edge trailing)</span>
                </label>
              </div>

              {/* Diameters */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="flex flex-col gap-1">
                  <span className="text-neutral-300">
                    Axle diameter Dₐ (mm)
                    <span className="text-neutral-500 text-xs ml-1">(default 12)</span>
                  </span>
                  <input
                    type="number"
                    className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
                    value={calibDa}
                    onChange={e => setCalibDa(_nz(e.target.value, calibDa))}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-neutral-300">
                    USB diameter Dₛ (mm)
                    <span className="text-neutral-500 text-xs ml-1">(prefilled, editable)</span>
                  </span>
                  <input
                    type="number"
                    className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
                    value={calibDs}
                    onChange={e => setCalibDs(_nz(e.target.value, calibDs))}
                  />
                </label>
              </div>

              {/* Measurement count */}
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-300">Number of measurements:</span>
                <div className="flex flex-wrap gap-4">
                  <label
                    className="flex items-center gap-1"
                    title="3 points: fast, but less robust to noise."
                  >
                    <input
                      type="radio"
                      checked={calibCount === 3}
                      onChange={() => {
                        setCalibCount(3);
                        ensureCalibRowsLength(3);
                      }}
                    />
                    <span>3</span>
                  </label>
                  <label
                    className="flex items-center gap-1"
                    title="4 points (recommended): good balance of effort and robustness."
                  >
                    <input
                      type="radio"
                      checked={calibCount === 4}
                      onChange={() => {
                        setCalibCount(4);
                        ensureCalibRowsLength(4);
                      }}
                    />
                    <span>4 (recommended)</span>
                  </label>
                  <label
                    className="flex items-center gap-1"
                    title="5 points: best redundancy, but more work. Use if you suspect noisy readings."
                  >
                    <input
                      type="radio"
                      checked={calibCount === 5}
                      onChange={() => {
                        setCalibCount(5);
                        ensureCalibRowsLength(5);
                      }}
                    />
                    <span>5</span>
                  </label>
                </div>
              </div>

              {/* Measurement table */}
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">
                    Measurements: for each height, record hₙ (datum → USB top) and CAo, the full outer-to-outer span between axle and USB (press calipers square: |O______O|, outer face of axle to outer face of USB). CA is then computed as CA = CAo − (Dₐ/2 + Dₛ/2).
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 font-mono text-[0.7rem] text-neutral-400">
                  <div>#</div>
                  <div>hₙ (mm)</div>
                  <div>CAo (mm)</div>
                </div>
                {Array.from({ length: calibCount }, (_, i) => {
                  const row = calibRows[i] ?? { hn: '', CAo: '' };
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-3 gap-1 items-center text-[0.75rem]"
                    >
                      <div className="text-neutral-500">{i + 1}</div>
                      <input
                        type="number"
                        className="rounded border border-neutral-700 bg-neutral-950 px-1 py-0.5"
                        value={row.hn}
                        onChange={e =>
                          setCalibRows(prev => {
                            const next = [...prev];
                            while (next.length <= i) {
                              next.push({ hn: '', CAo: '' });
                            }
                            next[i] = { ...next[i], hn: e.target.value };
                            return next;
                          })
                        }
                      />
                      <input
                        type="number"
                        className="rounded border border-neutral-700 bg-neutral-950 px-1 py-0.5"
                        value={row.CAo}
                        onChange={e =>
                          setCalibRows(prev => {
                            const next = [...prev];
                            while (next.length <= i) {
                              next.push({ hn: '', CAo: '' });
                            }
                            next[i] = { ...next[i], CAo: e.target.value };
                            return next;
                          })
                        }
                      />
                    </div>
                  );
                })}
              </div>

              {/* Actions and results */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-2 py-1 rounded border border-emerald-500 bg-emerald-900/40 hover:bg-emerald-900 text-emerald-50"
                    onClick={handleRunCalibration}
                  >
                    Compute hc &amp; o
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 disabled:opacity-40"
                    disabled={!calibResult}
                    onClick={handleApplyCalibration}
                  >
                    Apply to {calibBase === 'rear' ? 'rear base' : 'front base'}
                  </button>
                </div>

                {calibError && (
                  <div className="text-red-400 text-xs">{calibError}</div>
                )}

                {calibResult && (
                  <div className="border border-neutral-700 rounded p-2 flex flex-col gap-1">
                    <div className="text-neutral-200">
                      Proposed constants for {calibBase === 'rear' ? 'rear' : 'front'} base:
                    </div>
                    <div className="font-mono text-[0.8rem]">
                      hc = {calibResult.hc.toFixed(3)} mm, o = {calibResult.o.toFixed(3)} mm
                    </div>
                    <div className="text-neutral-300 text-[0.75rem]">
                      Max |residual| in hₙ: {calibResult.diagnostics.maxAbsResidualMm.toFixed(3)} mm
                    </div>
                    <div className="text-[0.75rem]">
                      {(() => {
                        const a = calibResult.angleErrorDeg;
                        if (a == null) {
                          return (
                            <span className="text-neutral-400">
                              Angle error estimate not available (derivative too small).
                            </span>
                          );
                        }
                        let label = '';
                        let cls = '';
                        if (a <= 0.05) {
                          label = 'Excellent';
                          cls = 'text-emerald-300';
                        } else if (a <= 0.1) {
                          label = 'Good';
                          cls = 'text-emerald-200';
                        } else if (a <= 0.2) {
                          label = 'Fair';
                          cls = 'text-amber-300';
                        } else {
                          label = 'Poor';
                          cls = 'text-red-400';
                        }
                        return (
                          <span className={cls}>
                            Estimated worst-case angle error over your wheels ≈ {a.toFixed(3)}° ({label}).{' '}
                            If &gt; 0.10°, consider re-measuring.
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
      {/* ====== PRESET MANAGER MODAL (shell) ====== */}
      {isPresetManagerOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 pt-12 pb-[calc(env(safe-area-inset-bottom)+16px)] px-4">
          <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-950 p-4 shadow-xl max-h-[90vh] overflow-y-auto">            <p className="mt-1 text-[0.75rem] text-neutral-400">
              This is a placeholder for preset rename/delete. We&apos;ll wire it up next.
            </p>

            <div className="mt-3 max-h-64 overflow-y-auto text-xs">
              {sessionPresets.length === 0 ? (
                <div className="text-neutral-500">No presets saved yet.</div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {sessionPresets.map(preset => (
                    <li
                      key={preset.id}
                      className="flex items-center justify-between gap-2 rounded border border-neutral-700 bg-neutral-900 px-2 py-1"
                    >
                      <div className="flex flex-col">
                        <span className="text-neutral-100">{preset.name}</span>
                        <span className="text-[0.65rem] text-neutral-500">
                          {preset.steps.length} step{preset.steps.length === 1 ? '' : 's'}
                          {selectedPresetId === preset.id && ' · active'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="px-3 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-200 active:scale-95 transition-transform"
                onClick={() => setIsPresetManagerOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== SAVE PRESET MODAL ====== */}
      {isPresetDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 pt-12 pb-[calc(env(safe-area-inset-bottom)+16px)] px-4">
          <div className="w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-950 p-4 shadow-xl max-h-[90vh] overflow-y-auto">            <h3 className="text-sm font-semibold text-neutral-100">Save preset</h3>
            <p className="mt-1 text-[0.75rem] text-neutral-400">
              Enter a name for this progression.
            </p>

            <div className="mt-3">
              <input
                type="text"
                className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Preset name…"
                value={presetNameDraft}
                onKeyDown={blurOnEnter}
                onChange={e => setPresetNameDraft(e.target.value)}
                autoFocus
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-300"
                onClick={() => {
                  setIsPresetDialogOpen(false);
                  setPresetNameDraft('');
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="px-3 py-1 rounded border border-emerald-500 bg-emerald-900/40 text-xs text-emerald-100 hover:bg-emerald-900 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-transform"
                onClick={handleSavePreset}
                disabled={!presetNameTrimmed || sessionSteps.length === 0 || isPresetNameDuplicate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;





