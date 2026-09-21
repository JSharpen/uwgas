import * as fs from 'fs';

let content = fs.readFileSync('src/utils/wheelWear.ts', 'utf8');

const newCode = `
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
    return 'Measurement required';
  }

  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  return \`Measure in \${daysRemaining} day\${daysRemaining === 1 ? '' : 's'}\`;
}
`;

content += '\n' + newCode;
fs.writeFileSync('src/utils/wheelWear.ts', content);
