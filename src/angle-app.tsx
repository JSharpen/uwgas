// @ts-nocheck

// Tormek USB Height Multi‑wheel Calculator – Rebuilt Baseline
// -----------------------------------------------------------
// This is a minimal, but fully working, single‑file React app
// that restores core Ton/Dutchman math, wheel handling and a
// basic UI so you can run and iterate again. Advanced features
// (wizard, presets, dual calibration, etc.) can be layered back
// on top of this stable foundation.


// =============== Helpers ===============

function _nz(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

function rad2deg(r: number): number {
  return (r * 180) / Math.PI;
}

function _save(k: string, v: any) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(k, JSON.stringify(v));
    }
  } catch {
    // ignore
  }
}

function _load<T>(k: string, def: T): T {
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

function blurOnEnter(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'Enter') {
    (e.currentTarget as HTMLInputElement).blur();
  }
}

// =============== Core Types ===============

type BaseSide = 'rear' | 'front';

type Wheel = {
  id: string;
  name: string;
  D: number; // effective diameter (numeric, used for math)
  DText?: string; // text version for editing
  angleOffset: number; // Δβ at wheel level (default)
  baseForHn: BaseSide; // default base for this wheel
  isHoning: boolean;
};

type SessionStep = {
  id: string;
  wheelId: string;
  base: BaseSide;
  angleOffset: number; // Δβ at step level
};

type PresetStepRef = {
  wheelId: string;
  wheelName: string;
  base: BaseSide;
  angleOffset: number;
};

type SessionPreset = {
  id: string;
  name: string;
  notes?: string;
  createdAt: string;
  version: 1;
  steps: PresetStepRef[];
};

type MachineConstants = {
  rear: { hc: number; o: number };
  front: { hc: number; o: number };
};

type MachineConfig = {
  id: string;
  name: string;
  constants: MachineConstants;
  usbDiameter: number;   // Ds for this machine
  jigDiameter: number;   // Dj for this machine
};

type GlobalState = {
  projection: number; // A
  usbDiameter: number; // Ds
  targetAngle: number; // β per side
  jig: { Dj: number }; // jig diameter
  microBump: { enabled: boolean; bumpDeg: number };
};


// =============== Defaults ===============

const DEFAULT_GLOBAL: GlobalState = {
  projection: 127.39,
  usbDiameter: 11.98,
  targetAngle: 16,
  jig: { Dj: 12 },
  microBump: { enabled: false, bumpDeg: 0 },
};

const DEFAULT_CONSTANTS: MachineConstants = {
  // These are "reasonable" T8‑like defaults and can be edited in UI
  rear: { hc: 29.0, o: 50.0 },
  front: { hc: 51.3, o: 131.7 },
};

const DEFAULT_WHEELS: Wheel[] = [
  // ===== 250 mm class – T-8 / T-7 =====

  {
    id: `wheel-sg250-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'SG-250 Original Grindstone',
    D: 250.0,
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
  },
  {
    id: `wheel-sb250-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'SB-250 Blackstone Silicon',
    D: 250.0,
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
  },
  {
    id: `wheel-sj250-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'SJ-250 Japanese Waterstone',
    D: 250.0,
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
  },
  {
    id: `wheel-dc250-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'DC-250 Diamond Wheel Coarse (360)',
    D: 250.0,
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
  },
  {
    id: `wheel-df250-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'DF-250 Diamond Wheel Fine (600)',
    D: 250.0,
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
  },
  {
    id: `wheel-de250-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'DE-250 Diamond Wheel Extra Fine (1200)',
    D: 250.0,
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
  },

  // Honing – T-8 / T-7

  {
    id: `wheel-la220-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'LA-220 Leather Honing Wheel',
    D: 215.0, // you can change to your measured value (e.g. 215) if you prefer
    angleOffset: 0,
    baseForHn: 'front',
    isHoning: true,
  },
  {
    id: `wheel-cw220-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'CW-220 Composite Honing Wheel',
    D: 220.0,
    angleOffset: 0,
    baseForHn: 'front',
    isHoning: true,
  },

  // ===== 200 mm class – T-4 / T-3 =====

  {
    id: `wheel-sg200-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'SG-200 Original Grindstone',
    D: 200.0,
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
  },
  {
    id: `wheel-sj200-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'SJ-200 Japanese Waterstone',
    D: 200.0,
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
  },
  {
    id: `wheel-dc200-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'DC-200 Diamond Wheel Coarse (360)',
    D: 200.0,
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
  },
  {
    id: `wheel-df200-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'DF-200 Diamond Wheel Fine (600)',
    D: 200.0,
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
  },
  {
    id: `wheel-de200-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'DE-200 Diamond Wheel Extra Fine (1200)',
    D: 200.0,
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
  },

  // Honing – T-4 / T-3

  {
    id: `wheel-la145-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'LA-145 Leather Honing Wheel',
    D: 145.0,
    angleOffset: 0,
    baseForHn: 'front',
    isHoning: true,
  },
];

// =============== Ton/Dutchman Math Core ===============

type TonInput = {
  base: BaseSide; // which base we reference hn to
  D: number; // wheel diameter (dw)
  A: number; // projection (A)
  betaDeg: number; // target β (per side)
  Dj: number; // jig diameter
  Ds: number; // USB diameter
  constants: MachineConstants;
  microBumpDeg?: number; // optional additional angle bump
  angleOffsetDeg?: number; // per‑wheel or per‑step Δβ
};

type TonOutput = {
  hr: number; // wheel → USB top (rear reference)
  hn: number; // datum → USB top (chosen base)
  betaEffDeg: number; // effective grinding angle
};

function computeTonHeights(input: TonInput): TonOutput {
  const {
    base,
    D,
    A,
    betaDeg,
    Dj,
    Ds,
    constants,
    microBumpDeg = 0,
    angleOffsetDeg = 0,
  } = input;

  const R = D / 2; // wheel radius
  const K = A - Ds / 2; // USB contact → apex
  const JC = Dj / 2; // jig radius

  const CG = Math.sqrt(K * K + JC * JC); // apex → USB centre
  const phi = Math.atan(JC / K); // jig offset angle

  const betaTotalDeg = betaDeg + microBumpDeg + angleOffsetDeg;
  const betaRad = deg2rad(betaTotalDeg);

  // Ton F9: CA = distance wheel centre ↔ USB centre
  const CA = Math.sqrt(CG * CG + R * R + 2 * CG * R * Math.sin(betaRad - phi));

  // hr: wheel → USB top, always referenced to rear wheel centre
  const hr = (CA - R) + Ds / 2;

  // Base offsets
  const baseConst = base === 'rear' ? constants.rear : constants.front;
  const O = baseConst.o;
  const hc = baseConst.hc;

  // Vertical coordinate of USB centre relative to axle
  const y = Math.sqrt(Math.max(CA * CA - O * O, 0));

  const hn = y - hc + Ds / 2;

  // Inverse: effective β from geometry (for diagnostics)
  const arg = (CA * CA - CG * CG - R * R) / (2 * CG * R);
  const clamped = Math.max(-1, Math.min(1, arg));
  const betaEffRad = Math.asin(clamped) + phi;
  const betaEffDeg = rad2deg(betaEffRad);

  return { hr, hn, betaEffDeg };
}

