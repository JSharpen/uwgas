import * as React from 'react';
import { useStore } from '../../state/store';
import { useUIStore } from '../../state/uiStore';
import type { JigConfig } from '../../types/core';
import { generateId } from '../../utils/id';
import ModalShell from '../ModalShell';
import useModalLayout from '../../hooks/useModalLayout';

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
                  <span className="text-xs font-bold font-mono">J</span>
                </div>
                <div className={`text-base font-medium tracking-wide truncate ${isExpanded ? 'text-amber-400/80' : 'text-white'}`}>
                  {item.name || 'Untitled Jig'}
                </div>
              </div>
            </div>

            {/* Expanded Details Pane */}
            <div 
              className="grid transition-all duration-300 ease-in-out relative z-10" style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden min-h-0">
                <div className="p-5 pt-0 flex flex-col gap-4 mt-2" onClick={e => e.stopPropagation()}>
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Jig Name</span>
                      <input
                        type="text"
                        className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                        defaultValue={item.name}
                        onBlur={e => onUpdateJig(item.id, { name: e.target.value.trim() })}
                      />
                    </label>
                  </div>

                  <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Diameter (Dj) in mm</span>
                      <input
                        type="number"
                        step="0.1"
                        className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                        defaultValue={item.Dj}
                        onBlur={e => onUpdateJig(item.id, { Dj: Number(e.target.value) })}
                      />
                    </label>
                    
                    <label className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Base Length (mm)</span>
                      <input
                        type="number"
                        step="0.1"
                        className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                        defaultValue={item.length || ''}
                        onBlur={e => onUpdateJig(item.id, { length: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 cursor-pointer">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Adjustable Collar?</span>
                      <input
                        type="checkbox"
                        className="rounded border-white/5 bg-black/40 text-[var(--color-accent)] focus:ring-[var(--color-accent)] w-5 h-5 cursor-pointer accent-[var(--color-accent)]"
                        checked={!!item.isAdjustableLength}
                        onChange={e => onUpdateJig(item.id, { isAdjustableLength: e.target.checked })}
                      />
                    </label>

                    <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: item.isAdjustableLength ? "1fr" : "0fr" }}>
                      <div className="overflow-hidden min-h-0">
                        <label className="flex flex-col gap-1.5 pt-2 border-t border-white/5 mt-2">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Thread Pitch (Optional, mm)</span>
                          <input
                            type="number"
                            step="0.1"
                            className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                            defaultValue={item.threadPitch || ''}
                            onBlur={e => onUpdateJig(item.id, { threadPitch: e.target.value ? Number(e.target.value) : undefined })}
                          />
                        </label>
                      </div>
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
          title="Add Jig"
          onClose={closeModals}
          overlayStyle={overlayStyle}
          dialogStyle={getDialogStyle({ liftByKeyboard: true })}
        >
          <div className="flex flex-col gap-4">
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-white">Jig Name</span>
                <input
                  type="text"
                  className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                  value={draftJig.name || ''}
                  onChange={e => setDraftJig({ ...draftJig, name: e.target.value })}
                  autoFocus
                />
              </label>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-white">Diameter (Dj) in mm</span>
                <input
                  type="number"
                  step="0.1"
                  className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                  value={draftJig.Dj || ''}
                  onChange={e => setDraftJig({ ...draftJig, Dj: Number(e.target.value) })}
                />
              </label>
              
              <label className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                <span className="text-sm font-semibold text-white">Base Length (mm)</span>
                <input
                  type="number"
                  step="0.1"
                  className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                  value={draftJig.length || ''}
                  onChange={e => setDraftJig({ ...draftJig, length: e.target.value ? Number(e.target.value) : undefined })}
                />
              </label>

              <label className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 cursor-pointer">
                <span className="text-sm font-semibold text-white">Adjustable Collar?</span>
                <input
                  type="checkbox"
                  className="rounded border-white/5 bg-black/40 text-[var(--color-accent)] focus:ring-[var(--color-accent)] w-5 h-5 cursor-pointer accent-[var(--color-accent)]"
                  checked={!!draftJig.isAdjustableLength}
                  onChange={e => setDraftJig({ ...draftJig, isAdjustableLength: e.target.checked })}
                />
              </label>

              {draftJig.isAdjustableLength && (
                <label className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                  <span className="text-sm font-semibold text-white">Thread Pitch (Optional, mm)</span>
                  <input
                    type="number"
                    step="0.1"
                    className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                    value={draftJig.threadPitch || ''}
                    onChange={e => setDraftJig({ ...draftJig, threadPitch: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </label>
              )}
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
