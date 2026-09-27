import type { MachineConfig } from '../types/core';

export function isMachineUnmapped(m: MachineConfig): boolean {
  const hasRear = m.calibrationProfiles?.some(p => p.rear) || false;
  const hasFront = m.calibrationProfiles?.some(p => p.front) || false;
  return !hasRear || !hasFront;
}
