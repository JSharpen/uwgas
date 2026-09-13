import * as React from 'react';
import { useUIStore } from '../../state/uiStore';
import { useDevStore } from '../../state/devStore';
import { useProgressionState, useStore } from '../../state/store';
import { useShallow } from 'zustand/react/shallow';
import { APP_VERSION_DISPLAY } from '../../version';
import { PresetMenuPopover } from '../presets/PresetMenuPopover';

export function ContextBar() {
  const confirmation = useUIStore(s => s.topBarConfirmation);
  const view = useUIStore(s => s.view);
  const settingsView = useUIStore(s => s.settingsView);
  
  const { sessionSteps, addStep, clearSessionSteps } = useProgressionState();
  
  
  const maskTopFade = useDevStore((s) => s.maskTopFade);
  const selectedPresetId = useUIStore(s => s.selectedPresetId);
  const sessionPresets = useStore(useShallow(s => s.sessionPresets));
  const isPresetMenuOpen = useUIStore(s => s.isPresetMenuOpen);
  const setPresetMenuOpen = useUIStore(s => s.setPresetMenuOpen);
  const setSettingsView = useUIStore(s => s.setSettingsView);
  
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
  
  const activePreset = sessionPresets.find(p => p.id === selectedPresetId);
  const presetName = activePreset ? activePreset.name : 'Custom Setup';

  if (confirmation) {
    return (
      <>
        {/* Invisible spacer to reserve layout flow space since header is fixed */}
        <div className="w-full shrink-0" style={{ height: `calc(${headerActualHeight}px + var(--card-stack-gap, 12px) - 1rem)` }} />
        <header ref={headerRef} className="touch-none fixed top-3 sm:top-4 left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-50 flex items-center justify-between px-2 py-2 bg-[#09090b] border border-red-500/30 rounded-3xl ring-1 ring-red-500/20 shadow-[0_4px_12px_rgba(239,68,68,0.15)] transition-all duration-300 mx-auto" style={{ minHeight: 'var(--top-bar-thickness, 60px)' } as React.CSSProperties}>
          <div className="flex-1 flex justify-start">
          <button
            type="button"
            className="h-11 px-3 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 text-white/60 hover:bg-white/10 active:bg-white/15 border border-white/10 transition flex items-center justify-center active:scale-95 cursor-pointer"
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
              className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center justify-center active:scale-95 cursor-pointer"
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
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-red-500 text-white hover:bg-red-400 active:bg-red-600 transition shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center justify-center active:scale-95 cursor-pointer"
            onClick={() => {
              confirmation.onConfirm();
              useUIStore.getState().setTopBarConfirmation(null);
            }}
          >
            {confirmation.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </header>
      </>
    );
  }

  // --- Normal Layouts ---
  let leftSlot = <div className="flex-1 flex justify-start min-w-[80px]" />;
  let centerSlot = null;
  let rightSlot = <div className="flex-1 flex justify-end min-w-[80px]" />;

  if (view === 'calculator') {
    leftSlot = (
      <div className="flex-1 flex justify-start min-w-[80px]">
        <button
          type="button"
          className={`h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider border transition flex items-center justify-center
            ${sessionSteps.length === 0
              ? 'bg-transparent border-white/5 text-white/20 cursor-not-allowed'
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10 active:scale-95 cursor-pointer'
            }`}
          onClick={() => {
            if (sessionSteps.length > 0) {
              if (selectedPresetId === '') {
                // Custom setup -> 3 buttons
                useUIStore.getState().setTopBarConfirmation({
                  confirmLabel: 'Clear',
                  cancelLabel: 'Cancel',
                  onConfirm: () => clearSessionSteps(),
                  centerAction: {
                    label: 'Save & Clear',
                    onClick: () => {
                      useUIStore.getState().setClearAfterSave(true);
                      useUIStore.getState().setPresetDialogOpen(true);
                    }
                  }
                });
              } else {
                // Preset loaded -> 2 buttons
                useUIStore.getState().setTopBarConfirmation({
                  message: 'Clear Progression?',
                  confirmLabel: 'Yes',
                  cancelLabel: 'No',
                  onConfirm: () => clearSessionSteps()
                });
              }
            }
          }}
          disabled={sessionSteps.length === 0}
        >
          Clear All
        </button>
      </div>
    );
    
    centerSlot = (
      <button 
        type="button"
        className="flex-shrink flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors mx-2 min-w-0 cursor-pointer"
        onClick={() => setPresetMenuOpen(!isPresetMenuOpen)}
      >
        <h2 className={`text-xs sm:text-sm font-bold tracking-widest uppercase truncate ${activePreset ? 'text-amber-400' : 'text-white/60'}`}>
          {presetName}
        </h2>
        <span className={`text-[10px] text-white/30 transition-transform ${isPresetMenuOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
    );
    
    rightSlot = (
      <div className="flex-1 flex justify-end min-w-[80px]">
        <button
          type="button"
          className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center justify-center active:scale-95 cursor-pointer shrink-0"
          onClick={() => addStep()}
        >
          + Add Step
        </button>
      </div>
    );
  } else if (view === 'wheels') {
    centerSlot = (
      <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase truncate text-white/60 mx-2 text-center">
        Wheels
      </h2>
    );
    rightSlot = (
      <div className="flex-1 flex justify-end min-w-[80px]">
        <button
          type="button"
          className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center justify-center active:scale-95 cursor-pointer shrink-0"
          onClick={() => window.dispatchEvent(new CustomEvent('openAddWheelModal'))}
        >
          + Add Wheel
        </button>
      </div>
    );
  } else if (view === 'settings') {
    if (settingsView === 'root') {
      leftSlot = (
        <div className="flex-1 flex justify-start min-w-[80px]">
          <div className="h-11 px-3 rounded-2xl font-mono text-[10px] sm:text-xs text-white/30 border border-white/5 bg-black/20 flex items-center justify-center">
            v{APP_VERSION_DISPLAY}
          </div>
        </div>
      );
      centerSlot = (
        <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase truncate text-white/60 mx-2 text-center">
          Settings
        </h2>
      );
    } else {
      leftSlot = (
        <div className="flex-1 flex justify-start min-w-[80px]">
          <button
            onClick={() => setSettingsView(settingsView.startsWith('dev-') ? 'dev' : 'root')}
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider border bg-white/5 border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer"
          >
            ← Back
          </button>
        </div>
      );
      
      const titleMap: Record<string, string> = {
        'machine': 'Machines',
        'hardware': 'Hardware',
        'measurement': 'Measurement',
        'import': 'Import / Export',
        'glossary': 'Glossary',
        'dev': 'Dev Mode',
        'dev-ui': 'UI Settings',
        'dev-interaction': 'Interaction Mode',
        'dev-state': 'State Explorer'
      };
      
      centerSlot = (
        <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase truncate text-white/60 mx-2 text-center">
          {titleMap[settingsView] || 'Settings'}
        </h2>
      );
      
      if (settingsView === 'machine') {
        rightSlot = (
          <div className="flex-1 flex justify-end min-w-[80px]">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openAddMachineModal'))}
              className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center justify-center active:scale-95 cursor-pointer shrink-0"
            >
              + Add
            </button>
          </div>
        );
      } else if (settingsView === 'hardware') {
        rightSlot = (
          <div className="flex-1 flex justify-end min-w-[80px]">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openAddHardwareModal'))}
              className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center justify-center active:scale-95 cursor-pointer shrink-0"
            >
              + Add
            </button>
          </div>
        );
      }
    }
  }

  return (
    <>
      {/* Invisible spacer to reserve layout flow space since header is fixed */}
      <div className="w-full shrink-0" style={{ height: `calc(${headerActualHeight}px + var(--card-stack-gap, 12px) - 1rem)` }} />
      <header ref={headerRef} className="touch-none fixed top-3 sm:top-4 left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-50 flex items-center justify-between px-2 py-2 bg-[#09090b] border border-amber-500/30 ring-1 ring-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.15)] rounded-3xl transition-all duration-300 mx-auto" style={{ minHeight: 'var(--top-bar-thickness, 60px)' } as React.CSSProperties}>

      {leftSlot}
      {centerSlot}
      {rightSlot}
      
      {/* Preset Menu Popover anchors to this header */}
      <PresetMenuPopover />
    </header>
    </>
  );
}
