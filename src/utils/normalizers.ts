import type {
  CalibrationDiagnostics,
  CalibrationMeasurement,
  CalibrationSnapshot,
  SessionStep,
  Wheel,
} from '../types/core';

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeWheel(raw: unknown): Wheel {
  const obj = isObject(raw) ? raw : {};
  const id = typeof obj.id === 'string' && obj.id ? obj.id : `wheel-${Date.now()}`;
  const name = typeof obj.name === 'string' ? obj.name : 'Untitled wheel';
  const grit = typeof obj.grit === 'string' ? obj.grit : undefined;
  const D = typeof obj.D === 'number' && Number.isFinite(obj.D) ? obj.D : NaN;
  const DText =
    typeof obj.DText === 'string'
      ? obj.DText
      : typeof obj.D === 'number' && !Number.isNaN(obj.D)
      ? String(obj.D)
      : '';
  const angleOffset =
    typeof obj.angleOffset === 'number' && Number.isFinite(obj.angleOffset)
      ? obj.angleOffset
      : 0;
  const isHoning = Boolean(obj.isHoning);
  const baseForHn = obj.baseForHn === 'front' ? 'front' : 'rear';

  return {
    id,
    name,
    grit,
    D,
    DText,
    angleOffset,
    isHoning,
    baseForHn,
  };
}

export function normalizeSessionStep(raw: unknown): SessionStep {
  const obj = isObject(raw) ? raw : {};
  const id =
    typeof obj.id === 'string' && obj.id
      ? obj.id
      : `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const wheelId = typeof obj.wheelId === 'string' ? obj.wheelId : '';
  const base = obj.base === 'front' ? 'front' : 'rear';
  const angleOffset =
    typeof obj.angleOffset === 'number' && Number.isFinite(obj.angleOffset)
      ? obj.angleOffset
      : 0;

  return {
    id,
    wheelId,
    base,
    angleOffset,
  };
}

export function normalizeCalibrationSnapshots(items: unknown[]): CalibrationSnapshot[] {
  return items
    .map((item, idx) => {
      if (!isObject(item)) return null;
      const base: 'rear' | 'front' = item.base === 'front' ? 'front' : 'rear';
      const hc = typeof item.hc === 'number' ? item.hc : 0;
      const o = typeof item.o === 'number' ? item.o : 0;
      const id =
        typeof item.id === 'string' && item.id
          ? item.id
          : `snap-${base}-${Date.now()}-${idx}`;
      const diagRaw = isObject(item.diagnostics) ? item.diagnostics : {};
      const residuals = Array.isArray(diagRaw.residuals)
        ? (diagRaw.residuals.filter(r => typeof r === 'number') as number[])
        : [];
      const maxAbsResidualMm =
        typeof diagRaw.maxAbsResidualMm === 'number' ? diagRaw.maxAbsResidualMm : 0;
      const diagnostics: CalibrationDiagnostics = { residuals, maxAbsResidualMm };
      const angleErrorDeg =
        typeof item.angleErrorDeg === 'number' ? item.angleErrorDeg : null;
      const count = typeof item.count === 'number' ? item.count : residuals.length || 0;
      const Da = typeof item.Da === 'number' ? item.Da : 12;
      const Ds = typeof item.Ds === 'number' ? item.Ds : 12;
      const createdAt =
        typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString();
      const baseTag = typeof item.baseTag === 'string' ? item.baseTag : undefined;
      const name = typeof item.name === 'string' ? item.name : undefined;
      const rawRows = Array.isArray(item.measurements) ? item.measurements : [];
      const measurements: CalibrationMeasurement[] = rawRows.map(row => {
        const r = isObject(row) ? row : {};
        return {
          hn: typeof r.hn === 'string' ? r.hn : String(r.hn ?? ''),
          CAo: typeof r.CAo === 'string' ? r.CAo : String(r.CAo ?? ''),
        };
      });

      const snapshot: CalibrationSnapshot = {
        id,
        base,
        baseTag,
        name,
        hc,
        o,
        diagnostics,
        angleErrorDeg,
        count,
        Da,
        Ds,
        createdAt,
        measurements,
      };
      return snapshot;
    })
    .filter((s): s is CalibrationSnapshot => s !== null);
}