// =============== Session + Results Model ===============

type WheelResult = {
  wheel: Wheel;
  baseForHn: BaseSide;
  orientationLabel: string;
  betaEffDeg: number;
  hrWheel: number;
  hnBase: number;
  step?: SessionStep;
};

function computeWheelResults(
  wheels: Wheel[],
  sessionSteps: SessionStep[] | null,
  global: GlobalState,
  machine: MachineConfig
): WheelResult[] {
  const A = _nz(global.projection);
  const Ds = _nz(machine.usbDiameter);
  const Dj = _nz(machine.jigDiameter);
  const beta = _nz(global.targetAngle);
  const mb = global.microBump?.enabled ? _nz(global.microBump.bumpDeg) : 0;
  const items: { step?: SessionStep; wheel: Wheel }[] = [];

  if (sessionSteps && sessionSteps.length) {
    for (const step of sessionSteps) {
      const w = wheels.find(wh => wh.id === step.wheelId);
      if (!w) continue;
      items.push({ step, wheel: w });
    }
  } else {
    // No progression → no wheel results
    return [];
  }

  return items.map(({ step, wheel }) => {
    const baseForHn: BaseSide = wheel.isHoning
      ? 'front'
      : step?.base ?? wheel.baseForHn;

    const common: TonInput = {
      base: baseForHn,
      D: _nz(wheel.D),
      A,
      betaDeg: beta,
      Dj,
      Ds,
      constants: machine.constants,
      microBumpDeg: mb,
      angleOffsetDeg: _nz(step?.angleOffset ?? wheel.angleOffset),
    };

    const hrRear = computeTonHeights({ ...common, base: 'rear' });
    const hBase = computeTonHeights(common);

    const orientationLabel = baseForHn === 'rear'
      ? 'Edge leading (rear base)'
      : 'Edge trailing (front base)';

    return {
      wheel,
      baseForHn,
      orientationLabel,
      betaEffDeg: hBase.betaEffDeg,
      hrWheel: hrRear.hr,
      hnBase: hBase.hn,
      step,
    };
  });
}

// =============== Calibration Math (Single-base, wheel-less) ===============

type CalibrationMeasurement = {
  hn: string;  // datum → USB TOP (mm) as entered
  CAo: string; // outer-to-outer span |O______O| between axle and USB (mm) as entered
};

type CalibrationDiagnostics = {
  residuals: number[];
  maxAbsResidualMm: number;
};

type CalibrationResult = {
  hc: number;
  o: number;
  diagnostics: CalibrationDiagnostics;
};

/**
 * Calibrate one base (rear or front) from 3–5 measurements.
 * Uses only axle↔USB geometry, no wheel, no angle.
 */
function calibrateBase(
  rows: CalibrationMeasurement[],
  Da: number,
  Ds: number
): CalibrationResult | null {
  const Ra = Da / 2;
  const Rs = Ds / 2;

  // Build numeric arrays, only keeping rows with both values present
  const CA: number[] = [];
  const hn: number[] = [];

  for (const row of rows) {
    const hn_i = _nz(row.hn, NaN);
    const CAo_i = _nz(row.CAo, NaN);
    if (!Number.isFinite(hn_i) || !Number.isFinite(CAo_i)) continue;
    const CA_i = CAo_i - Ra - Rs; // centre-to-centre distance axle ↔ USB (outer-to-outer span |O______O|)
    CA.push(CA_i);
    hn.push(hn_i);
  }

  const N = CA.length;
  if (N < 2) return null;

  // 1) Estimate t = hc - Ds/2 using pairwise linear equations
  const hn1 = hn[0];
  const CA1 = CA[0];
  const tValues: number[] = [];

  for (let i = 1; i < N; i++) {
    const hni = hn[i];
    const CAi = CA[i];
    if (Math.abs(hni - hn1) < 1e-9) continue; // avoid divide-by-zero

    const num = (CA1 * CA1 - CAi * CAi) - (hn1 * hn1 - hni * hni);
    const den = 2 * (hn1 - hni);
    tValues.push(num / den);
  }

  if (!tValues.length) return null;

  const t =
    tValues.reduce((sum, v) => sum + v, 0) / tValues.length;

  // 2) Recover hc
  const hc = t + Rs; // Rs = Ds/2

  // 3) Estimate O using all points
  const O2Values: number[] = [];
  for (let i = 0; i < N; i++) {
    const y = hn[i] + t;
    const O2_i = CA[i] * CA[i] - y * y;
    if (O2_i > 0) O2Values.push(O2_i);
  }
  if (!O2Values.length) return null;

  const O2mean =
    O2Values.reduce((sum, v) => sum + v, 0) / O2Values.length;
  const o = Math.sqrt(O2mean);

  // 4) Diagnostics: residuals in hn (mm)
  const residuals: number[] = [];
  for (let i = 0; i < N; i++) {
    const y = Math.sqrt(Math.max(CA[i] * CA[i] - o * o, 0));
    const predHn = y - hc + Rs;
    residuals.push(hn[i] - predHn); // measured - predicted
  }
  const maxAbsResidualMm = residuals.reduce(
    (m, r) => Math.max(m, Math.abs(r)),
    0
  );

  return { hc, o, diagnostics: { residuals, maxAbsResidualMm } };
}

/**
 * Estimate worst-case angle error (deg) implied by a height residual, over
 * the user's wheels, for a given base. Uses numeric ∂hn/∂β via Ton core.
 */
function estimateMaxAngleErrorDeg(
  diagnostics: CalibrationDiagnostics,
  base: BaseSide,
  global: GlobalState,
  machineLike: MachineConfig,
  wheels: Wheel[]
): number | null {
  const maxRes = diagnostics.maxAbsResidualMm;
  if (!Number.isFinite(maxRes) || maxRes <= 0) return null;

  const A = _nz(global.projection);
  const beta = _nz(global.targetAngle);
  const Dj = machineLike.jigDiameter;
  const Ds = machineLike.usbDiameter;

  const candidateDs =
    wheels.length > 0 ? wheels.map(w => _nz(w.D)) : [250, 215, 200];

  let maxAngle = 0;

  for (const D of candidateDs) {
    if (!Number.isFinite(D) || D <= 0) continue;

    const delta = 0.05; // small angle step in degrees
    const baseInput: TonInput = {
      base,
      D,
      A,
      betaDeg: beta,
      Dj,
      Ds,
      constants: machineLike.constants,
    };

    const hnPlus = computeTonHeights({
      ...baseInput,
      betaDeg: beta + delta,
    }).hn;
    const hnMinus = computeTonHeights({
      ...baseInput,
      betaDeg: beta - delta,
    }).hn;

    const dHn_dBeta = (hnPlus - hnMinus) / (2 * delta);
    if (Math.abs(dHn_dBeta) < 1e-6) continue;

    const angleErr = Math.abs(maxRes / dHn_dBeta);
    if (angleErr > maxAngle) maxAngle = angleErr;
  }

  if (maxAngle === 0) return null;
  return maxAngle;
}

