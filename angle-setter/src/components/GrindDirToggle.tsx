import * as React from 'react';
import type{ BaseSide } from '../types/core';

function GrindDirToggle({
  base,
  isHoning,
  canToggle,
  onToggle,
}: {
  base: BaseSide;
  isHoning: boolean;
  canToggle: boolean; // edit-mode control
  onToggle: () => void;
}) {
  const label = base === 'rear' ? 'R' : 'F'; // Rear / Front

  // Click lock: honing OR view-mode (canToggle=false)
  const effectiveLocked = isHoning || !canToggle;

  const title = isHoning
    ? 'Honing wheel: fixed to Edge Trailing (front base)'
    : !canToggle
    ? base === 'rear'
      ? 'Edge Leading (rear base)'
      : 'Edge Trailing (front base)'
    : base === 'rear'
    ? 'Edge Leading (rear base) - click to switch to Edge Trailing'
    : 'Edge Trailing (front base) - click to switch to Edge Leading';

  const baseClasses =
    'px-2 py-1 text-[0.65rem] rounded border text-neutral-50 transition-colors';

  let stateClasses: string;

  // Styling: ONLY honing is grey. Non-honing is coloured, even if locked.
  if (isHoning) {
    stateClasses =
      'border-neutral-700 bg-neutral-900 text-neutral-500 opacity-60 cursor-not-allowed';
  } else if (base === 'rear') {
    // Edge leading
    stateClasses = 'border-emerald-500 bg-emerald-900/40 text-emerald-200';
  } else {
    // Edge trailing
    stateClasses = 'border-sky-500 bg-sky-900/40 text-sky-200';
  }

  return (
    <button
      type="button"
      title={title}
      onClick={() => {
        if (effectiveLocked) return; // still locked in view mode / honing
        onToggle();
      }}
      className={baseClasses + ' ' + stateClasses}
    >
      {label}
    </button>
  );
}

export default GrindDirToggle;
