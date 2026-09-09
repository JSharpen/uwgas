import type {
  AppPersistedState,
  CalibrationSnapshot,
  GlobalState,
  MachineConstants,
  MachineConfig,
  SessionPreset,
  SessionStep,
  Wheel,
  JigConfig,
  UsbConfig,
} from '../types/core';
import { DEFAULT_CONSTANTS, DEFAULT_GLOBAL, DEFAULT_WHEELS, DEFAULT_JIGS, DEFAULT_USBS } from './defaults';

export const PERSIST_VERSION = 6;

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

// Helper to find or create hardware config
function ensureHardwareConfig<T extends { id: string; name: string; }>(
  items: T[],
  value: number,
  prop: keyof T,
  prefix: string,
  namePrefix: string
): { id: string, items: T[] } {
  const existing = items.find(item => Number(item[prop]) === value);
  if (existing) {
    return { id: existing.id, items };
  }
  const id = `${prefix}-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const newItem = {
    id,
    name: `${namePrefix} (${value}mm)`,
    [prop]: value
  } as unknown as T;
  
  return { id, items: [...items, newItem] };
}

export function readPersistedState(): AppPersistedState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadedGlobal = _load<any>('t_global', DEFAULT_GLOBAL);
  const legacyConstants = _load<MachineConstants>('t_constants', DEFAULT_CONSTANTS);
  
  let machines = _load<MachineConfig[]>('t_machines', []);
  let defaultMachineId = _load<string | undefined>('t_defaultMachineId', undefined);
  let jigs = _load<JigConfig[]>('t_jigs', DEFAULT_JIGS);
  let usbs = _load<UsbConfig[]>('t_usbs', DEFAULT_USBS);
  usbs = usbs.map(u => {
    if ((u.id === 'usb-tormek' || u.id === 'usb-fvb') && u.threadPitch === undefined) {
      return { ...u, threadPitch: 1.5, microAdjustMarks: 6 };
    }
    return u;
  });
  let sessionSteps = _load<SessionStep[]>('t_sessionSteps', []);

  if (!machines || machines.length === 0) {
    const defaultMachine: MachineConfig = {
      id: 'default-machine',
      name: 'Primary Grinder',
      constants: legacyConstants,
      isDefault: true,
    };
    machines = [defaultMachine];
    defaultMachineId = defaultMachine.id;
  }

  // --- MIGRATION to V5: Raw Dj and usbDiameter -> Named Jigs/USBs ---
  if (loadedGlobal.usbDiameter !== undefined && !loadedGlobal.activeUsbId) {
    const res = ensureHardwareConfig(usbs, loadedGlobal.usbDiameter, 'Ds', 'usb', 'Custom USB');
    usbs = res.items;
    loadedGlobal.activeUsbId = res.id;
  }
  
  if (loadedGlobal.jig && loadedGlobal.jig.Dj !== undefined && !loadedGlobal.activeJigId) {
    const res = ensureHardwareConfig(jigs, loadedGlobal.jig.Dj, 'Dj', 'jig', 'Custom Jig');
    jigs = res.items;
    loadedGlobal.activeJigId = res.id;
  }

  // Ensure default IDs exist
  if (!loadedGlobal.activeUsbId) loadedGlobal.activeUsbId = DEFAULT_USBS[0].id;
  if (!loadedGlobal.activeJigId) loadedGlobal.activeJigId = DEFAULT_JIGS[0].id;

  // Migrate session steps (usbOverride -> usbId)
  sessionSteps = sessionSteps.map(step => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyStep = step as any;
    if (anyStep.usbOverride !== undefined && !anyStep.usbId) {
      const res = ensureHardwareConfig(usbs, anyStep.usbOverride, 'Ds', 'usb', 'Custom USB');
      usbs = res.items;
      anyStep.usbId = res.id;
      delete anyStep.usbOverride;
    }
    return anyStep as SessionStep;
  });
  // ----------------------------------------------------------------

  return {
    version: PERSIST_VERSION,
    global: { ...DEFAULT_GLOBAL, ...loadedGlobal },
    machines,
    defaultMachineId,
    jigs,
    usbs,
    constants: legacyConstants, // Keep for legacy writes
    wheels: _load<Wheel[]>('t_wheels', DEFAULT_WHEELS),
    sessionSteps,
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
  if (state.machines) _save('t_machines', state.machines);
  if (state.defaultMachineId) _save('t_defaultMachineId', state.defaultMachineId);
  if (state.jigs) _save('t_jigs', state.jigs);
  if (state.usbs) _save('t_usbs', state.usbs);
  if (state.constants) _save('t_constants', state.constants); // Legacy
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalRaw = parsedObj.global as any;
    const legacyConstantsRaw = parsedObj.constants;
    const machinesRaw = parsedObj.machines;
    const defaultMachineIdRaw = parsedObj.defaultMachineId;
    const jigsRaw = parsedObj.jigs;
    const usbsRaw = parsedObj.usbs;
    const wheelsRaw = parsedObj.wheels;
    const sessionStepsRaw = parsedObj.sessionSteps;
    const sessionPresetsRaw = parsedObj.sessionPresets;
    const heightModeRaw = parsedObj.heightMode;
    const snapshotsRaw = parsedObj.calibSnapshots;
    const appliedIdsRaw = parsedObj.calibAppliedIds;

    let machines = Array.isArray(machinesRaw) ? (machinesRaw as MachineConfig[]) : [];
    let defaultMachineId = typeof defaultMachineIdRaw === 'string' ? defaultMachineIdRaw : undefined;
    
    let jigs = Array.isArray(jigsRaw) ? (jigsRaw as JigConfig[]) : DEFAULT_JIGS;
    let usbs = Array.isArray(usbsRaw) ? (usbsRaw as UsbConfig[]) : DEFAULT_USBS;
    usbs = usbs.map(u => {
      if ((u.id === 'usb-tormek' || u.id === 'usb-fvb') && u.threadPitch === undefined) {
        return { ...u, threadPitch: 1.5, microAdjustMarks: 6 };
      }
      return u;
    });
    
    jigs = jigs.map(j => {
      const def = DEFAULT_JIGS.find(d => d.id === j.id);
      if (def) {
        return { ...def, ...j, length: j.length ?? def.length, isAdjustableLength: j.isAdjustableLength ?? def.isAdjustableLength, threadPitch: j.threadPitch ?? def.threadPitch };
      }
      return j;
    });
    
    let sessionSteps = Array.isArray(sessionStepsRaw) ? (sessionStepsRaw as SessionStep[]) : [];


    const constants = isObject(legacyConstantsRaw) ? (legacyConstantsRaw as MachineConstants) : DEFAULT_CONSTANTS;

    if (machines.length === 0) {
      const defaultMachine: MachineConfig = {
        id: 'default-machine',
        name: 'Primary Grinder',
        constants: constants,
        isDefault: true,
      };
      machines = [defaultMachine];
      defaultMachineId = defaultMachine.id;
    }

    // Migration in parse
    if (globalRaw && globalRaw.usbDiameter !== undefined && !globalRaw.activeUsbId) {
      const res = ensureHardwareConfig(usbs, globalRaw.usbDiameter, 'Ds', 'usb', 'Custom USB');
      usbs = res.items;
      globalRaw.activeUsbId = res.id;
    }
    if (globalRaw && globalRaw.jig && globalRaw.jig.Dj !== undefined && !globalRaw.activeJigId) {
      const res = ensureHardwareConfig(jigs, globalRaw.jig.Dj, 'Dj', 'jig', 'Custom Jig');
      jigs = res.items;
      globalRaw.activeJigId = res.id;
    }
    
    if (globalRaw && !globalRaw.activeUsbId) globalRaw.activeUsbId = DEFAULT_USBS[0].id;
    if (globalRaw && !globalRaw.activeJigId) globalRaw.activeJigId = DEFAULT_JIGS[0].id;

    sessionSteps = sessionSteps.map(step => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyStep = step as any;
      if (anyStep.usbOverride !== undefined && !anyStep.usbId) {
        const res = ensureHardwareConfig(usbs, anyStep.usbOverride, 'Ds', 'usb', 'Custom USB');
        usbs = res.items;
        anyStep.usbId = res.id;
        delete anyStep.usbOverride;
      }
      return anyStep as SessionStep;
    });

    const result: AppPersistedState = {
      version: PERSIST_VERSION,
      global: isObject(globalRaw)
        ? { ...DEFAULT_GLOBAL, ...(globalRaw as Partial<GlobalState>) }
        : DEFAULT_GLOBAL,
      machines,
      defaultMachineId,
      jigs,
      usbs,
      constants,
      wheels: Array.isArray(wheelsRaw) ? (wheelsRaw as Wheel[]) : [],
      sessionSteps,
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
    if (!result.wheels.length) result.wheels = DEFAULT_WHEELS;
    
    return result;
  } catch {
    return null;
  }
}

export function resetToDefaults(): AppPersistedState {
  const defaultMachine: MachineConfig = {
    id: 'default-machine',
    name: 'Primary Grinder',
    constants: DEFAULT_CONSTANTS,
    isDefault: true,
  };
  const defaults: AppPersistedState = {
    version: PERSIST_VERSION,
    global: DEFAULT_GLOBAL,
    machines: [defaultMachine],
    defaultMachineId: defaultMachine.id,
    jigs: DEFAULT_JIGS,
    usbs: DEFAULT_USBS,
    constants: DEFAULT_CONSTANTS,
    wheels: DEFAULT_WHEELS,
    sessionSteps: [],
    sessionPresets: [],
  };
  writePersistedState(defaults);
  return defaults;
}
