export type BaseSide = 'rear' | 'front';

export type Wheel = {
  id: string;
  name: string;
  D: number; // effective diameter (numeric, used for math)
  DText?: string; // text version for editing
  angleOffset: number; // β° at wheel level (default)
  baseForHn: BaseSide; // default base for this wheel
  isHoning: boolean;
  grit?: string; // optional grit or abrasive label
};

export type SessionStep = {
  id: string;
  wheelId: string;
  base: BaseSide;
  angleOffset: number; // β° at step level
  notes: string;
};

export type PresetStepRef = {
  wheelId: string;
  wheelName: string;
  base: BaseSide;
  angleOffset: number;
  notes?: string;
};

export type SessionPreset = {
  id: string;
  name: string;
  notes?: string;
  createdAt: string;
  version: 1;
  steps: PresetStepRef[];
};

export type MachineConstants = {
  rear: { hc: number; o: number };
  front: { hc: number; o: number };
};

export type MachineConfig = {
  id: string;
  name: string;
  constants: MachineConstants;
  usbDiameter: number; // Ds for this machine
  jigDiameter: number; // Dj for this machine
};

export type GlobalState = {
  projection: number; // A
  usbDiameter: number; // Ds
  targetAngle: number; // β per side
  jig: { Dj: number }; // jig diameter
  microBump: { enabled: boolean; bumpDeg: number };
};

export type AppPersistedState = {
  version: number;
  global: GlobalState;
  constants: MachineConstants;
  wheels: Wheel[];
  sessionSteps: SessionStep[];
  sessionPresets: SessionPreset[];
};

export type TonInput = {
  base: BaseSide; // which base we reference hn to
  D: number; // wheel diameter (dw)
  A: number; // projection (A)
  betaDeg: number; // target β (per side)
  Dj: number; // jig diameter
  Ds: number; // USB diameter
  constants: MachineConstants;
  microBumpDeg?: number; // optional additional angle bump
  angleOffsetDeg?: number; // per-wheel or per-step β°
};

export type TonOutput = {
  hr: number; // wheel ↕ USB top (rear reference)
  hn: number; // datum ↕ USB top (chosen base)
  betaEffDeg: number; // effective grinding angle
};

export type WheelResult = {
  wheel: Wheel;
  baseForHn: BaseSide;
  orientationLabel: string;
  betaEffDeg: number;
  hrWheel: number;
  hnBase: number;
  step?: SessionStep;
};

export type CalibrationMeasurement = {
  hn: string; // datum ↕ USB TOP (mm) as entered
  CAo: string; // outer-to-outer span |O______O| between axle and USB (mm) as entered
};

export type CalibrationDiagnostics = {
  residuals: number[];
  maxAbsResidualMm: number;
};

export type CalibrationResult = {
  hc: number;
  o: number;
  diagnostics: CalibrationDiagnostics;
};

export type CalibrationSnapshot = {
  base: BaseSide;
  diagnostics: CalibrationDiagnostics;
  angleErrorDeg: number | null;
  count: number;
  Da: number;
  Ds: number;
  createdAt: string;
};
