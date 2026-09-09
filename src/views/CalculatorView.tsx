import * as React from 'react';
import GlobalSetupCard from '../components/calculator/GlobalSetupCard';
import ProgressionView from '../components/ProgressionView';
import { useProgressionState } from '../state/store';
import { useUIStore } from '../state/uiStore';

export default function CalculatorView() {
  const isSetupPanelOpen = useUIStore((s) => s.isSetupPanelOpen);
  const setIsSetupPanelOpen = useUIStore((s) => s.setSetupPanelOpen);
  const isConfirmingClear = useUIStore((s) => s.isConfirmingClear);
  const setIsConfirmingClear = useUIStore((s) => s.setIsConfirmingClear);

  const { sessionSteps, addStep, clearSessionSteps, loadDefaultProgression } =
    useProgressionState();

  const headerRef = React.useRef<HTMLDivElement>(null);

  // Encapsulated sticky header ResizeObserver measuring resting bottom offset
  React.useEffect(() => {
    if (!headerRef.current) return;
    const updateHeaderBottom = () => {
      if (headerRef.current) {
        const section = headerRef.current;
        const stickyHeader = section.firstElementChild as HTMLElement;
        if (stickyHeader) {
          const restingBottom = section.offsetTop + stickyHeader.offsetHeight;
          document.documentElement.style.setProperty(
            '--progression-header-bottom',
            `${restingBottom}px`
          );
        }
      }
    };

    const observer = new ResizeObserver(updateHeaderBottom);
    observer.observe(headerRef.current);
    updateHeaderBottom();

    return () => observer.disconnect();
  }, []);

  // Collapse open steps when setup panel opens
  React.useEffect(() => {
    if (isSetupPanelOpen) {
      window.dispatchEvent(new CustomEvent('collapseAll'));
    }
  }, [isSetupPanelOpen]);

  // Encapsulated click-outside dismissal for isSetupPanelOpen
  React.useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent | MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest(
        '#global-setup-card, .motion-list-item, .bg-\\[\\#262626\\], .bg-neutral-900, .action-sheet, button, input, select, [role="dialog"]'
      );
      if (!isInteractive) {
        setIsSetupPanelOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleGlobalPointerDown);
    return () => document.removeEventListener('pointerdown', handleGlobalPointerDown);
  }, [setIsSetupPanelOpen]);

  return (
    <div className="flex flex-col gap-4">
      {/* Global Setup Card */}
      <GlobalSetupCard />

      {/* Progression Section */}
      <section ref={headerRef} className="flex flex-col gap-0 w-full max-w-[576px] mx-auto">
        <div className="sticky top-2 z-20 flex items-center justify-between mb-4 px-2 py-2 bg-[#262626]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300">
          {isConfirmingClear ? (
            <>
              <div className="flex-1 flex justify-start">
                <button
                  type="button"
                  className="h-11 px-3 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 text-white/60 hover:bg-white/10 active:bg-white/15 border border-white/10 transition flex items-center justify-center active:scale-95 cursor-pointer"
                  onClick={() => setIsConfirmingClear(false)}
                >
                  No
                </button>
              </div>

              <h2 className="text-xs sm:text-sm font-bold text-red-400 tracking-widest uppercase truncate px-2">
                Clear Progression?
              </h2>

              <div className="flex-1 flex justify-end">
                <button
                  type="button"
                  className="h-11 px-3 sm:px-4 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-red-500 text-white hover:bg-red-400 active:bg-red-600 transition shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center justify-center active:scale-95 cursor-pointer"
                  onClick={() => {
                    clearSessionSteps();
                    setIsConfirmingClear(false);
                  }}
                >
                  Yes
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 flex justify-start">
                <button
                  type="button"
                  className="h-11 px-3 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-red-500/10 text-red-500 hover:bg-red-500/20 active:bg-red-500/25 border border-red-500/20 transition disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center active:scale-95 cursor-pointer"
                  onClick={() => setIsConfirmingClear(true)}
                  disabled={sessionSteps.length === 0}
                >
                  Clear All
                </button>
              </div>

              <h2 className="text-xs sm:text-sm font-bold text-white tracking-widest uppercase truncate px-2">
                Progression
              </h2>

              <div className="flex-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => addStep()}
                  className="h-11 px-3 sm:px-4 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.2)] flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  + Add Step
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <div className="mt-1">
            {sessionSteps.length === 0 ? (
              <div className="text-sm text-white/40 bg-[#262626] border border-white/10 rounded-3xl p-8 flex flex-col gap-4 items-center text-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />
                <p className="text-white/60 relative z-10 font-medium">
                  No sharpening steps defined yet.
                </p>
                <div className="flex flex-col w-full gap-3 mt-2 relative z-10">
                  <button
                    type="button"
                    className="w-full bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold h-12 px-4 rounded-2xl transition flex items-center justify-center text-sm cursor-pointer"
                    onClick={loadDefaultProgression}
                  >
                    Load Standard Progression
                  </button>
                  <button
                    type="button"
                    className="w-full border border-white/10 hover:bg-white/5 active:bg-white/10 text-white/70 hover:text-white font-bold h-12 px-4 rounded-2xl transition flex items-center justify-center text-sm cursor-pointer"
                    onClick={() => addStep()}
                  >
                    Add Blank Step
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 w-full">
                <ProgressionView />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Safari flex gap scroll spacer */}
      <div className="h-px shrink-0 w-full" />
    </div>
  );
}
