import * as React from 'react';
import GlobalSetupCard from '../components/calculator/GlobalSetupCard';
import ProgressionView from '../components/ProgressionView';
import { EmptyProgressionState } from '../components/calculator/EmptyProgressionState';
import { useProgressionState, useStore } from '../state/store';
import { useUIStore } from '../state/uiStore';
import { ContextBar } from '../components/layout/ContextBar';
import { ModalSelector, ModalShell, Button } from '../components/ui';
import { useShallow } from 'zustand/react/shallow';

export default function CalculatorView() {
  const isSetupPanelOpen = useUIStore((s) => s.isSetupPanelOpen);
  const setIsSetupPanelOpen = useUIStore((s) => s.setSetupPanelOpen);
  
  const isPresetMenuOpen = useUIStore((s) => s.isPresetMenuOpen);
  const setPresetMenuOpen = useUIStore((s) => s.setPresetMenuOpen);
  const selectedPresetId = useUIStore((s) => s.selectedPresetId);
  const sessionPresets = useStore(useShallow(s => s.sessionPresets));
  const activePreset = sessionPresets.find(p => p.id === selectedPresetId);
  const presetName = activePreset ? activePreset.name : 'Custom Setup';
  const wheels = useStore(useShallow(s => s.wheels));
  const [isAddStepPickerOpen, setAddStepPickerOpen] = React.useState(false);

  const { sessionSteps, addStep, clearSessionSteps } = useProgressionState();
  const globalState = useStore(s => s.global);

  const hasDormantOverrides = React.useMemo(() => {
    return sessionSteps.some(step => 
      (step.machineId && !globalState.showMachineOverrides) || 
      (step.usbId && !globalState.showUsbOverrides)
    );
  }, [sessionSteps, globalState.showMachineOverrides, globalState.showUsbOverrides]);

  const [isDormantModalOpen, setDormantModalOpen] = React.useState(false);

  // Collapse open steps when setup panel opens
  React.useEffect(() => {
    if (isSetupPanelOpen) {
      window.dispatchEvent(new CustomEvent('collapseAll'));
    }
  }, [isSetupPanelOpen]);

  // Reset drawer state when unmounting (changing tabs)
  React.useEffect(() => {
    return () => {
      setIsSetupPanelOpen(false);
    };
  }, [setIsSetupPanelOpen]);

  // Encapsulated click-outside dismissal for isSetupPanelOpen
  React.useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent | MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest(
        '#global-setup-card, .motion-list-item, .bg-\\[\\#262626\\], .bg-neutral-900, .action-sheet, button, input, select, header, dialog, [role="dialog"]'
      );
      if (!isInteractive && useUIStore.getState().activeSheet === 'none' && !isAddStepPickerOpen) {
        setIsSetupPanelOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleGlobalPointerDown);
    return () => document.removeEventListener('pointerdown', handleGlobalPointerDown);
  }, [setIsSetupPanelOpen, isAddStepPickerOpen]);

  const expandedStepId = useUIStore(s => s.expandedStepId);
  const stepIndex = sessionSteps.findIndex(s => s.id === expandedStepId);

  return (
    <>
      <div className="flex flex-col gap-4">
        {expandedStepId ? (
          <>
            <ContextBar.Slot name="left">
              <ContextBar.Button
                variant="ghost-danger"
                onClick={() => {
                  const action = () => {
                    useStore.getState().deleteStep(expandedStepId);
                    useUIStore.getState().setExpandedStepId(null);
                  };
                  if (document.startViewTransition) document.startViewTransition(action);
                  else action();
                }}
              >
                Delete
              </ContextBar.Button>
            </ContextBar.Slot>
            <ContextBar.Slot name="center">
              <ContextBar.AmbientInfo>
                Edit Step {stepIndex + 1}
              </ContextBar.AmbientInfo>
            </ContextBar.Slot>
            <ContextBar.Slot name="right">
              <div className="h-11 flex items-center rounded-[var(--ui-radius-core)] bg-white/5 border border-white/10 overflow-hidden shadow-sm">
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
            </ContextBar.Slot>
          </>
        ) : isSetupPanelOpen ? (
          <>
            <ContextBar.Slot name="left">
              {null}
            </ContextBar.Slot>
            <ContextBar.Slot name="center">
              <ContextBar.AmbientInfo>
                Global Setup
              </ContextBar.AmbientInfo>
            </ContextBar.Slot>
            <ContextBar.Slot name="right">
              <ContextBar.Button variant="primary" onClick={() => setIsSetupPanelOpen(false)}>
                Done
              </ContextBar.Button>
            </ContextBar.Slot>
          </>
        ) : (
          <>
            <ContextBar.Slot name="left">
              {isPresetMenuOpen ? (
                <ContextBar.Button variant="ghost" onClick={() => useUIStore.setState({ isPresetMenuOpen: false, isPresetDialogOpen: true })}>Save</ContextBar.Button>
              ) : (
                <ContextBar.Button 
                  variant="ghost" 
                  disabled={sessionSteps.length === 0}
                  onClick={() => {
                    if (sessionSteps.length > 0) {
                      if (selectedPresetId === '') {
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
                        useUIStore.getState().setTopBarConfirmation({
                          message: 'Clear Progression?',
                          confirmLabel: 'Yes',
                          cancelLabel: 'No',
                          onConfirm: () => clearSessionSteps()
                        });
                      }
                    }
                  }}
                >
                  Clear All
                </ContextBar.Button>
              )}
            </ContextBar.Slot>
            
            <ContextBar.Slot name="center">
              <div className="flex items-center gap-2">
                <ContextBar.DropdownTitle 
                  title={presetName}
                  isOpen={isPresetMenuOpen}
                  isPrimary={!!activePreset}
                  onClick={() => setPresetMenuOpen(!isPresetMenuOpen)}
                />
                {hasDormantOverrides && (
                  <button 
                    onClick={() => setDormantModalOpen(true)}
                    className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] shrink-0 transition-transform active:scale-90 cursor-pointer -ml-0.5"
                    aria-label="Hardware overrides dormant"
                  />
                )}
              </div>
            </ContextBar.Slot>

            <ContextBar.Slot name="right">
              {isPresetMenuOpen ? (
                <ContextBar.Button variant="ghost" onClick={() => {
                  useUIStore.setState({ isPresetMenuOpen: false });
                  useUIStore.getState().setView('presets');
                }}>Manage</ContextBar.Button>
              ) : (
                <ContextBar.Button variant="primary" onClick={() => setAddStepPickerOpen(true)}>+ Add Step</ContextBar.Button>
              )}
            </ContextBar.Slot>
          </>
        )}

        {/* Global Setup Card */}
        <GlobalSetupCard />
        
        {/* Bottom Mask to hide scrolling cards behind the floating summary pill, placed independently to preserve box-shadows */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[576px] mx-auto h-[100px] bg-[#09090b] pointer-events-none z-[15]" />

        {/* Progression Section */}
        <section className="flex flex-col gap-0 w-full max-w-[576px] mx-auto">
          {/* Progression sticky header moved to ContextBar */}

          <div className="flex flex-col gap-3 w-full">
            <div>
              {sessionSteps.length === 0 ? (
                <EmptyProgressionState />
              ) : (
                <div className="flex flex-col gap-6 w-full">
                  <ProgressionView />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bottom scroll clearance spacer (ensures lowest card clears floating setup bar & bottom mask with exact card-stack-gap) */}
        <div 
          className="shrink-0 w-full pointer-events-none" 
          style={{ height: 'calc(var(--setup-bar-clearance, 180px) + var(--card-stack-gap, 0.75rem) - 126px)' }}
        />
      </div>

      <ModalSelector isOpen={isAddStepPickerOpen} onClose={() => setAddStepPickerOpen(false)} title="Select Wheel for New Step">
            {wheels.map(w => (
              <ModalSelector.Item 
                key={w.id} 
                meta={`D:${w.D}mm`}
                onClick={() => {
                  const newId = addStep(w.id);
                  useUIStore.getState().setExpandedStepId(newId);
                  setAddStepPickerOpen(false);
                }}
              >
                {w.name}
              </ModalSelector.Item>
            ))}
      </ModalSelector>

      {isDormantModalOpen && (
        <ModalShell
          title="Dormant Overrides Detected"
          subtitle="This progression contains step-level hardware overrides, but manual controls are currently disabled in settings."
          onClose={() => setDormantModalOpen(false)}
        >
          <div className="flex flex-col gap-3 mt-1">
            <Button
              variant="solid"
              intent="accent"
              fluid
              onClick={() => {
                useStore.getState().setGlobal({ showMachineOverrides: true, showUsbOverrides: true });
                setDormantModalOpen(false);
              }}
            >
              Enable Controls
            </Button>
            <Button
              variant="neu"
              fluid
              onClick={() => {
                const steps = useStore.getState().sessionSteps;
                steps.forEach(s => {
                  useStore.getState().updateStep(s.id, { machineId: undefined, usbId: undefined });
                });
                setDormantModalOpen(false);
              }}
            >
              Clear Overrides
            </Button>
            <Button
              variant="ghost"
              fluid
              onClick={() => setDormantModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </ModalShell>
      )}
    </>
  );
}
