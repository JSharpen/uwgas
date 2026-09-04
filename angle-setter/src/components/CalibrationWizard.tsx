import * as React from 'react';
import type {
  GlobalState,
  Wheel,
  MachineConfig,
  CalibrationMeasurement,
  CalibrationProfile,
  CalibrationDiagnostics,
  JigConfig,
  UsbConfig,
} from '../types/core';
import { IconClose } from '../icons';
import MiniSelect from './MiniSelect';
import { calibrateBase, estimateMaxAngleErrorDeg } from '../math/tormek';

type CalibrationWizardProps = {
  jigs: JigConfig[];
  usbs: UsbConfig[];
  global: GlobalState;
  activeMachine: MachineConfig;
  wheels: Wheel[];
  onSaveProfile: (profile: CalibrationProfile) => void;
  onCancel: () => void;
};

type WizardStep = 'intro' | 'measuring' | 'results';
type Scope = 'both' | 'rear' | 'front';

export default function CalibrationWizard({
  global,
  activeMachine,
  wheels,
  onSaveProfile,
  onCancel,
  jigs,
  usbs,
}: CalibrationWizardProps) {
  const [step, setStep] = React.useState<WizardStep>('intro');
  const [scope, setScope] = React.useState<Scope>('both');
  const [calibName, setCalibName] = React.useState('');
  const [calibCount, setCalibCount] = React.useState(4);
  const [calibDa, setCalibDa] = React.useState(12);
  const [calibDs, setCalibDs] = React.useState(usbs.find(u => u.id === global.activeUsbId)?.Ds ?? 12);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const [measIndex, setMeasIndex] = React.useState(0);

  const [rearRows, setRearRows] = React.useState<CalibrationMeasurement[]>(
    Array(4).fill({ hn: '', CAo: '' })
  );
  const [frontRows, setFrontRows] = React.useState<CalibrationMeasurement[]>(
    Array(4).fill({ hn: '', CAo: '' })
  );

  React.useEffect(() => {
    if (rearRows.length !== calibCount) {
      setRearRows(Array(calibCount).fill({ hn: '', CAo: '' }));
      setFrontRows(Array(calibCount).fill({ hn: '', CAo: '' }));
    }
  }, [calibCount, rearRows.length]);

  const [rearResult, setRearResult] = React.useState<{
    hc: number;
    o: number;
    diagnostics: CalibrationDiagnostics;
    angleErrorDeg: number | null;
  } | null>(null);
  const [frontResult, setFrontResult] = React.useState<{
    hc: number;
    o: number;
    diagnostics: CalibrationDiagnostics;
    angleErrorDeg: number | null;
  } | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const startMeasuring = () => {
    if (!calibName.trim()) {
      setValidationError('Please provide a name for this calibration profile.');
      return;
    }
    setValidationError(null);
    setStep('measuring');
    setMeasIndex(0);
  };

  const nextMeasurement = () => {
    if (measIndex < calibCount - 1) {
      setMeasIndex(measIndex + 1);
    } else {
      computeResults();
    }
  };

  const prevMeasurement = () => {
    if (measIndex > 0) {
      setMeasIndex(measIndex - 1);
    } else {
      setStep('intro');
    }
  };

  const computeResults = () => {
    setErrorMsg(null);
    let rRes = null;
    let fRes = null;

    if (scope === 'both' || scope === 'rear') {
      rRes = calibrateBase(rearRows, calibDa, calibDs);
      if (!rRes) {
        setErrorMsg('Failed to calibrate rear base. Check your height and axle measurements.');
        return;
      }
    }
    if (scope === 'both' || scope === 'front') {
      fRes = calibrateBase(frontRows, calibDa, calibDs);
      if (!fRes) {
        setErrorMsg('Failed to calibrate front base. Check your height and axle measurements.');
        return;
      }
    }

    // Estimate angle errors
    let rAngleError = null;
    let fAngleError = null;

    if (rRes) {
      const dummyMachine: MachineConfig = {
        ...activeMachine,
        constants: { ...activeMachine.constants, rear: { hc: rRes.hc, o: rRes.o } },
      };
      rAngleError = estimateMaxAngleErrorDeg(rRes.diagnostics, 'rear', global, dummyMachine, wheels, jigs, usbs);
    }
    if (fRes) {
      const dummyMachine: MachineConfig = {
        ...activeMachine,
        constants: { ...activeMachine.constants, front: { hc: fRes.hc, o: fRes.o } },
      };
      fAngleError = estimateMaxAngleErrorDeg(fRes.diagnostics, 'front', global, dummyMachine, wheels, jigs, usbs);
    }

    if (rRes) setRearResult({ hc: rRes.hc, o: rRes.o, diagnostics: rRes.diagnostics, angleErrorDeg: rAngleError });
    if (fRes) setFrontResult({ hc: fRes.hc, o: fRes.o, diagnostics: fRes.diagnostics, angleErrorDeg: fAngleError });

    setStep('results');
  };

  const updateRear = (field: 'hn' | 'CAo', val: string) => {
    setRearRows(prev => {
      const next = [...prev];
      next[measIndex] = { ...next[measIndex], [field]: val };
      return next;
    });
  };

  const updateFront = (field: 'hn' | 'CAo', val: string) => {
    setFrontRows(prev => {
      const next = [...prev];
      next[measIndex] = { ...next[measIndex], [field]: val };
      return next;
    });
  };

  const handleSave = () => {
    const profile: CalibrationProfile = {
      id: crypto.randomUUID(),
      name: calibName.trim(),
      createdAt: new Date().toISOString(),
      scope,
      Da: calibDa,
      Ds: calibDs,
    };

    if (rearResult) {
      profile.rear = {
        hc: rearResult.hc,
        o: rearResult.o,
        diagnostics: rearResult.diagnostics,
        angleErrorDeg: rearResult.angleErrorDeg,
        measurements: rearRows,
      };
    }

    if (frontResult) {
      profile.front = {
        hc: frontResult.hc,
        o: frontResult.o,
        diagnostics: frontResult.diagnostics,
        angleErrorDeg: frontResult.angleErrorDeg,
        measurements: frontRows,
      };
    }

    onSaveProfile(profile);
  };

  const renderDiagnosticBadge = (a: number | null) => {
    if (a == null) {
      return <span className="text-xs text-white/40 font-mono">Not available</span>;
    }
    let label = '';
    let badgeCls = '';
    if (a <= 0.05) {
      label = 'Excellent';
      badgeCls = 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
    } else if (a <= 0.1) {
      label = 'Good';
      badgeCls = 'bg-amber-500/20 border-amber-500/30 text-amber-400';
    } else if (a <= 0.2) {
      label = 'Fair';
      badgeCls = 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
    } else {
      label = 'Poor';
      badgeCls = 'bg-red-500/20 border-red-500/30 text-red-400';
    }
    return (
      <div className={`px-2.5 py-1 rounded-full border text-xs font-bold font-mono ${badgeCls} flex items-center gap-1.5`}>
        <span>Max Error ≈ {a.toFixed(3)}°</span>
        <span className="uppercase text-[10px] font-extrabold px-1.5 py-0.5 bg-black/40 rounded-full">{label}</span>
      </div>
    );
  };

  return (
    <section className="bg-[#262626] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 max-w-2xl mx-auto w-full relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Top Edge Highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Calibrate {activeMachine.name}
          </h2>
          <span className="text-xs text-white/50">
            Precision geometry solver for horizontal base offset and vertical datum
          </span>
        </div>
        <button
          type="button"
          className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer"
          onClick={onCancel}
          aria-label="Cancel calibration"
        >
          <IconClose className="w-5 h-5" />
        </button>
      </div>

      {/* Step Indicator Pills */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        {/* Step 1 */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all ${
            step === 'intro'
              ? 'bg-black/40 border-neutral-800 text-white shadow-sm'
              : 'bg-black/20 border-white/5 text-white/40'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
              step === 'intro' ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/60'
            }`}
          >
            1
          </span>
          <span>Setup</span>
        </div>

        <div className="h-px w-3 bg-white/10 shrink-0" />

        {/* Step 2 */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all ${
            step === 'measuring'
              ? 'bg-black/40 border-neutral-800 text-white shadow-sm'
              : 'bg-black/20 border-white/5 text-white/40'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
              step === 'measuring' ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/60'
            }`}
          >
            2
          </span>
          <span>
            {step === 'measuring' ? `Measure (${measIndex + 1}/${calibCount})` : 'Measure'}
          </span>
        </div>

        <div className="h-px w-3 bg-white/10 shrink-0" />

        {/* Step 3 */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all ${
            step === 'results'
              ? 'bg-black/40 border-neutral-800 text-white shadow-sm'
              : 'bg-black/20 border-white/5 text-white/40'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
              step === 'results' ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/60'
            }`}
          >
            3
          </span>
          <span>Results</span>
        </div>
      </div>

      {/* Step 1: Intro / Setup */}
      {step === 'intro' && (
        <div className="relative z-10 flex flex-col gap-5 w-full">
          {/* Profile Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
              Calibration Profile Name
            </label>
            <input
              type="text"
              className="h-12 bg-black/30 border border-white/10 focus:border-amber-400/60 rounded-2xl px-4 text-base font-semibold text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition w-full"
              value={calibName}
              onChange={e => {
                setCalibName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. Workshop Precision Mapping 2026"
            />
          </div>

          {/* Scope Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
              Calibration Scope
            </label>
            <MiniSelect
              value={scope}
              options={[
                { value: 'both', label: 'Both Bases (Recommended: Rear + Front)' },
                { value: 'rear', label: 'Rear Base Only (Edge Leading)' },
                { value: 'front', label: 'Front Base Only (Edge Trailing)' },
              ]}
              onChange={val => setScope(val as Scope)}
              widthClass="w-full"
            />
          </div>

          {/* Advanced Settings */}
          <details className="group bg-black/20 border border-white/5 rounded-2xl p-4 transition-all">
            <summary className="text-xs font-bold text-white/70 hover:text-white cursor-pointer select-none flex items-center justify-between">
              <span>Advanced Geometry Parameters</span>
              <span className="text-xs text-white/40 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
                  Measurements per base
                </label>
                <MiniSelect
                  value={String(calibCount)}
                  options={[
                    { value: '3', label: '3 Measurements (Fastest)' },
                    { value: '4', label: '4 Measurements (Recommended / High Accuracy)' },
                    { value: '5', label: '5 Measurements (Maximum Precision)' },
                  ]}
                  onChange={val => setCalibCount(parseInt(val, 10))}
                  widthClass="w-full"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
                    Axle Diameter (Dₐ mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="h-11 bg-black/30 border border-white/10 focus:border-amber-400/60 rounded-xl px-3 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                    value={calibDa}
                    onChange={e => setCalibDa(Number(e.target.value) || calibDa)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
                    USB Bar Diameter (Dₛ mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="h-11 bg-black/30 border border-white/10 focus:border-amber-400/60 rounded-xl px-3 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                    value={calibDs}
                    onChange={e => setCalibDs(Number(e.target.value) || calibDs)}
                  />
                </div>
              </div>
            </div>
          </details>

          {validationError && (
            <div className="p-3.5 bg-amber-400/10 border border-amber-400/30 rounded-2xl text-xs text-amber-300 font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* Footer CTA */}
          <div className="flex justify-end pt-3 border-t border-white/5">
            <button
              type="button"
              className="h-12 px-7 rounded-2xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-950/30 transition flex items-center justify-center cursor-pointer"
              onClick={startMeasuring}
            >
              Start Measurements →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Measuring */}
      {step === 'measuring' && (
        <div className="relative z-10 flex flex-col gap-5 w-full">
          {/* Instructions Banner */}
          <div className="p-4 bg-black/40 border border-amber-400/20 rounded-2xl text-xs text-white/90 leading-relaxed flex flex-col gap-1">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
              Calibration Procedure:
            </span>
            <p>
              Set your USB bar to a{' '}
              <strong className="text-white underline decoration-amber-400">
                {measIndex === 0 ? 'low' : measIndex === calibCount - 1 ? 'high' : 'medium'}
              </strong>{' '}
              height and lock the micro-adjust collar nut firmly.
              {scope === 'both' &&
                ' Measure the Rear base first, then transfer the USB to the Front base without altering the collar height.'}
            </p>
          </div>

          {/* Rear Base Card */}
          {(scope === 'both' || scope === 'rear') && (
            <div className="bg-black/25 border border-white/5 border-l-4 border-l-blue-500 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-400 tracking-wide flex items-center gap-2">
                  <span>Rear Base</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-semibold uppercase">
                    Edge Leading
                  </span>
                </h3>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">
                  POINT #{measIndex + 1}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
                    hₙ (Casing Datum to USB Top)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="h-12 bg-black/30 border border-white/10 focus:border-blue-400/60 rounded-xl px-4 text-base font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition w-full"
                      placeholder="mm"
                      value={rearRows[measIndex]?.hn}
                      onChange={e => updateRear('hn', e.target.value)}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-white/40 pointer-events-none">
                      mm
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
                    CAₒ (Axle Top to USB Top)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="h-12 bg-black/30 border border-white/10 focus:border-blue-400/60 rounded-xl px-4 text-base font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition w-full"
                      placeholder="mm"
                      value={rearRows[measIndex]?.CAo}
                      onChange={e => updateRear('CAo', e.target.value)}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-white/40 pointer-events-none">
                      mm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Front Base Card */}
          {(scope === 'both' || scope === 'front') && (
            <div className="bg-black/25 border border-white/5 border-l-4 border-l-emerald-500 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-400 tracking-wide flex items-center gap-2">
                  <span>Front Base</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold uppercase">
                    Edge Trailing
                  </span>
                </h3>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">
                  POINT #{measIndex + 1}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
                    hₙ (Casing Datum to USB Top)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="h-12 bg-black/30 border border-white/10 focus:border-emerald-400/60 rounded-xl px-4 text-base font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition w-full"
                      placeholder="mm"
                      value={frontRows[measIndex]?.hn}
                      onChange={e => updateFront('hn', e.target.value)}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-white/40 pointer-events-none">
                      mm
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
                    CAₒ (Axle Top to USB Top)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="h-12 bg-black/30 border border-white/10 focus:border-emerald-400/60 rounded-xl px-4 text-base font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition w-full"
                      placeholder="mm"
                      value={frontRows[measIndex]?.CAo}
                      onChange={e => updateFront('CAo', e.target.value)}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-white/40 pointer-events-none">
                      mm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <button
              type="button"
              className="h-12 px-5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold text-sm transition flex items-center justify-center cursor-pointer"
              onClick={prevMeasurement}
            >
              ← Back
            </button>
            <button
              type="button"
              className="h-12 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-950/30 transition flex items-center justify-center cursor-pointer"
              onClick={nextMeasurement}
            >
              {measIndex < calibCount - 1 ? 'Next Height →' : 'Compute Calibration →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 'results' && (
        <div className="relative z-10 flex flex-col gap-6 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">Calculated Machine Constants</h3>
            <span className="text-xs font-mono text-white/50">{calibName}</span>
          </div>

          {/* Rear Base Result Card */}
          {rearResult && (
            <div className="bg-black/25 border border-white/5 border-l-4 border-l-blue-500 rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-blue-400">Rear Base Geometry</h4>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-bold uppercase">
                    Edge Leading
                  </span>
                </div>
                {renderDiagnosticBadge(rearResult.angleErrorDeg)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    Vertical Datum Constant (h_c)
                  </span>
                  <div className="flex items-baseline mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tighter">
                      {rearResult.hc.toFixed(3)}
                    </span>
                    <span className="text-sm font-medium text-white/50 ml-1.5 font-mono">mm</span>
                  </div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    Horizontal Offset (o)
                  </span>
                  <div className="flex items-baseline mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tighter">
                      {rearResult.o.toFixed(3)}
                    </span>
                    <span className="text-sm font-medium text-white/50 ml-1.5 font-mono">mm</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/50 font-mono pt-1 px-1">
                <span>
                  Max Residual (ε):{' '}
                  <strong className="text-white">{rearResult.diagnostics.maxAbsResidualMm.toFixed(3)} mm</strong>
                </span>
                <span>
                  Fit Sample: <strong className="text-white">{calibCount} pts</strong>
                </span>
              </div>
            </div>
          )}

          {/* Front Base Result Card */}
          {frontResult && (
            <div className="bg-black/25 border border-white/5 border-l-4 border-l-emerald-500 rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-emerald-400">Front Base Geometry</h4>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold uppercase">
                    Edge Trailing
                  </span>
                </div>
                {renderDiagnosticBadge(frontResult.angleErrorDeg)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    Vertical Datum Constant (h_c)
                  </span>
                  <div className="flex items-baseline mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tighter">
                      {frontResult.hc.toFixed(3)}
                    </span>
                    <span className="text-sm font-medium text-white/50 ml-1.5 font-mono">mm</span>
                  </div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    Horizontal Offset (o)
                  </span>
                  <div className="flex items-baseline mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tighter">
                      {frontResult.o.toFixed(3)}
                    </span>
                    <span className="text-sm font-medium text-white/50 ml-1.5 font-mono">mm</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/50 font-mono pt-1 px-1">
                <span>
                  Max Residual (ε):{' '}
                  <strong className="text-white">{frontResult.diagnostics.maxAbsResidualMm.toFixed(3)} mm</strong>
                </span>
                <span>
                  Fit Sample: <strong className="text-white">{calibCount} pts</strong>
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <button
              type="button"
              className="h-12 px-5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold text-sm transition flex items-center justify-center cursor-pointer"
              onClick={() => setStep('measuring')}
            >
              ← Edit Measurements
            </button>
            <button
              type="button"
              className="h-12 px-7 rounded-2xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-950/30 transition flex items-center justify-center cursor-pointer"
              onClick={handleSave}
            >
              Save &amp; Apply Profile ✓
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

