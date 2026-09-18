import * as React from 'react';
import { generateId } from "../utils/id";
import type {
  MachineConfig,
  CalibrationMeasurement,
  CalibrationProfile,
  CalibrationDiagnostics,
} from '../types/core';
import MiniSelect from './MiniSelect';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../state/uiStore';
import { useStore } from '../state/store';
import { calibrateBase, calibrateBaseTrueLeastSquares } from '../math/tormek';
import { estimateMaxAngleErrorDeg } from '../services/calculationService';

type CalibrationWizardProps = {
  activeMachine: MachineConfig;
  onSaveProfile: (profile: CalibrationProfile) => void;
  
};

type Scope = 'both' | 'rear' | 'front';
type SolverOutput = {
  hc: number;
  o: number;
  diagnostics: CalibrationDiagnostics;
  angleErrorDeg: number | null;
};


export default function CalibrationWizard({
  activeMachine,
  onSaveProfile,
}: CalibrationWizardProps) {
  const global = useStore((s) => s.global);
  const wheels = useStore(useShallow((s) => s.wheels));
  const usbs = useStore(useShallow((s) => s.usbs));
    const jigs = useStore(useShallow((s) => s.jigs));
  const step = useUIStore(s => s.calibrationStep);
  const setStep = useUIStore(s => s.setCalibrationStep);
  const [scope, setScope] = React.useState<Scope>('both');
  const [calibName, setCalibName] = React.useState(`${activeMachine.name} - ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`);
  const calibCount = 5;
  const [selectedUsbId, setSelectedUsbId] = React.useState(global.activeUsbId);
  const calibDa = activeMachine.axleDiameter ?? 12;
  const calibDs = usbs.find(u => u.id === selectedUsbId)?.Ds ?? 12;
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const [measIndex, setMeasIndex] = React.useState(0);

  const [rearRows, setRearRows] = React.useState<CalibrationMeasurement[]>(
    Array(5).fill({ hn: '', CAo: '' })
  );
  const [frontRows, setFrontRows] = React.useState<CalibrationMeasurement[]>(
    Array(5).fill({ hn: '', CAo: '' })
  );

  React.useEffect(() => {
    if (rearRows.length !== calibCount) {
      setRearRows(Array(calibCount).fill({ hn: '', CAo: '' }));
      setFrontRows(Array(calibCount).fill({ hn: '', CAo: '' }));
    }
  }, [calibCount, rearRows.length]);

  const [solverMode, setSolverMode] = React.useState<'least-squares' | 'legacy'>('least-squares');
  const [rearResult, setRearResult] = React.useState<{ legacy: SolverOutput | null; ls: SolverOutput | null }>({ legacy: null, ls: null });
  
  const [frontResult, setFrontResult] = React.useState<{ legacy: SolverOutput | null; ls: SolverOutput | null }>({ legacy: null, ls: null });
  
  const [isIntroExpanded, setIsIntroExpanded] = React.useState(false);
  const [isGuideExpanded, setIsGuideExpanded] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const computeResults = React.useCallback(() => {
    setErrorMsg(null);
    
    let rResLeg = null;
    let rResLS = null;
    let fResLeg = null;
    let fResLS = null;

    if (scope === 'both' || scope === 'rear') {
      rResLeg = calibrateBase(rearRows, calibDa, calibDs);
      rResLS = calibrateBaseTrueLeastSquares(rearRows, calibDa, calibDs);
      if (!rResLeg || !rResLS) {
        setErrorMsg('Failed to calibrate rear base. Check your height and axle measurements.');
        return;
      }
    }
    
    if (scope === 'both' || scope === 'front') {
      fResLeg = calibrateBase(frontRows, calibDa, calibDs);
      fResLS = calibrateBaseTrueLeastSquares(frontRows, calibDa, calibDs);
      if (!fResLeg || !fResLS) {
        setErrorMsg('Failed to calibrate front base. Check your height and axle measurements.');
        return;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calcError = (res: any, side: 'rear' | 'front') => {
      if (!res) return null;
      const dummyMachine: MachineConfig = {
        ...activeMachine,
        constants: { ...activeMachine.constants, [side]: { hc: res.hc, o: res.o } },
      };
      return estimateMaxAngleErrorDeg(res.diagnostics, side, global, dummyMachine, wheels, jigs, usbs);
    };

    setRearResult({
      legacy: rResLeg ? { hc: rResLeg.hc, o: rResLeg.o, diagnostics: rResLeg.diagnostics, angleErrorDeg: calcError(rResLeg, 'rear') } : null,
      ls: rResLS ? { hc: rResLS.hc, o: rResLS.o, diagnostics: rResLS.diagnostics, angleErrorDeg: calcError(rResLS, 'rear') } : null,
    });

    setFrontResult({
      legacy: fResLeg ? { hc: fResLeg.hc, o: fResLeg.o, diagnostics: fResLeg.diagnostics, angleErrorDeg: calcError(fResLeg, 'front') } : null,
      ls: fResLS ? { hc: fResLS.hc, o: fResLS.o, diagnostics: fResLS.diagnostics, angleErrorDeg: calcError(fResLS, 'front') } : null,
    });

    setStep('results');
  }, [scope, rearRows, frontRows, calibDa, calibDs, activeMachine, global, wheels, jigs, usbs, setStep]);

  const startMeasuring = React.useCallback(() => {
    if (!calibName.trim()) {
      setValidationError('Please provide a name for this calibration profile.');
      return;
    }
    setValidationError(null);
    setStep('measuring');
    setMeasIndex(0);
  }, [calibName, setStep]);

  const nextMeasurement = React.useCallback(() => {
    if (measIndex < calibCount - 1) {
      setMeasIndex(measIndex + 1);
    } else {
      computeResults();
    }
  }, [measIndex, calibCount, computeResults]);

  const prevMeasurement = React.useCallback(() => {
    if (measIndex > 0) {
      setMeasIndex(measIndex - 1);
    } else {
      setStep('intro');
    }
  }, [measIndex, setStep]);

  React.useEffect(() => {
    const handleNext = () => { if (step === 'measuring') nextMeasurement(); };
    const handleBack = () => { if (step === 'measuring') prevMeasurement(); };
    const handleStart = () => { if (step === 'intro') startMeasuring(); };
    
    window.addEventListener('wizard-next', handleNext);
    window.addEventListener('wizard-back', handleBack);
    window.addEventListener('wizard-start', handleStart);
    
    return () => {
      window.removeEventListener('wizard-next', handleNext);
      window.removeEventListener('wizard-back', handleBack);
      window.removeEventListener('wizard-start', handleStart);
    };
  }, [step, nextMeasurement, prevMeasurement, startMeasuring]);

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
    let profileName = calibName.trim();
    if (!profileName) return;

    const tag = solverMode === 'least-squares' ? ' (Least Squares)' : ' (Legacy)';
    if (!profileName.includes(tag)) {
        profileName += tag;
    }

    const profile: CalibrationProfile = {
      id: generateId(),
      name: profileName,
      createdAt: new Date().toISOString(),
      scope,
      Da: calibDa,
      Ds: calibDs,
    };

    const rearToSave = solverMode === 'least-squares' ? rearResult.ls : rearResult.legacy;
    if (rearToSave) {
      profile.rear = {
        hc: rearToSave.hc,
        o: rearToSave.o,
        diagnostics: rearToSave.diagnostics,
        angleErrorDeg: rearToSave.angleErrorDeg,
        measurements: rearRows,
      };
    }

    const frontToSave = solverMode === 'least-squares' ? frontResult.ls : frontResult.legacy;
    if (frontToSave) {
      profile.front = {
        hc: frontToSave.hc,
        o: frontToSave.o,
        diagnostics: frontToSave.diagnostics,
        angleErrorDeg: frontToSave.angleErrorDeg,
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
    <section className="neu-convex rounded-3xl border border-black/40 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 max-w-2xl mx-auto w-full relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Top Edge Highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

      
        
      

      {/* Step Indicator Pills */}
      <div className="relative z-10 flex items-center w-full justify-between gap-1 sm:gap-2 pb-1 select-none">
        {/* Step 1 */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 ${
            step === 'intro'
              ? 'bg-black/40 border-neutral-800 text-white shadow-sm'
              : 'bg-black/20 border-white/5 text-white/40'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
              step === 'intro' ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/60'
            }`}
          >
            1
          </span>
          <span className={step === 'intro' ? 'block' : 'hidden sm:block'}>Setup</span>
        </div>

        <div className="h-px flex-1 bg-white/10 min-w-[12px]" />

        {/* Step 2 */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 ${
            step === 'measuring'
              ? 'bg-black/40 border-neutral-800 text-white shadow-sm'
              : 'bg-black/20 border-white/5 text-white/40'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
              step === 'measuring' ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/60'
            }`}
          >
            2
          </span>
          <span className={step === 'measuring' ? 'block' : 'hidden sm:block'}>
            {step === 'measuring' ? `Measure (${measIndex + 1}/${calibCount})` : 'Measure'}
          </span>
        </div>

        <div className="h-px flex-1 bg-white/10 min-w-[12px]" />

        {/* Step 3 */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 ${
            step === 'results'
              ? 'bg-black/40 border-neutral-800 text-white shadow-sm'
              : 'bg-black/20 border-white/5 text-white/40'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
              step === 'results' ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/60'
            }`}
          >
            3
          </span>
          <span className={step === 'results' ? 'block' : 'hidden sm:block'}>Results</span>
        </div>
      </div>

      {/* Step 1: Intro / Setup */}
      {step === 'intro' && (
        <div className="relative z-10 flex flex-col gap-5 w-full">
          {/* Welcome / Context Banner */}
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300">
            <div 
              role="button"
              tabIndex={0}
              className="text-sm font-bold text-amber-400 flex items-center justify-between p-4 cursor-pointer select-none hover:bg-amber-400/5 transition-colors"
              onClick={() => setIsIntroExpanded(!isIntroExpanded)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsIntroExpanded(!isIntroExpanded); } }}
            >
              <span className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 -rotate-45 shrink-0">
                <path d="M3 12h19" />
                <path d="M16 12v-1" />
                <path d="M18 12v-1" />
                <path d="M20 12v-1" />
                <path d="M6 12v7l-2 -2V5l2 2v5" />
                <path d="M12 12v7l2 -2V5l-2 2v5" />
                <rect x="14" y="10" width="3" height="4" rx="0.5" />
                <path d="M15.5 10v-2" />
              </svg> What is Geometry Mapping?</span>
              <span className={`text-lg leading-none transition-transform duration-300 ease-in-out ${isIntroExpanded ? 'rotate-45' : 'rotate-0'}`}>+</span>
            </div>
            <div className="grid transition-[grid-template-rows] duration-300 ease-in-out" style={{ gridTemplateRows: isIntroExpanded ? "1fr" : "0fr" }}>
              <div className="overflow-hidden">
                <div className="p-4 pt-0 flex flex-col gap-3 border-t border-amber-400/10 mt-1">
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              To calculate perfect sharpening angles, we need to map your specific machine's exact dimensions. 
              You will need a <strong>pair of calipers</strong>.
            </p>
            <div className="bg-black/30 rounded-xl p-3 flex flex-col gap-2 border border-white/5">
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">The Process</span>
              <ul className="text-xs text-white/70 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">1.</span>
                  <span>Set the USB to a stable height (avoid extreme limits) and lock it.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">2.</span>
                  <span>Measure the height from your chosen datum to the top of the USB bar (<strong className="text-white">hₙ</strong>).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">3.</span>
                  <span>Measure the height from the top of the drive axle to the top of the USB bar (<strong className="text-white">CAₒ</strong>).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">4.</span>
                  <span>Repeat for {calibCount} widely spaced, stable heights.</span>
                </li>
              </ul>
            </div>
              </div>
            </div>
          </div>
          </div>
          {/* Profile Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
              Calibration Profile Name
            </label>
            <input
              type="text"
              className="h-12 bg-black/30 border border-white/5 focus:border-amber-400/60 rounded-2xl px-4 text-base font-semibold text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition w-full"
              value={calibName}
              onChange={e => {
                setCalibName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. Workshop Precision Mapping 2026"
            />
          </div>

          {/* USB Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
              USB Bar Hardware
            </label>
            <MiniSelect
              value={selectedUsbId}
              options={usbs.map(u => ({ value: u.id, label: `${u.name} (Ø ${u.Ds}mm)` }))}
              onChange={val => setSelectedUsbId(val)}
              widthClass="w-full"
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

          {validationError && (
            <div className="p-3.5 bg-amber-400/10 border border-amber-400/30 rounded-2xl text-xs text-amber-300 font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

        </div>
      )}

      {/* Step 2: Measuring */}
      {step === 'measuring' && (
        <div className="relative z-10 flex flex-col gap-3 w-full">
          {/* Instructions Banner */}
          <div className="px-3 py-2 bg-black/40 border border-amber-400/20 rounded-xl text-[11px] text-white/90 leading-tight flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[9px] block mb-0.5">
                Point {measIndex + 1} of {calibCount}
              </span>
              <p>
                Set USB to a <strong className="text-white underline decoration-amber-400">{measIndex === 0 ? 'low' : measIndex === calibCount - 1 ? 'high' : 'medium'}</strong> stable height and lock collar. Avoid limits where the bar has play.
                
              </p>
            </div>
          </div>

          {/* Measurement Guide Accordion */}
          <div className="bg-black/20 border border-white/5 rounded-xl flex flex-col overflow-hidden transition-all duration-300">
            <div 
              role="button"
              tabIndex={0}
              className="p-3 text-[10px] uppercase tracking-widest font-bold text-amber-400/80 hover:text-amber-400 cursor-pointer select-none flex items-center justify-between hover:bg-white/5 transition-colors"
              onClick={() => setIsGuideExpanded(!isGuideExpanded)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsGuideExpanded(!isGuideExpanded); } }}
            >
              <span>How do I measure these?</span>
              <span className={`text-lg leading-none transition-transform duration-300 ease-in-out ${isGuideExpanded ? 'rotate-45' : 'rotate-0'}`}>+</span>
            </div>
            <div className="grid transition-[grid-template-rows] duration-300 ease-in-out" style={{ gridTemplateRows: isGuideExpanded ? "1fr" : "0fr" }}>
              <div className="overflow-hidden">
                <div className="p-3 pt-0 text-xs text-white/70 flex flex-col gap-3 border-t border-white/5 mt-2">
              <div className="flex flex-col gap-1.5">
                <strong className="text-white">hₙ (Datum Height)</strong>
                <p>Rest the bottom of your calipers on your chosen datum (usually the flat machine casing right beneath the USB) and extend the top jaw to the top of the USB bar.</p>
                <div className="mt-0.5 bg-amber-400/10 border border-amber-400/20 rounded-lg p-2.5 text-[10px] text-amber-200/90 leading-relaxed flex flex-col gap-1.5">
                  <strong className="text-amber-400 text-[11px] block">💡 Choosing a Custom Datum</strong>
                  <p>Our math engine lets you use ANY flat, horizontal surface as your zero-point (perfect for custom builds), provided you follow two strict rules:</p>
                  <ul className="list-disc pl-3.5 space-y-1 text-amber-200/80">
                    <li>You must be able to hold your calipers <strong className="text-amber-300">perfectly vertical</strong> (straight up and down). <strong>Never tilt them diagonally</strong> to reach a spot off to the side, as this will corrupt the calibration math.</li>
                    <li>You must measure from this exact same surface whenever you set sharpening heights in the future.</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <strong className="text-white">CAₒ (Axle Top)</strong>
                <p>Rest the bottom of your calipers on the very top curve of the main drive axle (where the wheel mounts). Extend the top jaw to the top of the USB bar.</p>
              </div>
            </div>
              </div>
            </div>
          </div>

          {/* Rear Base Card */}
          {(scope === 'both' || scope === 'rear') && (
            <div className="bg-black/25 border border-white/5 border-l-2 border-l-blue-500 rounded-xl p-3 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-blue-400 tracking-wide flex items-center gap-2">
                  <span>Rear Base</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold uppercase">
                    Edge Leading
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold pl-1 truncate">
                    hₙ (Datum)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="h-10 bg-black/30 border border-white/5 focus:border-blue-400/60 rounded-lg pl-3 pr-8 text-sm font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition w-full"
                      placeholder="mm"
                      value={rearRows[measIndex]?.hn}
                      onChange={e => updateRear('hn', e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/30 pointer-events-none">
                      mm
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold pl-1 truncate">
                    CAₒ (Axle Top)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="h-10 bg-black/30 border border-white/5 focus:border-blue-400/60 rounded-lg pl-3 pr-8 text-sm font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition w-full"
                      placeholder="mm"
                      value={rearRows[measIndex]?.CAo}
                      onChange={e => updateRear('CAo', e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/30 pointer-events-none">
                      mm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Front Base Card */}
          {(scope === 'both' || scope === 'front') && (
            <div className="bg-black/25 border border-white/5 border-l-2 border-l-emerald-500 rounded-xl p-3 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-400 tracking-wide flex items-center gap-2">
                  <span>Front Base</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold uppercase">
                    Edge Trailing
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold pl-1 truncate">
                    hₙ (Datum)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="h-10 bg-black/30 border border-white/5 focus:border-emerald-400/60 rounded-lg pl-3 pr-8 text-sm font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition w-full"
                      placeholder="mm"
                      value={frontRows[measIndex]?.hn}
                      onChange={e => updateFront('hn', e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/30 pointer-events-none">
                      mm
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold pl-1 truncate">
                    CAₒ (Axle Top)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="h-10 bg-black/30 border border-white/5 focus:border-emerald-400/60 rounded-lg pl-3 pr-8 text-sm font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition w-full"
                      placeholder="mm"
                      value={frontRows[measIndex]?.CAo}
                      onChange={e => updateFront('CAo', e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/30 pointer-events-none">
                      mm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[11px] text-red-400 font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Results */}
      {step === 'results' && (
        <div className="relative z-10 flex flex-col gap-6 w-full pb-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Geometry Solved</h3>
            <p className="text-xs text-white/60">Compare the mathematical engines below. True Least Squares is heavily recommended for maximum precision.</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
              Select Solver Engine to Save
            </span>
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${solverMode === 'least-squares' ? 'bg-amber-400 text-black shadow-sm' : 'text-white/50 hover:text-white/80'}`}
                onClick={() => setSolverMode('least-squares')}
              >
                True Least Squares
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${solverMode === 'legacy' ? 'bg-amber-400 text-black shadow-sm' : 'text-white/50 hover:text-white/80'}`}
                onClick={() => setSolverMode('legacy')}
              >
                Legacy Algebraic
              </button>
            </div>
          </div>

          
          {/* Outlier Warning */}
          {(
            (rearResult.ls?.diagnostics?.maxAbsResidualMm ?? 0) > 0.5 ||
            (frontResult.ls?.diagnostics?.maxAbsResidualMm ?? 0) > 0.5
          ) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-xl leading-none">⚠️</span>
              <div className="flex flex-col gap-1">
                <strong className="text-sm text-red-400 font-bold tracking-tight">Measurement Outlier Detected</strong>
                <p className="text-xs text-red-300/80 leading-relaxed">
                  The solver detected a high residual error (deviation &gt; 0.5mm). This typically means a measurement was misread, the calipers were not seated flush, or they were tilted diagonally to reach a datum point instead of being perfectly vertical. We strongly recommend going back to verify your measurements.
                </p>
              </div>
            </div>
          )}

          {/* Rear Base Result Card */}
          {(rearResult.ls || rearResult.legacy) && (
            <div className="bg-black/25 border border-white/5 border-l-4 border-l-blue-500 rounded-3xl p-5 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-blue-400">Rear Base</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-bold uppercase">Edge Leading</span>
                </div>
                {renderDiagnosticBadge(solverMode === 'least-squares' ? rearResult.ls?.angleErrorDeg ?? null : rearResult.legacy?.angleErrorDeg ?? null)}
              </div>
              <table className="w-full text-left text-xs text-white/70">
                <thead>
                  <tr>
                    <th className="pb-2 uppercase text-[9px] text-white/40 tracking-wider">Metric</th>
                    <th className={`pb-2 text-right uppercase text-[9px] tracking-wider ${solverMode === 'least-squares' ? 'text-amber-400' : 'text-white/40'}`}>Least Sq</th>
                    <th className={`pb-2 text-right uppercase text-[9px] tracking-wider ${solverMode === 'legacy' ? 'text-amber-400' : 'text-white/40'}`}>Legacy</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-t border-white/10">
                    <td className="py-2">h_c</td>
                    <td className={`py-2 text-right ${solverMode === 'least-squares' ? 'font-bold text-white' : 'text-white/40'}`}>{rearResult.ls?.hc.toFixed(4) ?? '-'}</td>
                    <td className={`py-2 text-right ${solverMode === 'legacy' ? 'font-bold text-white' : 'text-white/40'}`}>{rearResult.legacy?.hc.toFixed(4) ?? '-'}</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2">o</td>
                    <td className={`py-2 text-right ${solverMode === 'least-squares' ? 'font-bold text-white' : 'text-white/40'}`}>{rearResult.ls?.o.toFixed(4) ?? '-'}</td>
                    <td className={`py-2 text-right ${solverMode === 'legacy' ? 'font-bold text-white' : 'text-white/40'}`}>{rearResult.legacy?.o.toFixed(4) ?? '-'}</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2 text-[10px] text-white/40">Max ε</td>
                    <td className="py-2 text-right text-[10px]">{rearResult.ls?.diagnostics?.maxAbsResidualMm?.toFixed(3) ?? '-'}</td>
                    <td className="py-2 text-right text-[10px]">{rearResult.legacy?.diagnostics?.maxAbsResidualMm?.toFixed(3) ?? '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Front Base Result Card */}
          {(frontResult.ls || frontResult.legacy) && (
            <div className="bg-black/25 border border-white/5 border-l-4 border-l-emerald-500 rounded-3xl p-5 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-emerald-400">Front Base</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold uppercase">Edge Trailing</span>
                </div>
                {renderDiagnosticBadge(solverMode === 'least-squares' ? frontResult.ls?.angleErrorDeg ?? null : frontResult.legacy?.angleErrorDeg ?? null)}
              </div>
              <table className="w-full text-left text-xs text-white/70">
                <thead>
                  <tr>
                    <th className="pb-2 uppercase text-[9px] text-white/40 tracking-wider">Metric</th>
                    <th className={`pb-2 text-right uppercase text-[9px] tracking-wider ${solverMode === 'least-squares' ? 'text-amber-400' : 'text-white/40'}`}>Least Sq</th>
                    <th className={`pb-2 text-right uppercase text-[9px] tracking-wider ${solverMode === 'legacy' ? 'text-amber-400' : 'text-white/40'}`}>Legacy</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-t border-white/10">
                    <td className="py-2">h_c</td>
                    <td className={`py-2 text-right ${solverMode === 'least-squares' ? 'font-bold text-white' : 'text-white/40'}`}>{frontResult.ls?.hc.toFixed(4) ?? '-'}</td>
                    <td className={`py-2 text-right ${solverMode === 'legacy' ? 'font-bold text-white' : 'text-white/40'}`}>{frontResult.legacy?.hc.toFixed(4) ?? '-'}</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2">o</td>
                    <td className={`py-2 text-right ${solverMode === 'least-squares' ? 'font-bold text-white' : 'text-white/40'}`}>{frontResult.ls?.o.toFixed(4) ?? '-'}</td>
                    <td className={`py-2 text-right ${solverMode === 'legacy' ? 'font-bold text-white' : 'text-white/40'}`}>{frontResult.legacy?.o.toFixed(4) ?? '-'}</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2 text-[10px] text-white/40">Max ε</td>
                    <td className="py-2 text-right text-[10px]">{frontResult.ls?.diagnostics?.maxAbsResidualMm?.toFixed(3) ?? '-'}</td>
                    <td className="py-2 text-right text-[10px]">{frontResult.legacy?.diagnostics?.maxAbsResidualMm?.toFixed(3) ?? '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
            <button
              type="button"
              className="h-12 px-5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold text-xs transition flex items-center justify-center cursor-pointer"
              onClick={() => setStep('measuring')}
            >
              ← Edit
            </button>
            <button
              type="button"
              className="h-12 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-950/30 transition flex items-center justify-center cursor-pointer"
              onClick={handleSave}
            >
              Save Profile ✓
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

