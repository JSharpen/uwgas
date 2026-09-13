import * as React from 'react';
import { useProgressionState } from '../../state/store';

export function EmptyProgressionState() {
  const { addStep, loadDefaultProgression } = useProgressionState();

  return (
    <div className="text-sm text-white/40 neu-convex border border-black/40 rounded-3xl p-8 flex flex-col gap-4 items-center text-center shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />
      <p className="text-white/60 relative z-10 font-medium">
        No sharpening steps defined yet.
      </p>
      <div className="flex flex-col w-full gap-3 mt-2 relative z-10">
        <button
          type="button"
          className="w-full bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold h-12 px-4 rounded-2xl transition flex items-center justify-center text-sm cursor-pointer"
          onClick={loadDefaultProgression}
        >
          Load Standard Progression
        </button>
        <button
          type="button"
          className="w-full border border-white/5 hover:bg-white/5 active:bg-white/10 text-white/70 hover:text-white font-bold h-12 px-4 rounded-2xl transition flex items-center justify-center text-sm cursor-pointer"
          onClick={() => addStep()}
        >
          Add Blank Step
        </button>
      </div>
    </div>
  );
}
