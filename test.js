import { z } from 'zod';

const CalibrationDiagnosticsSchema = z.object({
  residuals: z.array(z.number()).catch([]),
  maxAbsResidualMm: z.number(),
});

const CalibrationMeasurementSchema = z.object({
  hn: z.string(),
  CAo: z.string(),
});

const CalibrationProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  scope: z.enum(['both', 'rear', 'front']),
  Da: z.number(),
  Ds: z.number(),
  rear: z.object({
    hc: z.number(),
    o: z.number(),
    diagnostics: CalibrationDiagnosticsSchema,
    angleErrorDeg: z.number().nullable().catch(null),
    measurements: z.array(CalibrationMeasurementSchema).catch([]),
  }).optional(),
  front: z.object({
    hc: z.number(),
    o: z.number(),
    diagnostics: CalibrationDiagnosticsSchema,
    angleErrorDeg: z.number().nullable().catch(null),
    measurements: z.array(CalibrationMeasurementSchema).catch([]),
  }).optional(),
});

const p1 = {
  id: "abc",
  name: 'Factory Default',
  createdAt: new Date().toISOString(),
  scope: 'both', Da: 12, Ds: 12,
  rear: { hc: 50, o: 20, diagnostics: { maxAbsResidualMm: 1.2 } },
  front: { hc: -10, o: 30, diagnostics: { maxAbsResidualMm: 0.9 } }
};

const result = CalibrationProfileSchema.safeParse(p1);
if (!result.success) {
  console.log("FAILED!", JSON.stringify(result.error.errors, null, 2));
} else {
  console.log("SUCCESS!", result.data);
}
