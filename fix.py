with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

def swap(old, new):
    global text
    if old not in text:
        print(f"Could not find: {old[:100]}")
    else:
        text = text.replace(old, new)

# 1. Imports
swap("import { calibrateBase } from '../math/tormek';", "import { calculateOptimalMeasurementTargets, solveWithSmartPruning } from '../math/tormek';")

# 2. constants
swap('const INITIAL_COUNT = 3;', 'const INITIAL_COUNT = 5;')

# 3. Adaptive types
old_adaptive_types = """type AdaptivePhase = 'quality-gate' | 'add-guided' | 'add-measure' | 'ceiling';

type AdaptiveState = {
  phase: AdaptivePhase;
  noImprovementCount: number;   // consecutive rounds with no improvement → ceiling at 2
  targetBase: 'rear' | 'front'; // which base is being improved right now
  guidedZoneHint: string;       // midpoint of largest hₙ gap — suggested USB position
  banner: string | null;        // info / warning shown on add-guided screen
};"""
swap(old_adaptive_types, "")

old_eps = """// Minimum improvement threshold: must reduce angle error by at least this many degrees.
const IMPROVEMENT_EPSILON_DEG = 0.002;

// Zone guidance for the 3 initial measurements
const ZONE_LABELS = ['LOW ZONE', 'MIDDLE ZONE', 'HIGH ZONE'];
const ZONE_COPY = [
  'Drop USB to a low, comfortable position — a couple of turns from the bottom. Lock the collar.',
  'Move USB to the middle of its travel. Any height you haven\\'t used yet is fine. Lock the collar.',
  'Raise USB to a high, comfortable position — a couple of turns from the top. Lock the collar.',
];"""
swap(old_eps, "")

# 4. State
old_state = """  const [adaptiveState, setAdaptiveState] = React.useState<AdaptiveState>({
    phase: 'quality-gate',
    noImprovementCount: 0,
    targetBase: 'rear',
    guidedZoneHint: '',
    banner: null,
  });
  // Both inputs always blank — user always measures fresh
  const [addNewHn, setAddNewHn] = React.useState('');
  const [addNewCAo, setAddNewCAo] = React.useState('');
  // Flag: triggers computeResults() after pool state has been committed to React
  const [pendingFinalCompute, setPendingFinalCompute] = React.useState(false);"""
swap(old_state, "")

old_eff = """  // After committing new rows to state, re-run the solver (reads the updated state)
  React.useEffect(() => {
    if (pendingFinalCompute) {
      setPendingFinalCompute(false);
      computeResults(false, false);
    }
  }, [pendingFinalCompute, computeResults]);"""
swap(old_eff, "")

# 5. computeResults
old_compute = """  // ── Solver ───────────────────────────────────────────────────────────────
  const computeResults = React.useCallback((forceResults = false, preventNavigation = false) => {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calcError = (res: any, side: 'rear' | 'front') => {
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

    const rAngleError = rRes ? calcError(rRes, 'rear') : null;
    const fAngleError = fRes ? calcError(fRes, 'front') : null;
    const isSubExcellent = (rAngleError !== null && rAngleError > 0.05) ||
                           (fAngleError !== null && fAngleError > 0.05);

    if (isSubExcellent && !forceResults) {
      // adaptiveState.phase is managed exclusively by handler functions — not overwritten here
      setStep('review');
    } else {
      setStep('results');
    }
  }, [scope, rearRows, frontRows, calibDa, calibDs, activeMachine, global, wheels, jigs, usbs, setStep]);"""

new_compute = """  // ── Solver ───────────────────────────────────────────────────────────────
  const computeResults = React.useCallback((forceResults = false, preventNavigation = false) => {
    setErrorMsg(null);
    let rRes = null;
    let fRes = null;

    if (scope === 'both' || scope === 'rear') {
      rRes = solveWithSmartPruning(rearRows.filter(r => r.hn !== '' && r.CAo !== ''), calibDa, calibDs, 0.02);
      if (!rRes) {
        setErrorMsg('Failed to calibrate rear base. Check your height and axle measurements.');
        return;
      }
    }

    if (scope === 'both' || scope === 'front') {
      fRes = solveWithSmartPruning(frontRows.filter(r => r.hn !== '' && r.CAo !== ''), calibDa, calibDs, 0.02);
      if (!fRes) {
        setErrorMsg('Failed to calibrate front base. Check your height and axle measurements.');
        return;
      }
    }

    const calcError = (res: any, side: 'rear' | 'front') => {
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
  }, [scope, rearRows, frontRows, calibDa, calibDs, activeMachine, global, wheels, jigs, usbs, setStep]);"""
swap(old_compute, new_compute)

old_next = """  const nextMeasurement = React.useCallback(() => {
    if (measIndex < INITIAL_COUNT - 1) {
      setMeasIndex(measIndex + 1);
    } else {
      computeResults();
    }
  }, [measIndex, computeResults]);"""
new_next = """  const nextMeasurement = React.useCallback(() => {
    if (measIndex === 3) {
      let rPass = true;
      let fPass = true;
      if (scope === 'both' || scope === 'rear') {
        const rRows = rearRows.slice(0, 4).filter(r => r.hn !== '' && r.CAo !== '');
        const rRes = rRows.length === 4 ? solveWithSmartPruning(rRows, calibDa, calibDs, 0.02) : null;
        rPass = !!rRes && rRes.diagnostics.maxAbsResidualMm <= 0.02;
      }
      if (scope === 'both' || scope === 'front') {
        const fRows = frontRows.slice(0, 4).filter(r => r.hn !== '' && r.CAo !== '');
        const fRes = fRows.length === 4 ? solveWithSmartPruning(fRows, calibDa, calibDs, 0.02) : null;
        fPass = !!fRes && fRes.diagnostics.maxAbsResidualMm <= 0.02;
      }
      if (rPass && fPass) {
        computeResults(); // Early exit!
        return;
      }
    }

    if (measIndex < INITIAL_COUNT - 1) {
      setMeasIndex(measIndex + 1);
    } else {
      computeResults();
    }
  }, [measIndex, computeResults, scope, rearRows, frontRows, calibDa, calibDs]);"""
swap(old_next, new_next)


with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
