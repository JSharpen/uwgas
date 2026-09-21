import * as React from 'react';
import type { Wheel } from '../../types/core';
import { IconDisc } from '../../icons';
import ModalShell from '../ModalShell';
import WheelFormFields from './WheelFormFields';
import ExpandableCard from '../ui/ExpandableCard';
import { Tag } from '../ui/Tag';
import useModalLayout from '../../hooks/useModalLayout';

import { useWheelState } from '../../state/store';
import { useUIStore } from '../../state/uiStore';
import { isWheelOverdue, getMeasurementCountdownText } from '../../utils/wheelWear';

export type WheelManagerViewProps = Record<string, never>;

export function WheelManagerView() {
  const {
    wheels,
    addWheel: onAddWheel,
    updateWheel: onUpdateWheel,
    deleteWheel: onDeleteWheel,
  } = useWheelState();
  const { overlayStyle: modalOverlayStyle, getDialogStyle: getModalDialogStyle } =
    useModalLayout();

  const expandedEquipmentId = useUIStore(s => s.expandedEquipmentId);
  const setExpandedEquipmentId = useUIStore(s => s.setExpandedEquipmentId);

  React.useEffect(() => {
    return () => setExpandedEquipmentId(null);
  }, [setExpandedEquipmentId]);

  const [deletingWheelId, setDeletingWheelId] = React.useState<string | null>(null);

  // Modal states
  const [isAddWheelModalVisible, setIsAddWheelModalVisible] = React.useState(false);
  const [isAddWheelModalClosing, setIsAddWheelModalClosing] = React.useState(false);

        
  const MODAL_CLOSE_MS = 200;

  const [newWheelDraft, setNewWheelDraft] = React.useState<Omit<Wheel, 'id'>>({
    name: '',
    D: NaN,
    DText: '',
    baseForHn: 'rear',
    isHoning: false,
  });

  const sortedWheels = React.useMemo(() => {
    const list = [...wheels];
    return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }, [wheels]);

  
  const openAddWheelModal = React.useCallback(() => {
    setNewWheelDraft({
      name: '',
      D: NaN,
      DText: '',
      baseForHn: 'rear',
      isHoning: false,
    });
    setIsAddWheelModalVisible(true);
    setIsAddWheelModalClosing(false);
  }, []);

    React.useEffect(() => {
    window.addEventListener('openAddWheelModal', openAddWheelModal);
    return () => window.removeEventListener('openAddWheelModal', openAddWheelModal);
  }, [openAddWheelModal]);

    const closeAddWheelModal = () => {
    setIsAddWheelModalClosing(true);
    window.setTimeout(() => {
      setIsAddWheelModalVisible(false);
      setIsAddWheelModalClosing(false);
    }, MODAL_CLOSE_MS);
  };

  const handleSaveNewWheel = () => {
    if (!newWheelDraft.name.trim() || !Number.isFinite(newWheelDraft.D)) return;
    onAddWheel(newWheelDraft);
    closeAddWheelModal();
  };

    const newWheelNameTrimmed = newWheelDraft.name.trim();
  const isNewWheelDiameterValid = Number.isFinite(newWheelDraft.D);
  const isAddWheelSaveDisabled = !newWheelNameTrimmed || !isNewWheelDiameterValid;

  return (
    <section className="flex flex-col gap-[var(--ui-gap)] max-w-3xl mx-auto pb-20 w-full">

      <div className="flex flex-col gap-4">
        {wheels.length === 0 ? (
          <div className="neu-convex rounded-[var(--ui-radius-mid)] border border-dashed border-black/40 p-[var(--ui-gap)] text-center text-xs text-white/50 flex flex-col gap-2">
            No wheels saved yet. Click <span className="font-bold text-white">Add Wheel</span> to create your first wheel.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedWheels.map((w, idx) => {
              const isExpanded = expandedEquipmentId === w.id;
              const baseLabel = w.isHoning
                ? 'Honing'
                : w.baseForHn === 'rear'
                ? 'Rear base'
                : 'Front base';

              const countdownText = getMeasurementCountdownText(w);

                if (deletingWheelId === w.id) {
                  return (
                    <div
                      key={w.id}
                      className="neu-convex rounded-[var(--ui-radius-mid)] border border-black/40 shadow-lg flex flex-col relative overflow-hidden group transition-all duration-300"
                      style={{ '--motion-order': idx } as React.CSSProperties}
                    >
                      {/* Subtle Top Edge Highlight */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-[var(--ui-radius-mid)] z-0" />
                      <div className="flex flex-col gap-3 p-4 items-center justify-center bg-red-500/10 border border-red-500/20 rounded-[var(--ui-radius-core)] text-center relative z-10 m-4">
                        <span className="text-sm font-bold text-red-400">Delete this wheel?</span>
                        <div className="flex gap-3 w-full max-w-xs mt-2">
                          <button
                            type="button"
                            className="flex-1 h-10 rounded-[var(--ui-radius-core)] neu-button text-white/70 font-semibold text-xs uppercase tracking-wide transition active:scale-95 flex items-center justify-center cursor-pointer"
                            onClick={() => setDeletingWheelId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="flex-1 h-10 rounded-[var(--ui-radius-core)] bg-red-500/80 text-white font-bold text-xs uppercase tracking-wide shadow-lg transition active:scale-95 flex items-center justify-center cursor-pointer neu-button"
                            onClick={() => { onDeleteWheel(w.id); setDeletingWheelId(null); }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <ExpandableCard
                    key={w.id}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedEquipmentId(isExpanded ? null : w.id)}
                    index={idx}
                    header={
                      <div className="flex flex-col min-w-0 w-full gap-2">
                        <div className="flex items-center gap-2.5 w-full">
                          <IconDisc className="w-6 h-6 text-[var(--color-accent)] shrink-0" />
                          <div className={`text-base font-medium tracking-wide truncate ${isExpanded ? 'text-amber-400/80' : 'text-white'}`}>
                            {w.name || 'Untitled wheel'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 min-h-[24px]">
                          <Tag intent="default" appearance="ghost">
                            {baseLabel}
                          </Tag>
                          <Tag 
                            intent="default" 
                            appearance="ghost"
                            badge={countdownText}
                            badgeIntent={isWheelOverdue(w) ? 'warning' : 'accent'}
                          >
                            Ø {w.D}mm
                          </Tag>
                        </div>
                      </div>
                    }
                  >
                    <div className="p-[var(--ui-gap)] pt-0 flex flex-col gap-4 mt-2" onClick={e => e.stopPropagation()}>
                      <WheelFormFields
                        value={w}
                        onChange={patch => onUpdateWheel(w.id, patch as Partial<import('../../types/core').Wheel>)}
                      />
                    </div>
                  </ExpandableCard>
                );
            })}
          </div>
        )}
      </div>

      {/* Add Wheel Modal */}
      {isAddWheelModalVisible && (
        <ModalShell
          title="Add wheel"
          subtitle="Enter wheel details. Saved wheels will appear in the list below."
          onClose={closeAddWheelModal}
          closing={isAddWheelModalClosing}
          overlayStyle={modalOverlayStyle}
          dialogStyle={getModalDialogStyle({ liftByKeyboard: true })}
        >
          <WheelFormFields
            value={newWheelDraft}
            onChange={patch => setNewWheelDraft(prev => ({ ...prev, ...patch }))}
            autoFocusName
          />

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="px-4 h-11 rounded-[var(--ui-radius-core)] neu-button text-white/70 font-semibold text-xs uppercase tracking-wide transition active:scale-95 cursor-pointer flex items-center justify-center"
              onClick={closeAddWheelModal}
            >
              Cancel
            </button>

            <button
              type="button"
              className="px-6 h-11 rounded-[var(--ui-radius-core)] bg-[var(--color-accent)] text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-[var(--color-accent)]"
              disabled={isAddWheelSaveDisabled}
              onClick={handleSaveNewWheel}
            >
              Save wheel
            </button>
          </div>
        </ModalShell>
      )}
    </section>
  );
}

export default WheelManagerView;

