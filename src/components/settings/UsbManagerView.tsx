import * as React from 'react';
import { TextInput } from "../ui/TextInput";
import { NumberInput } from "../ui/NumberInput";
import { useStore } from '../../state/store';
import { useUIStore } from '../../state/uiStore';
import type { UsbConfig } from '../../types/core';
import { generateId } from '../../utils/id';
import ModalShell from '../ModalShell';
import useModalLayout from '../../hooks/useModalLayout';
import ExpandableCard from '../ui/ExpandableCard';

export default function UsbManagerView() {
  const { usbs, addUsb: onAddUsb, updateUsb: onUpdateUsb } = useStore();
  
  const expandedEquipmentId = useUIStore(s => s.expandedEquipmentId);
  const setExpandedEquipmentId = useUIStore(s => s.setExpandedEquipmentId);

  React.useEffect(() => {
    return () => setExpandedEquipmentId(null);
  }, [setExpandedEquipmentId]);

  const { overlayStyle, getDialogStyle } = useModalLayout();

  const [draftUsb, setDraftUsb] = React.useState<Partial<UsbConfig>>({});
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const openAdd = React.useCallback(() => {
    setDraftUsb({ name: '', Ds: 11.98 });
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
    if (draftUsb.name && draftUsb.Ds) {
      onAddUsb({
        id: generateId(),
        name: draftUsb.name.trim(),
        Ds: draftUsb.Ds,
        threadPitch: draftUsb.threadPitch,
        microAdjustMarks: draftUsb.microAdjustMarks
      });
    }
    closeModals();
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-20 w-full animate-in fade-in zoom-in-95 duration-200">
      {usbs.map((item, idx) => {
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
                    <span className="text-xs font-bold font-mono">U</span>
                  </div>
                  <div className={`text-base font-medium tracking-wide truncate ${isExpanded ? 'text-amber-400/80' : 'text-white'}`}>
                    {item.name || 'Untitled USB'}
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
  label="USB Name"
  defaultValue={item.name}
                  onBlur={e => onUpdateUsb(item.id, { name: e.target.value.trim() })}
/>

              <NumberInput
  label="Diameter (Ds) in mm"
  defaultValue={item.Ds}
                  onBlur={e => onUpdateUsb(item.id, { Ds: Number(e.target.value) })}
/>
              
              <div className="flex items-center gap-4 pt-1">
                <NumberInput
  label="Thread pitch (mm)"
  defaultValue={item.threadPitch || ''}
                    onBlur={e => onUpdateUsb(item.id, { threadPitch: e.target.value ? Number(e.target.value) : undefined })}
/>

                <NumberInput
  label="Micro-adjust marks"
  defaultValue={item.microAdjustMarks || ''}
                    onBlur={e => onUpdateUsb(item.id, { microAdjustMarks: e.target.value ? Number(e.target.value) : undefined })}
/>
              </div>
            </div>
          </ExpandableCard>
        );
      })}

      {/* Add Modal */}
      {isAddModalOpen && (
        <ModalShell
          title="Add USB"
          onClose={closeModals}
          overlayStyle={overlayStyle}
          dialogStyle={getDialogStyle({ liftByKeyboard: true })}
        >
          <div className="flex flex-col gap-4">
            <TextInput
  label="USB Name"
  value={draftUsb.name || ''}
                onChange={e => setDraftUsb({ ...draftUsb, name: e.target.value })}
                autoFocus
/>

            <NumberInput
  label="Diameter (Ds) in mm"
  value={draftUsb.Ds || ''}
                onChange={e => setDraftUsb({ ...draftUsb, Ds: Number(e.target.value) })}
/>
            
            <div className="flex items-center gap-4 pt-1">
              <NumberInput
  label="Thread pitch (mm)"
  value={draftUsb.threadPitch || ''}
                  onChange={e => setDraftUsb({ ...draftUsb, threadPitch: e.target.value ? Number(e.target.value) : undefined })}
/>

              <NumberInput
  label="Micro-adjust marks"
  value={draftUsb.microAdjustMarks || ''}
                  onChange={e => setDraftUsb({ ...draftUsb, microAdjustMarks: e.target.value ? Number(e.target.value) : undefined })}
/>
            </div>

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
                disabled={!draftUsb.name || !draftUsb.Ds}
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
