import * as React from 'react';
import { Wheel } from '../types/core';

type WheelSelectProps = {
  wheels: Wheel[];
  value: string;
  onChange: (id: string) => void;
};

function WheelSelect({ wheels, value, onChange }: WheelSelectProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const selected = wheels.find(w => w.id === value) || null;

  const handleSelect = (id: string) => {
    onChange(id);
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
          {selected ? selected.name : 'Select wheel'}
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
        <div className="absolute left-0 mt-1 z-20 w-44 max-h-60 overflow-auto rounded border border-neutral-700 bg-neutral-950 shadow-lg">
          {wheels.length === 0 && (
            <div className="px-2 py-1 text-[0.7rem] text-neutral-500">No wheels defined</div>
          )}
          {wheels.map(w => {
            const isActive = w.id === value;
            return (
              <button
                key={w.id}
                type="button"
                className={
                  'w-full px-2 py-1 text-left text-[0.75rem] ' +
                  (isActive
                    ? 'bg-emerald-900/40 text-emerald-100'
                    : 'bg-neutral-950 text-neutral-100 hover:bg-neutral-900')
                }
                onClick={() => handleSelect(w.id)}
              >
                {w.name}
                {w.isHoning && (
                  <span className="ml-1 text-[0.65rem] text-emerald-300">• honing</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WheelSelect;
