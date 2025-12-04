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

export function _save(k: string, v: any) {
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

    const version = Number((parsed as any).version) || 1;
    if (!isFinite(version) || version < 1) return null;

    const result: AppPersistedState = {
      version,
      global: isObject((parsed as any).global) ? (parsed as any).global as GlobalState : DEFAULT_GLOBAL,
      constants: isObject((parsed as any).constants)
        ? (parsed as any).constants as MachineConstants
        : DEFAULT_CONSTANTS,
      wheels: Array.isArray((parsed as any).wheels) ? (parsed as any).wheels as Wheel[] : [],
      sessionSteps: Array.isArray((parsed as any).sessionSteps)
        ? (parsed as any).sessionSteps as SessionStep[]
        : [],
      sessionPresets: Array.isArray((parsed as any).sessionPresets)
        ? (parsed as any).sessionPresets as SessionPreset[]
        : [],
      heightMode: (parsed as any).heightMode === 'hr' ? 'hr' : 'hn',
      calibSnapshots: Array.isArray((parsed as any).calibSnapshots)
        ? (parsed as any).calibSnapshots as CalibrationSnapshot[]
        : [],
      calibAppliedIds: isObject((parsed as any).calibAppliedIds)
        ? (parsed as any).calibAppliedIds as { rear: string; front: string }
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
