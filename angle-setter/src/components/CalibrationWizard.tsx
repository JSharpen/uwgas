import * as React from 'react';
import MiniSelect from './MiniSelect';
import type {
  BaseSide,
  CalibrationDiagnostics,
  CalibrationMeasurement,
  CalibrationSnapshot,
  GlobalState,
  MachineConfig,
  MachineConstants,
  Wheel,
} from '../types/core';
import { calibrateBase, estimateMaxAngleErrorDeg } from '../math/tormek';
import { _nz } from '../utils/numbers';

type CalibrationResultState = {
  hc: number;
  o: number;
  diagnostics: CalibrationDiagnostics;
  angleErrorDeg: number | null;
  rowResiduals: { row: number; residual: number }[];
} | null;

type CalibrationWizardProps = {
  global: GlobalState;
  activeMachine: MachineConfig;
  wheels: Wheel[];
  calibBase: BaseSide | '';
  setCalibBase: React.Dispatch<React.SetStateAction<BaseSide | ''>>;
  calibName: string;
  setCalibName: React.Dispatch<React.SetStateAction<string>>;
  calibDa: number;
  setCalibDa: React.Dispatch<React.SetStateAction<number>>;
  calibDs: number;
  setCalibDs: React.Dispatch<React.SetStateAction<number>>;
  calibCount: number;
  setCalibCount: React.Dispatch<React.SetStateAction<number>>;
  calibRows: CalibrationMeasurement[];
  setCalibRows: React.Dispatch<React.SetStateAction<CalibrationMeasurement[]>>;
  calibResult: CalibrationResultState;
  setCalibResult: React.Dispatch<React.SetStateAction<CalibrationResultState>>;
  calibError: string | null;
  setCalibError: React.Dispatch<React.SetStateAction<string | null>>;
  calibSnapshots: CalibrationSnapshot[];
  setCalibSnapshots: React.Dispatch<React.SetStateAction<CalibrationSnapshot[]>>;
  onApplyCalibration: (base: BaseSide, snapshotId: string) => void;
};

