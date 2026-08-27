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
    const hostCard = rootRef.current?.closest<HTMLElement>('.card-elevated');
    const hostPanel = rootRef.current?.closest<HTMLElement>('.panel-card');
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

  const alignClass =
    align === 'right' ? 'dropdown-menu--align-right' : 'dropdown-menu--align-left';

  return (
    <div
      ref={rootRef}
      className={`dropdown text-xs ${widthClass ?? 'flex-shrink-0'} ${
        isMenuVisible ? 'dropdown--open' : ''
      }`}
    >
      <button
        type="button"
        className={`dropdown-trigger dropdown-trigger--sm w-full flex items-center justify-between gap-1.5 min-w-0 ${
          isMenuVisible ? 'dropdown-trigger--open' : ''
        }`}
        aria-label={ariaLabel}
        onClick={() => {
          if (isMenuVisible && !isMenuClosing) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
      >
        <span className="truncate min-w-0 flex-1 text-left">
          {renderLabel ? renderLabel(selected) : selected?.label ?? ''}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={
            'w-3 h-3 shrink-0 transition-transform ' +
            (isMenuVisible ? 'rotate-180' : 'rotate-0')
          }
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

      {isMenuVisible && (
        <div
          className={`dropdown-menu z-30 ${alignClass} ${
            isMenuClosing ? 'dropdown-menu--closing' : 'dropdown-menu--opening'
          } ${menuWidthClass ?? 'w-32'}`}
        >
          <div className="dropdown-menu__body">
            {options.length === 0 ? (
              <div className="dropdown-empty text-[0.7rem]">{emptyLabel}</div>
            ) : (
              options.map(opt => {
                const isActive = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`dropdown-item ${isActive ? 'dropdown-item--active' : ''}`}
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
                        <div className="dropdown-item__title">{opt.label}</div>
                        {opt.meta ? <div className="dropdown-item__meta">{opt.meta}</div> : null}
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
