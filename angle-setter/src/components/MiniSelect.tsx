import * as React from 'react';

type Option = { value: string; label: string };

type MiniSelectProps = {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  align?: 'left' | 'right';
  widthClass?: string;
  menuWidthClass?: string;
};

function MiniSelect({
  value,
  options,
  onChange,
  ariaLabel,
  align = 'left',
  widthClass,
  menuWidthClass,
}: MiniSelectProps) {
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const [isMenuClosing, setIsMenuClosing] = React.useState(false);
  const menuCloseTimerRef = React.useRef<number | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

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

  React.useEffect(() => {
    if (!isMenuVisible) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
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
    <div ref={rootRef} className={`dropdown text-xs ${widthClass ?? ''}`}>
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
        <span className="truncate">{selected?.label ?? ''}</span>
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
          className={`dropdown-menu ${alignClass} ${
            isMenuClosing ? 'dropdown-menu--closing' : 'dropdown-menu--opening'
          } ${menuWidthClass ?? 'w-32'}`}
        >
          {options.map(opt => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`dropdown-item ${isActive ? 'dropdown-item--active' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  closeMenu();
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MiniSelect;
