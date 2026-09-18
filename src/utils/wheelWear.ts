import type { Wheel } from '../types/core';

export function isWheelOverdue(wheel: Wheel): boolean {
  if (!wheel.isWearable || !wheel.measuredAt || !wheel.remeasureInterval) {
    return false;
  }

  let daysMultiplier = 1;
  switch (wheel.remeasureIntervalUnit) {
    case 'weeks':
      daysMultiplier = 7;
      break;
    case 'months':
      daysMultiplier = 30; // Approximation is fine here
      break;
    case 'days':
    default:
      daysMultiplier = 1;
      break;
  }

  const intervalMs = wheel.remeasureInterval * daysMultiplier * 24 * 60 * 60 * 1000;
  const timeSinceMeasurement = Date.now() - wheel.measuredAt;

  return timeSinceMeasurement > intervalMs;
}

