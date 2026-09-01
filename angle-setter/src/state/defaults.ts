import type { MachineConstants, GlobalState, Wheel, JigConfig, UsbConfig } from '../types/core';

export const DEFAULT_JIGS: JigConfig[] = [
  { id: 'jig-svm45', name: 'SVM-45', Dj: 12, isAdjustableLength: true, length: 100, threadPitch: 1.5 },
  { id: 'jig-kj45', name: 'KJ-45 Centering', Dj: 12, isAdjustableLength: false, length: 100 },
  { id: 'jig-svm140', name: 'SVM-140', Dj: 12, isAdjustableLength: true, length: 140, threadPitch: 1.5 },
  { id: 'jig-kj140', name: 'KJ-140 Centering', Dj: 12, isAdjustableLength: false, length: 140 },
];

export const DEFAULT_USBS: UsbConfig[] = [
  { id: 'usb-tormek', name: 'Tormek Standard', Ds: 11.98, threadPitch: 1.5, microAdjustMarks: 6 },
  { id: 'usb-fvb', name: 'Frontal Vertical Base', Ds: 12, threadPitch: 1.5, microAdjustMarks: 6 },
];
export const DEFAULT_GLOBAL: GlobalState = {
  projection: 127.39,
  activeUsbId: 'usb-tormek',
  targetAngle: 16,
  activeJigId: 'jig-svm45',
  calcMode: 'height',
  fixedUsbHeight: 150.0,
  fixedUsbRear: 150.0,
  fixedUsbFront: 85.0,
  fixedUsbMode: 'hn',
  useCustomFrontUsb: false,
  useProtrusionMode: false,
  protrusion: 25.0,
};

export const DEFAULT_CONSTANTS: MachineConstants = {
  // These are "reasonable" T8-like defaults and can be edited in UI
  rear: { hc: 29.0, o: 50.0 },
  front: { hc: 51.3, o: 131.7 },
};

export const DEFAULT_WHEELS: Wheel[] = [
  // ===== 250 mm class - T-8 / T-7 =====

  {
    id: `wheel-sg250-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'SG-250 Original Grindstone',
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

  // Honing - T-8 / T-7

  {
    id: `wheel-la220-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'LA-220 Leather Honing Wheel',
    D: 215.0, // you can change to your measured value (e.g. 215) if you prefer
    angleOffset: 0,
    baseForHn: 'front',
    isHoning: true,
  },
];
