import * as React from 'react';

type Option = { value: string; label: React.ReactNode; meta?: React.ReactNode; disabled?: boolean };

type MiniSelectProps = {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  align?: 'left' | 'right';
  widthClass?: string;
  menuWidthClass?: string;
  emptyLabel?: string;
  renderOption?: (option: Option, isActive: boolean) => React.ReactNode;
  renderLabel?: (option: Option | undefined) => React.ReactNode;
  liftOnOpen?: boolean;
};

function MiniSelect({
  value,
  options,
  onChange,
  ariaLabel,
  align = 'left',
  widthClass,
  menuWidthClass,
  emptyLabel = 'No options',
  renderOption,
  renderLabel,
  liftOnOpen = true,
}: MiniSelectProps) {
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const [isMenuClosing, setIsMenuClosing] = React.useState(false);
  const menuCloseTimerRef = React.useRef<number | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const cleanupRefs = React.useRef<(() => void)[]>([]);

  // Lift the nearest card when the menu is open so the menu sits above neighboring cards.
  React.useEffect(() => {
    // We hoist overflow on both the card and its containing panel to allow menus to escape.
    if (!liftOnOpen || !isMenuVisible) return;
    const hostCard = rootRef.current?.closest<HTMLElement>('.card-elevated, .bg-\\[\\#262626\\]');
    const hostPanel = rootRef.current?.closest<HTMLElement>('.panel-card, .bg-\\[\\#262626\\]');
    const cleanups: (() => void)[] = [];
    const apply = (el: HTMLElement | null | undefined) => {
      if (!el) return;
      const prevZ = el.style.zIndex;
      const prevOverflow = el.style.overflow;
      el.style.zIndex = '3000';
      el.style.overflow = 'visible';
      cleanups.push(() => {
        el.style.zIndex = prevZ;
        el.style.overflow = prevOverflow;
      });
    };
    apply(hostCard);
    apply(hostPanel);
    cleanupRefs.current = cleanups;
    return () => {
      cleanupRefs.current.forEach(fn => fn());
      cleanupRefs.current = [];
    };
  }, [isMenuVisible, liftOnOpen]);

  const selected = options.find(o => o.value === value) ?? options[0];

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

  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const touchMovedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isMenuVisible) return;

    const handleMouseDown = (event: MouseEvent) => {
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
        touchMovedRef.current = true; // treat as scroll/drag
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

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
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
    <div
      ref={rootRef}
      className={`relative text-xs ${widthClass ?? 'flex-shrink-0'}`}
    >
      <button
        type="button"
        className={`w-full min-h-[42px] bg-black/30 hover:bg-white/5 active:bg-white/10 border ${
          isMenuVisible ? 'border-amber-400/60 ring-2 ring-amber-400/20' : 'border-white/10 hover:border-white/20'
        } rounded-xl px-3.5 py-2 text-xs font-semibold text-white flex items-center justify-between gap-2 min-w-0 transition-all`}
        aria-label={ariaLabel}
        onClick={() => {
          if (isMenuVisible && !isMenuClosing) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
      >
        <span className="truncate min-w-0 flex-1 text-left font-medium">
          {renderLabel ? renderLabel(selected) : selected?.label ?? ''}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={
            'w-3.5 h-3.5 text-white/50 shrink-0 transition-transform duration-200 ' +
            (isMenuVisible ? 'rotate-180 text-amber-400' : 'rotate-0')
          }
          aria-hidden="true"
        >
          <path
            d="M7 10l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isMenuVisible && (
        <div
          className={`absolute z-30 mt-1.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuWidthClass ?? 'w-48 sm:w-56 min-w-full'} bg-[#262626] border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-md overflow-hidden ${
            isMenuClosing ? 'dropdown-menu--closing' : 'dropdown-menu--opening'
          }`}
        >
          <div className="max-h-64 overflow-y-auto overflow-x-hidden flex flex-col gap-1">
            {options.length === 0 ? (
              <div className="p-3 text-center text-xs text-white/40">{emptyLabel}</div>
            ) : (
              options.map(opt => {
                const isActive = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`w-full min-h-[40px] px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center justify-between gap-2 text-left disabled:opacity-40 disabled:hover:bg-transparent ${
                      isActive
                        ? 'bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold'
                        : 'text-white/80 hover:bg-white/10 hover:text-white border border-transparent'
                    }`}
                    disabled={opt.disabled}
                    onClick={() => {
                      if (opt.disabled) return;
                      onChange(opt.value);
                      closeMenu();
                    }}
                  >
                    {renderOption ? (
                      renderOption(opt, isActive)
                    ) : (
                      <>
                        <span className={`truncate flex-1 font-medium ${isActive ? 'text-amber-300 font-bold' : 'text-white'}`}>
                          {opt.label}
                        </span>
                        {opt.meta ? (
                          <span className={`text-[10px] font-mono shrink-0 ${isActive ? 'text-amber-300/80 font-bold' : 'text-white/40'}`}>
                            {opt.meta}
                          </span>
                        ) : null}
                      </>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MiniSelect;
