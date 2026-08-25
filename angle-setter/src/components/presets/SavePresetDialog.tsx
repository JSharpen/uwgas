import * as React from 'react';
import { BTN, BTN_MUTED } from '../../ui/buttons';
import { blurOnEnter } from '../../utils/dom';
import ModalShell from '../ModalShell';

export type SavePresetDialogProps = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  presetNameDraft: string;
  setPresetNameDraft: (val: string) => void;
  onSave: () => void;
  canSave: boolean;
  overlayStyle?: React.CSSProperties;
  dialogStyle?: React.CSSProperties;
};

export function SavePresetDialog({
  isOpen,
  isClosing,
  onClose,
  presetNameDraft,
  setPresetNameDraft,
  onSave,
  canSave,
  overlayStyle,
  dialogStyle,
}: SavePresetDialogProps) {
  if (!isOpen) return null;

  return (
    <ModalShell
      title="Save preset"
      subtitle="Enter a name for this progression."
      onClose={onClose}
      closing={isClosing}
      overlayStyle={overlayStyle}
      dialogStyle={dialogStyle}
    >
      <div className="mt-3">
        <input
          type="text"
          className="w-full rounded border u-border u-surface px-2 py-1 text-xs u-text placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
          placeholder="Preset name…"
          value={presetNameDraft}
          onKeyDown={e => {
            blurOnEnter(e);
            if (e.key === 'Enter' && canSave) {
              onSave();
            }
          }}
          onChange={e => setPresetNameDraft(e.target.value)}
          autoFocus
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          className={BTN_MUTED}
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          type="button"
          className={BTN.primary}
          onClick={onSave}
          disabled={!canSave}
        >
          Save
        </button>
      </div>
    </ModalShell>
  );
}

export default SavePresetDialog;
