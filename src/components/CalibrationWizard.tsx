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
import { calculateOptimalMeasurementTargets, calculateNextOptimalTarget, solveWithSmartPruning } from '../math/tormek';
import { estimateMaxAngleErrorDeg } from '../services/calculationService';
import { ContextBar } from './layout/ContextBar';
import { Tag } from './ui/Tag';

type CalibrationWizardProps = {
  activeMachine: MachineConfig;
  initialProfile?: CalibrationProfile;
  onSaveProfile: (profile: CalibrationProfile) => void;
};

type Scope = 'rear' | 'front';
type SolverOutput = {
  hc: number;
  o: number;
  diagnostics: CalibrationDiagnostics;
  angleErrorDeg: number | null;
};

// ── Adaptive Calibration State ──────────────────────────────────────────────
// Phase controls which sub-screen the review step renders.
// 'quality-gate' : Shows current quality badges + "Improve It" / "Save As-Is"
// 'add-guided'   : Shows the suggested USB zone for the next additional reading
// 'add-measure'  : Shows blank hₙ / CAₒ inputs for the active base
// 'ceiling'      : Shows quality badges with no further improvement option


// Initial zone count — solver needs ≥ 3 for overdetermination (1 degree of freedom).
const INITIAL_COUNT = 5;


export default function CalibrationWizard({
  activeMachine,
  initialProfile,
  onSaveProfile,
}: CalibrationWizardProps) {
  const global = useStore((s) => s.global);
  const wheels = useStore(useShallow((s) => s.wheels));
  const usbs = useStore(useShallow((s) => s.usbs));
  const jigs = useStore(useShallow((s) => s.jigs));
  const step = useUIStore(s => s.calibrationStep);
  const setStep = useUIStore(s => s.setCalibrationStep);
  const setCalibratingMachineId = useUIStore(s => s.setCalibratingMachineId);
  const calibratingScope = useUIStore(s => s.calibratingScope);
  const [scope] = React.useState<Scope>((calibratingScope as Scope) ?? initialProfile?.scope ?? 'rear');
  const [calibName, setCalibName] = React.useState(
    initialProfile?.name ||
    `${activeMachine.name} - ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
  );
  const [selectedUsbId, setSelectedUsbId] = React.useState(global.activeUsbId);
  const calibDa = initialProfile?.Da ?? activeMachine.axleDiameter ?? 12;
  const calibDs = initialProfile?.Ds ?? usbs.find(u => u.id === selectedUsbId)?.Ds ?? 12;
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const [measIndex, setMeasIndex] = React.useState(0);
  const [noImprovementCount, setNoImprovementCount] = React.useState(0);
  const [bestError, setBestError] = React.useState<number | null>(null);

  // Pools grow dynamically — no fixed length. Initialise from profile if editing, else 3 empty slots.
  const [rearRows, setRearRows] = React.useState<CalibrationMeasurement[]>(() => {
    if (initialProfile?.rear?.measurements?.length) return [...initialProfile.rear.measurements];
    return Array(INITIAL_COUNT).fill({ hn: '', CAo: '' });
  });
  const [frontRows, setFrontRows] = React.useState<CalibrationMeasurement[]>(() => {
    if (initialProfile?.front?.measurements?.length) return [...initialProfile.front.measurements];
    return Array(INITIAL_COUNT).fill({ hn: '', CAo: '' });
  });

    const [rearResult, setRearResult] = React.useState<SolverOutput | null>(null);
  const [frontResult, setFrontResult] = React.useState<SolverOutput | null>(null);
  const [isIntroExpanded, setIsIntroExpanded] = React.useState(false);
  
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);



  // ── Solver ───────────────────────────────────────────────────────────────
  const computeResults = React.useCallback((preventNavigation = false) => {
    setErrorMsg(null);
    let rRes = null;
    let fRes = null;

    if (scope === 'rear') {
      rRes = solveWithSmartPruning(rearRows.filter(r => r.hn !== '' && r.CAo !== ''), calibDa, calibDs, 0.02);
      if (!rRes) {
        setErrorMsg('Failed to calibrate rear base. Check your height and axle measurements.');
        return;
      }
    }

    if (scope === 'front') {
      fRes = solveWithSmartPruning(frontRows.filter(r => r.hn !== '' && r.CAo !== ''), calibDa, calibDs, 0.02);
      if (!fRes) {
        setErrorMsg('Failed to calibrate front base. Check your height and axle measurements.');
        return;
      }
    }

    const calcError = (res: import('../math/types').CalibrationResultOutput, side: 'rear' | 'front') => {
      if (!res) return null;
      const dummyMachine: MachineConfig = {
        ...activeMachine,
        constants: { ...activeMachine.constants, [side]: { hc: res.hc, o: res.o } },
      };
      return estimateMaxAngleErrorDeg(res.diagnostics, side, global, dummyMachine, wheels, jigs, usbs);
    };

    setRearResult(rRes ? { hc: rRes.hc, o: rRes.o, diagnostics: rRes.diagnostics, angleErrorDeg: calcError(rRes, 'rear') } : null);
    setFrontResult(fRes ? { hc: fRes.hc, o: fRes.o, diagnostics: fRes.diagnostics, angleErrorDeg: calcError(fRes, 'front') } : null);

    if (preventNavigation) return;
    setStep('results');
  }, [scope, rearRows, frontRows, calibDa, calibDs, activeMachine, global, wheels, jigs, usbs, setStep]);

  // ── Navigation ───────────────────────────────────────────────────────────
  const startMeasuring = React.useCallback(() => {
    if (!calibName.trim()) {
      setValidationError('Please provide a name for this calibration profile.');
      return;
    }
    setValidationError(null);
    setStep('measuring');
    setMeasIndex(0);
  }, [calibName, setStep]);

  const canProceed = React.useCallback(() => {
    const isRearValid = rearRows[measIndex]?.hn !== '' && rearRows[measIndex]?.CAo !== '';
    const isFrontValid = frontRows[measIndex]?.hn !== '' && frontRows[measIndex]?.CAo !== '';
    if (scope === 'rear') return isRearValid;
    if (scope === 'front') return isFrontValid;
    return isRearValid && isFrontValid;
  }, [measIndex, scope, rearRows, frontRows]);

  const nextMeasurement = React.useCallback(() => {
    if (!canProceed()) return;
    // Shared solver eval helper
    const evalCurrentError = (): number | null => {
      let rErr = 0; let fErr = 0;
      if (scope === 'rear') {
        const rRows = rearRows.slice(0, measIndex + 1).filter(r => r.hn !== '' && r.CAo !== '');
        const rRes = solveWithSmartPruning(rRows, calibDa, calibDs, 0.02);
        if (rRes) {
          const dummyMachine: MachineConfig = { ...activeMachine, constants: { ...activeMachine.constants, rear: { hc: rRes.hc, o: rRes.o } } };
          rErr = estimateMaxAngleErrorDeg(rRes.diagnostics, 'rear', global, dummyMachine, wheels, jigs, usbs) || 0;
        } else { return null; }
      }
      if (scope === 'front') {
        const fRows = frontRows.slice(0, measIndex + 1).filter(r => r.hn !== '' && r.CAo !== '');
        const fRes = solveWithSmartPruning(fRows, calibDa, calibDs, 0.02);
        if (fRes) {
          const dummyMachine: MachineConfig = { ...activeMachine, constants: { ...activeMachine.constants, front: { hc: fRes.hc, o: fRes.o } } };
          fErr = estimateMaxAngleErrorDeg(fRes.diagnostics, 'front', global, dummyMachine, wheels, jigs, usbs) || 0;
        } else { return null; }
      }
      return Math.max(rErr, fErr);
    };

    if (measIndex === 3) {
      // Early exit check at N=4
      const currentError = evalCurrentError();
      if (currentError !== null && currentError <= 0.015) {
        computeResults();
        return;
      }
    }

    if (measIndex >= 4) {
      // Endless loop stop conditions
      const currentError = evalCurrentError();
      if (currentError !== null) {
        if (currentError <= 0.015) {
          computeResults();
          return;
        }
        
        let newCount = noImprovementCount;
        let newBest = bestError;
        
        const IMPROVEMENT_EPSILON_DEG = 0.002;
        if (bestError === null || currentError < bestError - IMPROVEMENT_EPSILON_DEG) {
          newCount = 0;
          newBest = currentError;
        } else {
          newCount += 1;
        }
        
        setNoImprovementCount(newCount);
        setBestError(newBest);
        
        if (newCount >= 2) {
          // Ceiling hit.
          computeResults();
          return;
        }
      }
    }

    // Continue to next step
    if (measIndex + 1 >= rearRows.length) {
      setRearRows(prev => [...prev, { hn: '', CAo: '' }]);
      setFrontRows(prev => [...prev, { hn: '', CAo: '' }]);
    }
    setMeasIndex(measIndex + 1);
  }, [measIndex, computeResults, scope, rearRows, frontRows, calibDa, calibDs, activeMachine, global, wheels, jigs, usbs, noImprovementCount, bestError, canProceed]);

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

  // Editing an existing profile: compute results silently on first render
  React.useEffect(() => {
    if ((step === 'review' || step === 'results') && !rearResult && !frontResult) {
      computeResults(true);
    }
  }, [step, rearResult, frontResult, computeResults]);



  // ── Measuring step helpers ───────────────────────────────────────────────
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

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const profileName = calibName.trim();
    if (!profileName) return;

    
    const profile: CalibrationProfile = {
      id: initialProfile?.id ?? generateId(),
      name: profileName,
      createdAt: initialProfile?.createdAt ?? new Date().toISOString(),
      scope,
      Da: calibDa,
      Ds: calibDs,
    };

    const getEnvelope = (rows: CalibrationMeasurement[]) => {
      if (rows.length < 2) return undefined;
      const h0 = parseFloat(String(rows[0].hn));
      const h1 = parseFloat(String(rows[1].hn));
      if (!Number.isFinite(h0) || !Number.isFinite(h1)) return undefined;
      return { minHn: Math.min(h0, h1), maxHn: Math.max(h0, h1) };
    };

    const rearToSave = rearResult;
    if (rearToSave) {
      profile.rear = {
        hc: rearToSave.hc,
        o: rearToSave.o,
        diagnostics: rearToSave.diagnostics,
        angleErrorDeg: rearToSave.angleErrorDeg,
        measurements: rearRows.filter(r => r.hn !== '' && r.CAo !== ''),
        physicalEnvelope: getEnvelope(rearRows),
      };
    }

    const frontToSave = frontResult;
    if (frontToSave) {
      profile.front = {
        hc: frontToSave.hc,
        o: frontToSave.o,
        diagnostics: frontToSave.diagnostics,
        angleErrorDeg: frontToSave.angleErrorDeg,
        measurements: frontRows.filter(r => r.hn !== '' && r.CAo !== ''),
        physicalEnvelope: getEnvelope(frontRows),
      };
    };



    onSaveProfile(profile);
  };

  // ── Diagnostic badge renderer ────────────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <section className="neu-convex rounded-[var(--ui-radius-mid)] border border-black/40 shadow-2xl p-[var(--ui-gap)] flex flex-col gap-[var(--ui-gap)] max-w-2xl mx-auto w-full relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <ContextBar.Slot name="center">
        <ContextBar.Title title="Geometry Mapper" subtitle={activeMachine.name} />
      </ContextBar.Slot>
      <ContextBar.Slot name="left">
        {step === 'measuring' ? (
          <ContextBar.Button variant="nav" onClick={() => window.dispatchEvent(new CustomEvent('wizard-back'))}>Back</ContextBar.Button>
        ) : (
          <ContextBar.Button
            variant="nav"
            onClick={() => {
              setCalibratingMachineId(null);
            }}
          >
            Cancel
          </ContextBar.Button>
        )}
      </ContextBar.Slot>
      <ContextBar.Slot name="right">
        {step === 'measuring' && (
          <ContextBar.Button
            variant="primary"
            disabled={!canProceed()}
            onClick={() => window.dispatchEvent(new CustomEvent('wizard-next'))}
          >
            {measIndex >= INITIAL_COUNT - 1 ? 'Analyse →' : 'Next →'}
          </ContextBar.Button>
        )}
        {step === 'results' && (
          <ContextBar.Button
            variant="primary"
            onClick={handleSave}
          >
            Save
          </ContextBar.Button>
        )}
        {step === 'intro' && (
          <ContextBar.Button variant="primary" onClick={() => window.dispatchEvent(new CustomEvent('wizard-start'))}>
            Start →
          </ContextBar.Button>
        )}
      </ContextBar.Slot>

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
            {step === 'measuring' ? `Measure (${measIndex + 1}/${INITIAL_COUNT})` : 'Measure'}
          </span>
        </div>

        <div className="h-px flex-1 bg-white/10 min-w-[12px]" />

        {/* Step 3 — Review / Results */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 ${
            step === 'review' || step === 'results'
              ? 'bg-black/40 border-neutral-800 text-white shadow-sm'
              : 'bg-black/20 border-white/5 text-white/40'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
              step === 'review' || step === 'results' ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/60'
            }`}
          >
            3
          </span>
          <span className={step === 'review' || step === 'results' ? 'block' : 'hidden sm:block'}>
            {step === 'results' ? 'Results' : 'Quality'}
          </span>
        </div>
      </div>

      {/* Step 1: Intro / Setup */}
      {step === 'intro' && (
        <div className="relative z-10 flex flex-col gap-[var(--ui-gap)] w-full">
          {/* Welcome / Context Banner */}
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-[var(--ui-radius-core)] shadow-sm flex flex-col overflow-hidden transition-all duration-300">
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
                    <span>We'll start with 3 measurements. If any are slightly off, we'll ask for one or two more. <strong className="text-white">Most machines are fully mapped in 3–5 total.</strong></span>
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
              className="h-12 bg-black/30 border border-white/5 focus:border-amber-400/60 rounded-[var(--ui-radius-core)] px-4 text-base font-semibold text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition w-full"
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



          {validationError && (
            <div className="p-3.5 bg-amber-400/10 border border-amber-400/30 rounded-[var(--ui-radius-core)] text-xs text-amber-300 font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

        </div>
      )}

      {/* Step 2: Measuring */}
      {step === 'measuring' && (() => {
        let title = '';
        let desc = '';
        let targetHint: number | null = null;
        
        const rH0 = parseFloat(String(rearRows[0]?.hn));
        const rH1 = parseFloat(String(rearRows[1]?.hn));
        const hasRearEnvelope = Number.isFinite(rH0) && Number.isFinite(rH1);
        const rearMin = hasRearEnvelope ? Math.min(rH0, rH1) : 0;
        const rearMax = hasRearEnvelope ? Math.max(rH0, rH1) : 0;
        
        const hints = hasRearEnvelope ? calculateOptimalMeasurementTargets(rearMin, rearMax) : [0,0,0];

        if (measIndex === 0) {
          title = 'Low Travel';
          desc = 'Drop USB to a low position, a few turns from the bottom. Lock collar, then measure.';
        } else if (measIndex === 1) {
          title = 'High Travel';
          desc = 'Set USB high, near the top of its stable travel. Ensure the bar is firmly supported without wobble, then lock collar.';
        } else if (measIndex === 2) {
          title = 'Midpoint';
          targetHint = hints[0];
          desc = `Set USB near ≈ ${targetHint.toFixed(1)} mm (midway along your travel). Lock collar, then measure.`;
        } else if (measIndex === 3) {
          title = 'Lower-Mid';
          targetHint = hints[1];
          desc = `Set USB near ≈ ${targetHint.toFixed(1)} mm. Lock collar, then measure.`;
        } else if (measIndex === 4) {
          title = 'Upper-Mid';
          targetHint = hints[2];
          desc = `Set USB near ≈ ${targetHint.toFixed(1)} mm. Lock collar, then measure.`;
        } else {
          title = 'Refining...';
          const validHns = (scope === 'rear') 
            ? rearRows.slice(0, measIndex).map(r => parseFloat(String(r.hn))) 
            : frontRows.slice(0, measIndex).map(r => parseFloat(String(r.hn)));
          targetHint = hasRearEnvelope ? calculateNextOptimalTarget(validHns, rearMin, rearMax) : 0;
          desc = `Let's refine this further to eliminate variance. Set USB near ≈ ${targetHint.toFixed(1)} mm.`;
        }

        return (
          <div key={measIndex} className="relative z-10 flex flex-col gap-4 w-full pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
                Reading {measIndex + 1} {measIndex < INITIAL_COUNT ? `of ${INITIAL_COUNT}` : ''} · {title}
              </h3>
            </div>

            <p className="text-xs text-white/50 leading-snug">
              {desc}
            </p>

            {/* Live Diagnostics Feedback (Requires >= 3 completed points) */}
            {measIndex >= 3 && (() => {
              // Calculate live error from previously completed rows
              let rErr: number | null = null;
              let fErr: number | null = null;
              let rPruned = -1;
              let fPruned = -1;

              if (scope === 'rear') {
                const rRows = rearRows.slice(0, measIndex).filter(r => r.hn !== '' && r.CAo !== '');
                if (rRows.length >= 3) {
                  const rRes = solveWithSmartPruning(rRows, calibDa, calibDs, 0.02);
                  if (rRes) {
                    const dummyMachine: MachineConfig = { ...activeMachine, constants: { ...activeMachine.constants, rear: { hc: rRes.hc, o: rRes.o } } };
                    rErr = estimateMaxAngleErrorDeg(rRes.diagnostics, 'rear', global, dummyMachine, wheels, jigs, usbs);
                    rPruned = rRes.diagnostics.prunedIndex ?? -1;
                  }
                }
              }

              if (scope === 'front') {
                const fRows = frontRows.slice(0, measIndex).filter(r => r.hn !== '' && r.CAo !== '');
                if (fRows.length >= 3) {
                  const fRes = solveWithSmartPruning(fRows, calibDa, calibDs, 0.02);
                  if (fRes) {
                    const dummyMachine: MachineConfig = { ...activeMachine, constants: { ...activeMachine.constants, front: { hc: fRes.hc, o: fRes.o } } };
                    fErr = estimateMaxAngleErrorDeg(fRes.diagnostics, 'front', global, dummyMachine, wheels, jigs, usbs);
                    fPruned = fRes.diagnostics.prunedIndex ?? -1;
                  }
                }
              }

              const maxErr = Math.max(rErr ?? 0, fErr ?? 0);
              const wasPruned = (rPruned === measIndex - 1) || (fPruned === measIndex - 1);

              if (maxErr === 0) return null;

              return (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-lg p-3">
                    <div className="flex-1 flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Current Precision</span>
                      <span className={`text-sm font-mono font-bold ${maxErr <= 0.015 ? 'text-emerald-400' : maxErr <= 0.05 ? 'text-amber-400' : 'text-red-400'}`}>
                        ±{maxErr.toFixed(3)}°
                      </span>
                    </div>
                    {maxErr <= 0.015 ? (
                      <Tag intent="success" appearance="solid">Flawless</Tag>
                    ) : (
                      <Tag intent="warning" appearance="outline">Refining...</Tag>
                    )}
                  </div>
                  
                  {wasPruned && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                      <span className="text-[12px] leading-none mt-0.5">⚠️</span>
                      <p className="text-[10px] text-red-200/90 font-medium leading-relaxed">
                        Your last measurement was detected as a statistical outlier and discarded by the solver. Please ensure the calipers are perfectly seated and try again.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Rear Base Card */}
            {(scope === 'rear') && (
              <div className="bg-black/25 border border-white/5 border-l-2 border-l-amber-500 rounded-xl p-3 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-400 tracking-wide flex items-center gap-2">
                    <span>Rear Base</span>
                    <Tag intent="info" appearance="outline">
                      Edge Leading
                    </Tag>
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
                        className="h-10 bg-black/30 border border-white/5 focus:border-amber-400/60 rounded-lg pl-3 pr-8 text-sm font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-amber-400/20 transition w-full"
                        placeholder="mm"
                        value={rearRows[measIndex]?.hn}
                        onChange={e => updateRear('hn', e.target.value)}
                        autoFocus
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
                        className="h-10 bg-black/30 border border-white/5 focus:border-amber-400/60 rounded-lg pl-3 pr-8 text-sm font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-amber-400/20 transition w-full"
                        placeholder="mm"
                        value={rearRows[measIndex]?.CAo}
                        onChange={e => updateRear('CAo', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') window.dispatchEvent(new CustomEvent('wizard-next')); }}
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
            {(scope === 'front') && (
              <div className="bg-black/25 border border-white/5 border-l-2 border-l-blue-500 rounded-xl p-3 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-blue-400 tracking-wide flex items-center gap-2">
                    <span>Front Base</span>
                    <Tag intent="success" appearance="outline">
                      Edge Trailing
                    </Tag>
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
                        className="h-10 bg-black/30 border border-white/5 focus:border-blue-400/60 rounded-lg pl-3 pr-8 text-sm font-mono font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition w-full"
                        placeholder="mm"
                        value={frontRows[measIndex]?.CAo}
                        onChange={e => updateFront('CAo', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') window.dispatchEvent(new CustomEvent('wizard-next')); }}
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
        );
      })()}

      {/* Step 4: Results */}
      {step === 'results' && (
        <div className="relative z-10 flex flex-col gap-[var(--ui-gap)] w-full pb-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Geometry Solved</h3>
            <p className="text-xs text-white/60">Your machine geometry has been successfully calculated and mathematically optimized for precision.</p>
          </div>


          {/* Potential Improvement Banner */}
          {(() => {
            const worstError = Math.max(rearResult?.angleErrorDeg ?? 0, frontResult?.angleErrorDeg ?? 0);
            if (worstError > 0.015) {
              const diff = worstError - 0.015;
              return (
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-900/10 border border-amber-500/20 rounded-[var(--ui-radius-core)] p-5 flex gap-4 shadow-[0_4px_20px_rgba(245,158,11,0.05)] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                  <div className="relative z-10 text-2xl leading-none pt-0.5 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">💡</div>
                  <div className="relative z-10 flex flex-col gap-1.5">
                    <strong className="text-[13px] text-amber-400 font-extrabold tracking-tight">Precision Check</strong>
                    <p className="text-xs text-amber-100/80 leading-relaxed font-medium">
                      Your mapping has a {worstError.toFixed(3)}° worst-case error. The physical limit of your calipers is ≈ 0.015°, meaning you have <strong className="text-amber-300">{diff.toFixed(3)}° of potential improvement</strong> left.
                    </p>
                  </div>
                </div>
              );
            }
            return (
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 border border-emerald-500/20 rounded-[var(--ui-radius-core)] p-5 flex gap-4 shadow-[0_4px_20px_rgba(16,185,129,0.05)] animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                <div className="relative z-10 text-2xl leading-none pt-0.5 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">🏆</div>
                <div className="relative z-10 flex flex-col gap-1.5">
                  <strong className="text-[13px] text-emerald-400 font-extrabold tracking-tight">Flawless Mapping</strong>
                  <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                    Your mapping error is {(worstError || 0).toFixed(3)}°, which is perfectly inside the physical noise floor of your calipers.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Outlier Warning */}
          {(
            (rearResult?.diagnostics?.maxAbsResidualMm ?? 0) > 0.5 ||
            (frontResult?.diagnostics?.maxAbsResidualMm ?? 0) > 0.5
          ) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-[var(--ui-radius-core)] p-4 flex gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
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
          {rearResult && (
            <div className="bg-black/25 border border-white/5 border-l-4 border-l-amber-500 rounded-[var(--ui-radius-core)] p-[var(--ui-gap)] flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-amber-400">Rear Base</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold uppercase">Edge Leading</span>
                </div>
                {renderDiagnosticBadge(rearResult.angleErrorDeg ?? null)}
              </div>
              <div className="flex flex-col mt-2">
                <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">h_c</span>
                  <span className="text-xs font-mono font-bold text-white">{rearResult.hc.toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">o</span>
                  <span className="text-xs font-mono font-bold text-white">{rearResult.o.toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Max ε</span>
                  <span className="text-xs font-mono text-white/70">{rearResult.diagnostics.maxAbsResidualMm.toFixed(3)} mm</span>
                </div>
              </div>
            </div>
          )}

          {/* Front Base Result Card */}
          {frontResult && (
            <div className="bg-black/25 border border-white/5 border-l-4 border-l-blue-500 rounded-[var(--ui-radius-core)] p-[var(--ui-gap)] flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-blue-400">Front Base</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-bold uppercase">Edge Trailing</span>
                </div>
                {renderDiagnosticBadge(frontResult.angleErrorDeg ?? null)}
              </div>
              <div className="flex flex-col mt-2">
                <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">h_c</span>
                  <span className="text-xs font-mono font-bold text-white">{frontResult.hc.toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">o</span>
                  <span className="text-xs font-mono font-bold text-white">{frontResult.o.toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Max ε</span>
                  <span className="text-xs font-mono text-white/70">{frontResult.diagnostics.maxAbsResidualMm.toFixed(3)} mm</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center pt-6 pb-2">
            <button
              type="button"
              className="px-6 py-2 rounded-full hover:bg-white/5 active:bg-white/10 text-white/40 hover:text-white/80 font-bold text-[10px] uppercase tracking-wider transition cursor-pointer"
              onClick={() => {
                setRearRows(Array(INITIAL_COUNT).fill({ hn: '', CAo: '' }));
                setFrontRows(Array(INITIAL_COUNT).fill({ hn: '', CAo: '' }));
                setMeasIndex(0);
                setNoImprovementCount(0);
                setBestError(null);
                setStep('measuring');
              }}
            >
              ← Re-measure Entire Envelope
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
