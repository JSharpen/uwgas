import * as React from 'react';
import type { SessionPreset } from '../types/core';

type PresetSelectProps = {
  presets: SessionPreset[];
  value: string;
  onChange: (id: string) => void;
};

function PresetSelect({ presets, value, onChange }: PresetSelectProps) {
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const [isMenuClosing, setIsMenuClosing] = React.useState(false);
  const menuCloseTimerRef = React.useRef<number | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const touchMovedRef = React.useRef(false);

  const selected = presets.find(p => p.id === value) || null;

  const handleSelect = (id: string) => {
    onChange(id); // parent will load the preset
    closeMenu();
  };

const openMenu = React.useCallback(() => {
  if (menuCloseTimerRef.current) {
    window.clearTimeout(menuCloseTimerRef.current);
    menuCloseTimerRef.current = null;
  }
    setIsMenuVisible(true);
    setIsMenuClosing(false);
  }, []);

  const closeMenu = React.useCallback(() => {
    if (!isMenuVisible) return;
    if (menuCloseTimerRef.current) {
      window.clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
    setIsMenuClosing(true);
    menuCloseTimerRef.current = window.setTimeout(() => {
      setIsMenuVisible(false);
      setIsMenuClosing(false);
      menuCloseTimerRef.current = null;
    }, 160);
  }, [isMenuVisible]);

  React.useEffect(() => {
    if (!isMenuVisible) return;

    const handlePointer = (event: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      const t = event.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY };
      touchMovedRef.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = event.touches[0];
      const dx = Math.abs(t.clientX - touchStartRef.current.x);
      const dy = Math.abs(t.clientY - touchStartRef.current.y);
      if (dx > 8 || dy > 8) {
        touchMovedRef.current = true; // scrolling/dragging
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchMovedRef.current) return;
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [closeMenu, isMenuVisible]);

  React.useEffect(() => {
    return () => {
      if (menuCloseTimerRef.current) {
        window.clearTimeout(menuCloseTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="relative text-xs min-w-[7rem] max-w-[9rem]">
      {/* Shell / trigger */}
      <button
        type="button"
        className={
          'inline-flex w-full items-center justify-between gap-1 rounded border px-2 py-1 text-xs ' +
          (isMenuVisible
            ? 'border-sky-400 bg-neutral-900 shadow-md'
            : 'border-neutral-700 bg-neutral-950 hover:bg-neutral-900')
        }
        onClick={() => {
          if (isMenuVisible && !isMenuClosing) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
      >
        <span className="truncate text-left">
          {selected ? selected.name : 'Select preset'}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={'w-3 h-3 transition-transform ' + (isMenuVisible ? 'rotate-180' : 'rotate-0')}
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
      {isMenuVisible && (
        <div
          className="absolute right-0 mt-1 z-20 w-48 max-h-36 overflow-auto rounded border border-neutral-700 bg-neutral-950 shadow-lg"
          style={{
            animation: `${isMenuClosing ? 'dropdownOut 140ms ease-in forwards' : 'dropdownIn 160ms ease-out forwards'}`,
            transformOrigin: 'top right',
          }}
        >
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