function GrindDirToggle({
  base,
  isHoning,
  canToggle,
  onToggle,
}: {
  base: BaseSide;
  isHoning: boolean;
  canToggle: boolean; // edit-mode control
  onToggle: () => void;
}) {
  const label = base === 'rear' ? 'R' : 'F'; // Rear / Front

  // Click lock: honing OR view-mode (canToggle=false)
  const effectiveLocked = isHoning || !canToggle;

  const title = isHoning
    ? 'Honing wheel: fixed to Edge Trailing (front base)'
    : !canToggle
    ? base === 'rear'
      ? 'Edge Leading (rear base)'
      : 'Edge Trailing (front base)'
    : base === 'rear'
    ? 'Edge Leading (rear base) – click to switch to Edge Trailing'
    : 'Edge Trailing (front base) – click to switch to Edge Leading';

  const baseClasses =
    'px-1.5 py-0.5 text-[0.65rem] rounded border text-neutral-50 transition-colors';

  let stateClasses: string;

  // 🔹 Styling: ONLY honing is grey. Non-honing is coloured, even if locked.
  if (isHoning) {
    stateClasses =
      'border-neutral-700 bg-neutral-900 text-neutral-500 opacity-60 cursor-not-allowed';
  } else if (base === 'rear') {
    // Edge leading
    stateClasses = 'border-emerald-500 bg-emerald-900/40 text-emerald-200';
  } else {
    // Edge trailing
    stateClasses = 'border-sky-500 bg-sky-900/40 text-sky-200';
  }

  return (
    <button
      type="button"
      title={title}
      onClick={() => {
        if (effectiveLocked) return; // still locked in view mode / honing
        onToggle();
      }}
      className={baseClasses + ' ' + stateClasses}
    >
      {label}
    </button>
  );
}
// =============== Wheel Selector Dropdown===============
function WheelSelect({
  wheels,
  value,
  onChange,
}: {
  wheels: Wheel[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const selected = wheels.find(w => w.id === value) || null;

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

    React.useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block text-xs">
      {/* Shell / trigger */}
      <button
        type="button"
        className="inline-flex items-center justify-between gap-1 rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 w-[7rem] max-w-[7rem] hover:bg-neutral-900"
        onClick={() => setOpen(o => !o)}
      >
        <span className="truncate text-left">
          {selected ? selected.name : 'Select wheel'}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={
            'w-3 h-3 transition-transform ' + (open ? 'rotate-180' : 'rotate-0')
          }
          aria-hidden="true"
        >
          <path
            d="M7 10l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Menu */}
      {open && (
        <div className="absolute left-0 mt-1 z-20 w-44 max-h-60 overflow-auto rounded border border-neutral-700 bg-neutral-950 shadow-lg">
          {wheels.length === 0 && (
            <div className="px-2 py-1 text-[0.7rem] text-neutral-500">
              No wheels defined
            </div>
          )}
          {wheels.map(w => {
            const isActive = w.id === value;
            return (
              <button
                key={w.id}
                type="button"
                className={
                  'w-full px-2 py-1 text-left text-[0.75rem] ' +
                  (isActive
                    ? 'bg-emerald-900/40 text-emerald-100'
                    : 'bg-neutral-950 text-neutral-100 hover:bg-neutral-900')
                }
                onClick={() => handleSelect(w.id)}
              >
                {w.name}
                {w.isHoning && (
                  <span className="ml-1 text-[0.65rem] text-emerald-300">
                    · honing
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============== Preset Selector Dropdown===============
function PresetSelect({
  presets,
  value,
  onChange,
}: {
  presets: SessionPreset[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const selected = presets.find(p => p.id === value) || null;

  const handleSelect = (id: string) => {
    onChange(id);  // parent will load the preset
    setOpen(false);
  };

  React.useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block text-xs">

      {/* Trigger */}
      <button
        type="button"
        className="inline-flex items-center justify-between gap-1 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 min-w-[9rem] hover:bg-neutral-900"
        onClick={() => setOpen(o => !o)}
      >
        <span className="truncate text-left">
          {selected ? selected.name : 'Presets…'}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={
            'w-3 h-3 transition-transform ' + (open ? 'rotate-180' : 'rotate-0')
          }
          aria-hidden="true"
        >
          <path
            d="M7 10l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Menu */}
      {open && (
        <div className="absolute right-0 mt-1 z-20 w-48 max-h-60 overflow-auto rounded border border-neutral-700 bg-neutral-950 shadow-lg">
          {presets.length === 0 && (
            <div className="px-2 py-1 text-[0.7rem] text-neutral-500">
              No presets saved
            </div>
          )}
          {presets.map(p => {
            const isActive = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                className={
                  'w-full px-2 py-1 text-left text-[0.75rem] ' +
                  (isActive
                    ? 'bg-emerald-900/40 text-emerald-100'
                    : 'bg-neutral-950 text-neutral-100 hover:bg-neutral-900')
                }
                onClick={() => handleSelect(p.id)}
              >
                <span className="truncate">{p.name}</span>
                <span className="ml-1 text-[0.65rem] text-neutral-500">
                  · {p.steps.length} step{p.steps.length === 1 ? '' : 's'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============== App ===============

function App() {
  const [global, setGlobal] = React.useState<GlobalState>(() =>
    _load('t_global', DEFAULT_GLOBAL)
  );
  const [constants, setConstants] = React.useState<MachineConstants>(() =>
    _load('t_constants', DEFAULT_CONSTANTS)
  );
  const [wheels, setWheels] = React.useState<Wheel[]>(() =>
    _load('t_wheels', DEFAULT_WHEELS)
  );
  const [sessionSteps, setSessionSteps] = React.useState<SessionStep[]>(() =>
    _load('t_sessionSteps', [])
  );
    const [sessionPresets, setSessionPresets] = React.useState<SessionPreset[]>(() =>
    _load('t_sessionPresets', [])
  );
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>('');
  const [isPresetDialogOpen, setIsPresetDialogOpen] = React.useState(false);
  const [presetNameDraft, setPresetNameDraft] = React.useState('');
  const [isPresetManagerOpen, setIsPresetManagerOpen] = React.useState(false);

  const [view, setView] = React.useState<
  'calculator' | 'wheels' | 'settings'
>('calculator');
  const [settingsView, setSettingsView] = React.useState<'machine' | 'calibration'>('machine');

  const [isWheelConfigOpen, setIsWheelConfigOpen] = React.useState(false);


    // Track which wheel should auto-focus in the Wheel Manager
  const focusWheelIdRef = React.useRef<string | null>(null);

    // Scroll target for newly added progression steps
  const progressionEndRef = React.useRef<HTMLDivElement | null>(null);

  // Track last loaded preset and its steps
const lastLoadedPresetIdRef = React.useRef<string | null>(null);
const lastLoadedStepsRef = React.useRef<string | null>(null);


  // 🔒 Safety net: de-duplicate wheels by id (keep first, drop duplicates)
  React.useEffect(() => {
    const seen = new Set<string>();
    const deduped = wheels.filter(w => {
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });

    if (deduped.length !== wheels.length) {
      setWheels(deduped);
    }
  }, []); // run once on mount

  // Calibration wizard state (single-base)
  const [calibBase, setCalibBase] = React.useState<BaseSide>('rear');
  const [calibDa, setCalibDa] = React.useState<number>(12); // axle diameter
  const [calibDs, setCalibDs] = React.useState<number>(DEFAULT_GLOBAL.usbDiameter);
  const [calibCount, setCalibCount] = React.useState<number>(4); // 3/4/5, default 4 (recommended)
  const [calibRows, setCalibRows] = React.useState<CalibrationMeasurement[]>(() => []);
  const [calibResult, setCalibResult] = React.useState<{
    hc: number;
    o: number;
    diagnostics: CalibrationDiagnostics;
    angleErrorDeg: number | null;
  } | null>(null);
  const [calibError, setCalibError] = React.useState<string | null>(null);

  const activeMachine: MachineConfig = {
    id: 'machine-1',
    name: 'Default machine',
    constants,
    usbDiameter: global.usbDiameter,
    jigDiameter: global.jig.Dj,
  };

  // Persist basic state
  React.useEffect(() => {
    _save('t_global', global);
  }, [global]);

  React.useEffect(() => {
    _save('t_constants', constants);
  }, [constants]);

  React.useEffect(() => {
    _save('t_wheels', wheels);
  }, [wheels]);

  React.useEffect(() => {
    _save('t_sessionSteps', sessionSteps);
  }, [sessionSteps]);

  React.useEffect(() => {
    _save('t_sessionPresets', sessionPresets);
  }, [sessionPresets]);

  // Keep preset dropdown in sync when the progression is edited
  React.useEffect(() => {
    // If no preset is currently selected, nothing to sync
    if (!selectedPresetId) {
      lastLoadedStepsRef.current = null;
      return;
    }

    // Build a minimal snapshot of the current progression configuration
    const currentSnapshot = JSON.stringify(
      sessionSteps.map(s => ({
        wheelId: s.wheelId,
        base: s.base,
        angleOffset: s.angleOffset,
      }))
    );

    // If we don't yet have a snapshot for this selection, initialise it once
    if (lastLoadedStepsRef.current === null) {
      lastLoadedStepsRef.current = currentSnapshot;
      return;
    }

    // If the current progression no longer matches the snapshot,
    // the user has modified the config → clear the preset selection.
    if (currentSnapshot !== lastLoadedStepsRef.current) {
      lastLoadedStepsRef.current = null;
      setSelectedPresetId('');
    }
  }, [sessionSteps, selectedPresetId]);


  // Ensure calibRows length matches calibCount
  const ensureCalibRowsLength = (count: number) => {
    setCalibRows(prev => {
      const next = [...prev];
      while (next.length < count) {
        next.push({ hn: '', CAo: '' });
      }
      return next;
    });
  };

  const handleRunCalibration = () => {
    setCalibError(null);
    setCalibResult(null);

    const Da = calibDa || 12;
    const Ds = calibDs || global.usbDiameter;

    const rowsToUse = calibRows.slice(0, calibCount);
    const result = calibrateBase(rowsToUse, Da, Ds);
    if (!result) {
      setCalibError('Need at least two valid hn + CAo rows with numeric values.');
      return;
    }

    const proposedConstants: MachineConstants = {
      ...activeMachine.constants,
      [calibBase]: {
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
      calibBase,
      global,
      machineLike,
      wheels
    );

    setCalibResult({
      hc: result.hc,
      o: result.o,
      diagnostics: result.diagnostics,
      angleErrorDeg: angleErr,
    });
  };

  const handleApplyCalibration = () => {
    if (!calibResult) return;
    setConstants(prev => ({
      ...prev,
      [calibBase]: {
        ...prev[calibBase],
        hc: calibResult.hc,
        o: calibResult.o,
      },
    }) as MachineConstants);
  };

  const wheelResults = computeWheelResults(wheels, sessionSteps, global, activeMachine);

  const updateWheel = (id: string, patch: Partial<Wheel>) => {
    setWheels(prev => prev.map(w => (w.id === id ? { ...w, ...patch } : w)));
  };

  const addWheel = () => {
    const id = `wheel-${Date.now()}`;
    const w: Wheel = {
      id,
      name: 'New wheel',
      D: 250,
      DText: '250',
      angleOffset: 0,
      baseForHn: 'rear',
      isHoning: false,
    };

    // Tell the Wheel Manager to auto-focus this wheel's name input
    focusWheelIdRef.current = id;

    setWheels(prev => [...prev, w]);
  };

  const deleteWheel = (id: string) => {
    const target = wheels.find(w => w.id === id);
    const label = target
      ? `Delete wheel "${target.name}"?`
      : 'Delete this wheel?';

    if (!window.confirm(label)) {
      return;
    }

    // Remove the wheel itself
    setWheels(prev => prev.filter(w => w.id !== id));

    // Also remove any progression steps that referenced this wheel
    setSessionSteps(prev => prev.filter(step => step.wheelId !== id));
  };
const addStep = () => {
  if (wheels.length === 0) return;
  const defaultWheel = wheels[0];

  const step: SessionStep = {
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    wheelId: defaultWheel.id,
    base: defaultWheel.isHoning ? 'front' : defaultWheel.baseForHn,
    angleOffset: 0,
  };

  setSessionSteps(prev => {
    const next = [...prev, step];

    // Auto-scroll after DOM update
    window.requestAnimationFrame(() => {
      if (progressionEndRef.current) {
        progressionEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }
    });

    return next;
  });
};

const updateStep = (id: string, patch: Partial<SessionStep>) => {
  setSessionSteps(prev =>
    prev.map(s => (s.id === id ? { ...s, ...patch } : s))
  );
};

const moveStep = (index: number, delta: number) => {
  setSessionSteps(prev => {
    const next = [...prev];
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= next.length) return prev;
    const [item] = next.splice(index, 1);
    next.splice(newIndex, 0, item);
    return next;
  });
};

const handleSavePreset = () => {
  const name = presetNameDraft.trim();
  if (!name) return;
  if (sessionSteps.length === 0) return;

  // Build preset steps from current session steps
  const presetSteps: PresetStepRef[] = sessionSteps
    .map(step => {
      const wheel = wheels.find(w => w.id === step.wheelId);
      if (!wheel) return null;
      return {
        wheelId: wheel.id,
        wheelName: wheel.name,
        base: step.base,
        angleOffset: step.angleOffset,
      } as PresetStepRef;
    })
    .filter((x): x is PresetStepRef => x !== null);

  if (presetSteps.length === 0) return;

  const newPreset: SessionPreset = {
    id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    notes: undefined,
    createdAt: new Date().toISOString(),
    version: 1,
    steps: presetSteps,
  };

  setSessionPresets(prev => [...prev, newPreset]);
  setSelectedPresetId(newPreset.id);

  // Close dialog + clear draft
  setIsPresetDialogOpen(false);
  setPresetNameDraft('');
};

const handleLoadPreset = (presetId: string) => {
  const preset = sessionPresets.find(p => p.id === presetId);
  if (!preset) return;

  const resolvedSteps: SessionStep[] = [];

  for (const ref of preset.steps) {
    // Prefer ID, fall back to matching by name
    const wheel =
      wheels.find(w => w.id === ref.wheelId) ||
      wheels.find(w => w.name === ref.wheelName);

    if (!wheel) continue;

    resolvedSteps.push({
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      wheelId: wheel.id,
      base: ref.base,
      angleOffset: ref.angleOffset,
    });
  }

  if (resolvedSteps.length === 0) return;
  setSessionSteps(resolvedSteps);

  // Remember that this preset is now the active one
lastLoadedPresetIdRef.current = preset.id;
lastLoadedStepsRef.current = JSON.stringify(
  resolvedSteps.map(s => ({
    wheelId: s.wheelId,
    base: s.base,
    angleOffset: s.angleOffset,
  }))
);
setSelectedPresetId(preset.id);
};


const clearSteps = () => {
  setSessionSteps([]);
};

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Wet Grinder Angle Setter (Early Limited Version)</h1>

<div className="flex gap-2 text-sm mb-2">
  <button
    type="button"
    className={
      'px-2 py-1 rounded border ' +
      (view === 'calculator'
        ? 'border-emerald-500 bg-emerald-900/40'
        : 'border-neutral-700 bg-neutral-900')
    }
    onClick={() => setView('calculator')}
  >
    Calculator
  </button>

  <button
    type="button"
    className={
      'px-2 py-1 rounded border ' +
      (view === 'wheels'
        ? 'border-emerald-500 bg-emerald-900/40'
        : 'border-neutral-700 bg-neutral-900')
    }
    onClick={() => setView('wheels')}
  >
    Wheel Manager
  </button>

  <button
    type="button"
    className={
      'px-2 py-1 rounded border ' +
      (view === 'settings'
        ? 'border-emerald-500 bg-emerald-900/40'
        : 'border-neutral-700 bg-neutral-900')
    }
    onClick={() => setView('settings')}
  >
    Settings
  </button>
</div>

      {view === 'calculator' && (
        <>
          {/* Global controls */}
          <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/40 flex flex-col gap-2 max-w-xl">
            <h2 className="text-sm font-semibold text-neutral-200">Global setup</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex flex-col gap-1">
                <span className="text-neutral-300">Projection A (mm)</span>
                <input
                  type="number"
                  className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
                  value={global.projection}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({ ...g, projection: _nz(e.target.value, g.projection) }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-neutral-300">Target angle β (°/side)</span>
                <input
                  type="number"
                  className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
                  value={global.targetAngle}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({ ...g, targetAngle: _nz(e.target.value, g.targetAngle) }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-neutral-300">USB diameter Ds (mm)</span>
                <input
                  type="number"
                  className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
                  value={global.usbDiameter}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({ ...g, usbDiameter: _nz(e.target.value, g.usbDiameter) }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-neutral-300">Jig diameter Dj (mm)</span>
                <input
                  type="number"
                  className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
                  value={global.jig.Dj}
                  onKeyDown={blurOnEnter}
                  onChange={e =>
                    setGlobal(g => ({ ...g, jig: { ...g.jig, Dj: _nz(e.target.value, g.jig.Dj) } }))
                  }
                />
              </label>
            </div>
          </section>

          {/* Wheels / progression */}
          <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/20 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-neutral-200">Progression</h2>

              <div className="flex items-center gap-2">
                {/* Group: preset controls + hamburger */}
                <div className="flex items-center gap-2">
                  {/* VIEW MODE — Load preset UI */}
                  {!isWheelConfigOpen && (
                    <PresetSelect
                      presets={sessionPresets}
                      value={selectedPresetId || ''}
                      onChange={id => {
                        setSelectedPresetId(id);
                        if (id) {
                          handleLoadPreset(id); // auto-load on selection
                        }
                      }}
                    />
                  )}

                  {/* EDIT MODE — Save preset + Clear */}
                  {isWheelConfigOpen && (
                    <>
                      <button
                        type="button"
                        className="px-3 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                        onClick={() => {
                          if (sessionSteps.length === 0) return;
                          setPresetNameDraft('');
                          setIsPresetDialogOpen(true);
                        }}
                        disabled={sessionSteps.length === 0}
                      >
                        Save preset
                      </button>

                      <button
                        type="button"
                        className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-900 text-xs text-neutral-300 disabled:opacity-40"
                        onClick={clearSteps}
                        disabled={sessionSteps.length === 0}
                      >
                        Clear
                      </button>
                    </>
                  )}

                  {/* New: hamburger / manage presets button */}
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs"
                    title="Manage presets"
                    onClick={() => setIsPresetManagerOpen(true)}
                  >
                    ⋮
                  </button>
                </div>

                {/* Always present: Edit / Back toggle */}
                <button
                  type="button"
                  className="w-12 px-2 py-1 text-center rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs"
                  onClick={() => setIsWheelConfigOpen(open => !open)}
                >
                  {isWheelConfigOpen ? 'Back' : 'Edit'}
                </button>
              </div>
            </div>
            {/* TOGGLE: math vs progression cards */}
            {/* Shared wrapper so cards start at the exact same vertical position in both modes */}
            <div className="mt-2">
              {isWheelConfigOpen ? (
                // EDIT MODE – progression controls
                <div className="flex flex-col gap-3 text-xs">
                  {/* Empty state when no steps exist */}
                  {sessionSteps.length === 0 && (
                    <div className="text-xs text-neutral-400 border border-dashed border-neutral-700 rounded p-2">
                      No steps defined yet. Click <span className="font-semibold">+ Add step</span> to
                      start building a progression. When at least one step exists, the calculator
                      view will follow this sequence.
                    </div>
                  )}

                  {/* Steps list */}
                  {sessionSteps.length > 0 && (
                    <div className="flex flex-col gap-2 text-xs">
                      {sessionSteps.map((step, index) => {
                        const wheel = wheels.find(w => w.id === step.wheelId);
                        if (!wheel) return null;

                        const isHoning = wheel.isHoning;

                        return (
                          <div
                            key={step.id}
                            className="border border-neutral-700 rounded bg-neutral-950/40 overflow-hidden flex flex-col"
                          >
                            {/* === Header bar: step badge + wheel selector + grind direction + delete === */}
                           <div className="flex flex-wrap items-center justify-between gap-y-1 px-2 py-1 bg-neutral-900/80">
                              <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                                {/* Step badge (non-intrusive) */}
                                <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[0.7rem] font-mono text-neutral-100">
                                  {index + 1}
                                </div>

                                {/* Grind direction toggle – EL/ET, interactive in edit mode for non-honing */}
                                <GrindDirToggle
                                  base={step.base}
                                  isHoning={isHoning}
                                  canToggle={!isHoning} // edit mode: toggle allowed for non-honing wheels
                                  onToggle={() =>
                                    updateStep(step.id, {
                                      base: step.base === 'rear' ? 'front' : 'rear',
                                    })
                                  }
                                />
                              </div>

                                {/* Wheel selector lives in the header for quick scanning */}
                                <WheelSelect
                                  wheels={wheels}
                                  value={step.wheelId}
                                  onChange={id => {
                                    const newWheel = wheels.find(w => w.id === id);
                                    if (!newWheel) return;
                                    // When switching to a honing wheel, force the base to front
                                    updateStep(step.id, {
                                      wheelId: newWheel.id,
                                      base: newWheel.isHoning ? 'front' : step.base,
                                    });
                                  }}
                                />

                              {/* Header right side: D editor + delete */}
                              <div className="flex items-center gap-2">
                                {/* Diameter editor */}
                                <label className="flex items-center gap-1 text-[0.7rem] text-neutral-300">
                                  <span>D =</span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    className="w-[56px] rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-right text-[0.7rem] font-mono"
                                    value={
                                      wheel.DText !== undefined
                                        ? wheel.DText
                                        : Number.isNaN(wheel.D)
                                        ? ''
                                        : String(wheel.D)
                                    }
                                    onKeyDown={blurOnEnter}
                                    onFocus={e => e.target.select()}
                                    onChange={e => {
                                      const text = e.target.value;

                                      // Mirror Wheel Manager behaviour: keep DText + numeric D in sync
                                      const patch: Partial<Wheel> = { DText: text };

                                      const trimmed = text.trim();
                                      if (trimmed === '') {
                                        // Empty → clear numeric D as well
                                        patch.D = NaN as unknown as number;
                                        updateWheel(wheel.id, patch);
                                        return;
                                      }

                                      const normalised = trimmed.replace(',', '.');
                                      const val = Number(normalised);

                                      if (!Number.isNaN(val)) {
                                        // Round to 2 dp for the math side
                                        patch.D = Math.round(val * 100) / 100;
                                      }
                                      // If invalid number (e.g. "2."), we only update DText and keep last good D
                                      updateWheel(wheel.id, patch);
                                    }}
                                  />
                                  <span>mm</span>
                                </label>

                                {/* Delete step */}
                                <button
                                  type="button"
                                  className="text-red-400 text-[0.7rem] border border-red-400 rounded px-1.5 py-0.5 hover:bg-red-900/30 active:scale-95 transition-transform"
                                  onClick={() =>
                                    setSessionSteps(prev => prev.filter(s => s.id !== step.id))
                                  }
                                  title="Delete step"
                                >
                                  <svg viewBox="0 0 24 24" className="w-3 h-3" aria-hidden="true">
                                    {/* Bin body */}
                                    <path
                                      d="M9 9h6l-.5 9h-5z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    {/* Lid */}
                                    <path
                                      d="M8 7h8"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                    />
                                    {/* Handle */}
                                    <path
                                      d="M10 7l.5-2h3l.5 2"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* === Body: angle offset + sort controls anchored at bottom === */}
                            <div className="px-2 py-2 flex items-stretch gap-2">
                              {/* Left: angle offset Δβ */}
                              <div className="flex-1 flex flex-col gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-neutral-400 text-[0.7rem]">
                                    Angle offset Δβ
                                  </span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    className="w-10 rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-right text-xs"
                                    onKeyDown={blurOnEnter}
                                    value={step.angleOffset === 0 ? '' : step.angleOffset}
                                    placeholder="0"
                                    onFocus={e => {
                                      // Select only if non-empty for quick overwrite
                                      if (e.target.value !== '') {
                                        e.target.select();
                                      }
                                    }}
                                    onChange={e => {
                                      const text = e.target.value;
                                      if (text.trim() === '') {
                                        // Empty input = treat as 0 (no offset)
                                        updateStep(step.id, { angleOffset: 0 });
                                        return;
                                      }
                                      const val = Number(text);
                                      if (!Number.isNaN(val)) {
                                        updateStep(step.id, { angleOffset: val });
                                      }
                                    }}
                                  />
                                  <span className="text-neutral-400 text-[0.7rem]">°</span>
                                </div>
                              </div>

                              {/* Right: sort controls, anchored to the bottom */}
                              <div className="flex flex-col justify-end items-end gap-2">
                                <div className="flex flex-col gap-1 items-end">
                                  <button
                                    type="button"
                                    className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs disabled:opacity-40 active:scale-95 transition-transform"
                                    onClick={() => moveStep(index, -1)}
                                    disabled={index === 0}
                                    title="Move up"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs disabled:opacity-40 active:scale-95 transition-transform"
                                    onClick={() => moveStep(index, 1)}
                                    disabled={index === sessionSteps.length - 1}
                                    title="Move down"
                                  >
                                    ↓
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add step button — same width and spacing as cards */}
                  <button
                    type="button"
                    className="w-full px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs text-center disabled:opacity-40"
                    onClick={addStep}
                    disabled={wheels.length === 0}
                  >
                    + Add step
                  </button>

                  {/* Scroll anchor */}
                  <div ref={progressionEndRef} />
                </div>
              ) : (
                // VIEW MODE – if no progression, show prompt instead of default wheels
                sessionSteps.length === 0 ? (
                  <div className="text-xs text-neutral-400 border border-dashed border-neutral-700 rounded p-2">
                    No progression steps defined yet. Click{' '}
                    <span className="font-semibold">Edit progression</span> above to add wheels and
                    steps for this calculator.
                  </div>
                ) : (
                  <div className="grid gap-1 md:grid-cols-2">
                    {wheelResults.map((r, index) => (
                      <div
                        key={r.step?.id ?? r.wheel.id}
                        className="border border-neutral-700 rounded bg-neutral-950/40 overflow-hidden"
                      >
                        {/* ===== Header bar ===== */}
                        <div className="flex items-center justify-between px-2 py-1 bg-neutral-900/80">
                          <div className="flex items-center gap-1">
                            {/* Step badge */}
                            {r.step && (
                              <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[0.7rem] font-mono text-neutral-100">
                                {index + 1}
                              </div>
                            )}

                            {/* Grind direction indicator – read-only in view mode */}
                            {r.step && (
                              <GrindDirToggle
                                base={r.step.base}
                                isHoning={r.wheel.isHoning}
                                canToggle={false}
                                onToggle={() => {}}
                              />
                            )}

                            {/* Wheel name */}
                            <div className="text-xs font-semibold text-neutral-100">
                              {r.wheel.name}
                            </div>
                          </div>

                          {/* Right side: diameter display */}
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[0.7rem] text-neutral-200">
                              D={Number.isFinite(r.wheel.D) ? r.wheel.D.toFixed(2) : '—'}mm
                            </span>
                          </div>
                        </div>

                        {/* ===== Body ===== */}
                        <div className="px-2 py-2 flex flex-col gap-2">
                          {/* Math block */}
                          <div className="grid grid-cols-2 gap-2 text-[0.75rem]">
                            <div className="border border-neutral-700 rounded p-1 flex flex-col gap-0.5">
                              <div className="text-neutral-300">
                                Wheel → USB top (rear reference)
                              </div>
                              <div className="font-mono text-sm">
                                hᵣ = {r.hrWheel.toFixed(2)} mm
                              </div>
                            </div>

                            <div className="border border-neutral-700 rounded p-1 flex flex-col gap-0.5">
                              <div className="text-neutral-300">
                                Datum → USB top (selected base)
                              </div>
                              <div className="font-mono text-sm">
                                hₙ = {r.hnBase.toFixed(2)} mm
                              </div>
                              <div className="text-neutral-400 text-[0.7rem]">
                                βₑₑₚ = {r.betaEffDeg.toFixed(2)}°
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </section>
        </>
      )}

{view === 'wheels' && (
  <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/30 flex flex-col gap-3 max-w-3xl mx-auto">
    <div className="flex justify-between items-center">
      <h2 className="text-sm font-semibold text-neutral-200">Wheel Manager</h2>
      <button
        type="button"
        className="px-2 py-1 text-xs rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
        onClick={addWheel}
      >
        + Add Wheel
      </button>
    </div>

    <p className="text-xs text-neutral-300">
      Configure your grinding and honing wheels here. These settings are shared with
      the calculator view and saved to your browser.
    </p>

    <div className="grid gap-2 md:grid-cols-2">
      {wheels.map(w => (
        <div
          key={w.id}
          className="border border-neutral-700 rounded-md p-2 bg-neutral-950/40 flex flex-col gap-2"
        >
          {/* Name */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">Wheel name</span>
            <input
              className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
              value={w.name}
              ref={el => {
                if (el && focusWheelIdRef.current === w.id && view === 'wheels') {
                  el.focus();
                  el.select();
                  // one-shot: don't refocus on every render
                  focusWheelIdRef.current = null;
                }
              }}
              onKeyDown={blurOnEnter}
              onFocus={e => e.target.select()}
              onChange={e => updateWheel(w.id, { name: e.target.value })}
            />
          </div>

        {/* Diameter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-300">D</span>
          <input
            type="text"
            inputMode="decimal"
            className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-right text-sm appearance-none"
            value={
              w.DText !== undefined
                ? w.DText
                : Number.isNaN(w.D)
                ? ''
                : String(w.D)
            }
            onKeyDown={blurOnEnter}
            onFocus={e => e.target.select()}
            onChange={e => {
              const text = e.target.value;

              // Always store the raw text so the user sees exactly what they typed
              const patch: Partial<Wheel> = { DText: text };

              const trimmed = text.trim();
              if (trimmed === '') {
                // Empty: clear numeric value as well
                patch.D = NaN as unknown as number;
                updateWheel(w.id, patch);
                return;
              }

              const normalised = trimmed.replace(',', '.');
              const val = Number(normalised);

              if (!Number.isNaN(val)) {
                // Valid number: store rounded to 2 dp for the math side
                patch.D = Math.round(val * 100) / 100;
              }
              // If it's not a valid number yet (e.g. "2."), we still keep DText
              // but don't touch D, so the last good numeric value remains.

              updateWheel(w.id, patch);
            }}
          />
          <span className="text-neutral-400 text-[0.65rem]">mm</span>
        </div>

          {/* Honing flag + base */}
          <div className="flex flex-col gap-1 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={w.isHoning}
                onChange={e =>
                  updateWheel(w.id, {
                    isHoning: e.target.checked,
                    baseForHn: e.target.checked ? 'front' : w.baseForHn,
                  })
                }
              />
              <span className="text-neutral-300">Honing wheel? (Locks to Front base)</span>
            </label>

            {!w.isHoning && (
              <div className="flex items-center gap-3 text-xs text-neutral-300">
                <span>Default base for hₙ:</span>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={w.baseForHn === 'rear'}
                    onChange={() => updateWheel(w.id, { baseForHn: 'rear' })}
                  />
                  <span>Rear (edge leading)</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={w.baseForHn === 'front'}
                    onChange={() => updateWheel(w.id, { baseForHn: 'front' })}
                  />
                  <span>Front (edge trailing)</span>
                </label>
              </div>
            )}
          </div>

          {/* Delete */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-red-400 text-xs border border-red-400 rounded px-2 py-1 hover:bg-red-900/30"
              onClick={() => deleteWheel(w.id)}
            >
              Delete wheel
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
)}

      {/* Settings view */}
      {view === 'settings' && (
        <>
          <div className="flex gap-2 mb-2 text-xs">
            <button
              type="button"
              className={
                'px-2 py-1 rounded border ' +
                (settingsView === 'machine'
                  ? 'border-emerald-500 bg-emerald-900/40'
                  : 'border-neutral-700 bg-neutral-900')
              }
              onClick={() => setSettingsView('machine')}
            >
              Machine &amp; constants
            </button>
            <button
              type="button"
              className={
                'px-2 py-1 rounded border ' +
                (settingsView === 'calibration'
                  ? 'border-emerald-500 bg-emerald-900/40'
                  : 'border-neutral-700 bg-neutral-900')
              }
              onClick={() => setSettingsView('calibration')}
            >
              Calibration wizard
            </button>
          </div>

          {/* Machine constants view */}
          {settingsView === 'machine' && (
            <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/30 flex flex-col gap-2 max-w-xl">
              <h2 className="text-sm font-semibold text-neutral-200">Machine constants</h2>
              <p className="text-xs text-neutral-300 mb-2">
                Rear and front base geometry for the active machine. Calibration will update these
                values; you can also tweak them manually.
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-400 text-xs">Rear base</span>
                  <label className="flex items-center gap-2">
                    <span className="w-10 text-neutral-300 text-xs">hc</span>
                    <input
                      type="number"
                      className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right"
                      value={constants.rear.hc}
                      onKeyDown={blurOnEnter}
                      onChange={e =>
                        setConstants(c => ({
                          ...c,
                          rear: { ...c.rear, hc: _nz(e.target.value, c.rear.hc) },
                        }))
                      }
                    />
                  </label>

                  <label className="flex items-center gap-2">
                    <span className="w-10 text-neutral-300 text-xs">o</span>
                    <input
                      type="number"
                      className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right"
                      value={constants.rear.o}
                      onKeyDown={blurOnEnter}
                      onChange={e =>
                        setConstants(c => ({
                          ...c,
                          rear: { ...c.rear, o: _nz(e.target.value, c.rear.o) },
                        }))
                      }
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-400 text-xs">Front base</span>
                  <label className="flex items-center gap-2">
                    <span className="w-10 text-neutral-300 text-xs">hc</span>
                    <input
                      type="number"
                      className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right"
                      value={constants.front.hc}
                      onKeyDown={blurOnEnter}
                      onChange={e =>
                        setConstants(c => ({
                          ...c,
                          front: { ...c.front, hc: _nz(e.target.value, c.front.hc) },
                        }))
                      }
                    />
                  </label>

                  <label className="flex items-center gap-2">
                    <span className="w-10 text-neutral-300 text-xs">o</span>
                    <input
                      type="number"
                      className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right"
                      value={constants.front.o}
                      onKeyDown={blurOnEnter}
                      onChange={e =>
                        setConstants(c => ({
                          ...c,
                          front: { ...c.front, o: _nz(e.target.value, c.front.o) },
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* Calibration wizard view */}
          {settingsView === 'calibration' && (
            <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/30 flex flex-col gap-3 max-w-xl">
              <h2 className="text-sm font-semibold text-neutral-200">Calibration wizard (single base)</h2>
              <p className="text-xs text-neutral-300">
                Measure from your chosen datum to USB top (hₙ) and from axle outer surface to USB outer surface as the full outer-to-outer span CAo at several heights. The wizard will solve hc and o for the selected base
                and estimate the worst-case angle error over your wheels.
              </p>

              {/* Base selection */}
              <div className="flex items-center gap-4 text-xs">
                <span className="text-neutral-300">Base to calibrate:</span>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={calibBase === 'rear'}
                    onChange={() => setCalibBase('rear')}
                  />
                  <span>Rear (edge leading)</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={calibBase === 'front'}
                    onChange={() => setCalibBase('front')}
                  />
                  <span>Front (edge trailing)</span>
                </label>
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
                    onChange={e => setCalibDa(_nz(e.target.value, calibDa))}
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
                    onChange={e => setCalibDs(_nz(e.target.value, calibDs))}
                  />
                </label>
              </div>

              {/* Measurement count */}
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-300">Number of measurements:</span>
                <div className="flex flex-wrap gap-4">
                  <label
                    className="flex items-center gap-1"
                    title="3 points: fast, but less robust to noise."
                  >
                    <input
                      type="radio"
                      checked={calibCount === 3}
                      onChange={() => {
                        setCalibCount(3);
                        ensureCalibRowsLength(3);
                      }}
                    />
                    <span>3</span>
                  </label>
                  <label
                    className="flex items-center gap-1"
                    title="4 points (recommended): good balance of effort and robustness."
                  >
                    <input
                      type="radio"
                      checked={calibCount === 4}
                      onChange={() => {
                        setCalibCount(4);
                        ensureCalibRowsLength(4);
                      }}
                    />
                    <span>4 (recommended)</span>
                  </label>
                  <label
                    className="flex items-center gap-1"
                    title="5 points: best redundancy, but more work. Use if you suspect noisy readings."
                  >
                    <input
                      type="radio"
                      checked={calibCount === 5}
                      onChange={() => {
                        setCalibCount(5);
                        ensureCalibRowsLength(5);
                      }}
                    />
                    <span>5</span>
                  </label>
                </div>
              </div>

              {/* Measurement table */}
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">
                    Measurements: for each height, record hₙ (datum → USB top) and CAo, the full outer-to-outer span between axle and USB (press calipers square: |O______O|, outer face of axle to outer face of USB). CA is then computed as CA = CAo − (Dₐ/2 + Dₛ/2).
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 font-mono text-[0.7rem] text-neutral-400">
                  <div>#</div>
                  <div>hₙ (mm)</div>
                  <div>CAo (mm)</div>
                </div>
                {Array.from({ length: calibCount }, (_, i) => {
                  const row = calibRows[i] ?? { hn: '', CAo: '' };
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-3 gap-1 items-center text-[0.75rem]"
                    >
                      <div className="text-neutral-500">{i + 1}</div>
                      <input
                        type="number"
                        className="rounded border border-neutral-700 bg-neutral-950 px-1 py-0.5"
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
                        className="rounded border border-neutral-700 bg-neutral-950 px-1 py-0.5"
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
                    </div>
                  );
                })}
              </div>

              {/* Actions and results */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-2 py-1 rounded border border-emerald-500 bg-emerald-900/40 hover:bg-emerald-900 text-emerald-50"
                    onClick={handleRunCalibration}
                  >
                    Compute hc &amp; o
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 disabled:opacity-40"
                    disabled={!calibResult}
                    onClick={handleApplyCalibration}
                  >
                    Apply to {calibBase === 'rear' ? 'rear base' : 'front base'}
                  </button>
                </div>

                {calibError && (
                  <div className="text-red-400 text-xs">{calibError}</div>
                )}

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
          )}
        </>
      )}
      {/* ====== PRESET MANAGER MODAL (shell) ====== */}
      {isPresetManagerOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-950 p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-neutral-100">Manage presets</h3>
            <p className="mt-1 text-[0.75rem] text-neutral-400">
              This is a placeholder for preset rename/delete. We&apos;ll wire it up next.
            </p>

            <div className="mt-3 max-h-64 overflow-y-auto text-xs">
              {sessionPresets.length === 0 ? (
                <div className="text-neutral-500">No presets saved yet.</div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {sessionPresets.map(preset => (
                    <li
                      key={preset.id}
                      className="flex items-center justify-between gap-2 rounded border border-neutral-700 bg-neutral-900 px-2 py-1"
                    >
                      <div className="flex flex-col">
                        <span className="text-neutral-100">{preset.name}</span>
                        <span className="text-[0.65rem] text-neutral-500">
                          {preset.steps.length} step{preset.steps.length === 1 ? '' : 's'}
                          {selectedPresetId === preset.id && ' · active'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="px-3 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-200 active:scale-95 transition-transform"
                onClick={() => setIsPresetManagerOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== SAVE PRESET MODAL ====== */}
      {isPresetDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-950 p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-neutral-100">Save preset</h3>
            <p className="mt-1 text-[0.75rem] text-neutral-400">
              Enter a name for this progression.
            </p>

            <div className="mt-3">
              <input
                type="text"
                className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Preset name…"
                value={presetNameDraft}
                onKeyDown={blurOnEnter}
                onChange={e => setPresetNameDraft(e.target.value)}
                autoFocus
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-300"
                onClick={() => {
                  setIsPresetDialogOpen(false);
                  setPresetNameDraft('');
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="px-3 py-1 rounded border border-emerald-500 bg-emerald-900/40 text-xs text-emerald-100 hover:bg-emerald-900 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-transform"
                onClick={handleSavePreset}
                disabled={!presetNameDraft.trim() || sessionSteps.length === 0}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