function CalibrationWizard({
  global,
  activeMachine,
  wheels,
  calibBase,
  setCalibBase,
  calibName,
  setCalibName,
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
  calibSnapshots,
  setCalibSnapshots,
  onApplyCalibration,
}: CalibrationWizardProps) {
  const lastSnapshotIdRef = React.useRef<string | null>(null);

  const ensureCalibRowsLength = React.useCallback(
    (count: number) => {
      setCalibRows(prev => {
        const next = [...prev];
        while (next.length < count) {
          next.push({ hn: '', CAo: '' });
        }
        return next;
      });
    },
    [setCalibRows]
  );

  const validateInputs = React.useCallback(() => {
    const missing: string[] = [];
    const rowsToUse = Array.from({ length: calibCount }, (_, i) => calibRows[i] ?? { hn: '', CAo: '' });

    if (!calibBase) missing.push('Base selection');

    const DaVal = _nz(calibDa, NaN);
    const DsVal = _nz(calibDs, NaN);
    if (!Number.isFinite(DaVal) || DaVal <= 0) missing.push('Axle diameter');
    if (!Number.isFinite(DsVal) || DsVal <= 0) missing.push('USB diameter');

    let validRowCount = 0;
    rowsToUse.forEach((row, idx) => {
      const hnVal = _nz(row.hn, NaN);
      const CAoVal = _nz(row.CAo, NaN);
      const rowLabel = idx + 1;
      if (!Number.isFinite(hnVal)) missing.push(`Row ${rowLabel} h?`);
      if (!Number.isFinite(CAoVal)) missing.push(`Row ${rowLabel} CAo`);
      if (Number.isFinite(hnVal) && Number.isFinite(CAoVal)) validRowCount += 1;
    });

    if (validRowCount < 2) {
      missing.push('At least 2 complete measurement rows');
    }

    return { missing, rowsToUse, DaVal, DsVal };
  }, [calibBase, calibCount, calibDa, calibDs, calibRows]);

  const handleRunCalibration = React.useCallback(() => {
    setCalibError(null);
    setCalibResult(null);

    const { missing, rowsToUse, DaVal, DsVal } = validateInputs();
    if (missing.length > 0) {
      setCalibError(`Missing or invalid: ${missing.join(', ')}`);
      return;
    }

    const Da = DaVal || 12;
    const Ds = DsVal || global.usbDiameter;

    const result = calibrateBase(rowsToUse, Da, Ds);
    if (!result) {
      setCalibError('Need at least two valid hn + CAo rows with numeric values.');
      return;
    }

    // Map residuals back to original row indices used
    const rowResiduals: { row: number; residual: number }[] = [];
    let usedIdx = 0;
    rowsToUse.forEach((row, idx) => {
      const hnVal = _nz(row.hn, NaN);
      const CAoVal = _nz(row.CAo, NaN);
      if (!Number.isFinite(hnVal) || !Number.isFinite(CAoVal)) return;
      const residual = result.diagnostics.residuals[usedIdx];
      rowResiduals.push({ row: idx + 1, residual });
      usedIdx += 1;
    });

    const proposedConstants: MachineConstants = {
      ...activeMachine.constants,
      [calibBase as BaseSide]: {
        hc: result.hc,
        o: result.o,
      },
    } as MachineConstants;

    const machineLike: MachineConfig = {
      ...activeMachine,
      constants: proposedConstants,
    };

    const angleErr = estimateMaxAngleErrorDeg(
      result.diagnostics,
      calibBase as BaseSide,
      global,
      machineLike,
      wheels
    );

    const snapshot: CalibrationSnapshot = {
      id: `calib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      base: calibBase as BaseSide,
      baseTag: calibBase as BaseSide,
      name: calibName.trim(),
      hc: result.hc,
      o: result.o,
      measurements: rowsToUse,
      diagnostics: result.diagnostics,
      angleErrorDeg: angleErr,
      count: result.diagnostics.residuals.length,
      Da,
      Ds,
      createdAt: new Date().toISOString(),
    };

    lastSnapshotIdRef.current = snapshot.id;
    setCalibSnapshots(prev => [snapshot, ...prev]);

    setCalibResult({
      hc: result.hc,
      o: result.o,
      diagnostics: result.diagnostics,
      angleErrorDeg: angleErr,
      rowResiduals,
    });
  }, [
    activeMachine,
    calibBase,
    global,
    setCalibError,
    setCalibResult,
    setCalibSnapshots,
    validateInputs,
    wheels,
  ]);

  const handleApplyCalibration = React.useCallback(() => {
    if (!calibResult) return;
    if (!calibBase) return;
    if (calibResult.angleErrorDeg != null && calibResult.angleErrorDeg > 0.2) return;
    const fallback = calibSnapshots.find(s => s.base === calibBase)?.id || null;
    const snapshotId = lastSnapshotIdRef.current || fallback;
    if (!snapshotId) return;
    onApplyCalibration(calibBase as BaseSide, snapshotId);
  }, [calibBase, calibResult, calibSnapshots, onApplyCalibration]);

  const handleReset = React.useCallback(() => {
    const confirmMsg =
      'Start over? This will clear entered measurements, any result, and your base/name selection.';
    if (typeof window !== 'undefined' && !window.confirm(confirmMsg)) return;
    lastSnapshotIdRef.current = null;
    setCalibRows([]);
    setCalibResult(null);
    setCalibError(null);
    setCalibBase('');
    setCalibName('');
  }, [setCalibBase, setCalibError, setCalibName, setCalibResult, setCalibRows]);

  const hasDraft =
    Boolean(calibBase) ||
    Boolean(calibName.trim()) ||
    calibRows.some(r => (r?.hn ?? '') !== '' || (r?.CAo ?? '') !== '') ||
    calibResult != null ||
    calibError != null;

  const validation = validateInputs();
  const computeInvalid = validation.missing.length > 0;

  return (
    <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/30 flex flex-col gap-3 max-w-xl">
      <h2 className="text-sm font-semibold text-neutral-200">Calibration wizard (single base)</h2>
      <p className="text-xs text-neutral-300">
        Use this wizard to solve hc and o for one base. Pick the base, confirm axle/USB diameters,
        then take 3–5 paired measurements at different heights: h (datum to USB top) and CAo
        (outer-to-outer span from axle to USB—keep calipers square). Enter the pairs below; CA is
        computed automatically and the wizard reports the solved constants plus an angle-error
        estimate for your wheels.
      </p>

      {/* Base selection */}
      <div className="flex items-center gap-3 text-xs justify-end text-left">
        <span className="text-neutral-300">Base to calibrate:</span>
        <MiniSelect
          value={calibBase}
          options={[
            { value: '', label: 'Select base...' },
            { value: 'rear', label: 'Rear (edge leading)' },
            { value: 'front', label: 'Front (edge trailing)' },
          ]}
          onChange={val => {
            setCalibBase(val as BaseSide | '');
            // Clear any existing measurements/results when switching base
            setCalibRows([]);
            setCalibResult(null);
            setCalibError(null);
            ensureCalibRowsLength(calibCount);
          }}
          align="right"
          widthClass="w-40"
          menuWidthClass="w-40"
        />
      </div>

      <div className="flex items-center gap-3 text-xs justify-end text-left">
        <span className="text-neutral-300 whitespace-nowrap">Name (optional):</span>
        <input
          className="w-40 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs"
          value={calibName}
          onChange={e => setCalibName(e.target.value)}
          placeholder="e.g. New wheel setup"
        />
      </div>

      {/* Measurement count */}
      <div className="flex items-center gap-3 text-xs justify-end text-left">
        <span className="text-neutral-300 whitespace-nowrap">Measurements</span>
        <MiniSelect
          value={String(calibCount)}
          options={[
            { value: '3', label: '3 (fast)' },
            { value: '4', label: '4 (recommended)' },
            { value: '5', label: '5 (most robust)' },
          ]}
          onChange={val => {
            const next = parseInt(val, 10) || 4;
            setCalibCount(next);
            ensureCalibRowsLength(next);
          }}
          align="right"
          widthClass="w-40"
          menuWidthClass="w-40"
        />
      </div>

      {/* Diameters */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-neutral-300">
            Axle diameter Dₐ (mm)
            <span className="text-neutral-500 text-xs ml-1">(default 12)</span>
          </span>
          <input
            type="number"
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
            value={calibDa}
            onChange={e => setCalibDa(Number(e.target.value) || calibDa)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-neutral-300">
            USB diameter Dₛ (mm)
            <span className="text-neutral-500 text-xs ml-1">(prefilled, editable)</span>
          </span>
          <input
            type="number"
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
            value={calibDs}
            onChange={e => setCalibDs(Number(e.target.value) || calibDs)}
          />
        </label>
      </div>

      {/* Measurement table */}
      <div className="flex flex-col gap-1 text-xs">
        <div className="grid grid-cols-[1.5rem_repeat(3,minmax(0,1fr))] gap-1 font-mono text-[0.7rem] text-neutral-400 text-left items-center">
          <div>#</div>
          <div>hₙ (mm)</div>
          <div>CAo (mm)</div>
          <div>Residual</div>
        </div>
        {Array.from({ length: calibCount }, (_, i) => {
          const row = calibRows[i] ?? { hn: '', CAo: '' };
          const residualEntry = calibResult?.rowResiduals.find(r => r.row === i + 1);
          const abs = residualEntry ? Math.abs(residualEntry.residual) : null;
          let resClass = 'text-neutral-400';
          let badge = '';
          if (abs != null) {
            if (abs > 0.2) {
              resClass = 'text-red-400';
              badge = ' re-measure';
            } else if (abs > 0.1) {
              resClass = 'text-amber-300';
              badge = ' check';
            } else {
              resClass = 'text-emerald-300';
            }
          }
          return (
            <div key={i} className="grid grid-cols-[1.5rem_repeat(3,minmax(0,1fr))] gap-1 items-center text-[0.75rem]">
              <div className="text-neutral-500">{i + 1}</div>
              <input
                type="number"
                className="w-20 rounded border border-neutral-700 bg-neutral-950 px-1 py-0.5 text-right"
                value={row.hn}
                onChange={e =>
                  setCalibRows(prev => {
                    const next = [...prev];
                    while (next.length <= i) {
                      next.push({ hn: '', CAo: '' });
                    }
                    next[i] = { ...next[i], hn: e.target.value };
                    return next;
                  })
                }
              />
              <input
                type="number"
                className="w-20 rounded border border-neutral-700 bg-neutral-950 px-1 py-0.5 text-right"
                value={row.CAo}
                onChange={e =>
                  setCalibRows(prev => {
                    const next = [...prev];
                    while (next.length <= i) {
                      next.push({ hn: '', CAo: '' });
                    }
                    next[i] = { ...next[i], CAo: e.target.value };
                    return next;
                  })
                }
              />
              <div className={`text-[0.7rem] ${resClass}`}>
                {residualEntry ? `${residualEntry.residual.toFixed(3)} mm${badge}` : '—'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions and results */}
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              className={
                'px-2 py-1 rounded border transition-colors ' +
                (computeInvalid
                  ? 'border-neutral-700 bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'border-emerald-500 bg-emerald-900/40 text-emerald-50 hover:bg-emerald-900')
              }
              onClick={handleRunCalibration}
              aria-disabled={computeInvalid}
            >
              Compute hc &amp; o
            </button>
            {calibResult && (
              <button
                type="button"
                className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 disabled:opacity-40"
                disabled={
                  !calibBase ||
                  (calibResult.angleErrorDeg != null && calibResult.angleErrorDeg > 0.2)
                }
                onClick={handleApplyCalibration}
              >
                Apply to{' '}
                {calibBase === 'rear' ? 'rear base' : calibBase === 'front' ? 'front base' : 'base'}
              </button>
            )}
          </div>
          <button
            type="button"
            className="px-2 py-1 rounded border border-neutral-700 bg-neutral-950 hover:bg-neutral-900 text-neutral-200 disabled:opacity-40"
            onClick={handleReset}
            disabled={!hasDraft}
          >
            Start over
          </button>
        </div>

        {calibError && <div className="text-red-400 text-xs">Error: {calibError}</div>}

        {calibResult && (
          <div className="border border-neutral-700 rounded p-2 flex flex-col gap-1">
            <div className="text-neutral-200">
              Proposed constants for {calibBase === 'rear' ? 'rear' : 'front'} base:
            </div>
            <div className="font-mono text-[0.8rem]">
              hc = {calibResult.hc.toFixed(3)} mm, o = {calibResult.o.toFixed(3)} mm
            </div>
            <div className="text-neutral-300 text-[0.75rem]">
              Max |residual| in hₙ: {calibResult.diagnostics.maxAbsResidualMm.toFixed(3)} mm
            </div>
            <div className="text-[0.75rem]">
              {(() => {
                const a = calibResult.angleErrorDeg;
                if (a == null) {
                  return (
                    <span className="text-neutral-400">
                      Angle error estimate not available (derivative too small).
                    </span>
                  );
                }
                let label = '';
                let cls = '';
                if (a <= 0.05) {
                  label = 'Excellent';
                  cls = 'text-emerald-300';
                } else if (a <= 0.1) {
                  label = 'Good';
                  cls = 'text-emerald-200';
                } else if (a <= 0.2) {
                  label = 'Fair';
                  cls = 'text-amber-300';
                } else {
                  label = 'Poor';
                  cls = 'text-red-400';
                }
                return (
                  <span className={cls}>
                    Estimated worst-case angle error over your wheels ≈ {a.toFixed(3)}° ({label}).{' '}
                    If &gt; 0.10°, consider re-measuring.
                  </span>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CalibrationWizard;
