

// Tormek USB Height Multi‑wheel Calculator – Rebuilt Baseline
// -----------------------------------------------------------
// This is a minimal, but fully working, single‑file React app
// that restores core Ton/Dutchman math, wheel handling and a
// basic UI so you can run and iterate again. Advanced features
// (wizard, presets, dual calibration, etc.) can be layered back
// on top of this stable foundation.


//================Imports=================
import * as React from 'react';
import { IconKebab, IconTrash, IconSortAsc, IconSortDesc, IconClose } from './icons';
import CalibrationWizard from './components/CalibrationWizard';
import ImportExportPanel from './components/ImportExportPanel';
import GlossaryPage from './components/GlossaryPage';
import ProgressionView from './components/ProgressionView';
import MiniSelect from './components/MiniSelect';
import useModalLayout from './hooks/useModalLayout';
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
import { BTN, BTN_MUTED } from './ui/buttons';

const RESIDUAL_SYMBOL = 'ε';
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
  showLabel = false,
}: {
  base: BaseSide;
  isHoning: boolean;
  canToggle: boolean; // edit-mode control
  onToggle: () => void;
  showLabel?: boolean;
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
    stateClasses = 'border-accent bg-accent-tint text-accent';
  } else {
    // Edge trailing
    stateClasses = 'border-sky-400 bg-sky-900/40 text-sky-200';
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
      {showLabel ? `Base ${label}` : label}
    </button>
  );
}


type WheelFormValue = Pick<Wheel, 'name' | 'D' | 'DText' | 'grit' | 'isHoning' | 'baseForHn'>;

