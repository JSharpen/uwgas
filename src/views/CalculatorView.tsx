import * as React from 'react';
import GlobalSetupCard from '../components/calculator/GlobalSetupCard';
import ProgressionView from '../components/ProgressionView';
import { EmptyProgressionState } from '../components/calculator/EmptyProgressionState';
import { useProgressionState, useStore } from '../state/store';
import { useUIStore } from '../state/uiStore';
import { ContextBar } from '../components/layout/ContextBar';
import { ActionSheet } from '../components/ui/ActionSheet';
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
        '#global-setup-card, .motion-list-item, .bg-\\[\\#262626\\], .bg-neutral-900, .action-sheet, button, input, select, [role="dialog"]'
      );
      if (!isInteractive) {
        setIsSetupPanelOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleGlobalPointerDown);
    return () => document.removeEventListener('pointerdown', handleGlobalPointerDown);
  }, [setIsSetupPanelOpen]);

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
              <ContextBar.DropdownTitle 
                title={presetName}
                isOpen={isPresetMenuOpen}
                isPrimary={!!activePreset}
                onClick={() => setPresetMenuOpen(!isPresetMenuOpen)}
              />
            </ContextBar.Slot>

            <ContextBar.Slot name="right">
              {isPresetMenuOpen ? (
                <ContextBar.Button variant="ghost" onClick={() => useUIStore.setState({ isPresetMenuOpen: false, isPresetManagerOpen: true })}>Manage</ContextBar.Button>
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

        {/* Safari flex gap scroll spacer */}
        <div className="h-px shrink-0 w-full" />
      </div>

      <ActionSheet isOpen={isAddStepPickerOpen} onClose={() => setAddStepPickerOpen(false)}>
        <ActionSheet.Content title="Select Wheel for New Step">
          <ActionSheet.Scrollable>
            {wheels.map(w => (
              <ActionSheet.Item 
                key={w.id} 
                meta={`D:${w.D}mm`}
                onClick={() => {
                  const newId = addStep(w.id);
                  useUIStore.getState().setExpandedStepId(newId);
                  setAddStepPickerOpen(false);
                }}
              >
                {w.name}
              </ActionSheet.Item>
            ))}
          </ActionSheet.Scrollable>
        </ActionSheet.Content>
      </ActionSheet>
    </>
  );
}
