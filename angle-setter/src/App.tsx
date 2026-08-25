// ==============================================================================
// UWGAS (Universal Wet Grinder Angle Setter)
// Precision Tormek / Wet Grinder USB Height Calculator
// ==============================================================================

import * as React from 'react';
import { IconKebab } from './icons';
import CalibrationWizard from './components/CalibrationWizard';
import ImportExportPanel from './components/ImportExportPanel';
import GlossaryPage from './components/GlossaryPage';
import ProgressionView from './components/ProgressionView';
import ThemeLab from './components/ThemeLab';
import MiniSelect from './components/MiniSelect';
import GlobalSetupCard from './components/calculator/GlobalSetupCard';
import ProgressionEditor from './components/calculator/ProgressionEditor';
import WheelManagerView from './components/wheels/WheelManagerView';
import PresetManagerModal from './components/presets/PresetManagerModal';
import SavePresetDialog from './components/presets/SavePresetDialog';
import MachineConstantsCard from './components/settings/MachineConstantsCard';
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
import {
  isObject,
  normalizeCalibrationSnapshots,
  normalizeSessionStep,
  normalizeWheel,
} from './utils/normalizers';
import { PERSIST_VERSION, _load, _save } from './state/storage';
import { DEFAULT_CONSTANTS, DEFAULT_GLOBAL, DEFAULT_WHEELS } from './state/defaults';
import { computeWheelResults, computeTonHeights } from './math/tormek';
import { BTN } from './ui/buttons';
import { APP_VERSION, APP_VERSION_DISPLAY } from './version';

type PartialConstants = {
  rear?: Partial<MachineConstants['rear']>;
  front?: Partial<MachineConstants['front']>;
};

type RawAppliedIds = { rear?: string; front?: string };

type ImportSections = {
  global: boolean;
  constants: boolean;
  wheels: boolean;
  sessionSteps: boolean;
  sessionPresets: boolean;
  heightMode: boolean;
  calibSnapshots: boolean;
  calibAppliedIds: boolean;
};

type ImportModes = {
  [K in keyof ImportSections]: 'merge' | 'overwrite';
};

