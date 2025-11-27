import type { MachineConstants, GlobalState, Wheel } from '../types/core';
export const DEFAULT_GLOBAL: GlobalState = {
  projection: 127.39,
  usbDiameter: 11.98,
  targetAngle: 16,
  jig: { Dj: 12 },
  microBump: { enabled: false, bumpDeg: 0 },
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

  // Honing - T-8 / T-7

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

  // ===== 200 mm class - T-4 / T-3 =====

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

  // Honing - T-4 / T-3

  {
    id: `wheel-la145-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'LA-145 Leather Honing Wheel',
    D: 145.0,
    angleOffset: 0,
    baseForHn: 'front',
    isHoning: true,
  },
];
