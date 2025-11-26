import * as React from 'react';
import type{ SessionPreset } from '../types/core';

type PresetSelectProps = {
  presets: SessionPreset[];
  value: string;
  onChange: (id: string) => void;
};

function PresetSelect({ presets, value, onChange }: PresetSelectProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const selected = presets.find(p => p.id === value) || null;

  const handleSelect = (id: string) => {
    onChange(id); // parent will load the preset
    setOpen(false);
  };

  React.useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative text-xs min-w-[7rem] max-w-[9rem]">
      {/* Shell / trigger */}
      <button
        type="button"
        className={
          'inline-flex w-full items-center justify-between gap-1 rounded border px-2 py-1 text-xs ' +
          (open
            ? 'border-sky-400 bg-neutral-900 shadow-md'
            : 'border-neutral-700 bg-neutral-950 hover:bg-neutral-900')
        }
        onClick={() => setOpen(o => !o)}
      >
        <span className="truncate text-left">
          {selected ? selected.name : 'Select preset'}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={'w-3 h-3 transition-transform ' + (open ? 'rotate-180' : 'rotate-0')}
          aria-hidden="true"
        >
          <path
            d="M7 10l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Menu */}
      {open && (
        <div className="absolute right-0 mt-1 z-20 w-48 max-h-60 overflow-auto rounded border border-neutral-700 bg-neutral-950 shadow-lg">
          {presets.length === 0 && (
            <div className="px-2 py-1 text-[0.7rem] text-neutral-500">No presets saved</div>
          )}
          {presets.map(p => {
            const isActive = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                className={
                  'w-full px-2 py-1 text-left text-[0.75rem] ' +
                  (isActive
                    ? 'bg-emerald-900/40 text-emerald-100'
                    : 'bg-neutral-950 text-neutral-100 hover:bg-neutral-900')
                }
                onClick={() => handleSelect(p.id)}
              >
                <span className="truncate">{p.name}</span>
                <span className="ml-1 text-[0.65rem] text-neutral-500">
                  • {p.steps.length} step{p.steps.length === 1 ? '' : 's'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PresetSelect;
