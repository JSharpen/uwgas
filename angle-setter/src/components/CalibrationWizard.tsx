import * as React from 'react';
import type {
  GlobalState,
  Wheel,
  MachineConfig,
  CalibrationMeasurement,
  CalibrationProfile,
  CalibrationDiagnostics,
} from '../types/core';
import { BTN } from '../ui/buttons';
import MiniSelect from './MiniSelect';
import { calibrateBase, estimateMaxAngleErrorDeg } from '../math/tormek';

import type { JigConfig, UsbConfig } from "../types/core";
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

  const [rearResult, setRearResult] = React.useState<{hc: number, o: number, diagnostics: CalibrationDiagnostics, angleErrorDeg: number | null} | null>(null);
  const [frontResult, setFrontResult] = React.useState<{hc: number, o: number, diagnostics: CalibrationDiagnostics, angleErrorDeg: number | null} | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const startMeasuring = () => {
    if (!calibName.trim()) {
      alert("Please provide a name for this calibration.");
      return;
    }
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
        setErrorMsg("Failed to calibrate rear base. Check inputs.");
        return;
      }
    }
    if (scope === 'both' || scope === 'front') {
      fRes = calibrateBase(frontRows, calibDa, calibDs);
      if (!fRes) {
        setErrorMsg("Failed to calibrate front base. Check inputs.");
        return;
      }
    }
    
    // Estimate angle errors
    let rAngleError = null;
    let fAngleError = null;
    
    if (rRes) {
      const dummyMachine: MachineConfig = { ...activeMachine, constants: { ...activeMachine.constants, rear: { hc: rRes.hc, o: rRes.o } } };
      rAngleError = estimateMaxAngleErrorDeg(rRes.diagnostics, 'rear', global, dummyMachine, wheels, jigs, usbs);
    }
    if (fRes) {
      const dummyMachine: MachineConfig = { ...activeMachine, constants: { ...activeMachine.constants, front: { hc: fRes.hc, o: fRes.o } } };
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

  const renderDiagnostic = (a: number | null) => {
    if (a == null) return <span className="text-neutral-400">Not available</span>;
    let label = '';
    let cls = '';
    if (a <= 0.05) { label = 'Excellent'; cls = 'text-accent'; }
    else if (a <= 0.1) { label = 'Good'; cls = 'text-accent-soft'; }
    else if (a <= 0.2) { label = 'Fair'; cls = 'text-warning'; }
    else { label = 'Poor'; cls = 'text-danger'; }
    return <span className={cls}>Max error ≈ {a.toFixed(3)}° ({label})</span>;
  };

  return (
    <section className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 h-full p-4 md:p-6 u-surface rounded shadow">
      <div className="flex items-center justify-between border-b u-border pb-2">
        <h2 className="text-lg font-semibold u-text">Calibrate {activeMachine.name}</h2>
        <button type="button" className="text-xs text-neutral-400 hover:text-neutral-200" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {step === 'intro' && (
        <div className="flex flex-col gap-4 max-w-sm">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold u-text">Calibration Name</span>
            <input
              type="text"
              className="input-base w-full"
              value={calibName}
              onChange={e => setCalibName(e.target.value)}
              placeholder="e.g. Original Setup 2026"
            />
          </label>
          
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold u-text">Scope</span>
            <MiniSelect
              value={scope}
              options={[
                { value: 'both', label: 'Both Bases (Recommended)' },
                { value: 'rear', label: 'Rear Only' },
                { value: 'front', label: 'Front Only' },
              ]}
              onChange={val => setScope(val as Scope)}
              widthClass="w-full"
            />
          </label>
          
          <details className="text-xs text-neutral-400 mt-2">
            <summary className="cursor-pointer hover:text-neutral-200">Advanced Settings</summary>
            <div className="flex flex-col gap-3 mt-3 p-3 bg-neutral-900 rounded border u-border">
              <label className="flex flex-col gap-1">
                <span>Measurements per base</span>
                <MiniSelect
                  value={String(calibCount)}
                  options={[
                    { value: '3', label: '3 (fast)' },
                    { value: '4', label: '4 (recommended)' },
                    { value: '5', label: '5 (most robust)' },
                  ]}
                  onChange={val => setCalibCount(parseInt(val, 10))}
                  widthClass="w-full"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span>Axle Dₐ (mm)</span>
                  <input type="number" className="input-base px-2 py-1" value={calibDa} onChange={e => setCalibDa(Number(e.target.value) || calibDa)} />
                </label>
                <label className="flex flex-col gap-1">
                  <span>USB Dₛ (mm)</span>
                  <input type="number" className="input-base px-2 py-1" value={calibDs} onChange={e => setCalibDs(Number(e.target.value) || calibDs)} />
                </label>
              </div>
            </div>
          </details>
          
          <div className="mt-4 flex justify-end">
            <button type="button" className={BTN.primary} onClick={startMeasuring}>
              Start Measurements
            </button>
          </div>
        </div>
      )}

      {step === 'measuring' && (
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="text-sm font-semibold u-text flex justify-between">
            <span>Measurement {measIndex + 1} of {calibCount}</span>
          </div>
          
          <div className="p-3 bg-neutral-900 border border-primary/30 rounded text-xs text-neutral-300">
            Set your USB to a <strong>{measIndex === 0 ? 'low' : measIndex === calibCount - 1 ? 'high' : 'medium'}</strong> height and lock the nut.
            {(scope === 'both') && " Measure the Rear base first, then move the USB to the Front base without adjusting the nut."}
          </div>
          
          {(scope === 'both' || scope === 'rear') && (
            <div className="card-elevated p-3 flex flex-col gap-2 border-l-2 border-l-blue-500">
              <h3 className="text-sm font-semibold text-blue-400">Rear Base</h3>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-neutral-400">hₙ (Casing to USB top)</span>
                  <input type="number" className="input-base" placeholder="mm" value={rearRows[measIndex]?.hn} onChange={e => updateRear('hn', e.target.value)} />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-neutral-400">CAₒ (Axle to USB top)</span>
                  <input type="number" className="input-base" placeholder="mm" value={rearRows[measIndex]?.CAo} onChange={e => updateRear('CAo', e.target.value)} />
                </label>
              </div>
            </div>
          )}

          {(scope === 'both' || scope === 'front') && (
            <div className="card-elevated p-3 flex flex-col gap-2 border-l-2 border-l-emerald-500">
              <h3 className="text-sm font-semibold text-emerald-400">Front Base</h3>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-neutral-400">hₙ (Casing to USB top)</span>
                  <input type="number" className="input-base" placeholder="mm" value={frontRows[measIndex]?.hn} onChange={e => updateFront('hn', e.target.value)} />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-neutral-400">CAₒ (Axle to USB top)</span>
                  <input type="number" className="input-base" placeholder="mm" value={frontRows[measIndex]?.CAo} onChange={e => updateFront('CAo', e.target.value)} />
                </label>
              </div>
            </div>
          )}
          
          {errorMsg && <div className="text-danger text-xs">{errorMsg}</div>}

          <div className="flex justify-between mt-4">
            <button type="button" className={BTN.ghost} onClick={prevMeasurement}>
              Back
            </button>
            <button type="button" className={BTN.primary} onClick={nextMeasurement}>
              {measIndex < calibCount - 1 ? 'Next Height' : 'Compute Results'}
            </button>
          </div>
        </div>
      )}

      {step === 'results' && (
        <div className="flex flex-col gap-4 max-w-sm">
          <h3 className="text-sm font-semibold u-text">Calibration Results</h3>
          
          {rearResult && (
            <div className="card-elevated p-3 flex flex-col gap-1 border-l-2 border-l-blue-500 text-xs">
              <span className="font-semibold text-blue-400">Rear Base</span>
              <span className="font-mono mt-1">hc = {rearResult.hc.toFixed(3)}, o = {rearResult.o.toFixed(3)}</span>
              <span className="text-neutral-400 mt-1">Max Residual: {rearResult.diagnostics.maxAbsResidualMm.toFixed(3)} mm</span>
              {renderDiagnostic(rearResult.angleErrorDeg)}
            </div>
          )}
          
          {frontResult && (
            <div className="card-elevated p-3 flex flex-col gap-1 border-l-2 border-l-emerald-500 text-xs">
              <span className="font-semibold text-emerald-400">Front Base</span>
              <span className="font-mono mt-1">hc = {frontResult.hc.toFixed(3)}, o = {frontResult.o.toFixed(3)}</span>
              <span className="text-neutral-400 mt-1">Max Residual: {frontResult.diagnostics.maxAbsResidualMm.toFixed(3)} mm</span>
              {renderDiagnostic(frontResult.angleErrorDeg)}
            </div>
          )}
          
          <div className="flex justify-between mt-4">
            <button type="button" className={BTN.ghost} onClick={() => setStep('measuring')}>
              Back
            </button>
            <button type="button" className={BTN.primary} onClick={handleSave}>
              Save &amp; Apply
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
