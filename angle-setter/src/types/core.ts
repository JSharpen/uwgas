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
  machineId?: string;
  usbId?: string;
};

export type PresetStepRef = {
  wheelId: string;
  wheelName: string;
  base: BaseSide;
  angleOffset: number;
  machineId?: string;
  usbId?: string;
};

export type SessionPreset = {
  id: string;
  name: string;
  createdAt: string;
  version: 1;
  steps: PresetStepRef[];
};

export type JigConfig = {
  id: string;
  name: string;
  Dj: number;
};

export type UsbConfig = {
  id: string;
  name: string;
  Ds: number;
  threadPitch?: number; // mm per full rotation
  microAdjustMarks?: number; // number of index marks on the nut
};

export type MachineConstants = {
  rear: { hc: number; o: number };
  front: { hc: number; o: number };
};

export type MachineConfig = {
  id: string;
  name: string;
  constants: MachineConstants;
  isDefault?: boolean;
  axleDiameter?: number;
  calibrationProfiles?: CalibrationProfile[];
  activeCalibrationId?: string;
};

export type CalcMode = 'height' | 'projection';

export type GlobalState = {
  projection: number; // A (used when calcMode is 'height')
  activeUsbId: string;
  targetAngle: number; // β per side
  activeJigId: string;
  calcMode?: CalcMode; // 'height' (default) or 'projection'
  fixedUsbHeight?: number; // legacy fallback fixed USB height (mm)
  fixedUsbRear?: number; // fixed USB height for rear base (mm)
  fixedUsbFront?: number; // fixed USB height for front base (mm)
  fixedUsbMode?: 'hn' | 'hr'; // reference for fixed USB height: 'hn' (base) or 'hr' (wheel)
  useCustomFrontUsb?: boolean; // whether front USB height in projection mode overrides suggested value
};

export type AppPersistedState = {
  version: number;
  global: GlobalState;
  machines?: MachineConfig[];
  defaultMachineId?: string;
  jigs: JigConfig[];
  usbs: UsbConfig[];
  constants?: MachineConstants; // Legacy, kept for migration
  wheels: Wheel[];
  sessionSteps: SessionStep[];
  sessionPresets: SessionPreset[];
  heightMode?: 'hn' | 'hr';
  calibSnapshots?: CalibrationSnapshot[];
  calibAppliedIds?: { rear: string; front: string };
};

export type TonInput = {
  base: BaseSide; // which base we reference hn to
  D: number; // wheel diameter (dw)
  A: number; // projection (A)
  betaDeg: number; // target β (per side)
  Dj: number; // jig diameter
  Ds: number; // USB diameter
  constants: MachineConstants;
  angleOffsetDeg?: number; // per-wheel or per-step β°
};

export type TonOutput = {
  hr: number; // wheel ↕ USB top (rear reference)
  hn: number; // datum ↕ USB top (chosen base)
  betaEffDeg: number; // effective grinding angle
};

export type ProjectionInput = {
  base: BaseSide;
  D: number; // wheel diameter
  targetBetaDeg: number; // target β (per side)
  Dj: number; // jig diameter
  Ds: number; // USB diameter
  constants: MachineConstants;
  fixedUsb: { mode: 'hn' | 'hr'; value: number };
  angleOffsetDeg?: number; // per-wheel or per-step β°
};

export type ProjectionOutput = {
  A: number | null; // calculated required projection (null if unreachable)
  jg: number | null;
  CA: number;
  isReachable: boolean;
};

export type WheelResult = {
  wheel: Wheel;
  baseForHn: BaseSide;
  orientationLabel: string;
  betaEffDeg: number;
  hrWheel: number;
  hnBase: number;
  requiredProjectionA?: number | null;
  isReachable?: boolean;
  step?: SessionStep;
  unadjustedBetaDeg?: number | null;
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
  id: string;
  base: BaseSide;
  baseTag?: string; // optional user-visible tag for base
  name?: string; // optional user-supplied label
  hc: number;
  o: number;
  diagnostics: CalibrationDiagnostics;
  angleErrorDeg: number | null;
  count: number;
  Da: number;
  Ds: number;
  createdAt: string;
  measurements: CalibrationMeasurement[];
};

export type CalibrationProfile = {
  id: string;
  name: string;
  createdAt: string;
  scope: 'both' | 'rear' | 'front';
  Da: number;
  Ds: number;
  rear?: {
    hc: number;
    o: number;
    diagnostics: CalibrationDiagnostics;
    angleErrorDeg: number | null;
    measurements: CalibrationMeasurement[];
  };
  front?: {
    hc: number;
    o: number;
    diagnostics: CalibrationDiagnostics;
    angleErrorDeg: number | null;
    measurements: CalibrationMeasurement[];
  };
};
