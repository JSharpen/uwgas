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



export function getMeasurementCountdownText(wheel: import('../types/core').Wheel): string | null {
  if (!wheel.isWearable || !wheel.measuredAt || !wheel.remeasureInterval) {
    return null;
  }

  let daysMultiplier = 1;
  switch (wheel.remeasureIntervalUnit) {
    case 'weeks':
      daysMultiplier = 7;
      break;
    case 'months':
      daysMultiplier = 30;
      break;
    case 'days':
    default:
      daysMultiplier = 1;
      break;
  }

  const intervalMs = wheel.remeasureInterval * daysMultiplier * 24 * 60 * 60 * 1000;
  const targetTime = wheel.measuredAt + intervalMs;
  const msRemaining = targetTime - Date.now();
  
  if (msRemaining <= 0) {
    return 'OVERDUE';
  }

  const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  if (days > 0) {
    return `${days}d`;
  }

  const hours = Math.floor(msRemaining / (1000 * 60 * 60));
  if (hours > 0) {
    return `${hours}h`;
  }

  const minutes = Math.floor(msRemaining / (1000 * 60));
  if (minutes > 0) {
    return `${minutes}m`;
  }

  return '<1m';
}
