import * as React from 'react';
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
              <div className="flex items-center gap-2.5 min-w-0 flex-wrap w-full">
                <div className="w-6 h-6 shrink-0 flex items-center justify-center bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-lg">
                  <span className="text-xs font-bold font-mono">J</span>
                </div>
                <div className={`text-base font-medium tracking-wide truncate ${isExpanded ? 'text-amber-400/80' : 'text-white'}`}>
                  {item.name || 'Untitled Jig'}
                </div>
              </div>
            }
          >
            <div className="p-5 pt-0 flex flex-col gap-4 mt-2" onClick={e => e.stopPropagation()}>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Jig Name</span>
                <input
                  type="text"
                  className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-semibold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                  defaultValue={item.name}
                  onBlur={e => onUpdateJig(item.id, { name: e.target.value.trim() })}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Diameter (Dj) in mm</span>
                <input
                  type="number"
                  step="0.1"
                  className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                  defaultValue={item.Dj}
                  onBlur={e => onUpdateJig(item.id, { Dj: Number(e.target.value) })}
                />
              </label>
              
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Base Length (mm)</span>
                <input
                  type="number"
                  step="0.1"
                  className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                  defaultValue={item.length || ''}
                  onBlur={e => onUpdateJig(item.id, { length: e.target.value ? Number(e.target.value) : undefined })}
                />
              </label>

              <button
                type="button"
                role="switch"
                aria-checked={!!item.isAdjustableLength}
                className={`flex items-center justify-between w-full p-3.5 neu-button rounded-xl transition active:scale-[0.98] cursor-pointer ${item.isAdjustableLength ? 'border-[var(--color-accent)]/50' : ''}`}
                onClick={() => onUpdateJig(item.id, { isAdjustableLength: !item.isAdjustableLength })}
              >
                <div className="flex flex-col items-start min-w-0">
                  <span className={`text-sm font-bold ${item.isAdjustableLength ? 'text-amber-400' : 'text-white'}`}>Adjustable Collar</span>
                </div>
                {item.isAdjustableLength ? (
                  <span className="text-amber-400 font-bold text-xs uppercase tracking-wider px-2 shrink-0">Yes</span>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0 ml-4"></div>
                )}
              </button>

              <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: item.isAdjustableLength ? "1fr" : "0fr" }}>
                <div className="overflow-hidden min-h-0">
                  <label className="flex flex-col gap-1.5 pt-1 mt-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Thread Pitch (Optional, mm)</span>
                    <input
                      type="number"
                      step="0.1"
                      className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                      defaultValue={item.threadPitch || ''}
                      onBlur={e => onUpdateJig(item.id, { threadPitch: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </label>
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
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Jig Name</span>
              <input
                type="text"
                className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-semibold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                value={draftJig.name || ''}
                onChange={e => setDraftJig({ ...draftJig, name: e.target.value })}
                autoFocus
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Diameter (Dj) in mm</span>
              <input
                type="number"
                step="0.1"
                className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                value={draftJig.Dj || ''}
                onChange={e => setDraftJig({ ...draftJig, Dj: Number(e.target.value) })}
              />
            </label>
            
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Base Length (mm)</span>
              <input
                type="number"
                step="0.1"
                className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                value={draftJig.length || ''}
                onChange={e => setDraftJig({ ...draftJig, length: e.target.value ? Number(e.target.value) : undefined })}
              />
            </label>

            <button
              type="button"
              role="switch"
              aria-checked={!!draftJig.isAdjustableLength}
              className={`flex items-center justify-between w-full p-3.5 neu-button rounded-xl transition active:scale-[0.98] cursor-pointer ${draftJig.isAdjustableLength ? 'border-[var(--color-accent)]/50' : ''}`}
              onClick={() => setDraftJig({ ...draftJig, isAdjustableLength: !draftJig.isAdjustableLength })}
            >
              <div className="flex flex-col items-start min-w-0">
                <span className={`text-sm font-bold ${draftJig.isAdjustableLength ? 'text-amber-400' : 'text-white'}`}>Adjustable Collar</span>
              </div>
              {draftJig.isAdjustableLength ? (
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wider px-2 shrink-0">Yes</span>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0 ml-4"></div>
              )}
            </button>

            {draftJig.isAdjustableLength && (
              <label className="flex flex-col gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Thread Pitch (Optional, mm)</span>
                <input
                  type="number"
                  step="0.1"
                  className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                  value={draftJig.threadPitch || ''}
                  onChange={e => setDraftJig({ ...draftJig, threadPitch: e.target.value ? Number(e.target.value) : undefined })}
                />
              </label>
            )}

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
