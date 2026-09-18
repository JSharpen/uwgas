import * as React from 'react';
import type { SessionPreset } from '../../types/core';
import ModalShell from '../ModalShell';
import useModalLayout from '../../hooks/useModalLayout';
import { useUIStore } from '../../state/uiStore';
import { usePresetState, useStore } from '../../state/store';

export type PresetManagerModalProps = Record<string, never>;

export function PresetManagerModal() {
  const { overlayStyle, getDialogStyle } = useModalLayout();

  const isOpen = useUIStore((s) => s.isPresetManagerOpen);
  const isClosing = useUIStore((s) => s.isPresetManagerClosing);
  const setIsOpen = useUIStore((s) => s.setPresetManagerOpen);
  const setIsClosing = useUIStore((s) => s.setPresetManagerClosing);
  const selectedPresetId = useUIStore((s) => s.selectedPresetId);
  const setSelectedPresetId = useUIStore((s) => s.setSelectedPresetId);

  const presetState = usePresetState();
  const sessionPresets = presetState.sessionPresets;
  const machines = useStore(s => s.machines);
  const usbs = useStore(s => s.usbs);

  const onClose = React.useCallback(() => {
    setIsClosing(true);
    window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 180);
  }, [setIsClosing, setIsOpen]);

  const onLoadPreset = React.useCallback(
    (id: string) => {
      setSelectedPresetId(id);
      presetState.loadPreset(id);
      onClose();
    },
    [setSelectedPresetId, presetState, onClose]
  );

  const onDeletePreset = presetState.deletePreset;
  const onRenamePreset = presetState.renamePreset;
  const dialogStyle = getDialogStyle();
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
              
              const hwStep = preset.includeHardware ? preset.steps.find(s => s.machineId || s.usbId) : null;
              const machine = hwStep?.machineId ? machines?.find(m => m.id === hwStep.machineId) : null;
              const usb = hwStep?.usbId ? usbs?.find(u => u.id === hwStep.usbId) : null;
              const hwStr = [machine?.name, usb?.name].filter(Boolean).join(' • ');

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
                          {preset.includeHardware && (
                            <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full shrink-0">
                              HW Bound
                            </span>
                          )}
                          {isSelected && (
                            <span className="bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full shrink-0">
                              active
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40 font-mono font-medium truncate w-full text-left">
                      <span>{preset.steps.length} step{preset.steps.length === 1 ? '' : 's'}</span>
                      <span className="opacity-50">•</span>
                      <span>__° (TBD)</span>
                      {preset.includeHardware && hwStr && (
                        <>
                          <span className="opacity-50">•</span>
                          <span className="truncate text-cyan-400/70">{hwStr}</span>
                        </>
                      )}
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
                          className="h-11 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-30 disabled:hover:bg-amber-400 disabled:cursor-not-allowed text-black font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 flex items-center justify-center"
                          disabled={renameDisabled}
                          onClick={handleCommitRename}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="h-11 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center"
                          onClick={handleCancelRename}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="h-11 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 flex items-center justify-center"
                          onClick={() => {
                            onLoadPreset(preset.id);
                            onClose();
                          }}
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          className="h-11 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center"
                          onClick={() => handleBeginRename(preset)}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="h-11 px-3.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all active:scale-95 flex items-center justify-center"
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
