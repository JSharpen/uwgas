import * as React from 'react';
import { TextInput } from "../ui/TextInput";
import { NumberInput } from "../ui/NumberInput";
import { SwitchButton } from "../ui/SwitchButton";
import { useStore } from '../../state/store';
import { useUIStore } from '../../state/uiStore';
import type { JigConfig } from '../../types/core';
import { generateId } from '../../utils/id';
import ModalShell from '../ModalShell';
import useModalLayout from '../../hooks/useModalLayout';
import ExpandableCard from '../ui/ExpandableCard';

export default function JigManagerView() {
  const { jigs, addJig: onAddJig, updateJig: onUpdateJig } = useStore();
  
  const expandedEquipmentId = useUIStore(s => s.expandedEquipmentId);
  const setExpandedEquipmentId = useUIStore(s => s.setExpandedEquipmentId);

  React.useEffect(() => {
    return () => setExpandedEquipmentId(null);
  }, [setExpandedEquipmentId]);

  const { overlayStyle, getDialogStyle } = useModalLayout();

  const [draftJig, setDraftJig] = React.useState<Partial<JigConfig>>({});
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const openAdd = React.useCallback(() => {
    setDraftJig({ name: '', Dj: 12 });
    setIsAddModalOpen(true);
  }, []);

  React.useEffect(() => {
    window.addEventListener('openAddHardwareModal', openAdd);
    return () => window.removeEventListener('openAddHardwareModal', openAdd);
  }, [openAdd]);

  const closeModals = () => {
    setIsAddModalOpen(false);
  };

  const handleSaveAdd = () => {
    if (draftJig.name && draftJig.Dj) {
      onAddJig({
        id: generateId(),
        name: draftJig.name.trim(),
        Dj: draftJig.Dj,
        length: draftJig.length,
        isAdjustableLength: draftJig.isAdjustableLength,
        threadPitch: draftJig.threadPitch
      });
    }
    closeModals();
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-20 w-full animate-in fade-in zoom-in-95 duration-200">
      {jigs.map((item, idx) => {
        const isExpanded = expandedEquipmentId === item.id;
        
        return (
          <ExpandableCard
            key={item.id}
            isExpanded={isExpanded}
            onToggle={() => setExpandedEquipmentId(isExpanded ? null : item.id)}
            index={idx}
            header={
              <div className="flex flex-col min-w-0 w-full gap-2">
                <div className="flex items-center gap-2.5 w-full">
                  <div className="w-6 h-6 shrink-0 flex items-center justify-center bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-lg">
                    <span className="text-xs font-bold font-mono">J</span>
                  </div>
                  <div className={`text-base font-medium tracking-wide truncate ${isExpanded ? 'text-amber-400/80' : 'text-white'}`}>
                    {item.name || 'Untitled Jig'}
                  </div>
                </div>
                <div className="flex items-center gap-2 min-h-[24px]">
                  {/* Empty tags area for uniform height */}
                </div>
              </div>
            }
          >
            <div className="p-[var(--ui-gap)] pt-0 flex flex-col gap-4 mt-2" onClick={e => e.stopPropagation()}>
              <TextInput
  label="Jig Name"
  defaultValue={item.name}
                  onBlur={e => onUpdateJig(item.id, { name: e.target.value.trim() })}
/>

              <NumberInput
  label="Diameter (Dj) in mm"
  defaultValue={item.Dj}
                  onBlur={e => onUpdateJig(item.id, { Dj: Number(e.target.value) })}
/>
              
              <NumberInput
  label="Base Length (mm)"
  defaultValue={item.length || ''}
                  onBlur={e => onUpdateJig(item.id, { length: e.target.value ? Number(e.target.value) : undefined })}
/>

              <SwitchButton
                checked={!!item.isAdjustableLength}
                title="Adjustable Collar"
                onChange={() => onUpdateJig(item.id, { isAdjustableLength: !item.isAdjustableLength })}
              />

              <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: item.isAdjustableLength ? "1fr" : "0fr" }}>
                <div className="overflow-hidden min-h-0">
                  <NumberInput
  label="Thread Pitch (Optional, mm)"
  defaultValue={item.threadPitch || ''}
                      onBlur={e => onUpdateJig(item.id, { threadPitch: e.target.value ? Number(e.target.value) : undefined })}
/>
                </div>
              </div>
            </div>
          </ExpandableCard>
        );
      })}

      {/* Add Modal */}
      {isAddModalOpen && (
        <ModalShell
          title="Add Jig"
          onClose={closeModals}
          overlayStyle={overlayStyle}
          dialogStyle={getDialogStyle({ liftByKeyboard: true })}
        >
          <div className="flex flex-col gap-4">
            <TextInput
  label="Jig Name"
  value={draftJig.name || ''}
                onChange={e => setDraftJig({ ...draftJig, name: e.target.value })}
                autoFocus
/>

            <NumberInput
  label="Diameter (Dj) in mm"
  value={draftJig.Dj || ''}
                onChange={e => setDraftJig({ ...draftJig, Dj: Number(e.target.value) })}
/>
            
            <NumberInput
  label="Base Length (mm)"
  value={draftJig.length || ''}
                onChange={e => setDraftJig({ ...draftJig, length: e.target.value ? Number(e.target.value) : undefined })}
/>

            <SwitchButton
              checked={!!draftJig.isAdjustableLength}
              title="Adjustable Collar"
              onChange={() => setDraftJig({ ...draftJig, isAdjustableLength: !draftJig.isAdjustableLength })}
            />

            {draftJig.isAdjustableLength && (
              <NumberInput
  label="Thread Pitch (Optional, mm)"
  value={draftJig.threadPitch || ''}
                  onChange={e => setDraftJig({ ...draftJig, threadPitch: e.target.value ? Number(e.target.value) : undefined })}
/>
            )}

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                className="px-4 h-11 rounded-[var(--ui-radius-core)] neu-button text-white/70 font-semibold text-xs uppercase tracking-wide transition active:scale-95 cursor-pointer flex items-center justify-center"
                onClick={closeModals}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-6 h-11 rounded-[var(--ui-radius-core)] bg-[var(--color-accent)] text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-[var(--color-accent)]" 
                disabled={!draftJig.name || !draftJig.Dj}
                onClick={handleSaveAdd}
              >
                Save
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
