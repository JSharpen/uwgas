import * as React from 'react';
import GlobalSetupCard from '../components/calculator/GlobalSetupCard';
import ProgressionView from '../components/ProgressionView';
import { EmptyProgressionState } from '../components/calculator/EmptyProgressionState';
import { useProgressionState } from '../state/store';
import { useUIStore } from '../state/uiStore';

export default function CalculatorView() {
  const isSetupPanelOpen = useUIStore((s) => s.isSetupPanelOpen);
  const setIsSetupPanelOpen = useUIStore((s) => s.setSetupPanelOpen);
  
  

  const { sessionSteps } =
    useProgressionState();

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

  return (
    <div className="flex flex-col gap-4">
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
  );
}
