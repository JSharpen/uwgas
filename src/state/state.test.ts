/// <reference types="node" />
import './test_env.ts';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mockStorage, mockWindow } from './test_env.ts';
import {
  useStore,
  flushPendingWrite,
  createDebouncedStorage,
} from './store.ts';
import { useUIStore } from './uiStore.ts';
import {
  migrateLegacyStorageIfNeeded,
  UNIFIED_STORAGE_KEY,
  LEGACY_KEYS,
} from './migration.ts';
import { AppPersistedStateSchema } from './schema.ts';
import {
  DEFAULT_CONSTANTS,
  DEFAULT_GLOBAL,
  DEFAULT_JIGS,
  DEFAULT_USBS,
  DEFAULT_WHEELS,
} from './defaults.ts';
import type {
  CalibrationProfile,
  CalibrationSnapshot,
  MachineConfig,
} from '../types/core.ts';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resetStoreToDefaults(): void {
  useStore.setState({
    global: { ...DEFAULT_GLOBAL },
    machines: [
      {
        id: 'default-machine',
        name: 'Primary Grinder',
        constants: DEFAULT_CONSTANTS,
        isDefault: true,
      },
    ],
    defaultMachineId: 'default-machine',
    jigs: [...DEFAULT_JIGS],
    usbs: [...DEFAULT_USBS],
    wheels: [...DEFAULT_WHEELS],
    sessionSteps: [],
    sessionPresets: [],
    heightMode: 'hn',
    calibSnapshots: [],
    calibAppliedIds: { rear: '', front: '' },
  });
}

