import * as React from 'react';
import { useUIStore } from '../../state/uiStore';
import { useProgressionState, useStore } from '../../state/store';
import { useShallow } from 'zustand/react/shallow';
import { APP_VERSION_DISPLAY } from '../../version';
import { PresetMenuPopover } from '../presets/PresetMenuPopover';

export function ContextBar() {
  const confirmation = useUIStore(s => s.topBarConfirmation);
  const view = useUIStore(s => s.view);
  const settingsView = useUIStore(s => s.settingsView);
  const equipmentTab = useUIStore(s => s.equipmentTab);
  const calibratingMachineId = useUIStore(s => s.calibratingMachineId);
  const calibrationStep = useUIStore(s => s.calibrationStep);
  const expandedEquipmentId = useUIStore(s => s.expandedEquipmentId);
  const expandedStepId = useUIStore(s => s.expandedStepId);
  
  const { sessionSteps, addStep, clearSessionSteps } = useProgressionState();
  
  
  const selectedPresetId = useUIStore(s => s.selectedPresetId);
  const expandedPresetId = useUIStore(s => s.expandedPresetId);
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
  let leftSlot = <div className="flex-1 flex justify-start min-w-[80px] min-h-11" />;
  let centerSlot = null;
  let rightSlot = <div className="flex-1 flex justify-end min-w-[80px] min-h-11" />;

  if (calibratingMachineId) {
    if (calibrationStep === 'measuring') {
      leftSlot = (
        <div className="flex-1 flex justify-start min-w-[80px] min-h-11">
          <button
            type="button"
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer"
            onClick={() => window.dispatchEvent(new CustomEvent('wizard-back'))}
          >
            Back
          </button>
        </div>
      );
      rightSlot = (
        <div className="flex-1 flex justify-end min-w-[80px] min-h-11">
          <button
            type="button"
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center justify-center active:scale-95 cursor-pointer shrink-0"
            onClick={() => window.dispatchEvent(new CustomEvent('wizard-next'))}
          >
            Next
          </button>
        </div>
      );
    } else {
      leftSlot = (
        <div className="flex-1 flex justify-start min-w-[80px] min-h-11">
          <button
            type="button"
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer"
            onClick={() => useUIStore.getState().setCalibratingMachineId(null)}
          >
            Cancel
          </button>
        </div>
      );
      if (calibrationStep === 'intro') {
        rightSlot = (
          <div className="flex-1 flex justify-end min-w-[80px] min-h-11">
            <button
              type="button"
              className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center justify-center active:scale-95 cursor-pointer shrink-0"
              onClick={() => window.dispatchEvent(new CustomEvent('wizard-start'))}
            >
              Begin
            </button>
          </div>
        );
      } else {
        rightSlot = <div className="flex-1 flex justify-end min-w-[80px] min-h-11" />;
      }
    }
    
    const calibratingMachine = useStore.getState().machines?.find(m => m.id === calibratingMachineId);
    centerSlot = (
      <div className="flex flex-col items-center justify-center mx-2 overflow-hidden">
        <h2 className="text-xs font-bold tracking-widest uppercase truncate text-[var(--color-accent)] leading-tight">
          Geometry Mapper
        </h2>
        {calibratingMachine && (
          <span className="text-[10px] text-white/50 truncate font-mono">
            {calibratingMachine.name}
          </span>
        )}
      </div>
    );
  } else if (expandedEquipmentId) {
    leftSlot = (
      <div className="flex-1 flex justify-start min-w-[80px] min-h-11">
        <button
          type="button"
          className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer"
          onClick={() => {
            useUIStore.getState().setTopBarConfirmation({
              message: `Delete ${equipmentTab === 'jigs' ? 'Jig' : equipmentTab === 'usbs' ? 'USB' : equipmentTab === 'machines' ? 'Machine' : 'Wheel'}?`,
              confirmLabel: 'Delete',
              cancelLabel: 'Cancel',
              onConfirm: () => {
                const id = expandedEquipmentId;
                if (equipmentTab === 'jigs') useStore.getState().deleteJig(id);
                else if (equipmentTab === 'usbs') useStore.getState().deleteUsb(id);
                else if (equipmentTab === 'machines') useStore.getState().deleteMachine(id);
                else if (equipmentTab === 'wheels') useStore.getState().deleteWheel(id);
                useUIStore.getState().setExpandedEquipmentId(null);
              }
            });
          }}
        >
          Delete
        </button>
      </div>
    );

    centerSlot = (
      <h2 className="text-[10px] sm:text-xs font-bold tracking-widest uppercase truncate text-white/40 mx-2 text-center">
        Edit {equipmentTab === 'jigs' ? 'Jig' : equipmentTab === 'usbs' ? 'USB' : equipmentTab === 'machines' ? 'Machine' : 'Wheel'}
      </h2>
    );

    rightSlot = <div className="flex-1 flex justify-end min-w-[80px] min-h-11" />;
  } else if (expandedStepId) {
    const stepIndex = sessionSteps.findIndex(s => s.id === expandedStepId);
    
    const handleDelete = () => {
      const action = () => {
        useStore.getState().deleteStep(expandedStepId);
        useUIStore.getState().setExpandedStepId(null);
      };
      if (document.startViewTransition) document.startViewTransition(action);
      else action();
    };

    leftSlot = (
      <div className="flex-1 flex justify-start min-w-[80px] min-h-11">
        <button
          type="button"
          className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 active:scale-95 transition flex items-center justify-center cursor-pointer"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    );

    centerSlot = (
      <h2 className="text-[10px] sm:text-xs font-bold tracking-widest uppercase truncate text-white/40 mx-2 text-center">
        Edit Step {stepIndex + 1}
      </h2>
    );

    rightSlot = (
      <div className="flex-1 flex justify-end min-w-[80px] min-h-11">
        <div className="h-11 flex items-center rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-sm">
          <button
            type="button"
            disabled={stepIndex === 0}
            className="h-full px-4 sm:px-5 font-bold text-lg text-white hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition border-r border-white/10 flex items-center justify-center cursor-pointer"
            onClick={() => {
              const action = () => useStore.getState().moveStep(stepIndex, -1);
              if (document.startViewTransition) document.startViewTransition(action);
              else action();
            }}
          >
            ↑
          </button>
          <button
            type="button"
            disabled={stepIndex === sessionSteps.length - 1}
            className="h-full px-4 sm:px-5 font-bold text-lg text-white hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition flex items-center justify-center cursor-pointer"
            onClick={() => {
              const action = () => useStore.getState().moveStep(stepIndex, 1);
              if (document.startViewTransition) document.startViewTransition(action);
              else action();
            }}
          >
            ↓
          </button>
        </div>
      </div>
    );
  } else if (view === 'calculator') {
    if (isPresetMenuOpen) {
      leftSlot = (
        <div className="flex-1 flex justify-start min-w-[80px] min-h-11">
          <button
            type="button"
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer"
            onClick={() => {
              useUIStore.setState({
                isPresetMenuOpen: false,
                isPresetDialogOpen: true
              });
            }}
          >
            Save
          </button>
        </div>
      );
      rightSlot = (
        <div className="flex-1 flex justify-end min-w-[80px] min-h-11">
          <button
            type="button"
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer shrink-0"
            onClick={() => {
              useUIStore.setState({
                isPresetMenuOpen: false,
                isPresetManagerOpen: true
              });
            }}
          >
            Manage
          </button>
        </div>
      );
    } else {
      leftSlot = (
        <div className="flex-1 flex justify-start min-w-[80px] min-h-11">
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
      
      rightSlot = (
        <div className="flex-1 flex justify-end min-w-[80px] min-h-11">
          <button
            type="button"
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center justify-center active:scale-95 cursor-pointer shrink-0"
            onClick={() => addStep()}
          >
            + Add Step
          </button>
        </div>
      );
    }

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
  } else if (view === 'presets') {
    if (expandedPresetId) {
      leftSlot = (
        <div className="flex-1 flex justify-start min-w-[80px] min-h-11">
          <button
            type="button"
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer"
            onClick={() => {
              useUIStore.getState().setTopBarConfirmation({
                message: 'Delete Preset?',
                confirmLabel: 'Delete',
                cancelLabel: 'Cancel',
                onConfirm: () => {
                  useStore.getState().deletePreset(expandedPresetId);
                  useUIStore.getState().setExpandedPresetId(null);
                }
              });
            }}
          >
            Delete
          </button>
        </div>
      );

      centerSlot = (
        <button
          type="button"
          className="flex-shrink flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors mx-2 min-w-0 cursor-pointer"
          onClick={() => {
            // Trigger a rename event that PresetsView can listen to
            window.dispatchEvent(new CustomEvent('beginRenamePreset', { detail: expandedPresetId }));
          }}
        >
          <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase truncate text-white/60">
            Rename
          </h2>
        </button>
      );

      rightSlot = (
        <div className="flex-1 flex justify-end min-w-[80px] min-h-11">
          <button
            type="button"
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center justify-center active:scale-95 cursor-pointer shrink-0"
            onClick={() => {
              useUIStore.getState().setSelectedPresetId(expandedPresetId);
              useStore.getState().loadPreset(expandedPresetId);
              useUIStore.getState().setView('calculator');
            }}
          >
            Load
          </button>
        </div>
      );
    } else {
      // Ambient info when nothing is selected
      centerSlot = (
        <h2 className="text-[10px] sm:text-xs font-bold tracking-widest uppercase truncate text-white/40 mx-2 text-center">
          {sessionPresets.length} Saved {sessionPresets.length === 1 ? 'Setup' : 'Setups'}
        </h2>
      );
    }
  } else if (view === 'settings') {
    if (settingsView === 'root') {
      leftSlot = (
        <div className="flex-1 flex justify-start min-w-[80px] min-h-11">
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
        <div className="flex-1 flex justify-start min-w-[80px] min-h-11">
          <button
            onClick={() => setSettingsView(settingsView.startsWith('dev-') ? 'dev' : 'root')}
            className="h-11 px-3 sm:px-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider border bg-white/5 border-white/10 text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer"
          >
            ← Back
          </button>
        </div>
      );
      
      const titleMap: Record<string, string> = {
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
