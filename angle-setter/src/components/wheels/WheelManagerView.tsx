import * as React from 'react';
import type { Wheel } from '../../types/core';
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
    <section className="flex flex-col gap-6 max-w-3xl mx-auto pb-20 w-full">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Wheel Manager</h2>
        <button
          type="button"
          className="px-4 h-11 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition flex items-center justify-center cursor-pointer"
          onClick={openAddWheelModal}
        >
          + Add Wheel
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {wheels.length === 0 ? (
          <div className="bg-[#262626] rounded-3xl border border-dashed border-white/10 p-8 text-center text-xs text-white/50 flex flex-col gap-2">
            No wheels saved yet. Click <span className="font-bold text-white">Add Wheel</span> to create your first wheel.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="bg-[#262626] rounded-3xl border border-white/10 shadow-lg p-6 flex flex-col justify-between gap-4 relative overflow-hidden group transition-all"
                  style={{ '--motion-order': idx } as React.CSSProperties}
                >
                  {/* Subtle Top Edge Highlight */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

                  {deletingWheelId === w.id ? (
                    <div className="flex flex-col gap-3 p-4 items-center justify-center bg-red-500/10 border border-red-500/20 rounded-2xl text-center relative z-10">
                      <span className="text-sm font-bold text-red-400">Delete this wheel?</span>
                      <div className="flex gap-3 w-full max-w-xs mt-2">
                        <button
                          type="button"
                          className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs uppercase tracking-wide transition flex items-center justify-center cursor-pointer"
                          onClick={() => setDeletingWheelId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wide shadow-lg transition flex items-center justify-center cursor-pointer"
                          onClick={() => { onDeleteWheel(w.id); setDeletingWheelId(null); }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IconDisc className="w-6 h-6 text-[var(--color-accent)] shrink-0" />
                          <div className="font-bold text-base text-white tracking-wide truncate">
                            {w.name || 'Untitled wheel'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition cursor-pointer"
                            onClick={() => openEditWheelModal(w)}
                            title="Edit Wheel"
                          >
                            <IconEdit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition cursor-pointer"
                            onClick={() => setDeletingWheelId(w.id)}
                            title="Delete Wheel"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative z-10">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Diameter</span>
                          <span className="font-mono text-2xl font-extrabold text-white tracking-tight">
                            {diameterDisplay || '-'}<span className="text-xs text-white/50 font-medium ml-1">mm</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="px-2.5 py-1 rounded-full border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/70">
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
        )}
      </div>

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
                    className="px-4 h-11 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wide transition cursor-pointer flex items-center justify-center"
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
                    className="px-4 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs uppercase tracking-wide transition cursor-pointer flex items-center justify-center"
                    onClick={closeEditWheelModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-6 h-11 rounded-xl bg-[var(--color-accent)] hover:brightness-110 text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
              className="px-4 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs uppercase tracking-wide transition cursor-pointer flex items-center justify-center"
              onClick={closeAddWheelModal}
            >
              Cancel
            </button>

            <button
              type="button"
              className="px-6 h-11 rounded-xl bg-[var(--color-accent)] hover:brightness-110 text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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

