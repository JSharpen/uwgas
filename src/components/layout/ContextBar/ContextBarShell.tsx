import * as React from 'react';
import { useUIStore } from '../../../state/uiStore';
import { PresetMenuPopover } from '../../presets/PresetMenuPopover';

export function ContextBarShell() {
  const confirmation = useUIStore(s => s.topBarConfirmation);
  
  const headerRef = React.useRef<HTMLElement>(null);
  const [headerActualHeight, setHeaderActualHeight] = React.useState(60);
  
  // Update dynamic CSS variable so downstream elements know where the context bar ends
  React.useEffect(() => {
    if (!headerRef.current) return;

    const updateHeaderBottom = () => {
      if (headerRef.current) {
        setHeaderActualHeight(headerRef.current.offsetHeight);
        // Find the resting bottom of the context bar relative to the document
        // We include a small buffer (e.g., 16px for the margin-bottom)
        const rect = headerRef.current.getBoundingClientRect();
        const restingBottom = rect.bottom + 16;
        document.documentElement.style.setProperty(
          '--progression-header-bottom',
          `${restingBottom}px`
        );
      }
    };

    const observer = new ResizeObserver(updateHeaderBottom);
    observer.observe(headerRef.current);
    window.addEventListener('resize', updateHeaderBottom);
    window.addEventListener('scroll', updateHeaderBottom, { passive: true });
    updateHeaderBottom();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeaderBottom);
      window.removeEventListener('scroll', updateHeaderBottom);
    };
  }, []);

  return (
    <>
      <div className="w-full shrink-0" style={{ height: `calc(${headerActualHeight}px + var(--card-stack-gap, 12px) - 1rem)` }} />
      
      <header 
        ref={headerRef} 
        className={`touch-none fixed top-3 sm:top-4 left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-50 bg-[#09090b] rounded-[var(--ui-radius-mid)] transition-all duration-300 mx-auto p-[var(--ui-gap)] ${
          confirmation 
            ? 'border border-red-500/30 ring-1 ring-red-500/20 shadow-[0_4px_12px_rgba(239,68,68,0.15)]' 
            : 'border border-amber-500/30 ring-1 ring-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.15)]'
        }`}
      >
        {/* 
          Standard Content (Portal Targets) 
          ALWAYS MOUNTED so Portals don't lose their DOM targets. Hidden when confirmation is active.
        */}
        <div className={`w-full items-center justify-between ${confirmation ? 'hidden' : 'flex'}`}>
          <div id="context-bar-left" className="flex-1 flex justify-start min-w-[80px] min-h-11" />
          <div id="context-bar-center" className="flex-shrink mx-2 flex flex-col items-center justify-center min-w-0" />
          <div id="context-bar-right" className="flex-1 flex justify-end min-w-[80px] min-h-11" />
          <PresetMenuPopover />
        </div>

        {/* Confirmation Override Content */}
        {confirmation && (
          <div className="w-full flex items-center justify-between">
            <div className="flex-1 flex justify-start">
              <button
                type="button"
                className="h-11 px-3 rounded-[var(--ui-radius-core)] font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 text-white/60 hover:bg-white/10 active:bg-white/15 border border-white/10 transition flex items-center justify-center active:scale-95 cursor-pointer"
                onClick={() => {
                  if (confirmation.onCancel) confirmation.onCancel();
                  useUIStore.getState().setTopBarConfirmation(null);
                }}
              >
                {confirmation.cancelLabel ?? 'Cancel'}
              </button>
            </div>

            {confirmation.centerAction ? (
              <div className="flex-shrink px-2 flex justify-center">
                <button
                  type="button"
                  className="h-11 px-3 sm:px-4 rounded-[var(--ui-radius-core)] font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center justify-center active:scale-95 cursor-pointer"
                  onClick={() => {
                    confirmation.centerAction!.onClick();
                    useUIStore.getState().setTopBarConfirmation(null);
                  }}
                >
                  {confirmation.centerAction.label}
                </button>
              </div>
            ) : (
              <h2 className="text-xs sm:text-sm font-bold text-red-400 tracking-widest uppercase truncate px-2 text-center">
                {confirmation.message}
              </h2>
            )}

            <div className="flex-1 flex justify-end">
              <button
                type="button"
                className="h-11 px-3 sm:px-4 rounded-[var(--ui-radius-core)] font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-red-500 text-white hover:bg-red-400 active:bg-red-600 transition shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center justify-center active:scale-95 cursor-pointer"
                onClick={() => {
                  confirmation.onConfirm();
                  useUIStore.getState().setTopBarConfirmation(null);
                }}
              >
                {confirmation.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

