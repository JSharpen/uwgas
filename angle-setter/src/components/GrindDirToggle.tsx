import type { BaseSide } from '../types/core';
import { IconEdgeLeading, IconEdgeTrailing } from '../icons';

function GrindDirToggle({
  base,
  isHoning,
  canToggle,
  onToggle,
  showLabel = false,
}: {
  base: BaseSide;
  isHoning: boolean;
  canToggle: boolean; // edit-mode control
  onToggle: () => void;
  showLabel?: boolean;
}) {
  const isRear = base === 'rear';
  const label = isRear ? 'R' : 'F';

  // Click lock: honing OR view-mode (canToggle=false)
  const effectiveLocked = isHoning || !canToggle;

  const title = isHoning
    ? 'Honing wheel: fixed to Edge Trailing (front base)'
    : !canToggle
    ? isRear
      ? 'Edge Leading (rear base)'
      : 'Edge Trailing (front base)'
    : isRear
    ? 'Edge Leading (rear base) - click to switch to Edge Trailing'
    : 'Edge Trailing (front base) - click to switch to Edge Leading';

  let stateClasses = '';

  if (isHoning) {
    stateClasses =
      'bg-neutral-950/60 border-neutral-800 text-neutral-500 opacity-60 cursor-not-allowed';
  } else if (isRear) {
    // Edge leading (Amber accent)
    stateClasses = effectiveLocked
      ? 'bg-amber-400/15 border-amber-400/30 text-amber-300 cursor-default'
      : 'bg-amber-400/20 hover:bg-amber-400/30 active:bg-amber-400/40 border-amber-400/50 text-amber-300 shadow-sm cursor-pointer hover:scale-105 active:scale-95';
  } else {
    // Edge trailing (Sky focus)
    stateClasses = effectiveLocked
      ? 'bg-sky-500/15 border-sky-400/30 text-sky-300 cursor-default'
      : 'bg-sky-500/20 hover:bg-sky-500/30 active:bg-sky-500/40 border-sky-400/50 text-sky-300 shadow-sm cursor-pointer hover:scale-105 active:scale-95';
  }

  return (
    <button
      type="button"
      title={title}
      disabled={effectiveLocked}
      onClick={() => {
        if (effectiveLocked) return;
        onToggle();
      }}
      className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full border inline-flex items-center justify-center gap-1.5 text-xs font-bold transition-all duration-200 select-none ${stateClasses}`}
    >
      {isRear ? (
        <IconEdgeLeading className="w-4 h-4 text-amber-400 shrink-0" />
      ) : (
        <IconEdgeTrailing className="w-4 h-4 text-sky-400 shrink-0" />
      )}
      <span className="font-mono font-semibold">
        {showLabel ? `Base ${label}` : label}
      </span>
    </button>
  );
}

export default GrindDirToggle;
