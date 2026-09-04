import * as React from 'react';
import type { SessionPreset } from '../../types/core';
import ModalShell from '../ModalShell';

export type PresetManagerModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  sessionPresets: SessionPreset[];
  selectedPresetId: string;
  onLoadPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
  onRenamePreset: (id: string, newName: string) => void;
  overlayStyle?: React.CSSProperties;
  dialogStyle?: React.CSSProperties;
};

export function PresetManagerModal({
  isOpen,
  isClosing,
  onClose,
  sessionPresets,
  selectedPresetId,
  onLoadPreset,
  onDeletePreset,
  onRenamePreset,
  overlayStyle,
  dialogStyle,
}: PresetManagerModalProps) {
  const [presetRenameId, setPresetRenameId] = React.useState<string | null>(null);
  const [presetRenameValue, setPresetRenameValue] = React.useState('');

  if (!isOpen) return null;

  const handleBeginRename = (preset: SessionPreset) => {
    setPresetRenameId(preset.id);
    setPresetRenameValue(preset.name);
  };

  const handleCancelRename = () => {
    setPresetRenameId(null);
    setPresetRenameValue('');
  };

  const handleCommitRename = () => {
    const trimmed = presetRenameValue.trim();
    if (!presetRenameId || !trimmed) return;
    onRenamePreset(presetRenameId, trimmed);
    setPresetRenameId(null);
    setPresetRenameValue('');
  };

  return (
    <ModalShell
      title="Manage presets"
      subtitle="Rename, load, or delete saved progressions."
      onClose={onClose}
      closing={isClosing}
      overlayStyle={overlayStyle}
      dialogStyle={dialogStyle}
    >
      <div className="max-h-[60vh] overflow-y-auto pr-0.5 flex flex-col gap-3">
        {sessionPresets.length === 0 ? (
          <div className="bg-black/20 border border-white/5 rounded-2xl p-6 text-center text-sm text-white/40">
            No presets saved yet.
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {sessionPresets.map(preset => {
              const isEditing = presetRenameId === preset.id;
              const renameTrimmed = presetRenameValue.trim();
              const renameConflicts =
                isEditing &&
                sessionPresets.some(
                  p =>
                    p.id !== preset.id &&
                    p.name.toLowerCase() === renameTrimmed.toLowerCase()
                );
              const renameDisabled =
                !isEditing || renameTrimmed.length === 0 || renameConflicts;
              const isSelected = selectedPresetId === preset.id;

              return (
                <li
                  key={preset.id}
                  className="bg-black/25 hover:bg-black/35 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full h-11 bg-black/40 border border-amber-400/60 rounded-xl px-3.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                          value={presetRenameValue}
                          onChange={e => setPresetRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleCommitRename();
                            }
                            if (e.key === 'Escape') {
                              handleCancelRename();
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <>
                          <span className="text-base font-semibold text-white tracking-wide truncate">
                            {preset.name}
                          </span>
                          {isSelected && (
                            <span className="bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full shrink-0">
                              active
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-xs text-white/40 font-mono font-medium">
                      {preset.steps.length} step{preset.steps.length === 1 ? '' : 's'}
                    </div>
                    {isEditing && renameConflicts && (
                      <div className="text-xs text-amber-400 font-medium">
                        A preset with that name already exists.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="h-10 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-30 disabled:hover:bg-amber-400 disabled:cursor-not-allowed text-black font-bold text-xs shadow-sm transition-all"
                          disabled={renameDisabled}
                          onClick={handleCommitRename}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="h-10 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-semibold text-xs transition-colors"
                          onClick={handleCancelRename}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="h-10 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold text-xs shadow-sm transition-all flex items-center justify-center"
                          onClick={() => {
                            onLoadPreset(preset.id);
                            onClose();
                          }}
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          className="h-10 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-semibold text-xs transition-colors flex items-center justify-center"
                          onClick={() => handleBeginRename(preset)}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="h-10 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 hover:text-red-300 font-semibold text-xs transition-colors flex items-center justify-center"
                          onClick={() => onDeletePreset(preset.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ModalShell>
  );
}

export default PresetManagerModal;
