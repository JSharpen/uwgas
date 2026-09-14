import { z } from 'zod';

export const BaseSideSchema = z.enum(['rear', 'front']);

export const WheelSchema = z.object({
  id: z.string(),
  name: z.string(),
  D: z.number(),
  DText: z.string().optional(),
  angleOffset: z.number(),
  baseForHn: BaseSideSchema,
  isHoning: z.boolean(),
  grit: z.string().optional(),
});

export const SessionStepSchema = z.object({
  id: z.string(),
  wheelId: z.string(),
  base: BaseSideSchema,
  angleOffset: z.number(),
  machineId: z.string().optional(),
  usbId: z.string().optional(),
});

export const PresetStepRefSchema = z.object({
  wheelId: z.string(),
  wheelName: z.string(),
  base: BaseSideSchema,
  angleOffset: z.number(),
  machineId: z.string().optional(),
  usbId: z.string().optional(),
});

export const PresetContextSchema = z.object({
  targetAngle: z.number().optional(),
  machineId: z.string().optional(),
  usbId: z.string().optional(),
});

export const SessionPresetSchema = z.preprocess((val: unknown) => {
  if (val && typeof val === 'object' && 'version' in val && (val as Record<string, unknown>).version === 1) {
    // Migrate v1 to v2
    const typedVal = val as Record<string, unknown>;
    const includeHardware = typedVal.includeHardware as boolean | undefined;
    let machineId: string | undefined;
    let usbId: string | undefined;
    
    if (includeHardware && Array.isArray(typedVal.steps)) {
      const hwStep = typedVal.steps.find((s: unknown) => {
        const step = s as Record<string, unknown>;
        return step && (step.machineId || step.usbId);
      }) as Record<string, unknown> | undefined;
      if (hwStep) {
        machineId = hwStep.machineId as string | undefined;
        usbId = hwStep.usbId as string | undefined;
      }
    }

    return {
      ...typedVal,
      version: 2,
      context: (includeHardware && (machineId || usbId)) ? { machineId, usbId } : undefined,
    };
  }
  return val;
}, z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  version: z.literal(2),
  steps: z.array(PresetStepRefSchema),
  includeHardware: z.boolean().optional(),
  context: PresetContextSchema.optional(),
}));

export const JigConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  Dj: z.number(),
  length: z.number().optional(),
  isAdjustableLength: z.boolean().optional(),
  threadPitch: z.number().optional(),
});

export const UsbConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  Ds: z.number(),
  threadPitch: z.number().optional(),
  microAdjustMarks: z.number().optional(),
});

export const MachineConstantsSchema = z.object({
  rear: z.object({ hc: z.number(), o: z.number() }),
  front: z.object({ hc: z.number(), o: z.number() }),
});

export const CalibrationMeasurementSchema = z.object({
  hn: z.string(),
  CAo: z.string(),
});

export const CalibrationDiagnosticsSchema = z.object({
  residuals: z.array(z.number()),
  maxAbsResidualMm: z.number(),
});

export const CalibrationProfileSchema = z.object({
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
    angleErrorDeg: z.number().nullable(),
    measurements: z.array(CalibrationMeasurementSchema),
  }).optional(),
  front: z.object({
    hc: z.number(),
    o: z.number(),
    diagnostics: CalibrationDiagnosticsSchema,
    angleErrorDeg: z.number().nullable(),
    measurements: z.array(CalibrationMeasurementSchema),
  }).optional(),
});

export const MachineConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  constants: MachineConstantsSchema,
  isDefault: z.boolean().optional(),
  axleDiameter: z.number().optional(),
  calibrationProfiles: z.array(CalibrationProfileSchema).optional(),
  activeCalibrationId: z.string().optional(),
});

export const CalcModeSchema = z.enum(['height', 'projection']);

export const GlobalStateSchema = z.object({
  projection: z.number(),
  activeMachineId: z.string().optional(),
  activeUsbId: z.string(),
  targetAngle: z.number(),
  activeJigId: z.string(),
  useProtrusionMode: z.boolean().optional(),
  protrusion: z.number().optional(),
  calcMode: CalcModeSchema.optional(),
  fixedUsbHeight: z.number().optional(),
  fixedUsbRear: z.number().optional(),
  fixedUsbFront: z.number().optional(),
  fixedUsbMode: z.enum(['hn', 'hr']).optional(),
  useCustomFrontUsb: z.boolean().optional(),
  showAdvancedStepOverrides: z.boolean().optional(),
});

export const AppPersistedStateSchema = z.object({
  version: z.number(),
  global: GlobalStateSchema,
  machines: z.array(MachineConfigSchema).optional(),
  defaultMachineId: z.string().optional(),
  jigs: z.array(JigConfigSchema),
  usbs: z.array(UsbConfigSchema),
  constants: MachineConstantsSchema.optional(), // Legacy
  wheels: z.array(WheelSchema),
  sessionSteps: z.array(SessionStepSchema),
  sessionPresets: z.array(SessionPresetSchema),
  heightMode: z.enum(['hn', 'hr']).optional(),
  calibSnapshots: z.array(z.any()).optional(),
  calibAppliedIds: z.any().optional(),
});