export default function App() {
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

  const [heightMode, setHeightMode] = React.useState<'hn' | 'hr'>(() => {
    const val = _load<'hn' | 'hr'>('t_heightMode', 'hn');
    return val === 'hr' ? 'hr' : 'hn';
  });

  // ======= Navigation & UI States =======
  const [view, setView] = React.useState<'calculator' | 'wheels' | 'settings'>('calculator');
  const [settingsView, setSettingsView] = React.useState<
    'machine' | 'calibration' | 'import' | 'glossary' | 'themelab'
  >('machine');

  const showDevHeader = import.meta.env.DEV;
  const [isSetupPanelOpen, setIsSetupPanelOpen] = React.useState(false);
  const [isWheelConfigOpen, setIsWheelConfigOpen] = React.useState(false);

  // Preset dialogs state
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>('');
  const [isPresetDialogOpen, setIsPresetDialogOpen] = React.useState(false);
  const [isPresetDialogClosing, setIsPresetDialogClosing] = React.useState(false);
  const [presetNameDraft, setPresetNameDraft] = React.useState('');

  const [isPresetManagerOpen, setIsPresetManagerOpen] = React.useState(false);
  const [isPresetManagerClosing, setIsPresetManagerClosing] = React.useState(false);

  // Progression kebab menu
  const [isProgressionMenuVisible, setIsProgressionMenuVisible] = React.useState(false);
  const [isProgressionMenuClosing, setIsProgressionMenuClosing] = React.useState(false);
  const progressionMenuRef = React.useRef<HTMLDivElement | null>(null);

  // Import / Export sections
  const [exportSections, setExportSections] = React.useState<ImportSections>({
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

  // Modal layout styles
  const { overlayStyle: modalOverlayStyle, getDialogStyle: getModalDialogStyle } =
    useModalLayout();

  // Calibration state
  const [calibBase, setCalibBase] = React.useState<BaseSide | ''>('');
  const [calibName, setCalibName] = React.useState<string>('');
  const [calibDa, setCalibDa] = React.useState<number>(12);
  const [calibDs, setCalibDs] = React.useState<number>(DEFAULT_GLOBAL.usbDiameter);
  const [calibCount, setCalibCount] = React.useState<number>(4);
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

  // Persistence effects
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

  // ======= Calculations & Machine Configuration =======
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

  const activeMachine: MachineConfig = React.useMemo(
    () => ({
      id: 'machine-1',
      name: 'Default machine',
      constants: effectiveConstants,
      usbDiameter: global.usbDiameter,
      jigDiameter: global.jig.Dj,
    }),
    [effectiveConstants, global.jig.Dj, global.usbDiameter]
  );

  const targetAngleSymbol = 'θ';
  const effectiveAngleSymbol = 'γ';
  const progressionCardMinHeight = 130;
  const progressionBodyPaddingX = 'px-3';
  const progressionBodyPaddingY = 'py-2';
  const progressionBodyGap = 'gap-2';

  const wheelResults = React.useMemo(
    () => computeWheelResults(wheels, sessionSteps, global, activeMachine),
    [activeMachine, global, sessionSteps, wheels]
  );

  const appliedCalibrationByBase = React.useMemo(
    () => ({
      rear: calibSnapshots.find(s => s.id === calibAppliedIds.rear) || null,
      front: calibSnapshots.find(s => s.id === calibAppliedIds.front) || null,
    }),
    [calibAppliedIds.front, calibAppliedIds.rear, calibSnapshots]
  );

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

  // ======= Step & Progression Handlers =======
  const handleAddStep = () => {
    if (wheels.length === 0) return;
    const firstWheel = wheels[0];
    const newStep: SessionStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      wheelId: firstWheel.id,
      base: firstWheel.isHoning ? 'front' : firstWheel.baseForHn,
      angleOffset: 0,
      notes: '',
    };
    setSessionSteps(prev => [...prev, newStep]);
  };

  const handleLoadDefaultProgression = React.useCallback(() => {
    const grindWheel = wheels.find(w => !w.isHoning) || wheels[0];
    const honeWheel = wheels.find(w => w.isHoning) || wheels[1] || wheels[0];

    const steps: SessionStep[] = [];
    if (grindWheel) {
      steps.push({
        id: `step-${Date.now()}-grind`,
        wheelId: grindWheel.id,
        base: 'rear',
        angleOffset: 0,
        notes: 'Primary bevel shaping / sharpening',
      });
    }
    if (honeWheel && honeWheel.id !== grindWheel?.id) {
      steps.push({
        id: `step-${Date.now()}-hone`,
        wheelId: honeWheel.id,
        base: 'front',
        angleOffset: 0.2, // standard +0.2° honing bump
        notes: 'Honing & deburring (+0.2° micro-bevel)',
      });
    }

    setSessionSteps(steps);
  }, [wheels]);

  const handleUpdateStep = (id: string, patch: Partial<SessionStep>) => {
    setSessionSteps(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  const handleDeleteStep = (id: string) => {
    setSessionSteps(prev => prev.filter(s => s.id !== id));
  };

  const handleMoveStep = (index: number, delta: -1 | 1) => {
    setSessionSteps(prev => {
      const next = [...prev];
      const newIndex = index + delta;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(newIndex, 0, item);
      return next;
    });
  };

  // ======= Wheel Manager Handlers =======
  const handleAddWheel = (draft: Omit<Wheel, 'id'>) => {
    const id = `wheel-${Date.now()}`;
    const newWheel: Wheel = {
      id,
      name: draft.name.trim(),
      D: Math.round(draft.D * 100) / 100,
      DText: draft.DText?.trim() ?? '',
      angleOffset: draft.angleOffset ?? 0,
      baseForHn: draft.isHoning ? 'front' : draft.baseForHn,
      isHoning: draft.isHoning,
      grit: draft.grit?.trim() ?? '',
    };
    setWheels(prev => [...prev, newWheel]);
  };

  const handleUpdateWheel = (id: string, patch: Partial<Wheel>) => {
    setWheels(prev => prev.map(w => (w.id === id ? { ...w, ...patch } : w)));
  };

  const handleDeleteWheel = (id: string) => {
    const target = wheels.find(w => w.id === id);
    if (!target) return;
    if (!window.confirm(`Delete wheel "${target.name}"?`)) return;

    setWheels(prev => prev.filter(w => w.id !== id));
    setSessionSteps(prev => prev.filter(step => step.wheelId !== id));
  };

  // ======= Preset Handlers =======
  const handleLoadPreset = (presetId: string) => {
    const preset = sessionPresets.find(p => p.id === presetId);
    if (!preset) return;

    const resolvedSteps: SessionStep[] = [];
    for (const ref of preset.steps) {
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

    if (resolvedSteps.length > 0) {
      setSessionSteps(resolvedSteps);
      setSelectedPresetId(preset.id);
    }
  };

  const handleSavePreset = () => {
    const name = presetNameDraft.trim();
    if (!name || sessionSteps.length === 0) return;

    if (sessionPresets.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      window.alert('A preset with that name already exists. Choose a different name.');
      return;
    }

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
      createdAt: new Date().toISOString(),
      version: 1,
      steps: presetSteps,
    };

    setSessionPresets(prev => [...prev, newPreset]);
    setSelectedPresetId(newPreset.id);
    setIsPresetDialogOpen(false);
    setPresetNameDraft('');
  };

  const handleDeletePreset = (id: string) => {
    const preset = sessionPresets.find(p => p.id === id);
    if (!preset) return;
    if (!window.confirm(`Delete preset "${preset.name}"?`)) return;

    setSessionPresets(prev => prev.filter(p => p.id !== id));
    if (selectedPresetId === id) setSelectedPresetId('');
  };

  const handleRenamePreset = (id: string, newName: string) => {
    setSessionPresets(prev =>
      prev.map(p => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  // ======= Import / Export =======
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
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return { error: 'Import failed: invalid JSON.' };
      }
      if (!isObject(parsed)) return { error: 'Import failed: expected a JSON object.' };
      const parsedObj = parsed as Record<string, unknown>;

      const nextGlobal = isObject(parsedObj.global)
        ? { ...DEFAULT_GLOBAL, ...(parsedObj.global as Partial<GlobalState>) }
        : DEFAULT_GLOBAL;

      const parsedConstants = isObject(parsedObj.constants)
        ? (parsedObj.constants as PartialConstants)
        : null;

      const nextConstants: MachineConstants = parsedConstants
        ? {
            rear: {
              hc: _nz(parsedConstants.rear?.hc, DEFAULT_CONSTANTS.rear.hc),
              o: _nz(parsedConstants.rear?.o, DEFAULT_CONSTANTS.rear.o),
            },
            front: {
              hc: _nz(parsedConstants.front?.hc, DEFAULT_CONSTANTS.front.hc),
              o: _nz(parsedConstants.front?.o, DEFAULT_CONSTANTS.front.o),
            },
          }
        : DEFAULT_CONSTANTS;

      const nextWheels = Array.isArray(parsedObj.wheels)
        ? parsedObj.wheels.map(normalizeWheel)
        : [];

      const nextSteps = Array.isArray(parsedObj.sessionSteps)
        ? parsedObj.sessionSteps.map(normalizeSessionStep)
        : [];

      const nextPresets = Array.isArray(parsedObj.sessionPresets)
        ? (parsedObj.sessionPresets as SessionPreset[])
        : [];

      const nextHeightMode = parsedObj.heightMode === 'hr' ? 'hr' : 'hn';
      const nextSnapshots = normalizeCalibrationSnapshots(
        Array.isArray(parsedObj.calibSnapshots) ? parsedObj.calibSnapshots : []
      );

      const appliedRaw = isObject(parsedObj.calibAppliedIds)
        ? (parsedObj.calibAppliedIds as RawAppliedIds)
        : null;
      const nextApplied = {
        rear: typeof appliedRaw?.rear === 'string' ? appliedRaw.rear : '',
        front: typeof appliedRaw?.front === 'string' ? appliedRaw.front : '',
      };

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
              hc: _nz(nextConstants.rear.hc, prev.rear.hc),
              o: _nz(nextConstants.rear.o, prev.rear.o),
            },
            front: {
              hc: _nz(nextConstants.front.hc, prev.front.hc),
              o: _nz(nextConstants.front.o, prev.front.o),
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
          const merged = mergeMapById(sessionSteps, nextSteps);
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
        setHeightMode(nextHeightMode);
        appliedSummary.push('heightMode: updated');
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
      return { summary };
    },
    [
      calibAppliedIds.front,
      calibAppliedIds.rear,
      calibSnapshots,
      importModes,
      importSections,
      sessionPresets,
      sessionSteps,
      wheels,
    ]
  );

  return (
    <div className="min-h-dvh u-bg p-3 sm:p-4 flex flex-col gap-4 max-w-4xl mx-auto">
      {view === 'settings' && (
        <div className="app-watermark" aria-label={`App version ${APP_VERSION}`}>
          v{APP_VERSION_DISPLAY}
        </div>
      )}
      {showDevHeader && <h1 className="text-lg font-semibold u-text">UWGAS Dev build</h1>}

      {/* Top Navigation Tabs */}
      <div className="flex gap-2 text-sm mb-1">
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

      {/* ================= CALCULATOR VIEW ================= */}
      {view === 'calculator' && (
        <div className="flex flex-col gap-4">
          {/* Global Setup Card */}
          <GlobalSetupCard
            global={global}
            setGlobal={setGlobal}
            isSetupPanelOpen={isSetupPanelOpen}
            setIsSetupPanelOpen={setIsSetupPanelOpen}
            targetAngleSymbol={targetAngleSymbol}
          />

          {/* Progression Section */}
          <section className="panel-card panel-card--allow-overflow motion-panel flex flex-col gap-0">
            <div
              className="panel-card__header grid items-center gap-2"
              style={{ gridTemplateColumns: 'auto minmax(0, 1fr) auto' }}
            >
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold u-text panel-header">Progression</h2>
                {/* Direct Height Mode Toggle Pill */}
                <button
                  type="button"
                  title={`Currently showing ${
                    heightMode === 'hn' ? 'Datum Base Height (hn)' : 'Wheel Top Height (hr)'
                  }. Click to toggle.`}
                  className="px-2 py-0.5 text-[0.7rem] rounded-full border border-neutral-700 bg-neutral-900 text-accent font-mono font-medium hover:border-accent"
                  onClick={() => setHeightMode(m => (m === 'hn' ? 'hr' : 'hn'))}
                >
                  {heightMode === 'hn' ? 'Mode: hn (base)' : 'Mode: hr (wheel)'}
                </button>
              </div>

              {/* Presets dropdown */}
              <div className="w-full min-w-0" style={{ maxWidth: 'min(28rem, calc(100% - 6rem))' }}>
                <MiniSelect
                  value={selectedPresetId || ''}
                  options={[
                    { value: '', label: 'Select preset…' },
                    ...sessionPresets.map(p => ({
                      value: p.id,
                      label: p.name,
                      meta: `${p.steps.length} step${p.steps.length === 1 ? '' : 's'}`,
                    })),
                  ]}
                  onChange={id => {
                    setSelectedPresetId(id);
                    if (id) handleLoadPreset(id);
                  }}
                  align="right"
                  widthClass="w-full min-w-[7.5rem]"
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
                  renderLabel={opt => (opt ? opt.label : 'Select preset…')}
                />
              </div>

              {/* Edit / Back toggle + Kebab Menu */}
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  className={`${BTN.base} px-3 text-xs`}
                  onClick={() => setIsWheelConfigOpen(open => !open)}
                >
                  {isWheelConfigOpen ? 'Done' : 'Edit Steps'}
                </button>

                <div ref={progressionMenuRef} className="relative">
                  <button
                    type="button"
                    className={`${BTN.iconPlain} text-neutral-300`}
                    title="Progression options"
                    onClick={() => {
                      if (isProgressionMenuVisible && !isProgressionMenuClosing) {
                        setIsProgressionMenuClosing(true);
                        setTimeout(() => {
                          setIsProgressionMenuVisible(false);
                          setIsProgressionMenuClosing(false);
                        }, 160);
                      } else {
                        setIsProgressionMenuVisible(true);
                        setIsProgressionMenuClosing(false);
                      }
                    }}
                  >
                    <IconKebab className="w-5 h-5" />
                  </button>

                  {isProgressionMenuVisible && (
                    <div
                      className="absolute right-0 mt-1 w-52 rounded border u-border u-surface shadow-lg text-xs z-30 overflow-hidden"
                      style={{
                        transformOrigin: 'top right',
                        animation: `${
                          isProgressionMenuClosing
                            ? 'menuFadeSlideOut 100ms ease-in forwards'
                            : 'menuFadeSlideIn 100ms ease-out forwards'
                        }`,
                      }}
                    >
                      <button
                        type="button"
                        className="menu-item w-full px-3 py-2 text-left"
                        onClick={() => {
                          setIsPresetDialogOpen(true);
                          setIsProgressionMenuVisible(false);
                        }}
                        disabled={sessionSteps.length === 0}
                      >
                        Save as preset
                      </button>
                      <button
                        type="button"
                        className="menu-item w-full px-3 py-2 text-left"
                        onClick={() => {
                          setIsPresetManagerOpen(true);
                          setIsProgressionMenuVisible(false);
                        }}
                      >
                        Manage presets
                      </button>
                      <button
                        type="button"
                        className="menu-item w-full px-3 py-2 text-left"
                        onClick={() => {
                          handleLoadDefaultProgression();
                          setIsProgressionMenuVisible(false);
                        }}
                      >
                        Load standard progression
                      </button>
                      <button
                        type="button"
                        className="menu-item w-full px-3 py-2 text-left text-danger"
                        onClick={() => {
                          setSessionSteps([]);
                          setIsProgressionMenuVisible(false);
                        }}
                        disabled={sessionSteps.length === 0}
                      >
                        Clear progression
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="panel-card__body flex flex-col gap-3">
              <div className="mt-1">
                {isWheelConfigOpen ? (
                  <ProgressionEditor
                    sessionSteps={sessionSteps}
                    wheels={wheels}
                    onUpdateStep={handleUpdateStep}
                    onUpdateWheel={handleUpdateWheel}
                    onDeleteStep={handleDeleteStep}
                    onAddStep={handleAddStep}
                    onLoadDefaultProgression={handleLoadDefaultProgression}
                    onMoveStep={handleMoveStep}
                    targetAngleSymbol={targetAngleSymbol}
                    progressionBodyPaddingX={progressionBodyPaddingX}
                    progressionBodyPaddingY={progressionBodyPaddingY}
                    progressionBodyGap={progressionBodyGap}
                  />
                ) : sessionSteps.length === 0 ? (
                  <div className="text-xs text-neutral-400 border border-dashed u-border rounded p-4 flex flex-col gap-3 items-center text-center">
                    <p>No sharpening steps defined yet.</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={BTN.primary}
                        onClick={handleLoadDefaultProgression}
                      >
                        + Load Standard Progression
                      </button>
                      <button
                        type="button"
                        className={BTN.base}
                        onClick={() => setIsWheelConfigOpen(true)}
                      >
                        Edit Steps Manually
                      </button>
                    </div>
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
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ================= WHEEL MANAGER VIEW ================= */}
      {view === 'wheels' && (
        <WheelManagerView
          wheels={wheels}
          onAddWheel={handleAddWheel}
          onUpdateWheel={handleUpdateWheel}
          onDeleteWheel={handleDeleteWheel}
        />
      )}

      {/* ================= SETTINGS VIEW ================= */}
      {view === 'settings' && (
        <>
          <div className="flex justify-end mb-2">
            <MiniSelect
              value={settingsView}
              options={[
                { value: 'machine', label: 'Machine & constants' },
                { value: 'calibration', label: 'Calibration wizard' },
                { value: 'import', label: 'Import / export' },
                { value: 'glossary', label: 'Glossary' },
                { value: 'themelab', label: 'Theme Lab' },
              ]}
              onChange={val => setSettingsView(val as typeof settingsView)}
              widthClass="w-52"
              menuWidthClass="w-56"
            />
          </div>

          {settingsView === 'machine' && (
            <MachineConstantsCard
              constants={constants}
              setConstants={setConstants}
              calibSnapshots={calibSnapshots}
              calibAppliedIds={calibAppliedIds}
              setCalibAppliedIds={setCalibAppliedIds}
            />
          )}

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

          {settingsView === 'glossary' && <GlossaryPage />}
          {settingsView === 'themelab' && <ThemeLab />}
        </>
      )}

      {/* ================= PRESET MODALS ================= */}
      <PresetManagerModal
        isOpen={isPresetManagerOpen}
        isClosing={isPresetManagerClosing}
        onClose={() => {
          setIsPresetManagerClosing(true);
          setTimeout(() => {
            setIsPresetManagerOpen(false);
            setIsPresetManagerClosing(false);
          }, 200);
        }}
        sessionPresets={sessionPresets}
        selectedPresetId={selectedPresetId}
        onLoadPreset={handleLoadPreset}
        onDeletePreset={handleDeletePreset}
        onRenamePreset={handleRenamePreset}
        overlayStyle={modalOverlayStyle}
        dialogStyle={getModalDialogStyle()}
      />

      <SavePresetDialog
        isOpen={isPresetDialogOpen}
        isClosing={isPresetDialogClosing}
        onClose={() => {
          setIsPresetDialogClosing(true);
          setTimeout(() => {
            setIsPresetDialogOpen(false);
            setIsPresetDialogClosing(false);
            setPresetNameDraft('');
          }, 200);
        }}
        presetNameDraft={presetNameDraft}
        setPresetNameDraft={setPresetNameDraft}
        onSave={handleSavePreset}
        canSave={Boolean(presetNameDraft.trim() && sessionSteps.length > 0)}
        overlayStyle={modalOverlayStyle}
        dialogStyle={getModalDialogStyle()}
      />
    </div>
  );
}
