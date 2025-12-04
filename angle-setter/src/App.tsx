

// Tormek USB Height Multi‑wheel Calculator – Rebuilt Baseline
// -----------------------------------------------------------
// This is a minimal, but fully working, single‑file React app
// that restores core Ton/Dutchman math, wheel handling and a
// basic UI so you can run and iterate again. Advanced features
// (wizard, presets, dual calibration, etc.) can be layered back
// on top of this stable foundation.


//================Imports=================
import * as React from 'react';
import { IconKebab, IconTrash, IconSortAsc, IconSortDesc } from './icons';
import MiniSelect from './components/MiniSelect';
import CalibrationWizard from './components/CalibrationWizard';
import ImportExportPanel from './components/ImportExportPanel';
import ProgressionView from './components/ProgressionView';
import type {
  BaseSide,
  CalibrationDiagnostics,
  CalibrationMeasurement,
  CalibrationSnapshot,
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
import { PERSIST_VERSION, _load, _save } from './state/storage';
import { DEFAULT_CONSTANTS, DEFAULT_GLOBAL, DEFAULT_WHEELS } from './state/defaults';
import {
  computeWheelResults,
  computeTonHeights,
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

function ExpandToggle({
  expanded,
  onToggle,
  labelExpanded,
  labelCollapsed,
}: {
  expanded: boolean;
  onToggle: () => void;
  labelExpanded: string;
  labelCollapsed: string;
}) {
  return (
    <button
      type="button"
      className={`btn-toggle ${expanded ? 'btn-toggle--open' : ''}`}
      aria-label={expanded ? labelExpanded : labelCollapsed}
      aria-expanded={expanded}
      onClick={onToggle}
      aria-pressed={expanded}
    >
      <svg
        viewBox="0 0 24 24"
        className={'w-3 h-3 transition-transform ' + (expanded ? 'rotate-180' : 'rotate-0')}
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
  );
}

function normalizeWheel(raw: any): Wheel {
  const base: BaseSide = raw?.baseForHn === 'front' ? 'front' : 'rear';
  const dVal = Number(raw?.D);
  const angleOffset = typeof raw?.angleOffset === 'number' ? raw.angleOffset : 0;
  const grit = typeof raw?.grit === 'string' ? raw.grit : '';
  const dText = typeof raw?.DText === 'string' ? raw.DText : undefined;

  return {
    id:
      typeof raw?.id === 'string' && raw.id
        ? raw.id
        : `wheel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: typeof raw?.name === 'string' ? raw.name : '',
    D: Number.isFinite(dVal) ? dVal : NaN,
    DText: dText,
    angleOffset,
    baseForHn: base,
    isHoning: Boolean(raw?.isHoning),
    grit,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeCalibrationSnapshots(items: any[]): CalibrationSnapshot[] {
  return items.map((snap, idx) => {
    const base: BaseSide = snap?.base === 'front' ? 'front' : 'rear';
    const hc = typeof snap?.hc === 'number' ? snap.hc : NaN;
    const o = typeof snap?.o === 'number' ? snap.o : NaN;
    const diagnostics =
      snap?.diagnostics && Array.isArray(snap.diagnostics.residuals)
        ? {
            residuals: snap.diagnostics.residuals.map((r: any) => Number(r) || 0),
            maxAbsResidualMm: Number(snap.diagnostics.maxAbsResidualMm) || 0,
          }
        : { residuals: [], maxAbsResidualMm: 0 };
    const angleErrorDeg =
      typeof snap?.angleErrorDeg === 'number' ? snap.angleErrorDeg : null;
    const count = Number(snap?.count) || diagnostics.residuals.length || 0;
    const Da = Number(snap?.Da) || 0;
    const Ds = Number(snap?.Ds) || 0;
    const createdAt =
      typeof snap?.createdAt === 'string' ? snap.createdAt : new Date().toISOString();
    const measurements = Array.isArray(snap?.measurements)
      ? snap.measurements.map((m: any) => ({
          hn: typeof m?.hn === 'string' ? m.hn : String(m?.hn ?? ''),
          CAo: typeof m?.CAo === 'string' ? m.CAo : String(m?.CAo ?? ''),
        }))
      : [];
    return {
      id: snap?.id || `calib-${Date.now()}-${idx}`,
      base,
      hc,
      o,
      diagnostics,
      angleErrorDeg,
      count,
      Da,
      Ds,
      createdAt,
      measurements,
    };
  });
}

// ============================================================================== App =======================================

function App() {
  // ======= Core state =======
  const [global, setGlobal] = React.useState<GlobalState>(() =>
    _load('t_global', DEFAULT_GLOBAL)
  );
  const [constants, setConstants] = React.useState<MachineConstants>(() =>
    _load('t_constants', DEFAULT_CONSTANTS)
  );
  const [wheels, setWheels] = React.useState<Wheel[]>(() => {
    const seen = new Set<string>();
    return _load('t_wheels', DEFAULT_WHEELS)
      .map(normalizeWheel)
      .filter(w => {
        if (seen.has(w.id)) return false;
        seen.add(w.id);
        return true;
      });
  });
  const [sessionSteps, setSessionSteps] = React.useState<SessionStep[]>(() =>
    _load('t_sessionSteps', [])
  );
  const [sessionPresets, setSessionPresets] = React.useState<SessionPreset[]>(() =>
    _load('t_sessionPresets', [])
  );

  // View state
  const [view, setView] = React.useState<
  'calculator' | 'wheels' | 'settings'
>('calculator');
  const [settingsView, setSettingsView] = React.useState<'machine' | 'calibration' | 'import'>(
    'machine'
  );
  // Preset dialog / manager state
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>('');
  const [isPresetDialogOpen, setIsPresetDialogOpen] = React.useState(false);
  const [presetNameDraft, setPresetNameDraft] = React.useState('');
  const [isPresetManagerOpen, setIsPresetManagerOpen] = React.useState(false);
  const [presetRenameId, setPresetRenameId] = React.useState<string | null>(null);
  const [presetRenameValue, setPresetRenameValue] = React.useState('');
  const [heightMode, setHeightMode] = React.useState<'hn' | 'hr'>(() => {
    const val = _load<'hn' | 'hr'>('t_heightMode', 'hn');
    return val === 'hr' ? 'hr' : 'hn';
  });

  // Step notes state
  const [isStepNotesOpen, setIsStepNotesOpen] = React.useState(false);
  const [stepNotesDraft, setStepNotesDraft] = React.useState('');
  const stepNotesStepIdRef = React.useRef<string | null>(null);

  // Wheel config panel state
  const [isWheelConfigOpen, setIsWheelConfigOpen] = React.useState(false);
  const [isSetupPanelOpen, setIsSetupPanelOpen] = React.useState(false);
  const [isAddWheelModalOpen, setIsAddWheelModalOpen] = React.useState(false);
  const [newWheelDraft, setNewWheelDraft] = React.useState<Omit<Wheel, 'id'>>({
    name: '',
    D: NaN,
    DText: '',
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
    grit: '',
  });
  const [expandedWheelIds, setExpandedWheelIds] = React.useState<string[]>([]);
  const [wheelSortField, setWheelSortField] = React.useState<'name' | 'diam'>('name');
  const [wheelSortDir, setWheelSortDir] = React.useState<'asc' | 'desc'>('asc');
  const [wheelGroup, setWheelGroup] = React.useState<'none' | 'grit'>('none');

  // Progression menu state
  const [isProgressionMenuOpen, setIsProgressionMenuOpen] = React.useState(false);
  const [isProgressionMenuVisible, setIsProgressionMenuVisible] = React.useState(false);
  const [isProgressionMenuClosing, setIsProgressionMenuClosing] = React.useState(false);
  const progressionMenuRef = React.useRef<HTMLDivElement | null>(null);
  const progressionMenuCloseTimerRef = React.useRef<number | null>(null);

  // Progression menu open/close handlers
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
const [modalShift, setModalShift] = React.useState(0);

// Nudge modals up on mobile when the virtual keyboard is visible
React.useEffect(() => {
  if (typeof window === 'undefined') return;
  const vv = window.visualViewport;
  if (!vv) return;

  const updateShift = () => {
    const shrink = Math.max(0, window.innerHeight - vv.height);
    const isMobile = window.innerWidth < 768;
    const next = isMobile ? Math.min(shrink, 180) : 0;
    setModalShift(next);
  };

  updateShift();
  vv.addEventListener('resize', updateShift);
  window.addEventListener('orientationchange', updateShift);
  return () => {
    vv.removeEventListener('resize', updateShift);
    window.removeEventListener('orientationchange', updateShift);
  };
}, []);


  // 🔒 Safety net: de-duplicate wheels by id (keep first, drop duplicates)
  React.useEffect(() => {
    setWheels(prev => {
      const seen = new Set<string>();
      const next = prev.map(normalizeWheel).filter(w => {
        if (seen.has(w.id)) return false;
        seen.add(w.id);
        return true;
      });
      const unchanged =
        next.length === prev.length &&
        next.every((w, i) => {
          const p = prev[i];
          return (
            w.id === p.id &&
            w.name === p.name &&
            w.D === p.D &&
            w.DText === p.DText &&
            w.angleOffset === p.angleOffset &&
            w.baseForHn === p.baseForHn &&
            w.isHoning === p.isHoning &&
            w.grit === p.grit
          );
        });
      return unchanged ? prev : next;
    });
  }, []); // run once on mount

  // Calibration wizard state (single-base)
  const [calibBase, setCalibBase] = React.useState<BaseSide | ''>('');
  const [calibDa, setCalibDa] = React.useState<number>(12); // axle diameter
  const [calibDs, setCalibDs] = React.useState<number>(DEFAULT_GLOBAL.usbDiameter);
  const [calibCount, setCalibCount] = React.useState<number>(4); // 3/4/5, default 4 (recommended)
  const [calibRows, setCalibRows] = React.useState<CalibrationMeasurement[]>(() => []);
  const [calibResult, setCalibResult] = React.useState<{
    hc: number;
    o: number;
    diagnostics: CalibrationDiagnostics;
    angleErrorDeg: number | null;
    rowResiduals: { row: number; residual: number }[];
  } | null>(null);
  const [calibError, setCalibError] = React.useState<string | null>(null);
  const [calibSnapshots, setCalibSnapshots] = React.useState<CalibrationSnapshot[]>(() => {
    const legacy = _load<CalibrationSnapshot | null>('t_calibSnapshot', null);
    const list = _load<CalibrationSnapshot[]>('t_calibSnapshots', []);
    const items = list && list.length ? list : legacy ? [legacy] : [];
    return normalizeCalibrationSnapshots(items);
  });
  const [calibAppliedIds, setCalibAppliedIds] = React.useState<{ rear: string; front: string }>(
    () => _load('t_calibAppliedIds', { rear: '', front: '' })
  );

  const effectiveConstants = React.useMemo(() => {
    const next = { ...constants };
    const rearSnap = calibSnapshots.find(s => s.id === calibAppliedIds.rear);
    const frontSnap = calibSnapshots.find(s => s.id === calibAppliedIds.front);
    if (rearSnap && Number.isFinite(rearSnap.hc) && Number.isFinite(rearSnap.o)) {
      next.rear = { hc: rearSnap.hc, o: rearSnap.o };
    }
    if (frontSnap && Number.isFinite(frontSnap.hc) && Number.isFinite(frontSnap.o)) {
      next.front = { hc: frontSnap.hc, o: frontSnap.o };
    }
    return next;
  }, [calibAppliedIds.front, calibAppliedIds.rear, calibSnapshots, constants]);

  const activeMachine: MachineConfig = {
    id: 'machine-1',
    name: 'Default machine',
    constants: effectiveConstants,
    usbDiameter: global.usbDiameter,
    jigDiameter: global.jig.Dj,
  };
  const targetAngleSymbol = 'θ';
  const effectiveAngleSymbol = 'γ';
  const wheelResults = computeWheelResults(wheels, sessionSteps, global, activeMachine);


  const appliedCalibrationByBase = React.useMemo(
    () => ({
      rear: calibSnapshots.find(s => s.id === calibAppliedIds.rear) || null,
      front: calibSnapshots.find(s => s.id === calibAppliedIds.front) || null,
    }),
    [calibAppliedIds.front, calibAppliedIds.rear, calibSnapshots]
  );

  // Estimated angle error (deg) per result, using calibration residuals for that base and wheel D
  const estimatedAngleErrorByResultId = React.useMemo(() => {
    const map: Record<string, number | null> = {};
    const A = _nz(global.projection);
    const beta = _nz(global.targetAngle);
    const Dj = activeMachine.jigDiameter;
    const Ds = activeMachine.usbDiameter;
    const delta = 0.05;

    for (const r of wheelResults) {
      const key = r.step?.id ?? r.wheel.id;
      const base: BaseSide = r.step?.base === 'front' ? 'front' : 'rear';
      const snap = base === 'front' ? appliedCalibrationByBase.front : appliedCalibrationByBase.rear;
      const rawResidual = snap?.diagnostics?.maxAbsResidualMm;
      const residualMm = Number.isFinite(rawResidual) ? Math.abs(Number(rawResidual)) : null;
      const Draw = _nz(r.wheel.D, 250);
      const D = Draw > 0 ? Draw : 250;

      if (residualMm === null) {
        map[key] = null;
        continue;
      }

      const baseInput = {
        base,
        D,
        A,
        betaDeg: beta,
        Dj,
        Ds,
        constants: activeMachine.constants,
      } as const;

      const hnPlus = computeTonHeights({ ...baseInput, betaDeg: beta + delta }).hn;
      const hnMinus = computeTonHeights({ ...baseInput, betaDeg: beta - delta }).hn;
      const dHn_dBeta = (hnPlus - hnMinus) / (2 * delta);

      if (Math.abs(dHn_dBeta) < 1e-6) {
        map[key] = null;
        continue;
      }

      map[key] = Math.abs(residualMm / dHn_dBeta);
    }

    return map;
  }, [
    activeMachine.constants,
    activeMachine.jigDiameter,
    activeMachine.usbDiameter,
    appliedCalibrationByBase.front,
    appliedCalibrationByBase.rear,
    global.projection,
    global.targetAngle,
    wheelResults,
  ]);

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
    _save('t_calibSnapshots', calibSnapshots);
  }, [calibSnapshots]);

  React.useEffect(() => {
    _save('t_calibAppliedIds', calibAppliedIds);
  }, [calibAppliedIds]);

  React.useEffect(() => {
    if (!isPresetManagerOpen) {
      setPresetRenameId(null);
      setPresetRenameValue('');
    }
  }, [isPresetManagerOpen]);

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

  const exportBundle = React.useMemo(
    () => ({
      version: PERSIST_VERSION,
      global,
      constants,
      wheels,
      sessionSteps,
      sessionPresets,
      heightMode,
      calibSnapshots,
      calibAppliedIds,
    }),
    [calibAppliedIds, calibSnapshots, constants, global, heightMode, sessionPresets, sessionSteps, wheels]
  );
  const exportText = React.useMemo(() => JSON.stringify(exportBundle, null, 2), [exportBundle]);
  const handleImportText = React.useCallback(
    (raw: string) => {
      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return 'Import failed: invalid JSON.';
      }
      if (!isObject(parsed)) return 'Import failed: expected a JSON object.';

      const nextGlobal = isObject(parsed.global)
        ? { ...DEFAULT_GLOBAL, ...(parsed.global as Partial<GlobalState>) }
        : DEFAULT_GLOBAL;

      const nextConstants = isObject(parsed.constants)
        ? {
            rear: {
              hc: _nz((parsed.constants as any).rear?.hc, DEFAULT_CONSTANTS.rear.hc),
              o: _nz((parsed.constants as any).rear?.o, DEFAULT_CONSTANTS.rear.o),
            },
            front: {
              hc: _nz((parsed.constants as any).front?.hc, DEFAULT_CONSTANTS.front.hc),
              o: _nz((parsed.constants as any).front?.o, DEFAULT_CONSTANTS.front.o),
            },
          }
        : DEFAULT_CONSTANTS;

      const nextWheels = Array.isArray(parsed.wheels)
        ? parsed.wheels.map(normalizeWheel)
        : DEFAULT_WHEELS;

      const nextSteps = Array.isArray(parsed.sessionSteps)
        ? (parsed.sessionSteps as SessionStep[])
        : [];

      const nextPresets = Array.isArray(parsed.sessionPresets)
        ? (parsed.sessionPresets as SessionPreset[])
        : [];

      const nextHeightMode = parsed.heightMode === 'hr' ? 'hr' : 'hn';

      const nextSnapshots = normalizeCalibrationSnapshots(
        Array.isArray(parsed.calibSnapshots) ? parsed.calibSnapshots : []
      );

      const appliedRaw = isObject(parsed.calibAppliedIds) ? (parsed.calibAppliedIds as any) : null;
      const nextApplied = {
        rear: typeof appliedRaw?.rear === 'string' ? appliedRaw.rear : '',
        front: typeof appliedRaw?.front === 'string' ? appliedRaw.front : '',
      };
      const ensuredApplied = {
        rear: nextSnapshots.some(s => s.id === nextApplied.rear) ? nextApplied.rear : '',
        front: nextSnapshots.some(s => s.id === nextApplied.front) ? nextApplied.front : '',
      };

      setGlobal(nextGlobal);
      setConstants(nextConstants);
      setWheels(nextWheels);
      setSessionSteps(nextSteps);
      setSessionPresets(nextPresets);
      setHeightMode(nextHeightMode);
      setCalibSnapshots(nextSnapshots);
      setCalibAppliedIds(ensuredApplied);

      return null;
    },
    []
  );
  const presetNameTrimmed = presetNameDraft.trim();
  const isPresetNameDuplicate =
    presetNameTrimmed.length > 0 &&
    sessionPresets.some(p => p.name.toLowerCase() === presetNameTrimmed.toLowerCase());
  const sortedWheels = React.useMemo(() => {
    const list = [...wheels];
    const dir = wheelSortDir === 'asc' ? 1 : -1;
    const cmpName = (a: Wheel, b: Wheel) =>
      dir * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    const cmpDiam = (a: Wheel, b: Wheel) => {
      const da = Number.isNaN(a.D) ? Number.POSITIVE_INFINITY : a.D;
      const db = Number.isNaN(b.D) ? Number.POSITIVE_INFINITY : b.D;
      if (da === db) return cmpName(a, b);
      return dir * (da - db);
    };
    return list.sort(wheelSortField === 'name' ? cmpName : cmpDiam);
  }, [wheels, wheelSortDir, wheelSortField]);

  const groupedWheels = React.useMemo(() => {
    if (wheelGroup === 'none') {
      return [{ key: 'all', label: null as string | null, items: sortedWheels }];
    }
    const keyFn = (w: Wheel) => (w.grit?.trim() ? w.grit.trim() : 'Ungrouped');
    const map = new Map<string, Wheel[]>();
    for (const w of sortedWheels) {
      const key = keyFn(w);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: key,
      items,
    }));
  }, [sortedWheels, wheelGroup]);
  const newWheelNameTrimmed = newWheelDraft.name.trim();
  const isNewWheelDiameterValid = Number.isFinite(newWheelDraft.D);
  const isAddWheelSaveDisabled = !newWheelNameTrimmed || !isNewWheelDiameterValid;

  const updateWheel = (id: string, patch: Partial<Wheel>) => {
    setWheels(prev => prev.map(w => (w.id === id ? { ...w, ...patch } : w)));
  };

  const toggleWheelExpanded = (id: string) => {
    setExpandedWheelIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const resetNewWheelDraft = () => {
    setNewWheelDraft({
      name: '',
      D: NaN,
      DText: '',
      angleOffset: 0,
      baseForHn: 'rear',
      isHoning: false,
      grit: '',
    });
  };

  const addWheel = () => {
    resetNewWheelDraft();
    setIsAddWheelModalOpen(true);
  };

  const handleSaveNewWheel = () => {
    if (isAddWheelSaveDisabled) return;

    const id = `wheel-${Date.now()}`;
    const w: Wheel = {
      id,
      name: newWheelNameTrimmed,
      D: Math.round(newWheelDraft.D * 100) / 100,
      DText: newWheelDraft.DText?.trim() ?? '',
      angleOffset: newWheelDraft.angleOffset ?? 0,
      baseForHn: newWheelDraft.isHoning ? 'front' : newWheelDraft.baseForHn,
      isHoning: newWheelDraft.isHoning,
      grit: newWheelDraft.grit?.trim() ?? '',
    };

    // Tell the Wheel Manager to auto-focus this wheel's name input
    focusWheelIdRef.current = id;

    setWheels(prev => [...prev, w]);
    setExpandedWheelIds(prev => [...prev, id]);
    setIsAddWheelModalOpen(false);
    resetNewWheelDraft();
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
    setExpandedWheelIds(prev => prev.filter(x => x !== id));

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
    notes: '',
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

const handleBeginPresetRename = (preset: SessionPreset) => {
  setPresetRenameId(preset.id);
  setPresetRenameValue(preset.name);
};

const handleCancelPresetRename = () => {
  setPresetRenameId(null);
  setPresetRenameValue('');
};

const handleCommitPresetRename = () => {
  if (!presetRenameId) return;
  const nextName = presetRenameValue.trim();
  if (!nextName) return;

  const duplicate = sessionPresets.some(
    p => p.id !== presetRenameId && p.name.toLowerCase() === nextName.toLowerCase()
  );
  if (duplicate) {
    window.alert('A preset with that name already exists. Choose a different name.');
    return;
  }

  setSessionPresets(prev =>
    prev.map(p => (p.id === presetRenameId ? { ...p, name: nextName } : p))
  );
  setPresetRenameId(null);
  setPresetRenameValue('');
};

const handleDeletePreset = (presetId: string) => {
  const preset = sessionPresets.find(p => p.id === presetId);
  const label = preset ? `Delete preset "${preset.name}"?` : 'Delete this preset?';
  if (!window.confirm(label)) return;

  setSessionPresets(prev => prev.filter(p => p.id !== presetId));
  if (selectedPresetId === presetId) {
    setSelectedPresetId('');
    lastLoadedPresetIdRef.current = null;
    lastLoadedStepsRef.current = null;
  }
  if (presetRenameId === presetId) {
    setPresetRenameId(null);
    setPresetRenameValue('');
  }
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
        notes: step.notes,
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
      notes: ref.notes ?? '',
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
          heightMode === 'hn' ? 'Show wheel height' : 'Show datum height',
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
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-neutral-200">Global setup</h2>
              <ExpandToggle
                expanded={isSetupPanelOpen}
                onToggle={() => setIsSetupPanelOpen(open => !open)}
                labelExpanded="Hide setup panel"
                labelCollapsed="Show setup panel"
              />
            </div>

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
                <span className="text-neutral-300">Target angle {targetAngleSymbol}° (/side)</span>
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
            </div>

            <div className={'collapsible ' + (isSetupPanelOpen ? 'collapsible--open' : '')}>
              <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                <label className="flex flex-col gap-1">
                  <span className="text-neutral-300">USB diameter Ds (mm)</span>
                  <input
                    type="number"
                    className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
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
                  <span className="text-neutral-300">Jig diameter Dj (mm)</span>
                  <input
                    type="number"
                    className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
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
                            className="border border-neutral-700 rounded bg-neutral-950/40 flex flex-col min-h-[140px]"
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
                              {/* Left: notes trigger + angle offset */}
                              <div className="flex-1 flex flex-col gap-2">
                                <button
                                  type="button"
                                  className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 text-xs text-neutral-200 hover:bg-neutral-800 self-start"
                                  onClick={() => {
                                    stepNotesStepIdRef.current = step.id;
                                    setStepNotesDraft(step.notes || '');
                                    setIsStepNotesOpen(true);
                                  }}
                                >
                                  Notes
                                </button>

                                <div className="flex flex-wrap items-center gap-2 mt-auto">
                                  <span className="text-neutral-400 text-[0.7rem]">
                                    {effectiveAngleSymbol} offset (deg)
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
                  <ProgressionView
                    wheelResults={wheelResults}
                    heightMode={heightMode}
                    angleSymbol={effectiveAngleSymbol}
                    angleErrorById={estimatedAngleErrorByResultId}
                  />
                )
              )}
            </div>
          </section>
        </>
      )}
      
{view === 'wheels' && (
  <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/30 flex flex-col gap-3 max-w-3xl mx-auto">
    <div className="flex flex-col gap-2 border-b border-neutral-800 pb-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-200">Wheel Manager</h2>
        <button
          type="button"
          className="px-3 py-1 rounded border border-emerald-500 bg-emerald-900/40 text-xs text-emerald-100 hover:bg-emerald-900 active:scale-95"
          onClick={addWheel}
        >
          + Add Wheel
        </button>
      </div>
    </div>

    <p className="text-xs text-neutral-300">
      Configure your grinding and honing wheels here. These settings are shared with
      the calculator view and saved to your browser.
    </p>

    <div className="flex items-center gap-2 flex-wrap justify-end">
        <label className="text-[0.75rem] text-neutral-400 flex items-center gap-1">
          <span>Group:</span>
          <MiniSelect
            value={wheelGroup}
            onChange={val => setWheelGroup(val as 'none' | 'grit')}
            options={[
              { value: 'none', label: 'None' },
              { value: 'grit', label: 'Grit' },
            ]}
            ariaLabel="Group wheels"
            widthClass="min-w-[6rem]"
          />
        </label>
        <label className="text-[0.75rem] text-neutral-400 flex items-center gap-1">
          <span>Sort:</span>
          <MiniSelect
            value={wheelSortField}
            onChange={val => setWheelSortField(val as 'name' | 'diam')}
            options={[
              { value: 'name', label: 'Name' },
              { value: 'diam', label: 'Diameter' },
            ]}
            ariaLabel="Sort wheels"
            widthClass="min-w-[6.5rem]"
          />
        </label>
        <button
          type="button"
          className="w-8 h-8 inline-flex items-center justify-center rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs"
          aria-label={`Toggle ${wheelSortField === 'name' ? 'name' : 'diameter'} sort ${wheelSortDir === 'asc' ? 'ascending' : 'descending'}`}
        onClick={() => setWheelSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))}
      >
        {wheelSortDir === 'asc' ? (
          <IconSortAsc className="w-4 h-4" />
        ) : (
          <IconSortDesc className="w-4 h-4" />
        )}
      </button>
    </div>

    {wheels.length === 0 ? (
      <div className="text-xs text-neutral-400 border border-dashed border-neutral-700 rounded p-3">
        No wheels saved yet. Click <span className="font-semibold text-neutral-200">Add Wheel</span>{' '}
        to create your first wheel.
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {groupedWheels.map(group => (
          <div key={group.key} className="flex flex-col gap-2">
            {group.label && (
              <div className="flex items-center gap-2 text-[0.85rem] text-neutral-200">
                <span className="font-semibold">{group.label}</span>
                <span className="text-[0.7rem] text-neutral-500">
                  {group.items.length} wheel{group.items.length === 1 ? '' : 's'}
                </span>
              </div>
            )}

            <div className="grid gap-2 md:grid-cols-2">
              {group.items.map(w => {
                const expanded = expandedWheelIds.includes(w.id);
                const diameterDisplay =
                  w.DText !== undefined ? w.DText : Number.isNaN(w.D) ? '' : String(w.D);
                const baseLabel = w.isHoning
                  ? 'Honing (front base)'
                  : w.baseForHn === 'rear'
                  ? 'Rear base'
                  : 'Front base';

                return (
                  <div
                    key={w.id}
                    className="border border-neutral-700 rounded-md p-2 bg-neutral-950/40 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="text-sm font-semibold text-neutral-100 truncate">
                          {w.name || 'Untitled wheel'}
                        </div>
                        <div className="text-[0.75rem] text-neutral-400 flex flex-wrap items-center gap-2">
                          <span className="font-mono">D: {diameterDisplay || '-'} mm</span>
                          <span>{baseLabel}</span>
                          {w.grit ? (
                            <span className="px-2 py-[2px] rounded border border-neutral-700 bg-neutral-900 text-neutral-200">
                              Grit: {w.grit}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <ExpandToggle
                          expanded={expanded}
                          onToggle={() => toggleWheelExpanded(w.id)}
                          labelExpanded="Hide wheel details"
                          labelCollapsed="Show wheel details"
                        />
                      </div>
                    </div>

                    <div
                      className={
                        'collapsible mt-1 border-t border-neutral-800 ' +
                        (expanded ? 'collapsible--open' : '')
                      }
                    >
                      <div className="flex flex-col gap-2 pt-1">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-neutral-400">Wheel name</span>
                          <input
                            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
                            value={w.name}
                            ref={el => {
                              if (el && focusWheelIdRef.current === w.id && view === 'wheels') {
                                el.focus();
                                el.select();
                                focusWheelIdRef.current = null;
                              }
                            }}
                            onKeyDown={blurOnEnter}
                            onFocus={e => e.target.select()}
                            onChange={e => updateWheel(w.id, { name: e.target.value })}
                          />
                        </div>

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
                              const patch: Partial<Wheel> = { DText: text };

                              const trimmed = text.trim();
                              if (trimmed === '') {
                                patch.D = NaN as unknown as number;
                                updateWheel(w.id, patch);
                                return;
                              }

                              const normalised = trimmed.replace(',', '.');
                              const val = Number(normalised);

                              if (!Number.isNaN(val)) {
                                patch.D = Math.round(val * 100) / 100;
                              }

                              updateWheel(w.id, patch);
                            }}
                          />
                          <span className="text-neutral-400 text-[0.65rem]">mm</span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-neutral-400">Grit / abrasive</span>
                          <input
                            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
                            value={w.grit ?? ''}
                            onChange={e => updateWheel(w.id, { grit: e.target.value })}
                            onKeyDown={blurOnEnter}
                          />
                        </div>

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
                              <span>Default base for h?:</span>
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
)}
{isAddWheelModalOpen && (
  <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/60 pt-12 md:pt-0 pb-[calc(env(safe-area-inset-bottom)+16px)] px-4 min-h-[100dvh]">
    <div
      className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-950 p-4 shadow-xl max-h-[90vh] overflow-y-auto"
      style={modalShift ? { transform: `translateY(-${modalShift}px)` } : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100">Add wheel</h3>
          <p className="text-[0.75rem] text-neutral-400">
            Enter wheel details. Saved wheels will appear in the list below.
          </p>
        </div>
        <button
          type="button"
          className="text-neutral-400 hover:text-neutral-200"
          onClick={() => {
            setIsAddWheelModalOpen(false);
            resetNewWheelDraft();
          }}
          aria-label="Close"
        >
          X
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-400">Wheel name</span>
          <input
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
            value={newWheelDraft.name}
            onChange={e => setNewWheelDraft(prev => ({ ...prev, name: e.target.value }))}
            onFocus={e => e.target.select()}
            onKeyDown={blurOnEnter}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-400">Diameter (mm)</span>
          <div className="flex items-center gap-2 text-xs">
            <input
              type="text"
              inputMode="decimal"
              className="w-24 rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-right text-sm appearance-none"
              value={
                newWheelDraft.DText !== undefined
                  ? newWheelDraft.DText
                  : Number.isNaN(newWheelDraft.D)
                  ? ''
                  : String(newWheelDraft.D)
              }
              onKeyDown={blurOnEnter}
              onFocus={e => e.target.select()}
              onChange={e => {
                const text = e.target.value;

                const patch: Partial<Wheel> = { DText: text };

                const trimmed = text.trim();
                if (trimmed === '') {
                  patch.D = NaN as unknown as number;
                  setNewWheelDraft(prev => ({ ...prev, ...patch }));
                  return;
                }

                const normalised = trimmed.replace(',', '.');
                const val = Number(normalised);

                if (!Number.isNaN(val)) {
                  patch.D = Math.round(val * 100) / 100;
                }

                setNewWheelDraft(prev => ({ ...prev, ...patch }));
              }}
            />
            <span className="text-neutral-400 text-[0.75rem]">mm</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-400">Grit / abrasive</span>
          <input
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
            value={newWheelDraft.grit ?? ''}
            onChange={e => setNewWheelDraft(prev => ({ ...prev, grit: e.target.value }))}
            onKeyDown={blurOnEnter}
          />
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newWheelDraft.isHoning}
              onChange={e =>
                setNewWheelDraft(prev => ({
                  ...prev,
                  isHoning: e.target.checked,
                  baseForHn: e.target.checked ? 'front' : prev.baseForHn,
                }))
              }
            />
            <span className="text-neutral-300">Honing wheel? (Locks to Front base)</span>
          </label>

          {!newWheelDraft.isHoning && (
            <div className="flex items-center gap-3 text-xs text-neutral-300">
              <span>Default base for h?:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={newWheelDraft.baseForHn === 'rear'}
                  onChange={() => setNewWheelDraft(prev => ({ ...prev, baseForHn: 'rear' }))}
                />
                <span>Rear (edge leading)</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={newWheelDraft.baseForHn === 'front'}
                  onChange={() => setNewWheelDraft(prev => ({ ...prev, baseForHn: 'front' }))}
                />
                <span>Front (edge trailing)</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-300"
          onClick={() => {
            setIsAddWheelModalOpen(false);
            resetNewWheelDraft();
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          className="px-3 py-1 rounded border border-emerald-500 bg-emerald-900/40 text-xs text-emerald-100 hover:bg-emerald-900 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-transform"
          disabled={isAddWheelSaveDisabled}
          onClick={handleSaveNewWheel}
        >
          Save wheel
        </button>
      </div>
    </div>
  </div>
)}

      {/* Settings view */}
      {view === 'settings' && (
        <>
          <div className="flex justify-end mb-3">
            <MiniSelect
              value={settingsView}
              options={[
                { value: 'machine', label: 'Machine & constants' },
                { value: 'calibration', label: 'Calibration wizard' },
                { value: 'import', label: 'Import / export' },
              ]}
              onChange={val => setSettingsView(val as typeof settingsView)}
              widthClass="w-52"
              menuWidthClass="w-56"
            />
          </div>

          {/* Machine constants view */}
          {settingsView === 'machine' && (
            <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/30 flex flex-col gap-2 max-w-xl">
              <h2 className="text-sm font-semibold text-neutral-200">Machine constants</h2>
              <p className="text-xs text-neutral-300 mb-2">
                Rear and front base geometry for the active machine. Calibration will update these
                values; you can also tweak them manually.
              </p>
              {(() => {
                const rearSnap = calibSnapshots.find(s => s.id === calibAppliedIds.rear) || null;
                const frontSnap = calibSnapshots.find(s => s.id === calibAppliedIds.front) || null;
                const rearOptions = [
                  { value: '', label: 'Manual input' },
                  ...calibSnapshots
                    .filter(s => s.base === 'rear')
                    .map(s => ({
                      value: s.id,
                      label: `Calibration ${s.createdAt?.slice(0, 10) || ''} (${s.count} pts)`,
                    })),
                ];
                const frontOptions = [
                  { value: '', label: 'Manual input' },
                  ...calibSnapshots
                    .filter(s => s.base === 'front')
                    .map(s => ({
                      value: s.id,
                      label: `Calibration ${s.createdAt?.slice(0, 10) || ''} (${s.count} pts)`,
                    })),
                ];
                const rearDisplay = rearSnap ? { hc: rearSnap.hc, o: rearSnap.o } : constants.rear;
                const frontDisplay = frontSnap
                  ? { hc: frontSnap.hc, o: frontSnap.o }
                  : constants.front;
                const BaseCard = ({
                  title,
                  snap,
                  options,
                  appliedId,
                  display,
                  onChange,
                  onChangeField,
                }: {
                  title: string;
                  snap: typeof rearSnap;
                  options: { value: string; label: string }[];
                  appliedId: string;
                  display: { hc: number; o: number };
                  onChange: (id: string) => void;
                  onChangeField: (field: 'hc' | 'o', value: string) => void;
                }) => {
                  const residual = snap?.diagnostics?.maxAbsResidualMm;
                  let sourceCls = 'text-neutral-400';
                  if (typeof residual === 'number' && Number.isFinite(residual)) {
                    if (residual <= 0.05) sourceCls = 'text-emerald-300';
                    else if (residual <= 0.1) sourceCls = 'text-emerald-200';
                    else if (residual <= 0.2) sourceCls = 'text-amber-300';
                    else sourceCls = 'text-red-400';
                  }

                  return (
                    <div className="rounded border border-neutral-700 bg-neutral-950/40 p-3 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs text-neutral-200">
                        <span>{title}</span>
                        <MiniSelect
                          value={appliedId}
                          options={options}
                          onChange={onChange}
                          widthClass="w-40"
                        />
                      </div>
                      <div className={`text-[0.7rem] ${sourceCls}`}>
                        {snap ? (
                          <>
                            Source: Calibration {snap.createdAt?.slice(0, 10) || ''} ({snap.count} pts
                            {residual != null ? `, max |resid| ${residual.toFixed(3)} mm` : ''}
                            {snap.angleErrorDeg != null ? `, ~${snap.angleErrorDeg.toFixed(3)}°` : ''})
                          </>
                        ) : (
                          'Source: Manual input'
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2">
                          <span className="w-16 text-neutral-300 text-xs">hc (mm)</span>
                          <input
                            type="number"
                            className="w-28 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right disabled:opacity-50"
                            value={display.hc}
                            disabled={Boolean(snap)}
                            onKeyDown={blurOnEnter}
                            onChange={e => onChangeField('hc', e.target.value)}
                          />
                        </label>
                        <label className="flex items-center gap-2">
                          <span className="w-16 text-neutral-300 text-xs">o (mm)</span>
                          <input
                            type="number"
                            className="w-28 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right disabled:opacity-50"
                            value={display.o}
                            disabled={Boolean(snap)}
                            onKeyDown={blurOnEnter}
                            onChange={e => onChangeField('o', e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <BaseCard
                      title="Rear base"
                      snap={rearSnap}
                      options={rearOptions}
                      appliedId={calibAppliedIds.rear}
                      display={rearDisplay}
                      onChange={val => setCalibAppliedIds(prev => ({ ...prev, rear: val || '' }))}
                      onChangeField={(field, value) =>
                        setConstants(c => ({
                          ...c,
                          rear: { ...c.rear, [field]: _nz(value, c.rear[field]) },
                        }))
                      }
                    />
                    <BaseCard
                      title="Front base"
                      snap={frontSnap}
                      options={frontOptions}
                      appliedId={calibAppliedIds.front}
                      display={frontDisplay}
                      onChange={val => setCalibAppliedIds(prev => ({ ...prev, front: val || '' }))}
                      onChangeField={(field, value) =>
                        setConstants(c => ({
                          ...c,
                          front: { ...c.front, [field]: _nz(value, c.front[field]) },
                        }))
                      }
                    />
                  </div>
                );
              })()}
            </section>
          )}

          {/* Calibration wizard view */}
          {settingsView === 'calibration' && (
            <CalibrationWizard
              global={global}
              activeMachine={activeMachine}
              wheels={wheels}
              calibBase={calibBase}
              setCalibBase={setCalibBase}
              calibDa={calibDa}
              setCalibDa={setCalibDa}
              calibDs={calibDs}
              setCalibDs={setCalibDs}
              calibCount={calibCount}
              setCalibCount={setCalibCount}
              calibRows={calibRows}
              setCalibRows={setCalibRows}
              calibResult={calibResult}
              setCalibResult={setCalibResult}
              calibError={calibError}
              setCalibError={setCalibError}
              calibSnapshots={calibSnapshots}
              setCalibSnapshots={setCalibSnapshots}
              onApplyCalibration={(base, snapshotId) =>
                setCalibAppliedIds(prev => ({ ...prev, [base]: snapshotId }))
              }
            />
          )}
          {settingsView === 'import' && (
            <ImportExportPanel exportText={exportText} onImportText={handleImportText} />
          )}
        </>
      )}
      {/* ====== PRESET MANAGER MODAL (shell) ====== */}
      {isPresetManagerOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 pt-12 pb-[calc(env(safe-area-inset-bottom)+16px)] px-4">
          <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-950 p-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">Manage presets</h3>
                <p className="mt-1 text-[0.75rem] text-neutral-400">
                  Rename, load, or delete saved progressions.
                </p>
              </div>
              <button
                type="button"
                className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-[0.7rem] text-neutral-200 active:scale-95 transition-transform"
                onClick={() => setIsPresetManagerOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-3 max-h-64 overflow-y-auto text-xs">
              {sessionPresets.length === 0 ? (
                <div className="text-neutral-500">No presets saved yet.</div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {sessionPresets.map(preset => {
                    const isEditing = presetRenameId === preset.id;
                    const renameTrimmed = presetRenameValue.trim();
                    const renameConflicts =
                      isEditing &&
                      sessionPresets.some(
                        p =>
                          p.id !== preset.id &&
                          p.name.toLowerCase() === renameTrimmed.toLowerCase()
                      );
                    const renameDisabled =
                      !isEditing || renameTrimmed.length === 0 || renameConflicts;

                    return (
                      <li
                        key={preset.id}
                        className="flex items-start justify-between gap-2 rounded border border-neutral-700 bg-neutral-900 px-2 py-2"
                      >
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <input
                                type="text"
                                className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                value={presetRenameValue}
                                onChange={e => setPresetRenameValue(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    handleCommitPresetRename();
                                  }
                                  if (e.key === 'Escape') {
                                    handleCancelPresetRename();
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span className="text-neutral-100">{preset.name}</span>
                            )}
                            {selectedPresetId === preset.id && (
                              <span className="text-[0.65rem] text-emerald-300 border border-emerald-600/60 rounded px-1 py-[2px]">
                                active
                              </span>
                            )}
                          </div>
                          <div className="text-[0.7rem] text-neutral-400">
                            {preset.steps.length} step{preset.steps.length === 1 ? '' : 's'}
                          </div>
                          {isEditing && renameConflicts && (
                            <div className="text-[0.65rem] text-amber-300">
                              A preset with that name already exists.
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 self-start">
                          {isEditing ? (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                className="px-2 py-1 rounded border border-emerald-500 bg-emerald-900/40 text-[0.7rem] text-emerald-100 hover:bg-emerald-900 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={renameDisabled}
                                onClick={handleCommitPresetRename}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-[0.7rem] text-neutral-200 active:scale-95"
                                onClick={handleCancelPresetRename}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1 justify-end">
                              <button
                                type="button"
                                className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-[0.7rem] text-neutral-200 active:scale-95"
                                onClick={() => {
                                  handleLoadPreset(preset.id);
                                  setIsPresetManagerOpen(false);
                                }}
                              >
                                Load
                              </button>
                              <button
                                type="button"
                                className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-[0.7rem] text-neutral-200 active:scale-95"
                                onClick={() => handleBeginPresetRename(preset)}
                              >
                                Rename
                              </button>
                              <button
                                type="button"
                                className="px-2 py-1 rounded border border-red-500/70 bg-red-900/40 text-[0.7rem] text-red-200 hover:bg-red-900 active:scale-95"
                                onClick={() => handleDeletePreset(preset.id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====== SAVE PRESET MODAL ====== */}
      {isPresetDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/60 pt-12 md:pt-0 pb-[calc(env(safe-area-inset-bottom)+16px)] px-4 min-h-[100dvh]">
          <div
            className="w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-950 p-4 shadow-xl max-h-[90vh] overflow-y-auto"
            style={modalShift ? { transform: `translateY(-${modalShift}px)` } : undefined}
          >
            <h3 className="text-sm font-semibold text-neutral-100">Save preset</h3>
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
      
      {isStepNotesOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/60 pt-12 md:pt-0 pb-[calc(env(safe-area-inset-bottom)+16px)] px-4 min-h-[100dvh]">
          <div
            className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-950 p-4 shadow-xl max-h-[90vh] overflow-y-auto"
            style={modalShift ? { transform: `translateY(-${modalShift}px)` } : undefined}
          >
            <h3 className="text-sm font-semibold text-neutral-100">Step notes</h3>
            <p className="mt-1 text-[0.75rem] text-neutral-400">
              Notes for this step.
            </p>
            <div className="mt-3">
              <textarea
                className="w-full min-h-[6rem] rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100"
                autoFocus
                value={stepNotesDraft}
                onChange={e => setStepNotesDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const id = stepNotesStepIdRef.current;
                    if (!id) return;
                    setSessionSteps(prev =>
                      prev.map(s => (s.id === id ? { ...s, notes: stepNotesDraft.trim() } : s))
                    );
                    setIsStepNotesOpen(false);
                  }
                }}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-300"
                onClick={() => setIsStepNotesOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded border border-emerald-500 bg-emerald-900/40 text-xs text-emerald-100 hover:bg-emerald-900 active:scale-95"
                onClick={() => {
                  const id = stepNotesStepIdRef.current;
                  if (!id) return;
                  setSessionSteps(prev =>
                    prev.map(s => (s.id === id ? { ...s, notes: stepNotesDraft.trim() } : s))
                  );
                  setIsStepNotesOpen(false);
                }}
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






