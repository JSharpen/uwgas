import * as React from 'react';
import type { Wheel } from '../../types/core';
import { BTN } from '../../ui/buttons';
import { IconDisc, IconEdit, IconTrash } from '../../icons';
import ModalShell from '../ModalShell';
import WheelFormFields, { type WheelFormValue } from './WheelFormFields';
import useModalLayout from '../../hooks/useModalLayout';

export type WheelManagerViewProps = {
  wheels: Wheel[];
  onAddWheel: (draft: Omit<Wheel, 'id'>) => void;
  onUpdateWheel: (id: string, patch: Partial<Wheel>) => void;
  onDeleteWheel: (id: string) => void;
};

export function WheelManagerView({
  wheels,
  onAddWheel,
  onUpdateWheel,
  onDeleteWheel,
}: WheelManagerViewProps) {
  const { overlayStyle: modalOverlayStyle, getDialogStyle: getModalDialogStyle } =
    useModalLayout();

      const [deletingWheelId, setDeletingWheelId] = React.useState<string | null>(null);
  

  // Modal states
  const [isAddWheelModalVisible, setIsAddWheelModalVisible] = React.useState(false);
  const [isAddWheelModalClosing, setIsAddWheelModalClosing] = React.useState(false);

  const [editingWheelId, setEditingWheelId] = React.useState<string | null>(null);
  const [editingWheelDraft, setEditingWheelDraft] = React.useState<WheelFormValue | null>(null);
  const [isEditWheelModalVisible, setIsEditWheelModalVisible] = React.useState(false);
  const [isEditWheelModalClosing, setIsEditWheelModalClosing] = React.useState(false);

  const MODAL_CLOSE_MS = 200;

  const [newWheelDraft, setNewWheelDraft] = React.useState<Omit<Wheel, 'id'>>({
    name: '',
    D: NaN,
    DText: '',
    angleOffset: 0,
    baseForHn: 'rear',
    isHoning: false,
  });

    const sortedWheels = React.useMemo(() => {
    const list = [...wheels];
    return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }, [wheels]);

  
  const editingWheel = React.useMemo(
    () => (editingWheelId ? wheels.find(w => w.id === editingWheelId) || null : null),
    [editingWheelId, wheels]
  );

  const openAddWheelModal = () => {
    setNewWheelDraft({
      name: '',
      D: NaN,
      DText: '',
      angleOffset: 0,
      baseForHn: 'rear',
      isHoning: false,
    });
    setIsAddWheelModalVisible(true);
    setIsAddWheelModalClosing(false);
  };

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

  const openEditWheelModal = (wheel: Wheel) => {
    setEditingWheelDraft({
      name: wheel.name,
      D: wheel.D,
      DText: wheel.DText,
      angleOffset: wheel.angleOffset,
      isHoning: wheel.isHoning,
      baseForHn: wheel.baseForHn,
    });
    setEditingWheelId(wheel.id);
    setIsEditWheelModalVisible(true);
    setIsEditWheelModalClosing(false);
  };

  const closeEditWheelModal = () => {
    setIsEditWheelModalClosing(true);
    window.setTimeout(() => {
      setIsEditWheelModalVisible(false);
      setIsEditWheelModalClosing(false);
      setEditingWheelId(null);
      setEditingWheelDraft(null);
    }, MODAL_CLOSE_MS);
  };

  const newWheelNameTrimmed = newWheelDraft.name.trim();
  const isNewWheelDiameterValid = Number.isFinite(newWheelDraft.D);
  const isAddWheelSaveDisabled = !newWheelNameTrimmed || !isNewWheelDiameterValid;

  return (
    <section className="panel-card panel-card--strong motion-panel flex flex-col gap-0 max-w-3xl mx-auto">
      <div className="panel-card__header flex items-center gap-2">
        <h2 className="text-sm font-semibold u-text panel-header">Wheel Manager</h2>
        <button
          type="button"
          className={`${BTN.primaryFlat} ml-auto`}
          onClick={openAddWheelModal}
        >
          + Add Wheel
        </button>
      </div>

      <div className="panel-card__body flex flex-col gap-3">
        

        {wheels.length === 0 ? (
          <div className="text-xs u-text-muted border border-dashed u-border rounded p-3 u-surface">
            No wheels saved yet. Click <span className="font-semibold u-text">Add Wheel</span> to create your first wheel.
          </div>
        ) : (
                    <div className="grid card-grid md:grid-cols-2">
            {sortedWheels.map((w, idx) => {
              const diameterDisplay =
                w.DText !== undefined ? w.DText : Number.isNaN(w.D) ? '' : String(w.D);
              const baseLabel = w.isHoning
                ? 'Honing (front base)'
                : w.baseForHn === 'rear'
                ? 'Rear base'
                : 'Front base';

              return (
                <div
                  key={w.id}
                  className="card-elevated wheel-card flex flex-col gap-2 motion-card"
                  style={{ '--motion-order': idx } as React.CSSProperties}
                >
                  {deletingWheelId === w.id ? (
                    <div className="flex flex-col gap-2 p-3 items-center justify-center min-h-[96px]">
                      <span className="text-sm font-semibold u-text">Delete this wheel?</span>
                      <div className="flex gap-2 w-full mt-2">
                        <button type="button" className={`${BTN.ghost} flex-1`} onClick={() => setDeletingWheelId(null)}>Cancel</button>
                        <button type="button" className={`${BTN.danger} flex-1`} onClick={() => { onDeleteWheel(w.id); setDeletingWheelId(null); }}>Delete</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="card-elevated__header wheel-card__header flex items-center justify-between gap-2 p-3 pb-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <IconDisc className="w-5 h-5 text-primary shrink-0" />
                          <div className="text-sm font-semibold u-text truncate">
                            {w.name || 'Untitled wheel'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 u-text-muted hover:u-text transition-colors"
                            onClick={() => openEditWheelModal(w)}
                            title="Edit"
                          >
                            <IconEdit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-red-500/10 text-red-500/70 hover:text-red-500 transition-colors"
                            onClick={() => setDeletingWheelId(w.id)}
                            title="Delete"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 pt-1 flex flex-col gap-2">
                        <span className="font-mono u-text text-sm">
                          D: {diameterDisplay || '-'} mm
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded-full border u-border bg-black/5 dark:bg-white/5 text-[11px] font-medium u-text-muted">
                            {baseLabel}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}      </div>

      {/* Edit Wheel Modal */}
      {isEditWheelModalVisible && (editingWheelDraft || editingWheel) && (
        <ModalShell
          title="Edit wheel"
          subtitle="Changes apply immediately to the calculator and presets."
          onClose={closeEditWheelModal}
          closing={isEditWheelModalClosing}
          overlayStyle={modalOverlayStyle}
          dialogStyle={getModalDialogStyle({ liftByKeyboard: true })}
        >
          {(() => {
            const source = editingWheelDraft || editingWheel!;
            const hasBaseline = Boolean(editingWheel);
            const saveDisabled =
              !editingWheelId ||
              !source.name.trim() ||
              !Number.isFinite(source.D) ||
              (hasBaseline &&
                source.name === editingWheel!.name &&
                source.D === editingWheel!.D &&
                (source.DText ?? '') === (editingWheel!.DText ?? '') &&
                source.isHoning === editingWheel!.isHoning &&
                source.baseForHn === editingWheel!.baseForHn);

            return (
              <>
                <WheelFormFields
                  value={source}
                  onChange={patch =>
                    setEditingWheelDraft(prev => ({
                      ...(prev || source),
                      ...patch,
                    }))
                  }
                />

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className={BTN.danger}
                    onClick={() => {
                      if (!editingWheelId) return;
                      onDeleteWheel(editingWheelId);
                      closeEditWheelModal();
                    }}
                  >
                    Delete wheel
                  </button>
                  <button
                    type="button"
                    className={BTN.ghost}
                    onClick={closeEditWheelModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={BTN.primary}
                    disabled={saveDisabled}
                    onClick={() => {
                      if (!editingWheelId || !editingWheelDraft) return;
                      onUpdateWheel(editingWheelId, editingWheelDraft as Partial<Wheel>);
                      closeEditWheelModal();
                    }}
                  >
                    Save changes
                  </button>
                </div>
              </>
            );
          })()}
        </ModalShell>
      )}

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
              className={BTN.ghost}
              onClick={closeAddWheelModal}
            >
              Cancel
            </button>

            <button
              type="button"
              className={BTN.primary}
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
