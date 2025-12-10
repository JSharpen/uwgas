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

  // Lift the nearest card when the menu is open so the menu sits above neighboring cards.
  React.useEffect(() => {
    if (!liftOnOpen) return;
    const host = rootRef.current?.closest<HTMLElement>('.card-elevated');
    if (!host) return;
    const prevZ = host.style.zIndex;
    const prevOverflow = host.style.overflow;
    if (isMenuVisible) {
      host.style.zIndex = '3000';
      host.style.overflow = 'visible';
    } else {
      host.style.zIndex = prevZ;
      host.style.overflow = prevOverflow;
    }
    return () => {
      host.style.zIndex = prevZ;
      host.style.overflow = prevOverflow;
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
      className={`dropdown text-xs flex-shrink-0 ${isMenuVisible ? 'dropdown--open' : ''} ${
        widthClass ?? ''
      }`}
    >
      <button
        type="button"
        className={`dropdown-trigger dropdown-trigger--sm ${
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
        <span className="truncate">{renderLabel ? renderLabel(selected) : selected?.label ?? ''}</span>
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

      {isMenuVisible && (
        <div
          className={`dropdown-menu z-30 ${alignClass} ${
            isMenuClosing ? 'dropdown-menu--closing' : 'dropdown-menu--opening'
          } ${menuWidthClass ?? 'w-32'}`}
        >
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
      )}
    </div>
  );
}

export default MiniSelect;
