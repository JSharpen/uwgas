/**
 * Tier 2: Application Calculation Service
 *
 * Bridges the pure math engine core (Tier 1) with application domain state:
 * - Performs entity lookups (wheels, machines, usbs, jigs)
 * - Formats orientation presentation labels
 * - Computes jig stop-collar turns based on thread pitch
 * - Chains unadjusted carryover angles across progression steps
 * - Provides useWheelResults() hook subscribing to Zustand store
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../state/store';
import {
  computeTonHeights,
  computeRequiredProjection,
  computeSuggestedFrontUsbHeight,
  solveBetaForFixedSetup,
  computeMaxAngleErrorFromResiduals,
} from '../math/tormek';
import type {
  BaseSide,
  FixedUsbReference,
  ReadonlyTonInput,
} from '../math/types';
import type {
  CalibrationDiagnostics,
  GlobalState,
  JigConfig,
  MachineConfig,
  SessionStep,
  UsbConfig,
  Wheel,
  WheelResult,
} from '../types/core';
import { _nz } from '../utils/numbers';

export function computeWheelResults(
  wheels: Wheel[],
  sessionSteps: SessionStep[] | null,
  global: GlobalState,
  machines: MachineConfig[],
  jigs: JigConfig[],
  usbs: UsbConfig[],
  defaultMachineId?: string
): WheelResult[] {
  const activeJig = jigs.find((j) => j.id === global.activeJigId) || jigs[0];
  const Dj = _nz(activeJig?.Dj ?? 12);
  const A =
    global.useProtrusionMode && activeJig?.length && global.protrusion !== undefined
      ? activeJig.length + _nz(global.protrusion)
      : _nz(global.projection);
  const activeGlobalUsb = usbs.find((u) => u.id === global.activeUsbId) || usbs[0];
  const globalDs = _nz(activeGlobalUsb?.Ds ?? 12);
  const beta = _nz(global.targetAngle);
  const isProjectionMode = global.calcMode === 'projection';
  const fixedUsbMode: FixedUsbReference = global.fixedUsbMode === 'hr' ? 'hr' : 'hn';
  const rearFixedHeight = _nz(global.fixedUsbRear, _nz(global.fixedUsbHeight, 150.0));

  const items: { step?: SessionStep; wheel: Wheel }[] = [];

  if (sessionSteps && sessionSteps.length) {
    for (const step of sessionSteps) {
      const w = wheels.find((wh) => wh.id === step.wheelId);
      if (!w) continue;
      items.push({ step, wheel: w });
    }
  } else {
    // No progression -> no wheel results
    return [];
  }

  const results: WheelResult[] = [];
  for (let i = 0; i < items.length; i++) {
    const { step, wheel } = items[i];
    const machineId = step?.machineId || defaultMachineId;
    const machine = machines.find((m) => m.id === machineId) || machines[0];
    if (!machine) continue; // fallback

    const stepUsb = usbs.find((u) => u.id === step?.usbId);
    const Ds = stepUsb ? _nz(stepUsb.Ds) : globalDs;
    const suggestedFrontHeight = computeSuggestedFrontUsbHeight(
      rearFixedHeight,
      machine.constants,
      Ds,
      fixedUsbMode
    );
    const frontFixedHeight = global.useCustomFrontUsb
      ? _nz(global.fixedUsbFront, suggestedFrontHeight)
      : suggestedFrontHeight;

    const baseForHn: BaseSide = wheel.isHoning
      ? 'front'
      : (step?.base ?? wheel.baseForHn);
    const angleOffset = _nz(step?.angleOffset ?? wheel.angleOffset);

    const orientationLabel =
      baseForHn === 'rear'
        ? 'Edge leading (rear base)'
        : 'Edge trailing (front base)';

    if (isProjectionMode) {
      const baseFixedHeight =
        baseForHn === 'rear' ? rearFixedHeight : frontFixedHeight;

      const projOutput = computeRequiredProjection({
        base: baseForHn,
        D: _nz(wheel.D),
        targetBetaDeg: beta,
        Dj,
        Ds,
        constants: machine.constants,
        fixedUsb: { mode: fixedUsbMode, value: baseFixedHeight },
        angleOffsetDeg: angleOffset,
      });

      if (!projOutput.isReachable || projOutput.A === null) {
        results.push({
          wheel,
          baseForHn,
          orientationLabel,
          betaEffDeg: beta + angleOffset,
          hrWheel: fixedUsbMode === 'hr' ? baseFixedHeight : 0,
          hnBase: fixedUsbMode === 'hn' ? baseFixedHeight : 0,
          requiredProjectionA: null,
          isReachable: false,
          step,
          unadjustedBetaDeg: null,
        });
        continue;
      }

      // Compute exact Ton heights corresponding to this solved projection
      const common: ReadonlyTonInput = {
        base: baseForHn,
        D: _nz(wheel.D),
        A: projOutput.A,
        betaDeg: beta,
        Dj,
        Ds,
        constants: machine.constants,
        angleOffsetDeg: angleOffset,
      };

      const hrRear = computeTonHeights({ ...common, base: 'rear' });
      const hBase = computeTonHeights(common);
      let requiredJigAdjustmentMm: number | null = null;
      let requiredJigTurns: number | null = null;
      if (
        global.useProtrusionMode &&
        global.protrusion !== undefined &&
        activeJig?.isAdjustableLength &&
        activeJig?.length
      ) {
        const requiredJigLength = projOutput.A - global.protrusion;
        requiredJigAdjustmentMm = requiredJigLength - activeJig.length;
        if (activeJig.threadPitch) {
          requiredJigTurns = requiredJigAdjustmentMm / activeJig.threadPitch;
        }
      }

      results.push({
        wheel,
        baseForHn,
        orientationLabel,
        betaEffDeg: hBase.betaEffDeg,
        hrWheel: hrRear.hr,
        hnBase: hBase.hn,
        requiredProjectionA: projOutput.A,
        isReachable: true,
        step,
        unadjustedBetaDeg: null,
        requiredJigAdjustmentMm,
        requiredJigTurns,
      });

      continue;
    }

    // Height mode (default)
    const common: ReadonlyTonInput = {
      base: baseForHn,
      D: _nz(wheel.D),
      A,
      betaDeg: beta,
      Dj,
      Ds,
      constants: machine.constants,
      angleOffsetDeg: angleOffset,
    };

    const hrRear = computeTonHeights({ ...common, base: 'rear' });
    const hBase = computeTonHeights(common);

    results.push({
      wheel,
      baseForHn,
      orientationLabel,
      betaEffDeg: hBase.betaEffDeg,
      hrWheel: hrRear.hr,
      hnBase: hBase.hn,
      requiredProjectionA: A,
      isReachable: true,
      step,
      unadjustedBetaDeg: null,
    });
  }

  // Calculate unadjusted carry-over angles across progression steps
  for (let i = 1; i < results.length; i++) {
    const curr = results[i];
    const prev = results[i - 1];
    if (curr.isReachable === false || prev.isReachable === false) continue;

    const prevA = prev.requiredProjectionA;
    if (prevA == null) continue;

    const machineId = curr.step?.machineId || defaultMachineId;
    const machine = machines.find((m) => m.id === machineId) || machines[0];
    if (!machine) continue;

    const currUsb = usbs.find((u) => u.id === curr.step?.usbId);
    const Ds = currUsb ? _nz(currUsb.Ds) : globalDs;
    const fixedUsbMode: FixedUsbReference = global.fixedUsbMode === 'hr' ? 'hr' : 'hn';

    if (global.calcMode === 'projection') {
      const baseFixedHeight = fixedUsbMode === 'hr' ? curr.hrWheel : curr.hnBase;
      const unadj = solveBetaForFixedSetup(
        curr.baseForHn,
        _nz(curr.wheel.D),
        prevA,
        Dj,
        Ds,
        machine.constants,
        baseFixedHeight,
        fixedUsbMode
      );
      if (unadj != null) {
        curr.unadjustedBetaDeg = unadj + _nz(curr.step?.angleOffset ?? curr.wheel.angleOffset);
      }
    } else {
      const unadj = solveBetaForFixedSetup(
        curr.baseForHn,
        _nz(curr.wheel.D),
        _nz(global.projection),
        Dj,
        Ds,
        machine.constants,
        fixedUsbMode === 'hn' ? prev.hnBase : prev.hrWheel,
        fixedUsbMode
      );
      if (unadj != null) {
        curr.unadjustedBetaDeg = unadj + _nz(curr.step?.angleOffset ?? curr.wheel.angleOffset);
      }
    }
  }

  return results;
}

/**
 * Estimate worst-case angle error (deg) implied by a height residual, over
 * the user's wheels, for a given base. Adapts UI domain models to pure math engine.
 */
