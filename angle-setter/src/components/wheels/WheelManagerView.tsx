import * as React from 'react';
import type { Wheel } from '../../types/core';
import { BTN } from '../../ui/buttons';
import { IconSortAsc, IconSortDesc } from '../../icons';
import MiniSelect from '../MiniSelect';
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

  const [wheelSortField, setWheelSortField] = React.useState<'name' | 'diam'>('name');
  const [wheelSortDir, setWheelSortDir] = React.useState<'asc' | 'desc'>('asc');
  const [wheelGroup, setWheelGroup] = React.useState<'none' | 'grit'>('none');

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
    grit: '',
  });

  const sortedWheels = React.useMemo(() => {
    const list = [...wheels];
    const dir = wheelSortDir === 'asc' ? 1 : -1;
    const cmpName = (a: Wheel, b: Wheel) =>
      dir * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    const cmpDiam = (a: Wheel, b: Wheel) => {
      const da = Number.isNaN(a.D) ? Number.POSITIVE_INFINITY : a.D;
      const db = Number.isNaN(b.D) ? Number.POSITIVE_INFINITY : b.D;
      if (da === db) return cmpName(a, b);
      return dir * (da - db);
    };
    return list.sort(wheelSortField === 'name' ? cmpName : cmpDiam);
  }, [wheels, wheelSortDir, wheelSortField]);

  const groupedWheels = React.useMemo(() => {
    if (wheelGroup === 'none') {
      return [{ key: 'all', label: null as string | null, items: sortedWheels }];
    }
    const keyFn = (w: Wheel) => (w.grit?.trim() ? w.grit.trim() : 'Ungrouped');
    const map = new Map<string, Wheel[]>();
    for (const w of sortedWheels) {
      const key = keyFn(w);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: key,
      items,
    }));
  }, [sortedWheels, wheelGroup]);

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
      grit: '',
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
      grit: wheel.grit,
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
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <label className="text-[0.75rem] u-text-muted flex items-center gap-1">
            <span>Group:</span>
            <MiniSelect
              value={wheelGroup}
              onChange={val => setWheelGroup(val as 'none' | 'grit')}
              options={[
                { value: 'none', label: 'None' },
                { value: 'grit', label: 'Grit' },
              ]}
              ariaLabel="Group wheels"
              widthClass="min-w-[6rem]"
            />
          </label>
          <label className="text-[0.75rem] u-text-muted flex items-center gap-1">
            <span>Sort:</span>
            <MiniSelect
              value={wheelSortField}
              onChange={val => setWheelSortField(val as 'name' | 'diam')}
              options={[
                { value: 'name', label: 'Name' },
                { value: 'diam', label: 'Diameter' },
              ]}
              ariaLabel="Sort wheels"
              widthClass="min-w-[6.5rem]"
            />
          </label>
          <button
            type="button"
            className={BTN.iconGhost}
            aria-label={`Toggle ${wheelSortField === 'name' ? 'name' : 'diameter'} sort ${wheelSortDir === 'asc' ? 'ascending' : 'descending'}`}
            onClick={() => setWheelSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))}
          >
            {wheelSortDir === 'asc' ? (
              <IconSortAsc className="w-4 h-4" />
            ) : (
              <IconSortDesc className="w-4 h-4" />
            )}
          </button>
        </div>

        {wheels.length === 0 ? (
          <div className="text-xs u-text-muted border border-dashed u-border rounded p-3 u-surface">
            No wheels saved yet. Click <span className="font-semibold u-text">Add Wheel</span> to create your first wheel.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedWheels.map(group => (
              <div key={group.key} className="flex flex-col gap-2">
                {group.label && (
                  <div className="flex items-center gap-2 text-[0.85rem] u-text">
                    <span className="font-semibold">{group.label}</span>
                    <span className="text-[0.7rem] u-text-muted">
                      {group.items.length} wheel{group.items.length === 1 ? '' : 's'}
                    </span>
                  </div>
                )}

                <div className="grid card-grid md:grid-cols-2">
                  {group.items.map((w, idx) => {
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
                        <div className="card-elevated__header wheel-card__header grid grid-cols-[1fr_auto] items-center gap-2">
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="text-sm font-semibold u-text truncate">
                              {w.name || 'Untitled wheel'}
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2 shrink-0 h-full">
                            <button
                              type="button"
                              className={BTN.base}
                              onClick={() => openEditWheelModal(w)}
                            >
                              Details
                            </button>
                          </div>
                        </div>

                        <div className="wheel-card__summary">
                          <span className="font-mono u-text text-[0.8rem]">
                            D: {diameterDisplay || '-'} mm
                          </span>
                          <span className="u-text-muted">{baseLabel}</span>
                          {w.grit ? (
                            <span className="px-2 py-[2px] rounded border u-border u-surface text-[0.75rem] u-text">
                              Grit: {w.grit}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
                (source.grit ?? '') === (editingWheel!.grit ?? '') &&
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
