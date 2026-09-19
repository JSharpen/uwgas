import * as React from 'react';
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
              <div className="flex items-center gap-2.5 min-w-0 flex-wrap w-full">
                <div className="w-6 h-6 shrink-0 flex items-center justify-center bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-lg">
                  <span className="text-xs font-bold font-mono">U</span>
                </div>
                <div className={`text-base font-medium tracking-wide truncate ${isExpanded ? 'text-amber-400/80' : 'text-white'}`}>
                  {item.name || 'Untitled USB'}
                </div>
              </div>
            }
          >
            <div className="p-5 pt-0 flex flex-col gap-4 mt-2" onClick={e => e.stopPropagation()}>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">USB Name</span>
                <input
                  type="text"
                  className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-semibold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                  defaultValue={item.name}
                  onBlur={e => onUpdateUsb(item.id, { name: e.target.value.trim() })}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Diameter (Ds) in mm</span>
                <input
                  type="number"
                  step="0.01"
                  className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                  defaultValue={item.Ds}
                  onBlur={e => onUpdateUsb(item.id, { Ds: Number(e.target.value) })}
                />
              </label>
              
              <div className="flex items-center gap-4 pt-1">
                <label className="flex flex-col gap-1.5 flex-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Thread pitch (mm)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 1.5"
                    className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent placeholder-white/20 focus:border-[var(--color-accent)] outline-none transition w-full"
                    defaultValue={item.threadPitch || ''}
                    onBlur={e => onUpdateUsb(item.id, { threadPitch: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </label>

                <label className="flex flex-col gap-1.5 flex-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Micro-adjust marks</span>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 6"
                    className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent placeholder-white/20 focus:border-[var(--color-accent)] outline-none transition w-full"
                    defaultValue={item.microAdjustMarks || ''}
                    onBlur={e => onUpdateUsb(item.id, { microAdjustMarks: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </label>
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
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">USB Name</span>
              <input
                type="text"
                className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-semibold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                value={draftUsb.name || ''}
                onChange={e => setDraftUsb({ ...draftUsb, name: e.target.value })}
                autoFocus
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Diameter (Ds) in mm</span>
              <input
                type="number"
                step="0.01"
                className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                value={draftUsb.Ds || ''}
                onChange={e => setDraftUsb({ ...draftUsb, Ds: Number(e.target.value) })}
              />
            </label>
            
            <div className="flex items-center gap-4 pt-1">
              <label className="flex flex-col gap-1.5 flex-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Thread pitch (mm)</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 1.5"
                  className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent placeholder-white/20 focus:border-[var(--color-accent)] outline-none transition w-full"
                  value={draftUsb.threadPitch || ''}
                  onChange={e => setDraftUsb({ ...draftUsb, threadPitch: e.target.value ? Number(e.target.value) : undefined })}
                />
              </label>

              <label className="flex flex-col gap-1.5 flex-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Micro-adjust marks</span>
                <input
                  type="number"
                  step="1"
                  placeholder="e.g. 6"
                  className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent placeholder-white/20 focus:border-[var(--color-accent)] outline-none transition w-full"
                  value={draftUsb.microAdjustMarks || ''}
                  onChange={e => setDraftUsb({ ...draftUsb, microAdjustMarks: e.target.value ? Number(e.target.value) : undefined })}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                className="px-4 h-11 rounded-xl neu-button text-white/70 font-semibold text-xs uppercase tracking-wide transition active:scale-95 cursor-pointer flex items-center justify-center"
                onClick={closeModals}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-6 h-11 rounded-xl bg-[var(--color-accent)] text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-[var(--color-accent)]" 
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
