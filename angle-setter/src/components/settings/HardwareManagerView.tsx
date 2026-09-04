import React, { useState } from 'react';
import type { JigConfig, UsbConfig } from '../../types/core';

type HardwareManagerViewProps = {
  jigs: JigConfig[];
  usbs: UsbConfig[];
  onUpdateJig: (id: string, patch: Partial<JigConfig>) => void;
  onAddJig: (jig: JigConfig) => void;
  onDeleteJig: (id: string) => void;
  onUpdateUsb: (id: string, patch: Partial<UsbConfig>) => void;
  onAddUsb: (usb: UsbConfig) => void;
  onDeleteUsb: (id: string) => void;
  onClose: () => void;
};

export default function HardwareManagerView({
  jigs,
  usbs,
  onUpdateJig,
  onAddJig,
  onDeleteJig,
  onUpdateUsb,
  onAddUsb,
  onDeleteUsb,
  onClose,
}: HardwareManagerViewProps) {
  const [activeTab, setActiveTab] = useState<'jigs' | 'usbs'>('jigs');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const blurOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
  };

  const handleAdd = () => {
    if (activeTab === 'jigs') {
      onAddJig({
        id: `jig-custom-${Date.now()}`,
        name: 'New Jig',
        Dj: 12,
      });
    } else {
      onAddUsb({
        id: `usb-custom-${Date.now()}`,
        name: 'New Support Bar',
        Ds: 11.98,
      });
    }
  };

  const activeItems = activeTab === 'jigs' ? jigs : usbs;

  return (
    <div className="flex flex-col h-full bg-[#262626] rounded-3xl border border-white/10 shadow-2xl max-w-3xl mx-auto overflow-hidden relative">
      {/* Subtle Top Edge Highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

      {/* Segmented Control Header */}
      <div className="relative z-10 p-5 sm:p-6 border-b border-white/5">
        <div className="flex bg-neutral-950 p-1 rounded-full border border-neutral-800">
          <button
            onClick={() => setActiveTab('jigs')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
              activeTab === 'jigs'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/40 hover:text-white'
            }`}
          >
            Jigs (Dj)
          </button>
          <button
            onClick={() => setActiveTab('usbs')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
              activeTab === 'usbs'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/40 hover:text-white'
            }`}
          >
            Support Bars (Ds)
          </button>
        </div>
      </div>

      {/* List */}
      <div className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
        {activeItems.map(item => {
          const isJig = activeTab === 'jigs';
          const isConfirming = deleteConfirmId === item.id;

          return (
            <div
              key={item.id}
              className="bg-black/20 hover:bg-black/30 border border-white/5 hover:border-white/10 rounded-2xl p-4 sm:p-5 transition-all flex flex-col gap-3"
            >
              {isConfirming ? (
                <div className="flex flex-col h-full items-center justify-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                  <span className="text-sm font-bold text-red-400">
                    Delete {item.name}?
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-4 h-10 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/70 transition flex items-center justify-center cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (isJig) { onDeleteJig(item.id); } else { onDeleteUsb(item.id); }
                        setDeleteConfirmId(null);
                      }}
                      className="px-4 h-10 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg transition flex items-center justify-center cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <input
                      className="bg-black/30 border border-white/5 focus:border-white/20 rounded-xl px-3.5 py-2 text-sm font-semibold text-white min-w-0 flex-1 transition outline-none"
                      value={item.name}
                      onChange={e =>
                        isJig
                          ? onUpdateJig(item.id, { name: e.target.value })
                          : onUpdateUsb(item.id, { name: e.target.value })
                      }
                      onKeyDown={blurOnEnter}
                    />
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition shrink-0 cursor-pointer"
                      title={`Delete ${isJig ? 'jig' : 'USB'}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-3 flex-wrap">
                    <label className="flex items-center gap-2">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        {isJig ? 'Jig Diameter (Dj)' : 'USB Diameter (Ds)'}:
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="w-20 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-right text-sm font-mono font-bold text-white focus:border-[var(--color-accent)] outline-none"
                        value={isJig ? (item as JigConfig).Dj : (item as UsbConfig).Ds}
                        onKeyDown={blurOnEnter}
                        onFocus={e => e.target.select()}
                        onChange={e => {
                          const val = Number(e.target.value.replace(',', '.'));
                          if (!Number.isNaN(val)) {
                            if (isJig) {
                              onUpdateJig(item.id, { Dj: val });
                            } else {
                              onUpdateUsb(item.id, { Ds: val });
                            }
                          }
                        }}
                      />
                      <span className="text-xs text-white/50 font-mono">mm</span>
                    </label>

                    {isJig && (
                      <div className="flex flex-col gap-3 w-full pt-2.5 mt-1 border-t border-white/5">
                        <label className="flex items-center justify-between gap-2">
                           <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Base Length (mm)</span>
                           <input
                             type="text"
                             inputMode="decimal"
                             placeholder="e.g. 100"
                             className="w-20 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-right text-sm font-mono font-bold text-white placeholder-white/20 focus:border-[var(--color-accent)] outline-none"
                             value={(item as import('../../types/core').JigConfig).length || ''}
                             onKeyDown={blurOnEnter}
                             onChange={e => {
                               const val = e.target.value === '' ? undefined : Number(e.target.value.replace(',', '.'));
                               if (val === undefined || !Number.isNaN(val)) {
                                 onUpdateJig(item.id, { length: val });
                               }
                             }}
                           />
                        </label>
                        <label className="flex items-center justify-between gap-2 cursor-pointer select-none">
                           <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Adjustable Collar?</span>
                           <input
                             type="checkbox"
                             className="rounded border-white/10 bg-black/40 text-[var(--color-accent)] focus:ring-[var(--color-accent)] w-4 h-4 cursor-pointer accent-[var(--color-accent)]"
                             checked={!!(item as import('../../types/core').JigConfig).isAdjustableLength}
                             onChange={e => {
                               onUpdateJig(item.id, { isAdjustableLength: e.target.checked });
                             }}
                           />
                        </label>
                        {(item as import('../../types/core').JigConfig).isAdjustableLength && (
                          <label className="flex items-center justify-between gap-2">
                             <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Thread Pitch (Optional, mm)</span>
                             <input
                               type="text"
                               inputMode="decimal"
                               placeholder="e.g. 1.5"
                               className="w-20 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-right text-sm font-mono font-bold text-white placeholder-white/20 focus:border-[var(--color-accent)] outline-none"
                               value={(item as import('../../types/core').JigConfig).threadPitch || ''}
                               onKeyDown={blurOnEnter}
                               onChange={e => {
                                 const val = e.target.value === '' ? undefined : Number(e.target.value.replace(',', '.'));
                                 if (val === undefined || !Number.isNaN(val)) {
                                   onUpdateJig(item.id, { threadPitch: val });
                                 }
                               }}
                             />
                          </label>
                        )}
                      </div>
                    )}

                    {!isJig && (
                      <div className="flex items-center gap-4 w-full pt-2.5 mt-1 border-t border-white/5">
                        <label className="flex items-center gap-2">
                           <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Thread pitch</span>
                           <input
                             type="text"
                             inputMode="decimal"
                             placeholder="e.g. 1.5"
                             className="w-16 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-right text-sm font-mono font-bold text-white placeholder-white/20 focus:border-[var(--color-accent)] outline-none"
                             value={(item as import('../../types/core').UsbConfig).threadPitch || ''}
                             onKeyDown={blurOnEnter}
                             onChange={e => {
                               const val = e.target.value === '' ? undefined : Number(e.target.value.replace(',', '.'));
                               if (val === undefined || !Number.isNaN(val)) {
                                 onUpdateUsb(item.id, { threadPitch: val });
                               }
                             }}
                           />
                           <span className="text-xs text-white/50 font-mono">mm</span>
                        </label>
                        <label className="flex items-center gap-2">
                           <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Marks</span>
                           <input
                             type="text"
                             inputMode="numeric"
                             placeholder="e.g. 6"
                             className="w-16 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-right text-sm font-mono font-bold text-white placeholder-white/20 focus:border-[var(--color-accent)] outline-none"
                             value={(item as import('../../types/core').UsbConfig).microAdjustMarks || ''}
                             onKeyDown={blurOnEnter}
                             onChange={e => {
                               const val = e.target.value === '' ? undefined : Number(e.target.value);
                               if (val === undefined || !Number.isNaN(val)) {
                                 onUpdateUsb(item.id, { microAdjustMarks: val });
                               }
                             }}
                           />
                        </label>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative z-10 p-5 sm:p-6 border-t border-white/5 bg-[#1f1f23]/90 backdrop-blur-md shrink-0 flex items-center justify-between gap-4">
        <button
          onClick={handleAdd}
          className="px-5 h-11 bg-white/10 hover:bg-white/20 text-white text-xs font-bold tracking-wide uppercase rounded-2xl shadow-sm transition flex items-center justify-center cursor-pointer"
        >
          + Add {activeTab === 'jigs' ? 'Jig' : 'USB'}
        </button>
        <button
          onClick={onClose}
          className="px-6 h-11 bg-[var(--color-accent)] hover:brightness-110 text-neutral-950 text-xs font-bold tracking-wide uppercase rounded-2xl shadow transition active:scale-95 flex items-center justify-center cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}