function WheelFormFields({
  value,
  onChange,
  autoFocusName = false,
}: {
  value: WheelFormValue;
  onChange: (patch: Partial<WheelFormValue>) => void;
  autoFocusName?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs u-text-muted">Wheel name</span>
        <input
          className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
          value={value.name}
          autoFocus={autoFocusName}
          onChange={e => onChange({ name: e.target.value })}
          onFocus={e => autoFocusName && e.target.select()}
          onKeyDown={blurOnEnter}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs u-text-muted">Diameter (mm)</span>
        <div className="flex items-center gap-2 text-xs">
          <input
            type="text"
            inputMode="decimal"
            className="w-24 rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-right text-sm appearance-none"
            value={
              value.DText !== undefined
                ? value.DText
                : Number.isNaN(value.D)
                ? ''
                : String(value.D)
            }
            onKeyDown={blurOnEnter}
            onFocus={e => e.target.select()}
            onChange={e => {
              const text = e.target.value;
              const patch: Partial<WheelFormValue> = { DText: text };

              const trimmed = text.trim();
              if (trimmed === '') {
                patch.D = NaN as unknown as number;
                onChange(patch);
                return;
              }

              const normalised = trimmed.replace(',', '.');
              const val = Number(normalised);

              if (!Number.isNaN(val)) {
                patch.D = Math.round(val * 100) / 100;
              }

              onChange(patch);
            }}
          />
          <span className="text-neutral-400 text-[0.75rem]">mm</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs u-text-muted">Grit / abrasive</span>
        <input
          className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
          value={value.grit ?? ''}
          onChange={e => onChange({ grit: e.target.value })}
          onKeyDown={blurOnEnter}
        />
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.isHoning}
            onChange={e =>
              onChange({
                isHoning: e.target.checked,
                baseForHn: e.target.checked ? 'front' : value.baseForHn,
              })
            }
          />
          <span className="text-neutral-300">Honing wheel? (Locks to Front base)</span>
        </label>

        {!value.isHoning && (
          <div className="flex items-center gap-3 text-xs text-neutral-300">
            <span>Default base for h?:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={value.baseForHn === 'rear'}
                onChange={() => onChange({ baseForHn: 'rear' })}
              />
              <span>Rear (edge leading)</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={value.baseForHn === 'front'}
                onChange={() => onChange({ baseForHn: 'front' })}
              />
              <span>Front (edge trailing)</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
  overlayStyle,
  dialogStyle,
  closing = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  overlayStyle?: React.CSSProperties;
  dialogStyle?: React.CSSProperties;
  closing?: boolean;
}) {
  const hasSubtitle = Boolean(subtitle);

  return (
    <div
      className={
        'fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-black/60 pt-12 md:pt-0 pb-[calc(env(safe-area-inset-bottom)+16px)] px-4 min-h-[100dvh] motion-overlay ' +
        (closing ? 'motion-overlay--closing' : '')
      }
      style={overlayStyle}
    >
      <div
        className={
          'w-full max-w-md rounded-lg border u-border u-surface p-4 shadow-xl max-h-[90vh] overflow-y-auto motion-dialog ' +
          (closing ? 'motion-dialog--closing' : '')
        }
        style={dialogStyle}
      >
        <div className="modal-shell__header">
          <h3 className="modal-shell__title">{title}</h3>
          <button
            type="button"
            className={BTN.close}
            onClick={onClose}
            aria-label="Close"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-shell__body">
          {hasSubtitle ? <p className="modal-shell__lede">{subtitle}</p> : null}
          <div>{children}</div>
        </div>

        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
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

type ExportSections = {
  global: boolean;
  constants: boolean;
  wheels: boolean;
  sessionSteps: boolean;
  sessionPresets: boolean;
  heightMode: boolean;
  calibSnapshots: boolean;
  calibAppliedIds: boolean;
};

type ImportSections = ExportSections;
type ImportModes = Record<keyof ImportSections, 'merge' | 'overwrite'>;

function normalizeCalibrationSnapshots(items: any[]): CalibrationSnapshot[] {
  return items.map((snap, idx) => {
    const base: BaseSide = snap?.base === 'front' ? 'front' : 'rear';
    const name = typeof snap?.name === 'string' ? snap.name : '';
    const baseTag =
      typeof snap?.baseTag === 'string' && snap.baseTag.trim()
        ? snap.baseTag.trim()
        : base;
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
      name,
      baseTag,
    };
  });
}

type BaseCardProps = {
  title: string;
  snap: CalibrationSnapshot | null;
  options: { value: string; label: string }[];
  appliedId: string;
  display: { hc: number; o: number };
  constantsInputMode: 'normal' | 'failsafe';
  onChange: (id: string) => void;
  onChangeField: (field: 'hc' | 'o', value: string) => void;
};

function BaseCard({
  title,
  snap,
  options,
  appliedId,
  display,
  constantsInputMode,
  onChange,
  onChangeField,
}: BaseCardProps) {
  const isLocked = Boolean(snap);
  const baseKey: 'rear' | 'front' = title.toLowerCase().includes('rear') ? 'rear' : 'front';
  const hcId = `${baseKey}-const-hc`;
  const oId = `${baseKey}-const-o`;
  const [hcDraft, setHcDraft] = React.useState<string>(() => String(display.hc ?? ''));
  const [oDraft, setODraft] = React.useState<string>(() => String(display.o ?? ''));

  // Keep local drafts in sync when the source changes (e.g., switching manual/calibration)
  React.useEffect(() => {
    setHcDraft(String(display.hc ?? ''));
    setODraft(String(display.o ?? ''));
  }, [display.hc, display.o, appliedId]);

  const residual = snap?.diagnostics?.maxAbsResidualMm;
  let sourceCls = 'text-neutral-400';
  if (typeof residual === 'number' && Number.isFinite(residual)) {
  if (residual <= 0.05) sourceCls = 'text-accent';
  else if (residual <= 0.1) sourceCls = 'text-accent-soft';
  else if (residual <= 0.2) sourceCls = 'text-warning';
  else sourceCls = 'text-danger';
  }

  const handleFocus = React.useCallback(
    (field: 'hc' | 'o', draft: string) => {
      const msg = `[const-input] focus ${field} ${baseKey}-const draft=${draft} applied=${appliedId} mode=${constantsInputMode}`;
      console.log(msg);
    },
    [appliedId, baseKey, constantsInputMode]
  );

  const handleCommit = React.useCallback(
    (field: 'hc' | 'o', value: string) => {
      onChangeField(field, value);
      console.log(
        `[const-input] commit ${field} ${baseKey}-const value=${value} mode=${constantsInputMode}`
      );
    },
    [baseKey, constantsInputMode, onChangeField]
  );

  return (
    <div className="rounded border border-neutral-700 bg-neutral-950/40 p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-neutral-200">
        <span>{title}</span>
        <MiniSelect
          value={appliedId}
          options={options}
          onChange={onChange}
          widthClass="w-56"
          menuWidthClass="w-64"
        />
      </div>
      <div className={`text-[0.7rem] ${sourceCls}`}>
        {snap ? (
          <>
            Source: {(snap.baseTag || snap.base || 'rear').toString().replace(/^\w/, c => c.toUpperCase())} calibration
            {snap.name?.trim() ? ` "${snap.name.trim()}"` : ''} {snap.createdAt ? `(${snap.createdAt.slice(0, 10)})` : ''} ({snap.count} pts
            {residual != null ? `, max |resid| ${residual.toFixed(3)} mm` : ''}
            {snap.angleErrorDeg != null ? `, ~${snap.angleErrorDeg.toFixed(3)} deg` : ''})
          </>
        ) : (
          'Source: Manual input'
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor={hcId} className="w-16 text-neutral-300 text-xs">
            hc (mm)
          </label>
          {isLocked ? (
            <div className="w-40 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-sm text-right text-neutral-400 select-none">
              {display.hc}
            </div>
          ) : (
            <input
              type="number"
              inputMode="decimal"
              id={hcId}
              className="w-40 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right"
              value={hcDraft ?? ''}
              onFocus={() => handleFocus('hc', hcDraft ?? '')}
              onChange={e => setHcDraft(e.target.value)}
              onBlur={e => handleCommit('hc', e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  blurOnEnter(e);
                  handleCommit('hc', e.currentTarget.value);
                }
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={oId} className="w-16 text-neutral-300 text-xs">
            o (mm)
          </label>
          {isLocked ? (
            <div className="w-40 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-sm text-right text-neutral-400 select-none">
              {display.o}
            </div>
          ) : (
            <input
              type="number"
              inputMode="decimal"
              id={oId}
              className="w-40 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right"
              value={oDraft ?? ''}
              onFocus={() => handleFocus('o', oDraft ?? '')}
              onChange={e => setODraft(e.target.value)}
              onBlur={e => handleCommit('o', e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  blurOnEnter(e);
                  handleCommit('o', e.currentTarget.value);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
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
  const [removingStepIds, setRemovingStepIds] = React.useState<Set<string>>(new Set());
  const stepRemoveTimersRef = React.useRef<Map<string, number>>(new Map());
  const [sessionPresets, setSessionPresets] = React.useState<SessionPreset[]>(() =>
    _load('t_sessionPresets', [])
  );
  const [exportSections, setExportSections] = React.useState<ExportSections>({
    global: true,
    constants: true,
    wheels: true,
    sessionSteps: true,
    sessionPresets: true,
    heightMode: true,
    calibSnapshots: true,
    calibAppliedIds: true,
  });
  const [importSections, setImportSections] = React.useState<ImportSections>({
    global: true,
    constants: true,
    wheels: true,
    sessionSteps: true,
    sessionPresets: true,
    heightMode: true,
    calibSnapshots: true,
    calibAppliedIds: true,
  });
  const [importModes, setImportModes] = React.useState<ImportModes>({
    global: 'merge',
    constants: 'merge',
    wheels: 'merge',
    sessionSteps: 'merge',
    sessionPresets: 'merge',
    heightMode: 'merge',
    calibSnapshots: 'merge',
    calibAppliedIds: 'merge',
  });

  // View state
  const [view, setView] = React.useState<'calculator' | 'wheels' | 'settings'>(
    'calculator'
  );
  const [settingsView, setSettingsView] = React.useState<
    'machine' | 'calibration' | 'import' | 'glossary'
  >('machine');
  
  const [constantsInputMode] = React.useState<'normal' | 'failsafe'>('normal');
  // Preset dialog / manager state
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>('');
  const [isPresetDialogOpen, setIsPresetDialogOpen] = React.useState(false);
  const [isPresetDialogVisible, setIsPresetDialogVisible] = React.useState(false);
  const [isPresetDialogClosing, setIsPresetDialogClosing] = React.useState(false);
  const presetDialogCloseTimerRef = React.useRef<number | null>(null);
  const [presetNameDraft, setPresetNameDraft] = React.useState('');
  const [isPresetManagerOpen, setIsPresetManagerOpen] = React.useState(false);
  const [isPresetManagerVisible, setIsPresetManagerVisible] = React.useState(false);
  const [isPresetManagerClosing, setIsPresetManagerClosing] = React.useState(false);
  const presetManagerCloseTimerRef = React.useRef<number | null>(null);
  const [presetRenameId, setPresetRenameId] = React.useState<string | null>(null);
  const [presetRenameValue, setPresetRenameValue] = React.useState('');
  const [heightMode, setHeightMode] = React.useState<'hn' | 'hr'>(() => {
    const val = _load<'hn' | 'hr'>('t_heightMode', 'hn');
    return val === 'hr' ? 'hr' : 'hn';
  });

  React.useEffect(() => {
    return () => {
      stepRemoveTimersRef.current.forEach(t => window.clearTimeout(t));
      stepRemoveTimersRef.current.clear();
    };
  }, []);

  // Step notes modal state
  const [isStepNotesOpen, setIsStepNotesOpen] = React.useState(false);
  const [isStepNotesVisible, setIsStepNotesVisible] = React.useState(false);
  const [isStepNotesClosing, setIsStepNotesClosing] = React.useState(false);
  const stepNotesCloseTimerRef = React.useRef<number | null>(null);
  const [stepNotesDraft, setStepNotesDraft] = React.useState('');
  const stepNotesStepIdRef = React.useRef<string | null>(null);

  // Wheel config panel state
  const [isWheelConfigOpen, setIsWheelConfigOpen] = React.useState(false);
  const [isSetupPanelOpen, setIsSetupPanelOpen] = React.useState(false);
  const [isAddWheelModalVisible, setIsAddWheelModalVisible] = React.useState(false);
  const [isAddWheelModalClosing, setIsAddWheelModalClosing] = React.useState(false);
  const [editingWheelId, setEditingWheelId] = React.useState<string | null>(null);
  const [editingWheelDraft, setEditingWheelDraft] = React.useState<WheelFormValue | null>(null);
  const [isEditWheelModalVisible, setIsEditWheelModalVisible] = React.useState(false);
  const [isEditWheelModalClosing, setIsEditWheelModalClosing] = React.useState(false);
  const MODAL_CLOSE_MS = 200;
  const [newWheelDraft, setNewWheelDraft] = React.useState<Omit<Wheel, 'id'>>({
    name: '',
    D: NaN,
    DText: '',
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
    grit: '',
  });
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


    // Scroll target for newly added progression steps
  const progressionEndRef = React.useRef<HTMLDivElement | null>(null);

  // Track last loaded preset and its steps
const lastLoadedPresetIdRef = React.useRef<string | null>(null);
const lastLoadedStepsRef = React.useRef<string | null>(null);
const { overlayStyle: modalOverlayStyle, getDialogStyle: getModalDialogStyle } = useModalLayout();


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
  const [calibName, setCalibName] = React.useState<string>('');
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
  const progressionCardMinHeight = 130;
  const progressionBodyPaddingX = 'px-3';
  const progressionBodyPaddingY = 'py-2';
  const progressionBodyGap = 'gap-2';
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
    setRemovingStepIds(prev => {
      let changed = false;
      const next = new Set(prev);
      prev.forEach(id => {
        if (!sessionSteps.some(s => s.id === id)) {
          next.delete(id);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
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

  // Modal visibility / exit animations
  React.useEffect(() => {
    const closeDuration = 200;
    if (isPresetManagerOpen) {
      if (presetManagerCloseTimerRef.current) {
        window.clearTimeout(presetManagerCloseTimerRef.current);
        presetManagerCloseTimerRef.current = null;
      }
      setIsPresetManagerClosing(false);
      setIsPresetManagerVisible(true);
      return;
    }
    if (!isPresetManagerVisible) return;
    setIsPresetManagerClosing(true);
    presetManagerCloseTimerRef.current = window.setTimeout(() => {
      setIsPresetManagerVisible(false);
      setIsPresetManagerClosing(false);
      presetManagerCloseTimerRef.current = null;
    }, closeDuration);
    return () => {
      if (presetManagerCloseTimerRef.current) {
        window.clearTimeout(presetManagerCloseTimerRef.current);
        presetManagerCloseTimerRef.current = null;
      }
    };
  }, [isPresetManagerOpen, isPresetManagerVisible]);

  React.useEffect(() => {
    const closeDuration = 200;
    if (isPresetDialogOpen) {
      if (presetDialogCloseTimerRef.current) {
        window.clearTimeout(presetDialogCloseTimerRef.current);
        presetDialogCloseTimerRef.current = null;
      }
      setIsPresetDialogClosing(false);
      setIsPresetDialogVisible(true);
      return;
    }
    if (!isPresetDialogVisible) return;
    setIsPresetDialogClosing(true);
    presetDialogCloseTimerRef.current = window.setTimeout(() => {
      setIsPresetDialogVisible(false);
      setIsPresetDialogClosing(false);
      presetDialogCloseTimerRef.current = null;
    }, closeDuration);
    return () => {
      if (presetDialogCloseTimerRef.current) {
        window.clearTimeout(presetDialogCloseTimerRef.current);
        presetDialogCloseTimerRef.current = null;
      }
    };
  }, [isPresetDialogOpen, isPresetDialogVisible]);

  React.useEffect(() => {
    return () => {
      if (presetManagerCloseTimerRef.current) {
        window.clearTimeout(presetManagerCloseTimerRef.current);
      }
      if (presetDialogCloseTimerRef.current) {
        window.clearTimeout(presetDialogCloseTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (progressionMenuCloseTimerRef.current) {
        window.clearTimeout(progressionMenuCloseTimerRef.current);
      }
      if (stepNotesCloseTimerRef.current) {
        window.clearTimeout(stepNotesCloseTimerRef.current);
      }
    };
  }, []);

  // Close notes popover on outside click/tap
  React.useEffect(() => {
    const closeDuration = 200;
    if (isStepNotesOpen) {
      if (stepNotesCloseTimerRef.current) {
        window.clearTimeout(stepNotesCloseTimerRef.current);
        stepNotesCloseTimerRef.current = null;
      }
      setIsStepNotesClosing(false);
      setIsStepNotesVisible(true);
      return;
    }
    if (!isStepNotesVisible) return;
    setIsStepNotesClosing(true);
    stepNotesCloseTimerRef.current = window.setTimeout(() => {
      setIsStepNotesVisible(false);
      setIsStepNotesClosing(false);
      stepNotesCloseTimerRef.current = null;
    }, closeDuration);
    return () => {
      if (stepNotesCloseTimerRef.current) {
        window.clearTimeout(stepNotesCloseTimerRef.current);
        stepNotesCloseTimerRef.current = null;
      }
    };
  }, [isStepNotesOpen, isStepNotesVisible]);

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
      ...(exportSections.global ? { global } : {}),
      ...(exportSections.constants ? { constants } : {}),
      ...(exportSections.wheels ? { wheels } : {}),
      ...(exportSections.sessionSteps ? { sessionSteps } : {}),
      ...(exportSections.sessionPresets ? { sessionPresets } : {}),
      ...(exportSections.heightMode ? { heightMode } : {}),
      ...(exportSections.calibSnapshots ? { calibSnapshots } : {}),
      ...(exportSections.calibAppliedIds ? { calibAppliedIds } : {}),
    }),
    [
      exportSections,
      calibAppliedIds,
      calibSnapshots,
      constants,
      global,
      heightMode,
      sessionPresets,
      sessionSteps,
      wheels,
    ]
  );
  const exportText = React.useMemo(() => JSON.stringify(exportBundle, null, 2), [exportBundle]);
  const handleImportText = React.useCallback(
    (raw: string) => {
      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return { error: 'Import failed: invalid JSON.' };
      }
      if (!isObject(parsed)) return { error: 'Import failed: expected a JSON object.' };

      // Normalise incoming sections
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
        : [];

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

      // Merge/overwrite helpers
      const mergeMapById = <T extends { id: string }>(current: T[], incoming: T[]) => {
        const map = new Map<string, T>();
        current.forEach(item => {
          if (item && item.id) map.set(item.id, item);
        });
        incoming.forEach(item => {
          if (item && item.id) map.set(item.id, item);
        });
        return Array.from(map.values());
      };

      // Apply per-section with modes
      const appliedSummary: string[] = [];

      if (importSections.global) {
        if (importModes.global === 'overwrite') {
          setGlobal(nextGlobal);
          appliedSummary.push('global: overwrite');
        } else {
          setGlobal(prev => ({ ...prev, ...nextGlobal }));
          appliedSummary.push('global: merge');
        }
      }

      if (importSections.constants) {
        if (importModes.constants === 'overwrite') {
          setConstants(nextConstants);
          appliedSummary.push('constants: overwrite');
        } else {
          setConstants(prev => ({
            rear: {
              hc: _nz((nextConstants as any).rear?.hc, prev.rear.hc),
              o: _nz((nextConstants as any).rear?.o, prev.rear.o),
            },
            front: {
              hc: _nz((nextConstants as any).front?.hc, prev.front.hc),
              o: _nz((nextConstants as any).front?.o, prev.front.o),
            },
          }));
          appliedSummary.push('constants: merge');
        }
      }

      if (importSections.wheels) {
        if (importModes.wheels === 'overwrite') {
          setWheels(nextWheels);
          appliedSummary.push(`wheels: overwrite (${nextWheels.length})`);
        } else {
          const merged = mergeMapById(wheels, nextWheels);
          setWheels(merged);
          appliedSummary.push(`wheels: merge -> ${merged.length}`);
        }
      }

      if (importSections.sessionSteps) {
        if (importModes.sessionSteps === 'overwrite') {
          setSessionSteps(nextSteps);
          appliedSummary.push(`steps: overwrite (${nextSteps.length})`);
        } else {
          const keyed = new Map<string, SessionStep>();
          sessionSteps.forEach((s, idx) => keyed.set((s as any).id || `cur-${idx}`, s));
          nextSteps.forEach((s, idx) => keyed.set((s as any).id || `new-${idx}`, s));
          const merged = Array.from(keyed.values());
          setSessionSteps(merged);
          appliedSummary.push(`steps: merge -> ${merged.length}`);
        }
      }

      if (importSections.sessionPresets) {
        if (importModes.sessionPresets === 'overwrite') {
          setSessionPresets(nextPresets);
          appliedSummary.push(`presets: overwrite (${nextPresets.length})`);
        } else {
          const merged = mergeMapById(sessionPresets, nextPresets);
          setSessionPresets(merged);
          appliedSummary.push(`presets: merge -> ${merged.length}`);
        }
      }

      if (importSections.heightMode) {
        if (importModes.heightMode === 'overwrite') {
          setHeightMode(nextHeightMode);
          appliedSummary.push('heightMode: overwrite');
        } else if (parsed.heightMode === 'hr' || parsed.heightMode === 'hn') {
          setHeightMode(nextHeightMode);
          appliedSummary.push('heightMode: merge (applied incoming)');
        } else {
          appliedSummary.push('heightMode: merge (kept existing)');
        }
      }

      let finalSnapshots = calibSnapshots;
      if (importSections.calibSnapshots) {
        if (importModes.calibSnapshots === 'overwrite') {
          finalSnapshots = nextSnapshots;
          setCalibSnapshots(nextSnapshots);
          appliedSummary.push(`calibrations: overwrite (${nextSnapshots.length})`);
        } else {
          const merged = mergeMapById(calibSnapshots, nextSnapshots);
          finalSnapshots = merged;
          setCalibSnapshots(merged);
          appliedSummary.push(`calibrations: merge -> ${merged.length}`);
        }
      }

      if (importSections.calibAppliedIds) {
        const ensureApplied = (applied: { rear: string; front: string }) => ({
          rear: finalSnapshots.some(s => s.id === applied.rear) ? applied.rear : '',
          front: finalSnapshots.some(s => s.id === applied.front) ? applied.front : '',
        });
        if (importModes.calibAppliedIds === 'overwrite') {
          setCalibAppliedIds(ensureApplied(nextApplied));
          appliedSummary.push('applied calibrations: overwrite');
        } else {
          const mergedApplied = {
            rear: nextApplied.rear || calibAppliedIds.rear,
            front: nextApplied.front || calibAppliedIds.front,
          };
          setCalibAppliedIds(ensureApplied(mergedApplied));
          appliedSummary.push('applied calibrations: merge');
        }
      }

      const summary =
        appliedSummary.length > 0
          ? `Import applied (${appliedSummary.join('; ')})`
          : 'Import did not apply any sections.';
      console.log(summary);
      return { summary };
    },
    [
      calibAppliedIds.rear,
      calibAppliedIds.front,
      calibSnapshots,
      constants,
      global,
      heightMode,
      importModes,
      importSections,
      sessionPresets,
      sessionSteps,
      wheels,
    ]
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
  const editingWheel = React.useMemo(
    () => (editingWheelId ? wheels.find(w => w.id === editingWheelId) || null : null),
    [editingWheelId, wheels]
  );

  React.useEffect(() => {
    if (!editingWheel) {
      setEditingWheelDraft(null);
      return;
    }
    setEditingWheelDraft({
      name: editingWheel.name,
      D: editingWheel.D,
      DText: editingWheel.DText,
      grit: editingWheel.grit,
      isHoning: editingWheel.isHoning,
      baseForHn: editingWheel.baseForHn,
    });
  }, [editingWheel]);

  const openEditWheelModal = (wheel: Wheel) => {
    setEditingWheelDraft({
      name: wheel.name,
      D: wheel.D,
      DText: wheel.DText,
      grit: wheel.grit,
      isHoning: wheel.isHoning,
      baseForHn: wheel.baseForHn,
    });
    setEditingWheelId(wheel.id);
    setIsEditWheelModalVisible(true);
    setIsEditWheelModalClosing(false);
  };

  const closeEditWheelModal = () => {
    setIsEditWheelModalClosing(true);
    window.setTimeout(() => {
      setIsEditWheelModalVisible(false);
      setIsEditWheelModalClosing(false);
      setEditingWheelId(null);
      setEditingWheelDraft(null);
    }, MODAL_CLOSE_MS);
  };
  const newWheelNameTrimmed = newWheelDraft.name.trim();
  const isNewWheelDiameterValid = Number.isFinite(newWheelDraft.D);
  const isAddWheelSaveDisabled = !newWheelNameTrimmed || !isNewWheelDiameterValid;

  const updateWheel = (id: string, patch: Partial<Wheel>) => {
    setWheels(prev => prev.map(w => (w.id === id ? { ...w, ...patch } : w)));
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

  const openAddWheelModal = () => {
    setIsAddWheelModalVisible(true);
    setIsAddWheelModalClosing(false);
  };

  const closeAddWheelModal = () => {
    setIsAddWheelModalClosing(true);
    window.setTimeout(() => {
      setIsAddWheelModalVisible(false);
      setIsAddWheelModalClosing(false);
      resetNewWheelDraft();
    }, MODAL_CLOSE_MS);
  };

  const addWheel = () => {
    resetNewWheelDraft();
    openAddWheelModal();
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

    setWheels(prev => [...prev, w]);
    closeAddWheelModal();
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
    if (editingWheelId === id) {
      closeEditWheelModal();
    }
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

const requestDeleteStep = (id: string) => {
  setRemovingStepIds(prev => {
    if (prev.has(id)) return prev;
    const next = new Set(prev);
    next.add(id);
    return next;
  });

  if (stepRemoveTimersRef.current.has(id)) return;

  const timer = window.setTimeout(() => {
    setSessionSteps(prev => prev.filter(s => s.id !== id));
    setRemovingStepIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    stepRemoveTimersRef.current.delete(id);
  }, 650);

  stepRemoveTimersRef.current.set(id, timer);
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
    <div className="min-h-dvh u-bg p-4 flex flex-col gap-4">
      <h1 className="text-lg font-semibold">UWGAS Dev build</h1>

      <div className="flex gap-2 text-sm mb-2">
        <button
          type="button"
          className={view === 'calculator' ? BTN.tabPrimary : BTN.tabGhost}
          onClick={() => setView('calculator')}
        >
          Calculator
        </button>

        <button
          type="button"
          className={view === 'wheels' ? BTN.tabPrimary : BTN.tabGhost}
          onClick={() => setView('wheels')}
        >
          Wheel Manager
        </button>

        <button
          type="button"
          className={view === 'settings' ? BTN.tabPrimary : BTN.tabGhost}
          onClick={() => setView('settings')}
        >
          Settings
        </button>
      </div>

        {view === 'calculator' && (
        <div className="flex flex-col gap-4">
          {/* Global controls */}
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
              <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="flex flex-col gap-1">
                  <span className="u-text">Projection A (mm)</span>
                  <input
                    type="number"
                    className="rounded border u-border u-surface px-2 py-1 text-sm u-text"
                    value={global.projection}
                    onKeyDown={blurOnEnter}
                    onChange={e =>
                      setGlobal(g => ({ ...g, projection: _nz(e.target.value, g.projection) }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="u-text">Target angle {targetAngleSymbol}° (/side)</span>
                  <input
                    type="number"
                    className="rounded border u-border u-surface px-2 py-1 text-sm u-text"
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
                    <span className="u-text">USB diameter Ds (mm)</span>
                    <input
                      type="number"
                      className="rounded border u-border u-surface px-2 py-1 text-sm u-text"
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
                    <span className="u-text">Jig diameter Dj (mm)</span>
                    <input
                      type="number"
                      className="rounded border u-border u-surface px-2 py-1 text-sm u-text"
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

          {/*Progression View*/}
          <section className="panel-card motion-panel flex flex-col gap-0">
            <div className="panel-card__header grid items-center gap-3" style={{ gridTemplateColumns: 'auto minmax(0, 1fr) auto' }}>
              <h2 className="text-sm font-semibold u-text panel-header">Progression</h2>
              <div
                className="w-full min-w-0"
                style={{ maxWidth: 'min(32rem, calc(100% - 10rem))' }}
              >
                <MiniSelect
                  value={selectedPresetId || ''}
                  options={[
                    { value: '', label: 'Select preset' },
                    ...sessionPresets.map(p => ({
                      value: p.id,
                      label: p.name,
                      meta: `${p.steps.length} step${p.steps.length === 1 ? '' : 's'}`,
                    })),
                  ]}
                  onChange={id => {
                    setSelectedPresetId(id);
                    if (id) {
                      handleLoadPreset(id); // auto-load on selection
                    }
                  }}
                  align="right"
                  widthClass="w-full min-w-[8rem]"
                  menuWidthClass="w-48"
                  emptyLabel="No presets saved"
                  renderOption={opt => (
                    <>
                      <div className="dropdown-item__title text-[0.75rem] truncate">{opt.label}</div>
                      {opt.meta ? (
                        <div className="dropdown-item__meta text-[0.7rem]">{opt.meta}</div>
                      ) : null}
                    </>
              )}
              renderLabel={opt => (opt ? opt.label : 'Select preset')}
            />
          </div>
              <div className="flex items-center gap-3 justify-end">
                <button
                  type="button"
                  className={`${BTN.base} w-12`}
                  onClick={() => setIsWheelConfigOpen(open => !open)}
            >
              {isWheelConfigOpen ? 'Back' : 'Edit'}
            </button>
                <div ref={progressionMenuRef} className="relative">
                  <button
                    type="button"
                    className={`${BTN.iconPlain} text-neutral-300`}
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
                    <IconKebab className="w-5 h-5" />
                  </button>
                  {isProgressionMenuVisible && (
                    <div
                      className="absolute right-0 mt-1 w-52 rounded border u-border u-surface shadow-lg text-xs z-30 overflow-hidden"
                      style={{
                        animation: `${isProgressionMenuClosing ? 'menuFadeSlideOut 100ms ease-in forwards' : 'menuFadeSlideIn 100ms ease-out forwards'}`,
                        transformOrigin: 'top right',
                      }}
                    >
                      {progressionMenuItems.map(item => (
                        <button
                          key={item.label}
                          type="button"
                          className="menu-item w-full px-3 py-2 text-left"
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
            <div className="panel-card__body flex flex-col gap-3">
              {/* TOGGLE: math vs progression cards */}
              {/* Shared wrapper so cards start at the exact same vertical position in both modes */}
              <div className="mt-2">
              {isWheelConfigOpen ? (
                // EDIT MODE – progression controls
                    <div className="flex flex-col card-stack text-xs">
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
                    <div className="flex flex-col gap-3">
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
                        const isRemoving = removingStepIds.has(step.id);

                        const removingStyle: React.CSSProperties | undefined = isRemoving
                          ? {
                              animation: 'stepRemove 520ms cubic-bezier(0.33, 1, 0.68, 1) forwards',
                            }
                          : undefined;

                        return (
                          <div
                            key={step.id}
                            className={`card-elevated flex flex-col motion-list-item ${isRemoving ? 'step-removing' : ''}`}
                            style={
                              {
                                '--motion-order': index,
                                minHeight: progressionCardMinHeight,
                                ...removingStyle,
                              } as React.CSSProperties
                            }
                          >
                            {/* === Header bar: step badge + wheel selector + grind direction + delete === */}
                            <div className="card-elevated__header wheel-card__header flex flex-wrap items-center gap-x-1 gap-y-1 px-2 py-1.5 min-h-[44px]">
                              {/* LEFT: step badge + grind direction + wheel select */}
                              <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                                {/* Step badge */}
                                <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[0.7rem] font-mono text-neutral-100 -ml-1 shadow-sm">
                                  {index + 1}
                                </div>

                                {/* Wheel selector */}
                                <MiniSelect
                                  value={step.wheelId}
                                  options={[
                                    { value: '', label: 'Select wheel...' },
                                    ...wheels.map(w => ({
                                      value: w.id,
                                      label: w.name,
                                      meta: w.isHoning ? 'honing' : undefined,
                                    })),
                                  ]}
                                  onChange={id => {
                                    const newWheel = wheels.find(w => w.id === id);
                                    if (!newWheel) return;
                                    updateStep(step.id, {
                                      wheelId: newWheel.id,
                                      base: newWheel.isHoning ? 'front' : step.base,
                                    });
                                  }}
                                  widthClass="min-w-[9rem] max-w-[9rem]"
                                  menuWidthClass="w-44"
                                  emptyLabel="No wheels defined"
                                  renderOption={opt => (
                                    <>
                                      <div className="dropdown-item__title text-[0.75rem]">{opt.label}</div>
                                      {opt.meta ? (
                                        <div className="dropdown-item__meta text-[0.7rem]">{opt.meta}</div>
                                      ) : null}
                                    </>
                                  )}
                                  renderLabel={opt => (opt ? opt.label : 'Select wheel...')}
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
                                  className={`${BTN.iconPlain} text-danger ml-1`}
                                  onClick={() => requestDeleteStep(step.id)}
                                  title="Delete step"
                                >
                                  <IconTrash className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                            
                              {/* === Body: two-column layout for base/angle and notes/sort === */}
                              <div
                                className={`${progressionBodyPaddingX} ${progressionBodyPaddingY} grid grid-cols-[1fr_1fr_auto] ${progressionBodyGap} items-stretch`}
                              >
                                {/* Left column: base select (top) + angle offset (bottom) */}
                                <div className="flex flex-col gap-2 h-full justify-between">
                                  <div className="flex items-center gap-2">
                                    <GrindDirToggle
                                      base={step.base}
                                      isHoning={isHoning}
                                      canToggle={!isHoning}
                                      showLabel
                                      onToggle={() =>
                                        updateStep(step.id, {
                                          base: step.base === 'rear' ? 'front' : 'rear',
                                        })
                                      }
                                    />
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-neutral-400 text-[0.7rem]">
                                      {targetAngleSymbol} offset
                                    </span>
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      className="w-14 rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-right text-xs"
                                      value={step.angleOffset === 0 ? '' : step.angleOffset}
                                      placeholder="0"
                                      onFocus={e => {
                                        if (e.target.value !== '') {
                                          e.target.select();
                                        }
                                      }}
                                      onChange={e => {
                                        const text = e.target.value;
                                        if (text.trim() === '') {
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

                                {/* Middle column: notes (modal trigger) */}
                                <div className="flex flex-col gap-2 items-start h-full relative">
                                  <button
                                    type="button"
                                    className={`${BTN.base} self-start`}
                                    onClick={() => {
                                      stepNotesStepIdRef.current = step.id;
                                      setStepNotesDraft(step.notes || '');
                                      setIsStepNotesOpen(true);
                                    }}
                                  >
                                    Notes
                                  </button>
                                </div>

                                {/* Right column: sort controls */}
                                <div className="flex flex-col justify-center items-end h-full min-w-[52px]">
                                  <button
                                    type="button"
                                  className={BTN.icon}
                                  onClick={() => moveStep(index, -1)}
                                  disabled={index === 0}
                                  title="Move up"
                                >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    className={`${BTN.icon} mt-1`}
                                    onClick={() => moveStep(index, 1)}
                                    disabled={index === sessionSteps.length - 1}
                                    title="Move down"
                                  >
                                    ↓
                                  </button>
                                </div>
                              </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add step button - same width and spacing as cards */}
                  <button
                    type="button"
                    className={`${BTN.primary} w-full text-center`}
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
                  <div className="text-xs text-neutral-400 border border-dashed u-border rounded p-2">
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
                    bodyPaddingX={progressionBodyPaddingX}
                    bodyPaddingY={progressionBodyPaddingY}
                    bodyGap={progressionBodyGap}
                    cardMinHeight={progressionCardMinHeight}
                  />
                )
              )}
            </div>
            </div>
          </section>
        </div>
      )}
      
{view === 'wheels' && (
  <section className="panel-card panel-card--strong motion-panel flex flex-col gap-0 max-w-3xl mx-auto">
    <div className="panel-card__header flex items-center gap-2">
      <h2 className="text-sm font-semibold u-text panel-header">Wheel Manager</h2>
      <button
        type="button"
        className={`${BTN.primaryFlat} ml-auto`}
        onClick={addWheel}
      >
        + Add Wheel
      </button>
    </div>

    <div className="panel-card__body flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <label className="text-[0.75rem] u-text-muted flex items-center gap-1">
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
        <label className="text-[0.75rem] u-text-muted flex items-center gap-1">
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
          className={BTN.iconGhost}
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
        <div className="text-xs u-text-muted border border-dashed u-border rounded p-3 u-surface">
          No wheels saved yet. Click <span className="font-semibold u-text">Add Wheel</span> to create your first wheel.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groupedWheels.map(group => (
            <div key={group.key} className="flex flex-col gap-2">
              {group.label && (
                <div className="flex items-center gap-2 text-[0.85rem] u-text">
                  <span className="font-semibold">{group.label}</span>
                  <span className="text-[0.7rem] u-text-muted">
                    {group.items.length} wheel{group.items.length === 1 ? '' : 's'}
                  </span>
                </div>
              )}

              <div className="grid card-grid md:grid-cols-2">
                {group.items.map((w, idx) => {
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
                      className="card-elevated wheel-card flex flex-col gap-2 motion-card"
                      style={{ '--motion-order': idx } as React.CSSProperties}
                    >
                    <div className="card-elevated__header wheel-card__header grid grid-cols-[1fr_auto] items-center gap-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="text-sm font-semibold u-text truncate">
                            {w.name || 'Untitled wheel'}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 shrink-0 h-full">
                          <button
                            type="button"
                            className={BTN.base}
                            onClick={() => openEditWheelModal(w)}
                          >
                            Details
                          </button>
                        </div>
                      </div>

                      <div className="wheel-card__summary">
                        <span className="font-mono u-text text-[0.8rem]">
                          D: {diameterDisplay || '-'} mm
                        </span>
                        <span className="u-text-muted">{baseLabel}</span>
                        {w.grit ? (
                          <span className="px-2 py-[2px] rounded border u-border u-surface text-[0.75rem] u-text">
                            Grit: {w.grit}
                          </span>
                        ) : null}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
)}
{isEditWheelModalVisible && (editingWheelDraft || editingWheel) && (
  <ModalShell
    title="Edit wheel"
    subtitle="Changes apply immediately to the calculator and presets."
    onClose={closeEditWheelModal}
    closing={isEditWheelModalClosing}
    overlayStyle={modalOverlayStyle}
    dialogStyle={getModalDialogStyle({ liftByKeyboard: true })}
  >
    {(() => {
      const source = editingWheelDraft || editingWheel!;
      const hasBaseline = Boolean(editingWheel);
      const saveDisabled =
        !editingWheelId ||
        !source.name.trim() ||
        !Number.isFinite(source.D) ||
        (hasBaseline &&
          source.name === editingWheel!.name &&
          source.D === editingWheel!.D &&
          (source.DText ?? '') === (editingWheel!.DText ?? '') &&
          (source.grit ?? '') === (editingWheel!.grit ?? '') &&
          source.isHoning === editingWheel!.isHoning &&
          source.baseForHn === editingWheel!.baseForHn);

      return (
        <>
          <WheelFormFields
            value={source}
            onChange={patch =>
              setEditingWheelDraft(prev => ({
                ...(prev || source),
                ...patch,
              }))
            }
          />

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className={BTN.danger}
              onClick={() => {
                if (!editingWheelId) return;
                deleteWheel(editingWheelId);
              }}
            >
              Delete wheel
            </button>
            <button
              type="button"
              className={BTN.ghost}
              onClick={closeEditWheelModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className={BTN.primary}
              disabled={saveDisabled}
              onClick={() => {
                if (!editingWheelId || !editingWheelDraft) return;
                updateWheel(editingWheelId, editingWheelDraft as Partial<Wheel>);
                closeEditWheelModal();
              }}
            >
              Save changes
            </button>
          </div>
        </>
      );
    })()}
  </ModalShell>
)}
{isAddWheelModalVisible && (
  <ModalShell
    title="Add wheel"
    subtitle="Enter wheel details. Saved wheels will appear in the list below."
    onClose={closeAddWheelModal}
    closing={isAddWheelModalClosing}
    overlayStyle={modalOverlayStyle}
    dialogStyle={getModalDialogStyle({ liftByKeyboard: true })}
  >
    <WheelFormFields
      value={newWheelDraft}
      onChange={patch => setNewWheelDraft(prev => ({ ...prev, ...patch }))}
      autoFocusName
    />

    <div className="mt-4 flex justify-end gap-2">
      <button
        type="button"
        className={BTN.ghost}
        onClick={closeAddWheelModal}
      >
        Cancel
      </button>

      <button
        type="button"
        className={BTN.primary}
        disabled={isAddWheelSaveDisabled}
        onClick={handleSaveNewWheel}
      >
        Save wheel
      </button>
    </div>
  </ModalShell>
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
                { value: 'glossary', label: 'Glossary' },
              ]}
              onChange={val => setSettingsView(val as typeof settingsView)}
              widthClass="w-52"
              menuWidthClass="w-56"
            />
          </div>

          {/* Machine constants view */}
          {settingsView === 'machine' && (
            <section className="border u-border rounded-lg p-3 u-surface flex flex-col gap-2 max-w-xl motion-panel">
              <h2 className="text-sm font-semibold u-text panel-header">Machine constants</h2>
              <p className="text-xs u-text-muted mb-2">
                Rear and front base geometry for the active machine. Calibration will update these
                values; you can also tweak them manually.
              </p>
              {(() => {
                const rearSnap = calibSnapshots.find(s => s.id === calibAppliedIds.rear) || null;
                const frontSnap = calibSnapshots.find(s => s.id === calibAppliedIds.front) || null;
                                const sortByDateDesc = (list: CalibrationSnapshot[]) =>
                  [...list].sort((a, b) => {
                    const da = Date.parse(a.createdAt || '') || 0;
                    const db = Date.parse(b.createdAt || '') || 0;
                    return db - da;
                  });
                const formatOption = (snap: CalibrationSnapshot, fallbackLabel: string) => {
                  const label =
                    snap.name?.trim() ||
                    snap.createdAt?.slice(0, 10) ||
                    fallbackLabel ||
                    'Calibration';
                  const resid = Number.isFinite(snap.diagnostics?.maxAbsResidualMm)
                    ? `, ${RESIDUAL_SYMBOL} ${snap.diagnostics.maxAbsResidualMm.toFixed(3)} mm`
                    : '';
                  return {
                    value: snap.id,
                    label: `${(snap.baseTag || fallbackLabel)
                      .toString()
                      .replace(/^\w/, c => c.toUpperCase())} - ${label} (${snap.count} pts${resid})`,
                  };
                };
                const rearOptions = [
                  { value: '', label: 'Manual input' },
                  ...sortByDateDesc(calibSnapshots.filter(s => s.base === 'rear')).map(s =>
                    formatOption(s, 'Rear')
                  ),
                ];
                const frontOptions = [
                  { value: '', label: 'Manual input' },
                  ...sortByDateDesc(calibSnapshots.filter(s => s.base === 'front')).map(s =>
                    formatOption(s, 'Front')
                  ),
                ];
                const rearDisplay = rearSnap ? { hc: rearSnap.hc, o: rearSnap.o } : constants.rear;
                const frontDisplay = frontSnap
                  ? { hc: frontSnap.hc, o: frontSnap.o }
                  : constants.front;
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <BaseCard
                      title="Rear base"
                      snap={rearSnap}
                      options={rearOptions}
                      appliedId={calibAppliedIds.rear}
                      display={rearDisplay}
                      constantsInputMode={constantsInputMode}
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
                      constantsInputMode={constantsInputMode}
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
              calibName={calibName}
              setCalibName={setCalibName}
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
          {settingsView === 'glossary' && <GlossaryPage />}
          {settingsView === 'import' && (
            <ImportExportPanel
              exportText={exportText}
              onImportText={handleImportText}
              exportSections={exportSections}
              onToggleExportSection={key =>
                setExportSections(prev => ({ ...prev, [key]: !prev[key] as boolean }))
              }
              importSections={importSections}
              importModes={importModes}
              onToggleImportSection={key =>
                setImportSections(prev => ({ ...prev, [key]: !prev[key] as boolean }))
              }
              onChangeImportMode={(key, mode) =>
                setImportModes(prev => ({ ...prev, [key]: mode }))
              }
            />
          )}
        </>
      )}

      {/* ====== PRESET MANAGER MODAL (shell) ====== */}
      {isPresetManagerVisible && (
        <ModalShell
          title="Manage presets"
          subtitle="Rename, load, or delete saved progressions."
          onClose={() => setIsPresetManagerOpen(false)}
          closing={isPresetManagerClosing}
          overlayStyle={modalOverlayStyle}
          dialogStyle={getModalDialogStyle()}
        >
          <div className="max-h-64 overflow-y-auto text-xs">
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
                      className="flex items-start justify-between gap-2 rounded border u-border u-surface px-2 py-2"
                    >
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <input
                              type="text"
                              className="w-full rounded border u-border u-surface px-2 py-1 text-xs u-text placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
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
                            <span className="u-text">{preset.name}</span>
                          )}
                          {selectedPresetId === preset.id && (
                            <span className="text-[0.65rem] text-accent-soft border border-accent rounded px-1 py-[2px]">
                              active
                            </span>
                          )}
                        </div>
                        <div className="text-[0.7rem] u-text-muted">
                          {preset.steps.length} step{preset.steps.length === 1 ? '' : 's'}
                        </div>
                        {isEditing && renameConflicts && (
                          <div className="text-[0.65rem] text-warning">
                            A preset with that name already exists.
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 self-start">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className={BTN.primary}
                              disabled={renameDisabled}
                              onClick={handleCommitPresetRename}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className={BTN.ghost}
                              onClick={handleCancelPresetRename}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1 justify-end">
                            <button
                              type="button"
                              className={BTN.base}
                              onClick={() => {
                                handleLoadPreset(preset.id);
                                setIsPresetManagerOpen(false);
                              }}
                            >
                              Load
                            </button>
                            <button
                              type="button"
                              className={BTN.base}
                              onClick={() => handleBeginPresetRename(preset)}
                            >
                              Rename
                            </button>
                            <button
                              type="button"
                              className={BTN.danger}
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
        </ModalShell>
      )}

      {/* ====== SAVE PRESET MODAL ====== */}
{isPresetDialogVisible && (
        <ModalShell
          title="Save preset"
          subtitle="Enter a name for this progression."
          onClose={() => {
            setIsPresetDialogOpen(false);
            setPresetNameDraft('');
          }}
          closing={isPresetDialogClosing}
          overlayStyle={modalOverlayStyle}
          dialogStyle={getModalDialogStyle()}
        >
          <h3 className="sr-only">Save preset</h3>
          <p className="sr-only">Enter a name for this progression.</p>

          <div className="mt-3">
              <input
                type="text"
                className="w-full rounded border u-border u-surface px-2 py-1 text-xs u-text placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
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
                className={BTN_MUTED}
                onClick={() => {
                  setIsPresetDialogOpen(false);
                  setPresetNameDraft('');
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className={BTN.primary}
                onClick={handleSavePreset}
                disabled={!presetNameTrimmed || sessionSteps.length === 0 || isPresetNameDuplicate}
              >
                Save
              </button>
            </div>
        </ModalShell>
      )}

      {/* ====== STEP NOTES MODAL ====== */}
      {isStepNotesVisible && (
        <ModalShell
          title="Step notes"
          subtitle="Notes for this step."
          onClose={() => setIsStepNotesOpen(false)}
          closing={isStepNotesClosing}
          overlayStyle={modalOverlayStyle}
          dialogStyle={getModalDialogStyle()}
        >
          <div className="mt-1">
            <textarea
              className="w-full min-h-[6rem] rounded border u-border u-surface px-2 py-1 text-xs u-text"
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
              className={BTN_MUTED}
              onClick={() => setIsStepNotesOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={BTN.primary}
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
        </ModalShell>
      )}
      
    </div>
  );
}

export default App;






