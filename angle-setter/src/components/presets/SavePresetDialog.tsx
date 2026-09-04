import * as React from 'react';
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
      <div className="flex flex-col gap-4">
        <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
          <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-0.5">
            Preset Name
          </label>
          <input
            type="text"
            className="w-full h-12 bg-black/30 border border-white/10 focus:border-amber-400/60 rounded-xl px-4 text-base text-white placeholder-white/30 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
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

        <div className="flex justify-end items-center gap-3 pt-2">
          <button
            type="button"
            className="h-12 px-5 rounded-2xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-white font-semibold text-sm transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="h-12 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-30 disabled:hover:bg-amber-400 disabled:cursor-not-allowed text-black font-bold text-sm shadow-lg shadow-amber-950/30 transition-all"
            onClick={onSave}
            disabled={!canSave}
          >
            Save Preset
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default SavePresetDialog;