export function estimateMaxAngleErrorDeg(
  diagnostics: CalibrationDiagnostics,
  base: BaseSide,
  global: GlobalState,
  machineLike: MachineConfig,
  wheels: Wheel[],
  jigs: JigConfig[],
  usbs: UsbConfig[]
): number | null {
  const maxRes = diagnostics.maxAbsResidualMm;
  if (!Number.isFinite(maxRes) || maxRes <= 0) return null;

  const activeJig = jigs.find((j) => j.id === global.activeJigId) || jigs[0];
  const Dj = _nz(activeJig?.Dj ?? 12);
  const A =
    global.useProtrusionMode && activeJig?.length && global.protrusion !== undefined
      ? activeJig.length + _nz(global.protrusion)
      : _nz(global.projection);
  const beta = _nz(global.targetAngle);
  const activeGlobalUsb = usbs.find((u) => u.id === global.activeUsbId) || usbs[0];
  const Ds = _nz(activeGlobalUsb?.Ds ?? 12);

  const candidateDs =
    wheels.length > 0 ? wheels.map((w) => _nz(w.D)) : [250, 215, 200];

  return computeMaxAngleErrorFromResiduals(
    maxRes,
    base,
    candidateDs,
    A,
    beta,
    Dj,
    Ds,
    machineLike.constants
  );
}

/**
 * React hook subscribing to Zustand store and computing WheelResult[]
 * with fine-grained shallow equality to prevent re-render storms.
 */
export function useWheelResults(): WheelResult[] {
  const {
    wheels,
    sessionSteps,
    global,
    machines,
    jigs,
    usbs,
    defaultMachineId,
  } = useStore(
    useShallow((state) => ({
      wheels: state.wheels,
      sessionSteps: state.sessionSteps,
      global: state.global,
      machines: state.machines,
      jigs: state.jigs,
      usbs: state.usbs,
      defaultMachineId: state.defaultMachineId,
    }))
  );

  return useMemo(
    () =>
      computeWheelResults(
        wheels,
        sessionSteps,
        global,
        machines,
        jigs,
        usbs,
        defaultMachineId
      ),
    [wheels, sessionSteps, global, machines, jigs, usbs, defaultMachineId]
  );
}
