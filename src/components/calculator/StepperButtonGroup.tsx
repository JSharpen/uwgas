import * as React from 'react';

interface StepperOption {
  label: string;
  value: number;
}

interface StepperButtonGroupProps {
  options: StepperOption[];
  onStep: (delta: number) => void;
  className?: string; // Optional override for button styling
}

export function StepperButtonGroup({ options, onStep, className }: StepperButtonGroupProps) {
  return (
    <div className="flex gap-2 w-full mt-1">
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          className={`flex-1 h-12 rounded-xl font-bold tabular-nums text-sm flex items-center justify-center active:scale-95 transition-all ${className || 'neu-button text-white/80'}`}
          onClick={() => onStep(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

