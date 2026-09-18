import * as React from 'react';
import { useStore } from '../../state/store';
import { useUIStore } from '../../state/uiStore';
import type { UsbConfig } from '../../types/core';
import { generateId } from '../../utils/id';
import ModalShell from '../ModalShell';
import useModalLayout from '../../hooks/useModalLayout';

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
          <div
            key={item.id}
            className={`neu-convex rounded-3xl border shadow-lg flex flex-col relative overflow-hidden group transition-all duration-300 ${isExpanded ? 'border-amber-400/30' : 'border-black/40'}`}
            style={{ '--motion-order': idx } as React.CSSProperties}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

            {/* Header */}
            <div
              className={`w-full px-5 py-4 flex items-center justify-between cursor-pointer transition-colors relative z-10 ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5 active:bg-white/10'}`}
              onClick={() => setExpandedEquipmentId(isExpanded ? null : item.id)}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-wrap w-full">
                <div className="w-6 h-6 shrink-0 flex items-center justify-center bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-lg">
                  <span className="text-xs font-bold font-mono">U</span>
                </div>
                <div className={`text-base font-medium tracking-wide truncate ${isExpanded ? 'text-amber-400/80' : 'text-white'}`}>
                  {item.name || 'Untitled USB'}
                </div>
              </div>
            </div>

            {/* Expanded Details Pane */}
            <div 
              className="grid transition-[grid-template-rows] duration-300 ease-in-out relative z-10" style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="p-5 pt-0 flex flex-col gap-4 mt-2" onClick={e => e.stopPropagation()}>
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">USB Name</span>
                      <input
                        type="text"
                        className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                        defaultValue={item.name}
                        onBlur={e => onUpdateUsb(item.id, { name: e.target.value.trim() })}
                      />
                    </label>
                  </div>

                  <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Diameter (Ds) in mm</span>
                      <input
                        type="number"
                        step="0.01"
                        className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                        defaultValue={item.Ds}
                        onBlur={e => onUpdateUsb(item.id, { Ds: Number(e.target.value) })}
                      />
                    </label>
                    
                    <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                      <label className="flex flex-col gap-1.5 flex-1">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Thread pitch (mm)</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 1.5"
                          className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white placeholder-white/20 focus:border-[var(--color-accent)] outline-none transition w-full"
                          defaultValue={item.threadPitch || ''}
                          onBlur={e => onUpdateUsb(item.id, { threadPitch: e.target.value ? Number(e.target.value) : undefined })}
                        />
                      </label>

                      <label className="flex flex-col gap-1.5 flex-1">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Micro-adjust marks</span>
                        <input
                          type="number"
                          step="1"
                          placeholder="e.g. 6"
                          className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white placeholder-white/20 focus:border-[var(--color-accent)] outline-none transition w-full"
                          defaultValue={item.microAdjustMarks || ''}
                          onBlur={e => onUpdateUsb(item.id, { microAdjustMarks: e.target.value ? Number(e.target.value) : undefined })}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-white">USB Name</span>
                <input
                  type="text"
                  className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                  value={draftUsb.name || ''}
                  onChange={e => setDraftUsb({ ...draftUsb, name: e.target.value })}
                  autoFocus
                />
              </label>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-white">Diameter (Ds) in mm</span>
                <input
                  type="number"
                  step="0.01"
                  className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                  value={draftUsb.Ds || ''}
                  onChange={e => setDraftUsb({ ...draftUsb, Ds: Number(e.target.value) })}
                />
              </label>
              
              <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                <label className="flex flex-col gap-1.5 flex-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Thread pitch (mm)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 1.5"
                    className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white placeholder-white/20 focus:border-[var(--color-accent)] outline-none transition w-full"
                    value={draftUsb.threadPitch || ''}
                    onChange={e => setDraftUsb({ ...draftUsb, threadPitch: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </label>

                <label className="flex flex-col gap-1.5 flex-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Micro-adjust marks</span>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 6"
                    className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white placeholder-white/20 focus:border-[var(--color-accent)] outline-none transition w-full"
                    value={draftUsb.microAdjustMarks || ''}
                    onChange={e => setDraftUsb({ ...draftUsb, microAdjustMarks: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </label>
              </div>
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
