const fs = require('fs');

const code = `import * as React from 'react';

type Option = { value: string; label: React.ReactNode; meta?: React.ReactNode; disabled?: boolean };

type MiniSelectProps = {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  align?: 'left' | 'right'; // kept for api compatibility, unused in modal
  widthClass?: string;
  menuWidthClass?: string;
  emptyLabel?: string;
  renderOption?: (option: Option, isActive: boolean) => React.ReactNode;
  renderLabel?: (option: Option | undefined) => React.ReactNode;
  liftOnOpen?: boolean; // kept for api compatibility, unused in modal
};

function MiniSelect({
  value,
  options,
  onChange,
  ariaLabel,
  widthClass,
  emptyLabel = 'No options',
  renderOption,
  renderLabel,
}: MiniSelectProps) {
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const [isMenuClosing, setIsMenuClosing] = React.useState(false);
  const menuCloseTimerRef = React.useRef<number | null>(null);
  const dialogRef = React.useRef<HTMLDialogElement>(null);

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
    }, 200); // 200ms to match ModalShell out-animation
  }, [isMenuVisible]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open && isMenuVisible && !isMenuClosing) {
      dialog.showModal();
    }
  }, [isMenuVisible, isMenuClosing]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      closeMenu();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [closeMenu, isMenuVisible]);

  React.useEffect(() => {
    return () => {
      if (menuCloseTimerRef.current) {
        window.clearTimeout(menuCloseTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={\`relative text-xs \${widthClass ?? 'flex-shrink-0'}\`}>
      <button
        type="button"
        className={\`w-full min-h-[42px] bg-black/30 hover:bg-white/5 active:bg-white/10 border \${
          isMenuVisible ? 'border-amber-400/60 ring-2 ring-amber-400/20' : 'border-white/5 hover:border-white/20'
        } rounded-xl px-3.5 py-2 text-xs font-semibold text-white flex items-center justify-between gap-2 min-w-0 transition-all\`}
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
        <dialog
          ref={dialogRef}
          onClick={(e) => {
            if (e.target === dialogRef.current) closeMenu();
          }}
          className={
            'z-50 m-auto overflow-y-auto bg-transparent p-4 sm:p-6 pb-[calc(env(safe-area-inset-bottom)+16px)] motion-overlay ' +
            (isMenuClosing ? 'motion-overlay--closing ' : '') + 
            'backdrop:bg-black/75 backdrop:backdrop-blur-sm w-full h-full max-h-full max-w-full'
          }
        >
          <div
            className={
              'relative w-full max-w-xs neu-convex rounded-3xl border border-black/40 shadow-2xl p-2 flex flex-col mx-auto motion-dialog ' +
              (isMenuClosing ? 'motion-dialog--closing' : '')
            }
          >
            {/* Subtle Edge Highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />
            
            <div className="relative z-10 max-h-[60vh] overflow-y-auto overflow-x-hidden flex flex-col gap-1 p-1">
              {options.length === 0 ? (
                <div className="p-4 text-center text-xs text-white/40">{emptyLabel}</div>
              ) : (
                options.map(opt => {
                  const isActive = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={\`w-full min-h-[44px] px-4 py-2.5 rounded-2xl text-xs transition-colors flex items-center justify-between gap-2 text-left disabled:opacity-40 disabled:hover:bg-transparent \${
                        isActive
                          ? 'bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold shadow-sm'
                          : 'text-white/80 hover:bg-white/10 hover:text-white border border-transparent'
                      }\`}
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
                          <span className={\`truncate flex-1 \${isActive ? 'text-amber-300 font-bold' : 'text-white font-medium'}\`}>
                            {opt.label}
                          </span>
                          {opt.meta ? (
                            <span className={\`text-[10px] font-mono shrink-0 \${isActive ? 'text-amber-300/80 font-bold' : 'text-white/40'}\`}>
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
        </dialog>
      )}
    </div>
  );
}

export default MiniSelect;
`;

fs.writeFileSync('src/components/MiniSelect.tsx', code);
console.log("Rewrote MiniSelect to use <dialog> modal!");
