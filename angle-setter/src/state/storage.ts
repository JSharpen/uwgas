import type {
  AppPersistedState,
  CalibrationSnapshot,
  GlobalState,
  MachineConstants,
  SessionPreset,
  SessionStep,
  Wheel,
} from '../types/core';
import { DEFAULT_CONSTANTS, DEFAULT_GLOBAL, DEFAULT_WHEELS } from './defaults';

export const PERSIST_VERSION = 3;

export function _save(k: string, v: unknown) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(k, JSON.stringify(v));
    }
  } catch {
    // ignore
  }
}

export function _load<T>(k: string, def: T): T {
  try {
    if (typeof localStorage === 'undefined') return def;
    const raw = localStorage.getItem(k);
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return def;
  }
}

export function readPersistedState(): AppPersistedState {
  return {
    version: PERSIST_VERSION,
    global: _load<GlobalState>('t_global', DEFAULT_GLOBAL),
    constants: _load<MachineConstants>('t_constants', DEFAULT_CONSTANTS),
    wheels: _load<Wheel[]>('t_wheels', DEFAULT_WHEELS),
    sessionSteps: _load<SessionStep[]>('t_sessionSteps', []),
    sessionPresets: _load<SessionPreset[]>('t_sessionPresets', []),
    heightMode: _load<'hn' | 'hr'>('t_heightMode', 'hn'),
    calibSnapshots: _load<CalibrationSnapshot[]>('t_calibSnapshots', []),
    calibAppliedIds: _load<{ rear: string; front: string }>('t_calibAppliedIds', {
      rear: '',
      front: '',
    }),
  };
}

export function writePersistedState(state: AppPersistedState) {
  _save('t_global', state.global);
  _save('t_constants', state.constants);
  _save('t_wheels', state.wheels);
  _save('t_sessionSteps', state.sessionSteps);
  _save('t_sessionPresets', state.sessionPresets);
  if (state.heightMode) _save('t_heightMode', state.heightMode);
  if (state.calibSnapshots) _save('t_calibSnapshots', state.calibSnapshots);
  if (state.calibAppliedIds) _save('t_calibAppliedIds', state.calibAppliedIds);
}

export function exportStateToString(state: AppPersistedState): string {
  return JSON.stringify(state, null, 2);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function parsePersistedState(raw: string): AppPersistedState | null {
  try {
    const parsed = JSON.parse(raw);
    if (!isObject(parsed)) return null;

    const parsedObj = parsed as Record<string, unknown>;
    const version = Number(parsedObj.version) || 1;
    if (!isFinite(version) || version < 1) return null;

    const globalRaw = parsedObj.global;
    const constantsRaw = parsedObj.constants;
    const wheelsRaw = parsedObj.wheels;
    const sessionStepsRaw = parsedObj.sessionSteps;
    const sessionPresetsRaw = parsedObj.sessionPresets;
    const heightModeRaw = parsedObj.heightMode;
    const snapshotsRaw = parsedObj.calibSnapshots;
    const appliedIdsRaw = parsedObj.calibAppliedIds;

    const result: AppPersistedState = {
      version,
      global: isObject(globalRaw) ? (globalRaw as GlobalState) : DEFAULT_GLOBAL,
      constants: isObject(constantsRaw)
        ? (constantsRaw as MachineConstants)
        : DEFAULT_CONSTANTS,
      wheels: Array.isArray(wheelsRaw) ? (wheelsRaw as Wheel[]) : [],
      sessionSteps: Array.isArray(sessionStepsRaw)
        ? (sessionStepsRaw as SessionStep[])
        : [],
      sessionPresets: Array.isArray(sessionPresetsRaw)
        ? (sessionPresetsRaw as SessionPreset[])
        : [],
      heightMode: heightModeRaw === 'hr' ? 'hr' : 'hn',
      calibSnapshots: Array.isArray(snapshotsRaw)
        ? (snapshotsRaw as CalibrationSnapshot[])
        : [],
      calibAppliedIds: isObject(appliedIdsRaw)
        ? (appliedIdsRaw as { rear: string; front: string })
        : { rear: '', front: '' },
    };

    // Fallback defaults for missing keys
    if (!result.wheels.length) {
      result.wheels = DEFAULT_WHEELS;
    }
    return result;
  } catch {
    return null;
  }
}

export function resetToDefaults(): AppPersistedState {
  const defaults: AppPersistedState = {
    version: PERSIST_VERSION,
    global: DEFAULT_GLOBAL,
    constants: DEFAULT_CONSTANTS,
    wheels: DEFAULT_WHEELS,
    sessionSteps: [],
    sessionPresets: [],
  };
  writePersistedState(defaults);
  return defaults;
}
