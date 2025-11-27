import * as React from 'react';
import type{
  BaseSide,
  CalibrationDiagnostics,
  CalibrationMeasurement,
  GlobalState,
  MachineConstants,
  SessionPreset,
  SessionStep,
  Wheel,
} from '../types/core';
import { _load, _save } from './storage';
import { DEFAULT_CONSTANTS, DEFAULT_GLOBAL, DEFAULT_WHEELS } from './defaults';

export type AppState = {
  global: GlobalState;
  setGlobal: React.Dispatch<React.SetStateAction<GlobalState>>;
  constants: MachineConstants;
  setConstants: React.Dispatch<React.SetStateAction<MachineConstants>>;
  wheels: Wheel[];
  setWheels: React.Dispatch<React.SetStateAction<Wheel[]>>;
  sessionSteps: SessionStep[];
  setSessionSteps: React.Dispatch<React.SetStateAction<SessionStep[]>>;
  sessionPresets: SessionPreset[];
  setSessionPresets: React.Dispatch<React.SetStateAction<SessionPreset[]>>;
  selectedPresetId: string;
  setSelectedPresetId: React.Dispatch<React.SetStateAction<string>>;
  isPresetDialogOpen: boolean;
  setIsPresetDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  presetNameDraft: string;
  setPresetNameDraft: React.Dispatch<React.SetStateAction<string>>;
  isPresetManagerOpen: boolean;
  setIsPresetManagerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  view: 'calculator' | 'wheels' | 'settings';
  setView: React.Dispatch<React.SetStateAction<'calculator' | 'wheels' | 'settings'>>;
  settingsView: 'machine' | 'calibration';
  setSettingsView: React.Dispatch<React.SetStateAction<'machine' | 'calibration'>>;
  isWheelConfigOpen: boolean;
  setIsWheelConfigOpen: React.Dispatch<React.SetStateAction<boolean>>;
  focusWheelIdRef: React.MutableRefObject<string | null>;
  progressionEndRef: React.MutableRefObject<HTMLDivElement | null>;
  lastLoadedPresetIdRef: React.MutableRefObject<string | null>;
  lastLoadedStepsRef: React.MutableRefObject<string | null>;
  calibBase: BaseSide;
  setCalibBase: React.Dispatch<React.SetStateAction<BaseSide>>;
  calibDa: number;
  setCalibDa: React.Dispatch<React.SetStateAction<number>>;
  calibDs: number;
  setCalibDs: React.Dispatch<React.SetStateAction<number>>;
  calibCount: number;
  setCalibCount: React.Dispatch<React.SetStateAction<number>>;
  calibRows: CalibrationMeasurement[];
  setCalibRows: React.Dispatch<React.SetStateAction<CalibrationMeasurement[]>>;
  calibResult: {
    hc: number;
    o: number;
    diagnostics: CalibrationDiagnostics;
    angleErrorDeg: number | null;
  } | null;
  setCalibResult: React.Dispatch<
    React.SetStateAction<{
      hc: number;
      o: number;
      diagnostics: CalibrationDiagnostics;
      angleErrorDeg: number | null;
    } | null>
  >;
  calibError: string | null;
  setCalibError: React.Dispatch<React.SetStateAction<string | null>>;
  ensureCalibRowsLength: (count: number) => void;
};

export function useAppState(): AppState {
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

  const [view, setView] = React.useState<'calculator' | 'wheels' | 'settings'>('calculator');
  const [settingsView, setSettingsView] = React.useState<'machine' | 'calibration'>('machine');

  const [isWheelConfigOpen, setIsWheelConfigOpen] = React.useState(false);

  // Track which wheel should auto-focus in the Wheel Manager
  const focusWheelIdRef = React.useRef<string | null>(null);

  // Scroll target for newly added progression steps
  const progressionEndRef = React.useRef<HTMLDivElement | null>(null);

  // Track last loaded preset and its steps
  const lastLoadedPresetIdRef = React.useRef<string | null>(null);
  const lastLoadedStepsRef = React.useRef<string | null>(null);

  // Safety net: de-duplicate wheels by id (keep first, drop duplicates)
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
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const ensureCalibRowsLength = (count: number) => {
    setCalibRows(prev => {
      const next = [...prev];
      while (next.length < count) {
        next.push({ hn: '', CAo: '' });
      }
      return next;
    });
  };

  return {
    global,
    setGlobal,
    constants,
    setConstants,
    wheels,
    setWheels,
    sessionSteps,
    setSessionSteps,
    sessionPresets,
    setSessionPresets,
    selectedPresetId,
    setSelectedPresetId,
    isPresetDialogOpen,
    setIsPresetDialogOpen,
    presetNameDraft,
    setPresetNameDraft,
    isPresetManagerOpen,
    setIsPresetManagerOpen,
    view,
    setView,
    settingsView,
    setSettingsView,
    isWheelConfigOpen,
    setIsWheelConfigOpen,
    focusWheelIdRef,
    progressionEndRef,
    lastLoadedPresetIdRef,
    lastLoadedStepsRef,
    calibBase,
    setCalibBase,
    calibDa,
    setCalibDa,
    calibDs,
    setCalibDs,
    calibCount,
    setCalibCount,
    calibRows,
    setCalibRows,
    calibResult,
    setCalibResult,
    calibError,
    setCalibError,
    ensureCalibRowsLength,
  };
}
