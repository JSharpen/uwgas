import { AppPersistedStateSchema } from './schema';
import {
  DEFAULT_CONSTANTS,
  DEFAULT_GLOBAL,
  DEFAULT_JIGS,
  DEFAULT_USBS,
  DEFAULT_WHEELS,
} from './defaults';
import type {
  AppPersistedState,
  GlobalState,
  JigConfig,
  MachineConfig,
  MachineConstants,
  SessionPreset,
  SessionStep,
  UsbConfig,
  Wheel,
} from '../types/core';
import { normalizeCalibrationSnapshots, normalizeWheel } from '../utils/normalizers';

export const UNIFIED_STORAGE_KEY = 'uwgas_app_state_v1';

export const LEGACY_KEYS = [
  't_global',
  't_constants',
  't_machines',
  't_defaultMachineId',
  't_default_machine_id',
  't_jigs',
  't_default_jig_id',
  't_usbs',
  't_default_usb_id',
  't_wheels',
  't_sessionSteps',
  't_steps',
  't_sessionPresets',
  't_presets',
  't_active_preset_id',
  't_heightMode',
  't_calibSnapshots',
  't_calibAppliedIds',
] as const;

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function ensureHardwareConfig<T extends { id: string; name: string }>(
  items: T[],
  value: number,
  prop: keyof T,
  prefix: string,
  namePrefix: string
): { id: string; items: T[] } {
  const existing = items.find((item) => Number(item[prop]) === value);
  if (existing) return { id: existing.id, items };

  const id = `${prefix}-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const newItem = {
    id,
    name: `${namePrefix} (${value}mm)`,
    [prop]: value,
  } as unknown as T;

  return { id, items: [...items, newItem] };
}

export function migrateLegacyStorageIfNeeded(): boolean {
  if (typeof localStorage === 'undefined') return false;

  // 1. If unified key already exists, migration is complete
  if (localStorage.getItem(UNIFIED_STORAGE_KEY)) {
    return false;
  }

  // 2. Check if ANY legacy key exists
  const hasLegacyData = LEGACY_KEYS.some((key) => localStorage.getItem(key) !== null);
  if (!hasLegacyData) {
    return false;
  }

  try {
    // 3. Extract and normalize legacy keys
    const loadedGlobal = safeLoad<Record<string, unknown>>('t_global', {});
    const legacyConstants = safeLoad<MachineConstants>('t_constants', DEFAULT_CONSTANTS);

    let machines = safeLoad<MachineConfig[]>('t_machines', []);
    let defaultMachineId =
      safeLoad<string | undefined>('t_defaultMachineId', undefined) ??
      safeLoad<string | undefined>('t_default_machine_id', undefined);

    let jigs = safeLoad<JigConfig[]>('t_jigs', DEFAULT_JIGS);
    let usbs = safeLoad<UsbConfig[]>('t_usbs', DEFAULT_USBS);

    // Backfill standard USB pitch/marks
    usbs = usbs.map((u) => {
      if ((u.id === 'usb-tormek' || u.id === 'usb-fvb') && u.threadPitch === undefined) {
        return { ...u, threadPitch: 1.5, microAdjustMarks: 6 };
      }
      return u;
    });

    // Merge jigs with default properties
    jigs = jigs.map((j) => {
      const def = DEFAULT_JIGS.find((d) => d.id === j.id);
      if (def) {
        return {
          ...def,
          ...j,
          length: j.length ?? def.length,
          isAdjustableLength: j.isAdjustableLength ?? def.isAdjustableLength,
          threadPitch: j.threadPitch ?? def.threadPitch,
        };
      }
      return j;
    });

    // Synthesize default machine if none exist
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

    // Migrate raw Dj/Ds in global to named entities
    const anyGlobal: Record<string, unknown> = { ...DEFAULT_GLOBAL, ...loadedGlobal };
    if (loadedGlobal.usbDiameter !== undefined && !loadedGlobal.activeUsbId) {
      const res = ensureHardwareConfig(
        usbs,
        Number(loadedGlobal.usbDiameter),
        'Ds',
        'usb',
        'Custom USB'
      );
      usbs = res.items;
      anyGlobal.activeUsbId = res.id;
    }
    if (
      loadedGlobal.jig &&
      typeof loadedGlobal.jig === 'object' &&
      (loadedGlobal.jig as Record<string, unknown>).Dj !== undefined &&
      !loadedGlobal.activeJigId
    ) {
      const res = ensureHardwareConfig(
        jigs,
        Number((loadedGlobal.jig as Record<string, unknown>).Dj),
        'Dj',
        'jig',
        'Custom Jig'
      );
      jigs = res.items;
      anyGlobal.activeJigId = res.id;
    }

    if (!anyGlobal.activeUsbId) anyGlobal.activeUsbId = DEFAULT_USBS[0].id;
    if (!anyGlobal.activeJigId) anyGlobal.activeJigId = DEFAULT_JIGS[0].id;

    // Steps (support both t_sessionSteps and t_steps)
    let sessionSteps =
      localStorage.getItem('t_sessionSteps') !== null
        ? safeLoad<SessionStep[]>('t_sessionSteps', [])
        : safeLoad<SessionStep[]>('t_steps', []);
    if (!Array.isArray(sessionSteps)) sessionSteps = [];

    sessionSteps = sessionSteps.map((step) => {
      const anyStep: Record<string, unknown> = { ...step };
      if (anyStep.usbOverride !== undefined && !anyStep.usbId) {
        const res = ensureHardwareConfig(
          usbs,
          Number(anyStep.usbOverride),
          'Ds',
          'usb',
          'Custom USB'
        );
        usbs = res.items;
        anyStep.usbId = res.id;
        delete anyStep.usbOverride;
      }
      return anyStep as unknown as SessionStep;
    });

    // Wheels (deduplicate and normalize)
    const rawWheels = safeLoad<Wheel[]>('t_wheels', DEFAULT_WHEELS);
    const seenWheels = new Set<string>();
    const wheels = (Array.isArray(rawWheels) ? rawWheels : DEFAULT_WHEELS)
      .map(normalizeWheel)
      .filter((w) => {
        if (seenWheels.has(w.id)) return false;
        seenWheels.add(w.id);
        return true;
      });

    // Presets (support both t_sessionPresets and t_presets)
    let sessionPresets =
      localStorage.getItem('t_sessionPresets') !== null
        ? safeLoad<SessionPreset[]>('t_sessionPresets', [])
        : safeLoad<SessionPreset[]>('t_presets', []);
    if (!Array.isArray(sessionPresets)) sessionPresets = [];

    const heightModeRaw = safeLoad<string>('t_heightMode', 'hn');
    const heightMode: 'hn' | 'hr' = heightModeRaw === 'hr' ? 'hr' : 'hn';

    const rawCalibSnapshots = safeLoad<unknown[]>('t_calibSnapshots', []);
    const calibSnapshots = Array.isArray(rawCalibSnapshots)
      ? normalizeCalibrationSnapshots(rawCalibSnapshots)
      : [];
    const calibAppliedIds = safeLoad<{ rear: string; front: string }>('t_calibAppliedIds', {
      rear: '',
      front: '',
    });

    const candidateState: AppPersistedState = {
      version: 1,
      global: anyGlobal as unknown as GlobalState,
      machines,
      defaultMachineId,
      jigs,
      usbs,
      constants: legacyConstants,
      wheels: wheels.length > 0 ? wheels : DEFAULT_WHEELS,
      sessionSteps,
      sessionPresets,
      heightMode,
      calibSnapshots,
      calibAppliedIds,
    };

    // 4. Validate through Zod Schema
    const parseResult = AppPersistedStateSchema.safeParse(candidateState);
    if (!parseResult.success) {
      console.error('Migration failed Zod validation', parseResult.error);
      return false;
    }

    // 5. Commit to unified envelope
    const envelope = {
      state: parseResult.data,
      version: 1,
    };
    localStorage.setItem(UNIFIED_STORAGE_KEY, JSON.stringify(envelope));
    localStorage.setItem('uwgas_migration_status', `migrated_at_${new Date().toISOString()}`);

    // NOTE: Legacy keys are intentionally NOT deleted to prevent data loss.
    return true;
  } catch (err) {
    console.error('Critical failure in legacy storage migration', err);
    return false;
  }
}
