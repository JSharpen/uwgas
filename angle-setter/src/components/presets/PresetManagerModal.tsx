import * as React from 'react';
import type { SessionPreset } from '../../types/core';
import { BTN } from '../../ui/buttons';
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
      <div className="max-h-64 overflow-y-auto text-xs">
        {sessionPresets.length === 0 ? (
          <div className="text-neutral-500">No presets saved yet.</div>
        ) : (
          <ul className="flex flex-col gap-2">
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

              return (
                <li
                  key={preset.id}
                  className="flex items-start justify-between gap-2 rounded border u-border u-surface px-2 py-2"
                >
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full rounded border u-border u-surface px-2 py-1 text-xs u-text placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
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
                        <span className="u-text">{preset.name}</span>
                      )}
                      {selectedPresetId === preset.id && (
                        <span className="text-[0.65rem] text-accent-soft border border-accent rounded px-1 py-[2px]">
                          active
                        </span>
                      )}
                    </div>
                    <div className="text-[0.7rem] u-text-muted">
                      {preset.steps.length} step{preset.steps.length === 1 ? '' : 's'}
                    </div>
                    {isEditing && renameConflicts && (
                      <div className="text-[0.65rem] text-warning">
                        A preset with that name already exists.
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 self-start">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className={BTN.primary}
                          disabled={renameDisabled}
                          onClick={handleCommitRename}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className={BTN.ghost}
                          onClick={handleCancelRename}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1 justify-end">
                        <button
                          type="button"
                          className={BTN.base}
                          onClick={() => {
                            onLoadPreset(preset.id);
                            onClose();
                          }}
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          className={BTN.base}
                          onClick={() => handleBeginRename(preset)}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className={BTN.danger}
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
