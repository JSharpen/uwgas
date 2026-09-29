import * as React from 'react';
import { blurOnEnter } from '../../utils/dom';
import ModalShell from '../ModalShell';
import useModalLayout from '../../hooks/useModalLayout';
import { useUIStore } from '../../state/uiStore';
import { usePresetState, useStore } from '../../state/store';
import { Button, TextInput, SettingGroup, SettingItem, SwitchToggle } from '../ui';

export type SavePresetDialogProps = Record<string, never>;

export function SavePresetDialog() {
  const { overlayStyle, getDialogStyle } = useModalLayout();

  const isOpen = useUIStore((s) => s.isPresetDialogOpen);
  const isClosing = useUIStore((s) => s.isPresetDialogClosing);
  const setIsOpen = useUIStore((s) => s.setPresetDialogOpen);
  const setIsClosing = useUIStore((s) => s.setPresetDialogClosing);
  const presetNameDraft = useUIStore((s) => s.presetNameDraft);
  const setPresetNameDraft = useUIStore((s) => s.setPresetNameDraft);

  const [saveTargetAngle, setSaveTargetAngle] = React.useState(true);
  const [saveMachine, setSaveMachine] = React.useState(true);
  const [saveUsb, setSaveUsb] = React.useState(true);

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
      setSaveTargetAngle(true);
      setSaveMachine(true);
      setSaveUsb(true);
      setClearAfterSave(false);
    }, 180);
  }, [setIsClosing, setIsOpen, setSaveTargetAngle, setSaveMachine, setSaveUsb, setClearAfterSave]);

  const onSave = React.useCallback(() => {
    const trimmed = presetNameDraft.trim();
    if (!trimmed) return;
    presetState.savePreset(trimmed, { saveTargetAngle, saveMachine, saveUsb });
    if (clearAfterSave) {
      clearSessionSteps();
    }
    setPresetNameDraft('');
    onClose();
  }, [presetNameDraft, saveTargetAngle, saveMachine, saveUsb, presetState, clearAfterSave, clearSessionSteps, setPresetNameDraft, onClose]);

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
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-0.5">
            Preset Name
          </label>
          <TextInput
            value={presetNameDraft}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPresetNameDraft(e.target.value)}
            placeholder="Preset name…"
            autoFocus
            onKeyDown={e => {
              blurOnEnter(e);
              if (e.key === 'Enter' && canSave) {
                onSave();
              }
            }}
          />
          {isOverwrite && (
            <div className="text-red-400 text-xs px-1 font-medium mt-1">
              A preset with this name already exists and will be overwritten.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-0.5">
            Context Overrides
          </label>
          <SettingGroup>
            <SettingItem 
              title="Target Angle" 
              description="Save the current target angle."
              control={
                <SwitchToggle 
                  checked={saveTargetAngle} 
                  onChange={setSaveTargetAngle} 
                  ariaLabel="Save target angle" 
                />
              }
            />
            <SettingItem 
              title="Bind Global Machine" 
              description="Force the entire app to switch to your active machine. (Step overrides are always saved)."
              control={
                <SwitchToggle 
                  checked={saveMachine} 
                  onChange={setSaveMachine} 
                  ariaLabel="Bind global machine" 
                />
              }
            />
            <SettingItem 
              title="Bind Global USB Setup" 
              description="Force the entire app to switch to your active USB. (Step overrides are always saved)."
              control={
                <SwitchToggle 
                  checked={saveUsb} 
                  onChange={setSaveUsb} 
                  ariaLabel="Bind global USB setup" 
                />
              }
              className="border-b-0"
            />
          </SettingGroup>
        </div>

        <div className="flex justify-end items-center gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="solid"
            className={isOverwrite ? 'bg-red-500 hover:bg-red-400 active:bg-red-600 shadow-red-950/30 text-white' : 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 shadow-amber-950/30 text-black'}
            onClick={onSave}
            disabled={!canSave}
          >
            {isOverwrite ? 'Overwrite' : 'Save'}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

export default SavePresetDialog;