describe('State Persistence & Storage Migration Challenger Suite', () => {
  beforeEach(() => {
    mockStorage.clear();
    resetStoreToDefaults();
  });

  // =========================================================================
  // 1. Deep Store Operations Across All 7 Slices + UI Store
  // =========================================================================
  describe('1. Deep Store Operations Across All 7 Slices', () => {
    it('calculatorSlice: mutates all global configuration properties', () => {
      const {
        setTargetAngle,
        setProjection,
        setCalcMode,
        setActiveUsbId,
        setActiveJigId,
        setFixedUsbHeight,
        setFixedUsbRear,
        setFixedUsbFront,
        setFixedUsbMode,
        setUseCustomFrontUsb,
        setProtrusionMode,
        setProtrusion,
        setShowAdvancedStepOverrides,
        setGlobal,
        resetGlobal,
      } = useStore.getState();

      setTargetAngle(18.5);
      assert.strictEqual(useStore.getState().global.targetAngle, 18.5);

      setProjection(142.0);
      assert.strictEqual(useStore.getState().global.projection, 142.0);

      setCalcMode('projection');
      assert.strictEqual(useStore.getState().global.calcMode, 'projection');

      setActiveUsbId('usb-custom-test');
      assert.strictEqual(useStore.getState().global.activeUsbId, 'usb-custom-test');

      setActiveJigId('jig-custom-test');
      assert.strictEqual(useStore.getState().global.activeJigId, 'jig-custom-test');

      setFixedUsbHeight(140.5);
      assert.strictEqual(useStore.getState().global.fixedUsbHeight, 140.5);

      setFixedUsbRear(135.0);
      assert.strictEqual(useStore.getState().global.fixedUsbRear, 135.0);

      setFixedUsbFront(92.0);
      assert.strictEqual(useStore.getState().global.fixedUsbFront, 92.0);

      setFixedUsbMode('hr');
      assert.strictEqual(useStore.getState().global.fixedUsbMode, 'hr');

      setUseCustomFrontUsb(true);
      assert.strictEqual(useStore.getState().global.useCustomFrontUsb, true);

      setProtrusionMode(true);
      assert.strictEqual(useStore.getState().global.useProtrusionMode, true);

      setProtrusion(32.5);
      assert.strictEqual(useStore.getState().global.protrusion, 32.5);

      setShowAdvancedStepOverrides(true);
      assert.strictEqual(useStore.getState().global.showAdvancedStepOverrides, true);

      setGlobal({ targetAngle: 15.0 });
      assert.strictEqual(useStore.getState().global.targetAngle, 15.0);
      assert.strictEqual(useStore.getState().global.protrusion, 32.5);

      resetGlobal();
      assert.strictEqual(useStore.getState().global.targetAngle, DEFAULT_GLOBAL.targetAngle);
      assert.strictEqual(useStore.getState().global.projection, DEFAULT_GLOBAL.projection);
    });

    it('progressionSlice: manages session steps, ordering, and default progression', () => {
      const {
        addStep,
        updateStep,
        moveStep,
        deleteStep,
        clearSessionSteps,
        loadDefaultProgression,
      } = useStore.getState();

      const wheels = useStore.getState().wheels;
      const w0 = wheels[0].id;
      const w1 = wheels[1].id;

      clearSessionSteps();
      assert.strictEqual(useStore.getState().sessionSteps.length, 0);

      // Add step with specific wheel
      addStep(w0);
      assert.strictEqual(useStore.getState().sessionSteps.length, 1);
      const step1 = useStore.getState().sessionSteps[0];
      assert.strictEqual(step1.wheelId, w0);
      assert.strictEqual(step1.angleOffset, 0);

      // Add step without arg (defaults to first wheel)
      addStep(w1);
      assert.strictEqual(useStore.getState().sessionSteps.length, 2);
      const step2 = useStore.getState().sessionSteps[1];
      assert.strictEqual(step2.wheelId, w1);

      // Update step
      updateStep(step1.id, { angleOffset: 0.4, machineId: 'custom-m1' });
      const updatedStep1 = useStore.getState().sessionSteps.find((s) => s.id === step1.id);
      assert.strictEqual(updatedStep1?.angleOffset, 0.4);
      assert.strictEqual(updatedStep1?.machineId, 'custom-m1');

      // Move step (reordering)
      moveStep(0, 1);
      assert.strictEqual(useStore.getState().sessionSteps[0].id, step2.id);
      assert.strictEqual(useStore.getState().sessionSteps[1].id, step1.id);

      // Move step boundary checks (out of bounds should be no-op)
      moveStep(0, -1);
      assert.strictEqual(useStore.getState().sessionSteps[0].id, step2.id);
      moveStep(1, 1);
      assert.strictEqual(useStore.getState().sessionSteps[1].id, step1.id);

      // Delete step
      deleteStep(step1.id);
      assert.strictEqual(useStore.getState().sessionSteps.length, 1);
      assert.strictEqual(useStore.getState().sessionSteps[0].id, step2.id);

      // Load default progression
      loadDefaultProgression();
      const defSteps = useStore.getState().sessionSteps;
      assert.ok(defSteps.length >= 1);
      assert.strictEqual(defSteps[0].angleOffset, 0);
      if (defSteps.length > 1) {
        assert.strictEqual(defSteps[1].angleOffset, 0.2);
      }
    });

    it('machineSlice: manages custom machines, default fallback, and calibration profiles', () => {
      const {
        addMachine,
        updateMachine,
        setDefaultMachineId,
        addCalibrationProfile,
        setActiveCalibrationProfile,
        deleteCalibrationProfile,
        deleteMachine,
      } = useStore.getState();

      const customMachine: MachineConfig = {
        id: 'machine-t4-custom',
        name: 'Tormek T-4 Custom',
        constants: {
          rear: { hc: 28.5, o: 49.0 },
          front: { hc: 50.0, o: 130.0 },
        },
      };

      addMachine(customMachine);
      assert.strictEqual(useStore.getState().machines.length, 2);

      updateMachine('machine-t4-custom', { name: 'T-4 Workshop Grinder' });
      assert.strictEqual(
        useStore.getState().machines.find((m) => m.id === 'machine-t4-custom')?.name,
        'T-4 Workshop Grinder'
      );

      setDefaultMachineId('machine-t4-custom');
      assert.strictEqual(useStore.getState().defaultMachineId, 'machine-t4-custom');

      const profile: CalibrationProfile = {
        id: 'calib-prof-1',
        name: 'Factory Profile',
        createdAt: new Date().toISOString(),
        scope: 'rear',
        Da: 250,
        Ds: 12,
        rear: {
          hc: 28.5,
          o: 49.0,
          diagnostics: { residuals: [0.01, -0.01], maxAbsResidualMm: 0.01 },
          angleErrorDeg: 0.02,
          measurements: [{ hn: '150', CAo: '192' }],
        },
      };

      addCalibrationProfile('machine-t4-custom', profile);
      const mWithCalib = useStore.getState().machines.find((m) => m.id === 'machine-t4-custom');
      assert.strictEqual(mWithCalib?.calibrationProfiles?.length, 1);
      assert.strictEqual(mWithCalib?.activeCalibrationId, 'calib-prof-1');

      setActiveCalibrationProfile('machine-t4-custom', undefined);
      assert.strictEqual(
        useStore.getState().machines.find((m) => m.id === 'machine-t4-custom')?.activeCalibrationId,
        undefined
      );

      deleteCalibrationProfile('machine-t4-custom', 'calib-prof-1');
      assert.strictEqual(
        useStore.getState().machines.find((m) => m.id === 'machine-t4-custom')?.calibrationProfiles?.length,
        0
      );

      // Deleting current default machine automatically re-points defaultMachineId to first remaining
      deleteMachine('machine-t4-custom');
      assert.strictEqual(useStore.getState().machines.length, 1);
      assert.strictEqual(useStore.getState().defaultMachineId, 'default-machine');
    });

    it('hardwareSlice: manages jigs and usbs', () => {
      const {
        addJig,
        updateJig,
        deleteJig,
        addUsb,
        updateUsb,
        deleteUsb,
      } = useStore.getState();

      const initialJigCount = useStore.getState().jigs.length;
      const initialUsbCount = useStore.getState().usbs.length;

      addJig({ id: 'jig-custom-1', name: 'Custom Small Knife Jig', Dj: 14.5 });
      assert.strictEqual(useStore.getState().jigs.length, initialJigCount + 1);

      updateJig('jig-custom-1', { Dj: 15.0 });
      assert.strictEqual(
        useStore.getState().jigs.find((j) => j.id === 'jig-custom-1')?.Dj,
        15.0
      );

      deleteJig('jig-custom-1');
      assert.strictEqual(useStore.getState().jigs.length, initialJigCount);

      addUsb({
        id: 'usb-custom-1',
        name: 'Custom Precision USB',
        Ds: 12.5,
        threadPitch: 1.25,
        microAdjustMarks: 8,
      });
      assert.strictEqual(useStore.getState().usbs.length, initialUsbCount + 1);

      updateUsb('usb-custom-1', { threadPitch: 1.0 });
      assert.strictEqual(
        useStore.getState().usbs.find((u) => u.id === 'usb-custom-1')?.threadPitch,
        1.0
      );

      deleteUsb('usb-custom-1');
      assert.strictEqual(useStore.getState().usbs.length, initialUsbCount);
    });

    it('wheelSlice: adds, normalizes, updates, and deletes wheels', () => {
      const { addWheel, updateWheel, deleteWheel, setWheels } = useStore.getState();
      const initialWheelCount = useStore.getState().wheels.length;

      addWheel({
        name: 'CBN 400 Wheel',
        D: 248.5,
        baseForHn: 'rear',
        isHoning: false,
      });

      assert.strictEqual(useStore.getState().wheels.length, initialWheelCount + 1);
      const added = useStore.getState().wheels[useStore.getState().wheels.length - 1];
      assert.ok(added.id.length > 0);
      assert.strictEqual(added.name, 'CBN 400 Wheel');

      updateWheel(added.id, { D: 247.0, grit: '400# CBN' });
      const updated = useStore.getState().wheels.find((w) => w.id === added.id);
      assert.strictEqual(updated?.D, 247.0);
      assert.strictEqual(updated?.grit, '400# CBN');

      deleteWheel(added.id);
      assert.strictEqual(useStore.getState().wheels.length, initialWheelCount);

      // setWheels batch update with normalization
      setWheels([
        {
          id: 'batch-w1',
          name: 'Batch Wheel 1',
          D: 250,
          baseForHn: 'rear',
          isHoning: false,
        },
      ]);
      assert.strictEqual(useStore.getState().wheels.length, 1);
      assert.strictEqual(useStore.getState().wheels[0].id, 'batch-w1');
    });

    it('presetSlice: saves, validates, renames, loads, and deletes presets', () => {
      const {
        addStep,
        savePreset,
        renamePreset,
        loadPreset,
        deletePreset,
        clearSessionSteps,
      } = useStore.getState();

      clearSessionSteps();
      // Empty steps should reject savePreset
      savePreset('Empty Preset');
      assert.strictEqual(useStore.getState().sessionPresets.length, 0);

      const wheels = useStore.getState().wheels;
      addStep(wheels[0].id);

      // Empty name should reject savePreset
      savePreset('   ');
      assert.strictEqual(useStore.getState().sessionPresets.length, 0);

      // Valid save
      savePreset('Kitchen Knives 15deg');
      assert.strictEqual(useStore.getState().sessionPresets.length, 1);
      const preset = useStore.getState().sessionPresets[0];
      assert.strictEqual(preset.name, 'Kitchen Knives 15deg');
      assert.strictEqual(preset.steps.length, 1);
      assert.strictEqual(preset.steps[0].wheelId, wheels[0].id);

      // Rename preset
      renamePreset(preset.id, '  Master Chef 15deg  ');
      assert.strictEqual(useStore.getState().sessionPresets[0].name, 'Master Chef 15deg');

      // Load preset: resets sessionSteps with new generated IDs
      clearSessionSteps();
      assert.strictEqual(useStore.getState().sessionSteps.length, 0);
      loadPreset(preset.id);
      assert.strictEqual(useStore.getState().sessionSteps.length, 1);
      assert.strictEqual(useStore.getState().sessionSteps[0].wheelId, wheels[0].id);
      // New step must have its own unique ID, not match preset ID
      assert.notStrictEqual(useStore.getState().sessionSteps[0].id, preset.id);

      // Delete preset
      deletePreset(preset.id);
      assert.strictEqual(useStore.getState().sessionPresets.length, 0);
    });

    it('settingsSlice: manages heightMode and calibration snapshots', () => {
      const {
        setHeightMode,
        addCalibSnapshot,
        applyCalibSnapshot,
        deleteCalibSnapshot,
      } = useStore.getState();

      setHeightMode('hr');
      assert.strictEqual(useStore.getState().heightMode, 'hr');
      setHeightMode('hn');
      assert.strictEqual(useStore.getState().heightMode, 'hn');

      const snapshot: CalibrationSnapshot = {
        id: 'snap-1',
        createdAt: new Date().toISOString(),
        base: 'rear',
        hc: 29.1,
        o: 50.2,
        diagnostics: { residuals: [0.002], maxAbsResidualMm: 0.002 },
        angleErrorDeg: 0.01,
        count: 1,
        Da: 250,
        Ds: 12,
        measurements: [{ hn: '150', CAo: '192' }],
      };

      addCalibSnapshot(snapshot);
      assert.strictEqual(useStore.getState().calibSnapshots.length, 1);

      applyCalibSnapshot('rear', 'snap-1');
      assert.strictEqual(useStore.getState().calibAppliedIds.rear, 'snap-1');

      // Deleting snapshot clears reference in calibAppliedIds
      deleteCalibSnapshot('snap-1');
      assert.strictEqual(useStore.getState().calibSnapshots.length, 0);
      assert.strictEqual(useStore.getState().calibAppliedIds.rear, '');
    });

    it('uiStore: manages ephemeral UI navigation, modal states, and section selectors', () => {
      const ui = useUIStore.getState();

      ui.setView('settings');
      assert.strictEqual(useUIStore.getState().view, 'settings');

      ui.setSettingsView('measurement');
      assert.strictEqual(useUIStore.getState().settingsView, 'measurement');

      ui.toggleSetupPanel();
      assert.strictEqual(useUIStore.getState().isSetupPanelOpen, true);
      ui.setSetupPanelOpen(false);
      assert.strictEqual(useUIStore.getState().isSetupPanelOpen, false);

      ui.setPresetDialogOpen(true);
      ui.setPresetNameDraft('Sujihiki 12deg');
      assert.strictEqual(useUIStore.getState().isPresetDialogOpen, true);
      assert.strictEqual(useUIStore.getState().presetNameDraft, 'Sujihiki 12deg');

      ui.setExportSections((prev) => ({ ...prev, wheels: false }));
      assert.strictEqual(useUIStore.getState().exportSections.wheels, false);

      ui.setImportModes((prev) => ({ ...prev, wheels: 'overwrite' }));
      assert.strictEqual(useUIStore.getState().importModes.wheels, 'overwrite');
    });
  });

  // =========================================================================
  // 2. Debounced Persistence & Flush Mechanisms
  // =========================================================================
  describe('2. Debounced Persistence (300ms) & Flush Mechanisms', () => {
    it('debounces storage writes by 300ms', async () => {
      const storage = createDebouncedStorage();

      storage.setItem('test_debounce_key', 'value_initial');

      // Immediately (<50ms), localStorage must NOT have received the write
      await sleep(50);
      assert.strictEqual(mockStorage.getItem('test_debounce_key'), null);

      // After 350ms, the timer fires and the write commits
      await sleep(320);
      assert.strictEqual(mockStorage.getItem('test_debounce_key'), 'value_initial');
    });

    it('flushPendingWrite() immediately commits pending writes without waiting for timer', () => {
      const storage = createDebouncedStorage();

      storage.setItem('test_flush_key', 'value_flush_instant');
      assert.strictEqual(mockStorage.getItem('test_flush_key'), null);

      flushPendingWrite();
      assert.strictEqual(mockStorage.getItem('test_flush_key'), 'value_flush_instant');
    });

    it('flushes pending writes on window beforeunload event', () => {
      const storage = createDebouncedStorage();

      storage.setItem('test_unload_key', 'value_on_unload');
      assert.strictEqual(mockStorage.getItem('test_unload_key'), null);

      // Dispatch beforeunload on mock window
      mockWindow.dispatchEvent({ type: 'beforeunload' });
      assert.strictEqual(mockStorage.getItem('test_unload_key'), 'value_on_unload');
    });

    it('coalesces rapid repeated mutations into a single final write', async () => {
      const storage = createDebouncedStorage();

      for (let i = 1; i <= 5; i++) {
        storage.setItem('test_rapid_key', `value_${i}`);
        await sleep(40); // 40ms < 300ms debounce
      }

      assert.strictEqual(mockStorage.getItem('test_rapid_key'), null);

      await sleep(350);
      assert.strictEqual(mockStorage.getItem('test_rapid_key'), 'value_5');
    });

    it('removeItem() cancels any pending debounced write and clears the key', async () => {
      const storage = createDebouncedStorage();

      storage.setItem('test_abort_key', 'aborted_val');
      storage.removeItem('test_abort_key');

      await sleep(350);
      assert.strictEqual(mockStorage.getItem('test_abort_key'), null);
    });

    it('flushPendingWrite() survives localStorage write errors without throwing', () => {
      const storage = createDebouncedStorage();
      storage.setItem('test_err_key', 'val');

      // Mock setItem throwing QuotaExceededError
      const origSetItem = mockStorage.setItem.bind(mockStorage);
      mockStorage.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      try {
        assert.doesNotThrow(() => {
          flushPendingWrite();
        });
      } finally {
        mockStorage.setItem = origSetItem;
      }
    });

    it('multi-tab synchronization: rehydrates store when storage event fires for uwgas_app_state_v1', async () => {
      const incomingEnvelope = {
        state: {
          version: 1,
          global: { ...DEFAULT_GLOBAL, targetAngle: 21.5 },
          machines: [
            {
              id: 'default-machine',
              name: 'Primary Grinder',
              constants: DEFAULT_CONSTANTS,
              isDefault: true,
            },
          ],
          defaultMachineId: 'default-machine',
          jigs: DEFAULT_JIGS,
          usbs: DEFAULT_USBS,
          constants: DEFAULT_CONSTANTS,
          wheels: DEFAULT_WHEELS,
          sessionSteps: [],
          sessionPresets: [],
          heightMode: 'hn',
          calibSnapshots: [],
          calibAppliedIds: { rear: '', front: '' },
        },
        version: 1,
      };

      mockStorage.setItem(UNIFIED_STORAGE_KEY, JSON.stringify(incomingEnvelope));
      mockWindow.dispatchEvent({ type: 'storage', key: UNIFIED_STORAGE_KEY });

      await sleep(100);
      assert.strictEqual(useStore.getState().global.targetAngle, 21.5);
    });
  });

  // =========================================================================
  // 3. Legacy Storage Migration Bridge
  // =========================================================================
  describe('3. Legacy Storage Migration Bridge (11+ Legacy Keys)', () => {
    it('returns false when localStorage has no legacy keys and no unified key', () => {
      const migrated = migrateLegacyStorageIfNeeded();
      assert.strictEqual(migrated, false);
      assert.strictEqual(mockStorage.getItem(UNIFIED_STORAGE_KEY), null);
    });

    it('returns false when unified key already exists (does not overwrite existing state)', () => {
      mockStorage.setItem(
        UNIFIED_STORAGE_KEY,
        JSON.stringify({ state: { version: 1 }, version: 1 })
      );
      mockStorage.setItem('t_global', JSON.stringify({ targetAngle: 25 }));

      const migrated = migrateLegacyStorageIfNeeded();
      assert.strictEqual(migrated, false);
      const unified = JSON.parse(mockStorage.getItem(UNIFIED_STORAGE_KEY)!);
      assert.strictEqual(unified.state.version, 1);
    });

    it('migrates full 11+ legacy keys into uwgas_app_state_v1 without destroying legacy keys', () => {
      const legacyGlobal = {
        projection: 139.0,
        targetAngle: 15.0,
        activeUsbId: 'usb-tormek',
        activeJigId: 'jig-svm45',
        calcMode: 'height',
      };
      const legacyConstants = {
        rear: { hc: 29.5, o: 51.0 },
        front: { hc: 51.5, o: 132.0 },
      };
      const legacyMachines = [
        {
          id: 'legacy-m1',
          name: 'Legacy Grinder 1',
          constants: legacyConstants,
          isDefault: true,
        },
      ];
      const legacyWheels = [
        {
          id: 'w-custom-leg',
          name: 'Custom Worn Wheel',
          D: 235.0,
          angleOffset: 0.1,
          baseForHn: 'rear' as const,
          isHoning: false,
        },
      ];
      const legacySteps = [
        {
          id: 'step-leg-1',
          wheelId: 'w-custom-leg',
          base: 'rear' as const,
          angleOffset: 0,
        },
      ];
      const legacyPresets = [
        {
          id: 'preset-leg-1',
          name: 'Legacy Preset 1',
          createdAt: new Date().toISOString(),
          version: 1 as const,
          steps: [
            {
              wheelId: 'w-custom-leg',
              wheelName: 'Custom Worn Wheel',
              base: 'rear' as const,
              angleOffset: 0,
            },
          ],
        },
      ];
      const legacySnapshots = [
        {
          id: 'snap-leg-1',
          createdAt: new Date().toISOString(),
          machineId: 'legacy-m1',
          base: 'rear' as const,
          hc: 29.5,
          o: 51.0,
          diagnostics: { residuals: [0.001], maxAbsResidualMm: 0.001 },
        },
      ];

      // Seed all legacy keys
      mockStorage.setItem('t_global', JSON.stringify(legacyGlobal));
      mockStorage.setItem('t_constants', JSON.stringify(legacyConstants));
      mockStorage.setItem('t_machines', JSON.stringify(legacyMachines));
      mockStorage.setItem('t_defaultMachineId', JSON.stringify('legacy-m1'));
      mockStorage.setItem('t_jigs', JSON.stringify(DEFAULT_JIGS));
      mockStorage.setItem('t_usbs', JSON.stringify(DEFAULT_USBS));
      mockStorage.setItem('t_wheels', JSON.stringify(legacyWheels));
      mockStorage.setItem('t_sessionSteps', JSON.stringify(legacySteps));
      mockStorage.setItem('t_sessionPresets', JSON.stringify(legacyPresets));
      mockStorage.setItem('t_heightMode', JSON.stringify('hr'));
      mockStorage.setItem('t_calibSnapshots', JSON.stringify(legacySnapshots));
      mockStorage.setItem(
        't_calibAppliedIds',
        JSON.stringify({ rear: 'snap-leg-1', front: '' })
      );

      const migrated = migrateLegacyStorageIfNeeded();
      assert.strictEqual(migrated, true);

      // Verify migration status flag is recorded
      assert.ok(mockStorage.getItem('uwgas_migration_status')?.startsWith('migrated_at_'));

      // Verify unified envelope structure
      const rawUnified = mockStorage.getItem(UNIFIED_STORAGE_KEY);
      assert.ok(rawUnified !== null);
      const parsedEnvelope = JSON.parse(rawUnified!);
      assert.strictEqual(parsedEnvelope.version, 1);
      assert.strictEqual(parsedEnvelope.state.global.targetAngle, 15.0);
      assert.strictEqual(parsedEnvelope.state.global.projection, 139.0);
      assert.strictEqual(parsedEnvelope.state.heightMode, 'hr');
      assert.strictEqual(parsedEnvelope.state.machines[0].name, 'Legacy Grinder 1');
      assert.strictEqual(parsedEnvelope.state.wheels[0].name, 'Custom Worn Wheel');
      assert.strictEqual(parsedEnvelope.state.sessionSteps[0].wheelId, 'w-custom-leg');
      assert.strictEqual(parsedEnvelope.state.sessionPresets[0].name, 'Legacy Preset 1');
      assert.strictEqual(parsedEnvelope.state.calibAppliedIds.rear, 'snap-leg-1');

      // CRITICAL REQUIREMENT: Verify legacy keys are NEVER destroyed
      for (const k of LEGACY_KEYS) {
        if (
          [
            't_global',
            't_constants',
            't_machines',
            't_defaultMachineId',
            't_jigs',
            't_usbs',
            't_wheels',
            't_sessionSteps',
            't_sessionPresets',
            't_heightMode',
            't_calibSnapshots',
            't_calibAppliedIds',
          ].includes(k)
        ) {
          assert.ok(
            mockStorage.getItem(k) !== null,
            `Legacy key ${k} must be preserved in localStorage`
          );
        }
      }
    });

    it('honors snake_case legacy keys (t_steps, t_presets, t_default_machine_id)', () => {
      mockStorage.setItem('t_global', JSON.stringify({ targetAngle: 17 }));
      mockStorage.setItem(
        't_steps',
        JSON.stringify([
          { id: 'snake-step-1', wheelId: 'w1', base: 'rear', angleOffset: 0 },
        ])
      );
      mockStorage.setItem(
        't_presets',
        JSON.stringify([
          {
            id: 'snake-pre-1',
            name: 'Snake Preset',
            createdAt: '2026-01-01',
            version: 1,
            steps: [],
          },
        ])
      );
      mockStorage.setItem(
        't_machines',
        JSON.stringify([
          {
            id: 'machine-snake',
            name: 'Snake Machine',
            constants: DEFAULT_CONSTANTS,
            isDefault: true,
          },
        ])
      );
      mockStorage.setItem('t_default_machine_id', JSON.stringify('machine-snake'));

      const migrated = migrateLegacyStorageIfNeeded();
      assert.strictEqual(migrated, true);

      const parsedEnvelope = JSON.parse(mockStorage.getItem(UNIFIED_STORAGE_KEY)!);
      assert.strictEqual(parsedEnvelope.state.sessionSteps[0].id, 'snake-step-1');
      assert.strictEqual(parsedEnvelope.state.sessionPresets[0].name, 'Snake Preset');
      assert.strictEqual(parsedEnvelope.state.defaultMachineId, 'machine-snake');
    });

    it('synthesizes default grinder when legacy t_machines is missing', () => {
      mockStorage.setItem('t_global', JSON.stringify({ targetAngle: 17 }));
      mockStorage.setItem('t_default_machine_id', JSON.stringify('orphaned-machine-id'));

      const migrated = migrateLegacyStorageIfNeeded();
      assert.strictEqual(migrated, true);

      const parsedEnvelope = JSON.parse(mockStorage.getItem(UNIFIED_STORAGE_KEY)!);
      assert.strictEqual(parsedEnvelope.state.machines.length, 1);
      assert.strictEqual(parsedEnvelope.state.machines[0].id, 'default-machine');
      // When machines is synthesized, it resets defaultMachineId to default-machine
      assert.strictEqual(parsedEnvelope.state.defaultMachineId, 'default-machine');
    });

    it('camelCase keys take precedence over snake_case keys if both are present', () => {
      mockStorage.setItem('t_global', JSON.stringify({ targetAngle: 17 }));
      mockStorage.setItem(
        't_steps',
        JSON.stringify([
          { id: 'snake-step', wheelId: 'w-snake', base: 'rear', angleOffset: 0 },
        ])
      );
      mockStorage.setItem(
        't_sessionSteps',
        JSON.stringify([
          { id: 'camel-step', wheelId: 'w-camel', base: 'front', angleOffset: 0.5 },
        ])
      );
      mockStorage.setItem(
        't_presets',
        JSON.stringify([
          { id: 'snake-p', name: 'Snake P', createdAt: '2026', version: 1, steps: [] },
        ])
      );
      mockStorage.setItem(
        't_sessionPresets',
        JSON.stringify([
          { id: 'camel-p', name: 'Camel P', createdAt: '2026', version: 1, steps: [] },
        ])
      );

      const migrated = migrateLegacyStorageIfNeeded();
      assert.strictEqual(migrated, true);

      const parsedEnvelope = JSON.parse(mockStorage.getItem(UNIFIED_STORAGE_KEY)!);
      assert.strictEqual(parsedEnvelope.state.sessionSteps[0].id, 'camel-step');
      assert.strictEqual(parsedEnvelope.state.sessionPresets[0].name, 'Camel P');
    });

    it('migrates legacy step.usbOverride into a custom USB and sets step.usbId', () => {
      mockStorage.setItem('t_global', JSON.stringify({ targetAngle: 16 }));
      mockStorage.setItem(
        't_sessionSteps',
        JSON.stringify([
          {
            id: 'step-with-override',
            wheelId: 'wheel-1',
            base: 'rear',
            angleOffset: 0,
            usbOverride: 11.75, // Legacy custom diameter override
          },
        ])
      );

      const migrated = migrateLegacyStorageIfNeeded();
      assert.strictEqual(migrated, true);

      const parsedEnvelope = JSON.parse(mockStorage.getItem(UNIFIED_STORAGE_KEY)!);
      const migratedStep = parsedEnvelope.state.sessionSteps[0];
      assert.ok(migratedStep.usbId, 'step must have usbId assigned');
      assert.strictEqual((migratedStep as Record<string, unknown>).usbOverride, undefined);

      // Verify that the custom USB was added to usbs array
      const customUsb = parsedEnvelope.state.usbs.find(
        (u: { Ds: number }) => u.Ds === 11.75
      );
      assert.ok(customUsb, 'Custom USB with Ds=11.75 must be created in usbs');
      assert.strictEqual(migratedStep.usbId, customUsb.id);
    });

    it('migrates raw usbDiameter & jig.Dj in legacy t_global into custom hardware entities', () => {
      // Legacy t_global from older version where activeUsbId and activeJigId did NOT exist
      mockStorage.setItem(
        't_global',
        JSON.stringify({
          targetAngle: 15.5,
          projection: 139.0,
          usbDiameter: 13.25, // Custom USB diameter
          jig: { Dj: 14.75 }, // Custom Jig diameter
        })
      );

      const migrated = migrateLegacyStorageIfNeeded();
      assert.strictEqual(migrated, true);

      const parsedEnvelope = JSON.parse(mockStorage.getItem(UNIFIED_STORAGE_KEY)!);
      const global = parsedEnvelope.state.global;
      const usbs = parsedEnvelope.state.usbs;
      const jigs = parsedEnvelope.state.jigs;

      const customUsb = usbs.find((u: { Ds: number }) => u.Ds === 13.25);
      const customJig = jigs.find((j: { Dj: number }) => j.Dj === 14.75);

      assert.ok(customUsb, 'Custom USB with Ds=13.25mm must be created in usbs');
      assert.strictEqual(global.activeUsbId, customUsb.id, 'activeUsbId must point to custom USB');
      assert.ok(customJig, 'Custom Jig with Dj=14.75mm must be created in jigs');
      assert.strictEqual(global.activeJigId, customJig.id, 'activeJigId must point to custom Jig');
    });
  });

  // =========================================================================
  // 4. Zod Validation Resilience
  // =========================================================================
  describe('4. Zod Validation Resilience Against Corrupted Storage', () => {
    it('handles non-JSON raw strings in localStorage without throwing', () => {
      mockStorage.setItem(UNIFIED_STORAGE_KEY, '{corrupted-json-payload-without-quotes');
      const storage = createDebouncedStorage();

      // getItem should read raw string without crashing
      const raw = storage.getItem(UNIFIED_STORAGE_KEY);
      assert.strictEqual(raw, '{corrupted-json-payload-without-quotes');

      // Attempting to parse with AppPersistedStateSchema handles non-objects safely
      let parsedObj: unknown = null;
      try {
        parsedObj = JSON.parse(raw!);
      } catch {
        parsedObj = null;
      }
      const parseResult = AppPersistedStateSchema.safeParse(parsedObj);
      assert.strictEqual(parseResult.success, false);
    });

    it('rejects schema violations (out-of-range types, invalid enums) and preserves valid state', () => {
      const invalidPayload = {
        version: 'not-a-number',
        global: {
          projection: 'not-a-number',
          activeUsbId: 12345,
          targetAngle: null,
          activeJigId: {},
        },
        wheels: [
          {
            id: 'bad-wheel',
            name: 'Bad Wheel',
            D: 'string-D',
            baseForHn: 'diagonal', // Invalid enum
          },
        ],
      };

      const parseResult = AppPersistedStateSchema.safeParse(invalidPayload);
      assert.strictEqual(parseResult.success, false);
      assert.ok(parseResult.error.issues.length > 0);
    });

    it('validates a complete, compliant AppPersistedState object cleanly', () => {
      const validState = {
        version: 1,
        global: DEFAULT_GLOBAL,
        machines: [
          {
            id: 'default-machine',
            name: 'Primary Grinder',
            constants: DEFAULT_CONSTANTS,
            isDefault: true,
          },
        ],
        defaultMachineId: 'default-machine',
        jigs: DEFAULT_JIGS,
        usbs: DEFAULT_USBS,
        constants: DEFAULT_CONSTANTS,
        wheels: DEFAULT_WHEELS,
        sessionSteps: [],
        sessionPresets: [],
        heightMode: 'hn' as const,
        calibSnapshots: [],
        calibAppliedIds: { rear: '', front: '' },
      };

      const parseResult = AppPersistedStateSchema.safeParse(validState);
      assert.strictEqual(parseResult.success, true);
    });
  });

  // =========================================================================
  // 5. JSON Import/Export Round-Trip & Modes
  // =========================================================================
  describe('5. JSON Import / Export Round-Trip & Modes', () => {
    it('importState: handles invalid JSON gracefully with descriptive error', () => {
      const { importState } = useStore.getState();
      const sections = {
        global: true,
        constants: true,
        wheels: true,
        sessionSteps: true,
        sessionPresets: true,
        heightMode: true,
      };
      const modes = {
        global: 'merge' as const,
        constants: 'merge' as const,
        wheels: 'merge' as const,
        sessionSteps: 'merge' as const,
        sessionPresets: 'merge' as const,
        heightMode: 'overwrite' as const,
      };

      const res1 = importState('{ bad json', sections, modes);
      assert.strictEqual(res1.error, 'Import failed: invalid JSON.');

      const res2 = importState('12345', sections, modes);
      assert.strictEqual(res2.error, 'Import failed: not an object.');

      const res3 = importState('null', sections, modes);
      assert.strictEqual(res3.error, 'Import failed: not an object.');
    });

    it('importState: overwrite mode replaces collections completely', () => {
      const { importState } = useStore.getState();

      const incomingJson = JSON.stringify({
        wheels: [
          {
            id: 'w-overwritten',
            name: 'Sole Imported Wheel',
            D: 250,
            angleOffset: 0,
            baseForHn: 'rear',
            isHoning: false,
          },
        ],
        sessionSteps: [
          {
            id: 'step-overwritten',
            wheelId: 'w-overwritten',
            base: 'rear',
            angleOffset: 0.1,
          },
        ],
        sessionPresets: [
          {
            id: 'preset-overwritten',
            name: 'Sole Imported Preset',
            createdAt: '2026-01-01',
            version: 1,
            steps: [],
          },
        ],
        heightMode: 'hr',
      });

      const sections = {
        global: false,
        constants: false,
        wheels: true,
        sessionSteps: true,
        sessionPresets: true,
        heightMode: true,
      };
      const modes = {
        global: 'merge' as const,
        constants: 'merge' as const,
        wheels: 'overwrite' as const,
        sessionSteps: 'overwrite' as const,
        sessionPresets: 'overwrite' as const,
        heightMode: 'overwrite' as const,
      };

      const res = importState(incomingJson, sections, modes);
      assert.ok(res.summary?.includes('Import applied'));

      // Check state
      const state = useStore.getState();
      assert.strictEqual(state.wheels.length, 1);
      assert.strictEqual(state.wheels[0].id, 'w-overwritten');
      assert.strictEqual(state.sessionSteps.length, 1);
      assert.strictEqual(state.sessionSteps[0].id, 'step-overwritten');
      assert.strictEqual(state.sessionPresets.length, 1);
      assert.strictEqual(state.sessionPresets[0].id, 'preset-overwritten');
      assert.strictEqual(state.heightMode, 'hr');
    });

    it('importState: merge mode unions items by ID, updating existing and appending new', () => {
      const { importState } = useStore.getState();
      const existingWheels = useStore.getState().wheels;
      const firstWheelId = existingWheels[0].id;

      const incomingJson = JSON.stringify({
        wheels: [
          {
            id: firstWheelId,
            name: 'Updated SG-250 (Merged)',
            D: 246.0,
            angleOffset: 0,
            baseForHn: 'rear',
            isHoning: false,
          },
          {
            id: 'new-merged-wheel',
            name: 'Brand New Merged Wheel',
            D: 200.0,
            angleOffset: 0,
            baseForHn: 'front',
            isHoning: true,
          },
        ],
      });

      const sections = {
        global: false,
        constants: false,
        wheels: true,
        sessionSteps: false,
        sessionPresets: false,
        heightMode: false,
      };
      const modes = {
        global: 'merge' as const,
        constants: 'merge' as const,
        wheels: 'merge' as const,
        sessionSteps: 'merge' as const,
        sessionPresets: 'merge' as const,
        heightMode: 'overwrite' as const,
      };

      const res = importState(incomingJson, sections, modes);
      assert.ok(res.summary?.includes('wheels: merge'));

      const state = useStore.getState();
      // Original count + 1 new wheel
      assert.strictEqual(state.wheels.length, existingWheels.length + 1);

      // Existing wheel was updated with new properties
      const updatedFirst = state.wheels.find((w) => w.id === firstWheelId);
      assert.strictEqual(updatedFirst?.name, 'Updated SG-250 (Merged)');
      assert.strictEqual(updatedFirst?.D, 246.0);

      // New wheel was appended
      const brandNew = state.wheels.find((w) => w.id === 'new-merged-wheel');
      assert.ok(brandNew !== null);
      assert.strictEqual(brandNew?.D, 200.0);
    });

    it('constants section in importState imports machines, jigs, and usbs', () => {
      const { importState } = useStore.getState();

      const incomingWithHardware = JSON.stringify({
        machines: [
          {
            id: 'm-imported',
            name: 'Imported Machine',
            constants: DEFAULT_CONSTANTS,
          },
        ],
        jigs: [
          {
            id: 'jig-imported-custom',
            name: 'Imported Custom Jig',
            Dj: 14.2,
          },
        ],
        usbs: [
          {
            id: 'usb-imported-custom',
            name: 'Imported Custom USB',
            Ds: 12.8,
          },
        ],
      });

      const sections = {
        global: false,
        constants: true,
        wheels: false,
        sessionSteps: false,
        sessionPresets: false,
        heightMode: false,
      };
      const modes = {
        global: 'merge' as const,
        constants: 'merge' as const,
        wheels: 'merge' as const,
        sessionSteps: 'merge' as const,
        sessionPresets: 'merge' as const,
        heightMode: 'overwrite' as const,
      };

      importState(incomingWithHardware, sections, modes);

      // Machine was imported
      assert.ok(useStore.getState().machines.some((m) => m.id === 'm-imported'));

      // Check if jigs or usbs were imported
      const hasImportedJig = useStore.getState().jigs.some((j) => j.id === 'jig-imported-custom');
      const hasImportedUsb = useStore.getState().usbs.some((u) => u.id === 'usb-imported-custom');

      // Jigs and usbs are bundled under the "constants" section
      assert.strictEqual(
        hasImportedJig,
        true,
        'Expected store.ts importState to import custom jigs'
      );
      assert.strictEqual(
        hasImportedUsb,
        true,
        'Expected store.ts importState to import custom usbs'
      );
    });
  });
});
