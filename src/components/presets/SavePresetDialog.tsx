import * as React from 'react';
import { blurOnEnter } from '../../utils/dom';
import ModalShell from '../ModalShell';
import useModalLayout from '../../hooks/useModalLayout';
import { useUIStore } from '../../state/uiStore';
import { usePresetState, useStore } from '../../state/store';

export type SavePresetDialogProps = Record<string, never>;

export function SavePresetDialog() {
  const { overlayStyle, getDialogStyle } = useModalLayout();

  const isOpen = useUIStore((s) => s.isPresetDialogOpen);
  const isClosing = useUIStore((s) => s.isPresetDialogClosing);
  const setIsOpen = useUIStore((s) => s.setPresetDialogOpen);
  const setIsClosing = useUIStore((s) => s.setPresetDialogClosing);
  const presetNameDraft = useUIStore((s) => s.presetNameDraft);
  const setPresetNameDraft = useUIStore((s) => s.setPresetNameDraft);

  const [includeHardware, setIncludeHardware] = React.useState(false);

  const clearAfterSave = useUIStore((s) => s.clearAfterSave);
  const setClearAfterSave = useUIStore((s) => s.setClearAfterSave);

  const presetState = usePresetState();
  const sessionStepsCount = useStore((s) => s.sessionSteps.length);
  const clearSessionSteps = useStore((s) => s.clearSessionSteps);

  const onClose = React.useCallback(() => {
    setIsClosing(true);
    window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setIncludeHardware(false);
      setClearAfterSave(false);
    }, 180);
  }, [setIsClosing, setIsOpen, setClearAfterSave]);

  const onSave = React.useCallback(() => {
    const trimmed = presetNameDraft.trim();
    if (!trimmed) return;
    presetState.savePreset(trimmed, includeHardware);
    if (clearAfterSave) {
      clearSessionSteps();
    }
    setPresetNameDraft('');
    onClose();
  }, [presetNameDraft, includeHardware, presetState, clearAfterSave, clearSessionSteps, setPresetNameDraft, onClose]);

  const canSave = sessionStepsCount > 0 && presetNameDraft.trim().length > 0;
  const isOverwrite = presetState.sessionPresets.some(
    p => p.name.trim().toLowerCase() === presetNameDraft.trim().toLowerCase()
  );
  const dialogStyle = getDialogStyle();

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
            className="w-full h-12 bg-black/30 border border-white/5 focus:border-amber-400/60 rounded-xl px-4 text-base text-white placeholder-white/30 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
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
          {isOverwrite && (
            <div className="text-red-400 text-xs px-1 font-medium mt-1">
              A preset with this name already exists and will be overwritten.
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 bg-black/20 border border-white/5 rounded-2xl p-4 cursor-pointer transition-colors hover:bg-black/30">
          <input
            type="checkbox"
            className="w-5 h-5 rounded border-white/10 bg-black/40 text-amber-400 focus:ring-amber-400/30 focus:ring-offset-0 transition-all cursor-pointer"
            checked={includeHardware}
            onChange={(e) => setIncludeHardware(e.target.checked)}
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white/90">Bind Hardware</span>
            <span className="text-[10px] text-white/40 leading-tight mt-0.5">Save current machine and USB selections with this preset.</span>
          </div>
        </label>

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
            className={`h-12 px-6 rounded-2xl ${
              isOverwrite 
                ? 'bg-red-500 hover:bg-red-400 active:bg-red-600 shadow-red-950/30 text-white' 
                : 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 shadow-amber-950/30 text-black'
            } disabled:opacity-30 disabled:cursor-not-allowed font-bold text-sm shadow-lg transition-all`}
            onClick={onSave}
            disabled={!canSave}
          >
            {isOverwrite ? 'Overwrite Preset' : 'Save Preset'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default SavePresetDialog;
