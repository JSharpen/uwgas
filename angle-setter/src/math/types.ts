/**
 * Sacred Pure Math Geometric Types & Contracts (Tier 1)
 *
 * ZERO UI / Application domain models. Contains only pure geometric coordinates,
 * machine frame dimensions, and forward/inverse solver inputs and outputs.
 */

export type BaseSide = 'rear' | 'front';

export type FixedUsbReference = 'hn' | 'hr';

export interface MachineBaseConstants {
  readonly hc: number;
  readonly o: number;
}

export interface MachineConstants {
  readonly rear: MachineBaseConstants;
  readonly front: MachineBaseConstants;
}

export interface ReadonlyTonInput {
  readonly base: BaseSide;
  readonly D: number;
  readonly A: number;
  readonly betaDeg: number;
  readonly Dj: number;
  readonly Ds: number;
  readonly constants: MachineConstants;
  readonly angleOffsetDeg?: number;
}

export interface ReadonlyTonOutput {
  readonly hn: number;
  readonly hr: number;
  readonly CA: number;
  readonly y: number;
  readonly phiRad: number;
  readonly betaEffDeg: number;
}

export interface ReadonlyProjectionInput {
  readonly base: BaseSide;
  readonly D: number;
  readonly targetBetaDeg: number;
  readonly Dj: number;
  readonly Ds: number;
  readonly constants: MachineConstants;
  readonly fixedUsb: Readonly<{
    readonly mode: FixedUsbReference;
    readonly value: number;
  }>;
  readonly angleOffsetDeg?: number;
}

export interface ReadonlyProjectionOutput {
  readonly A: number | null;
  readonly jg: number | null;
  readonly CA: number;
  readonly isReachable: boolean;
}

export interface ReadonlyCalibrationMeasurement {
  readonly hn: number | string;
  readonly CAo: number | string;
}

export interface CalibrationDiagnosticsOutput {
  readonly residuals: number[];
  readonly maxAbsResidualMm: number;
}

export interface CalibrationResultOutput {
  readonly hc: number;
  readonly o: number;
  readonly diagnostics: CalibrationDiagnosticsOutput;
}

// Convenient aliases for internal math engine use
export type TonInput = ReadonlyTonInput;
export type TonOutput = ReadonlyTonOutput;
export type ProjectionInput = ReadonlyProjectionInput;
export type ProjectionOutput = ReadonlyProjectionOutput;
export type CalibrationMeasurement = ReadonlyCalibrationMeasurement;
export type CalibrationResult = CalibrationResultOutput;
export type CalibrationDiagnostics = CalibrationDiagnosticsOutput;
