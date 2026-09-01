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
    <div className="flex flex-col h-full bg-neutral-900 overflow-hidden">
      {/* Segmented Control Header */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveTab('jigs')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'jigs'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Jigs (Dj)
          </button>
          <button
            onClick={() => setActiveTab('usbs')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'usbs'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Support Bars (Ds)
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeItems.map(item => {
          const isJig = activeTab === 'jigs';
          const isConfirming = deleteConfirmId === item.id;

          return (
            <div
              key={item.id}
              className="card-elevated flex flex-col min-h-[5.5rem] overflow-hidden"
            >
              {isConfirming ? (
                <div className="flex flex-col h-full items-center justify-center gap-3 p-4 bg-danger/10">
                  <span className="text-sm font-semibold text-danger">
                    Delete {item.name}?
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-neutral-800 text-neutral-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (isJig) { onDeleteJig(item.id); } else { onDeleteUsb(item.id); }
                        setDeleteConfirmId(null);
                      }}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-danger text-white shadow"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="card-elevated__header flex items-center justify-between px-3 py-2 min-h-[40px]">
                    <input
                      className="bg-transparent border-none outline-none text-sm font-semibold text-neutral-100 min-w-0 flex-1 px-1 focus:bg-neutral-900 rounded"
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
                      className="p-1.5 text-neutral-500 hover:text-danger hover:bg-neutral-800 rounded-md transition-colors ml-2"
                      title={`Delete ${isJig ? 'jig' : 'USB'}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>

                  <div className="card-elevated__body flex items-center justify-between px-3 py-3 u-surface gap-3 flex-wrap">
                    <label className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-400">
                        {isJig ? 'Jig Diameter (Dj)' : 'USB Diameter (Ds)'}:
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="w-16 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-xs font-mono"
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
                      <span className="text-xs text-neutral-500">mm</span>
                    </label>
                    {isJig && (
                      <div className="flex flex-col gap-3 w-full pt-2 mt-2 border-t border-neutral-800/40">
                        <label className="flex items-center justify-between gap-2">
                           <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Base Length (mm)</span>
                           <input
                             type="text"
                             inputMode="decimal"
                             placeholder="e.g. 100"
                             className="w-16 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-xs font-mono placeholder-neutral-700"
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
                        <label className="flex items-center justify-between gap-2">
                           <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Adjustable Collar?</span>
                           <input
                             type="checkbox"
                             className="rounded border-neutral-700 bg-neutral-950 text-accent focus:ring-accent"
                             checked={!!(item as import('../../types/core').JigConfig).isAdjustableLength}
                             onChange={e => {
                               onUpdateJig(item.id, { isAdjustableLength: e.target.checked });
                             }}
                           />
                        </label>
                        {(item as import('../../types/core').JigConfig).isAdjustableLength && (
                          <label className="flex items-center justify-between gap-2">
                             <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Thread Pitch (Optional, mm)</span>
                             <input
                               type="text"
                               inputMode="decimal"
                               placeholder="e.g. 1.5"
                               className="w-16 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-xs font-mono placeholder-neutral-700"
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
                      <div className="flex items-center gap-4 w-full pt-1.5 mt-1 border-t border-neutral-800/40">
                        <label className="flex items-center gap-2">
                           <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Thread pitch</span>
                           <input
                             type="text"
                             inputMode="decimal"
                             placeholder="e.g. 1.5"
                             className="w-12 rounded border border-neutral-700 bg-neutral-950 px-1 py-1 text-right text-xs font-mono placeholder-neutral-700"
                             value={(item as import('../../types/core').UsbConfig).threadPitch || ''}
                             onKeyDown={blurOnEnter}
                             onChange={e => {
                               const val = e.target.value === '' ? undefined : Number(e.target.value.replace(',', '.'));
                               if (val === undefined || !Number.isNaN(val)) {
                                 onUpdateUsb(item.id, { threadPitch: val });
                               }
                             }}
                           />
                           <span className="text-[10px] text-neutral-600">mm</span>
                        </label>
                        <label className="flex items-center gap-2">
                           <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Marks</span>
                           <input
                             type="text"
                             inputMode="numeric"
                             placeholder="e.g. 6"
                             className="w-10 rounded border border-neutral-700 bg-neutral-950 px-1 py-1 text-right text-xs font-mono placeholder-neutral-700"
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

      <div className="p-4 border-t border-neutral-800 bg-neutral-900 shrink-0 flex items-center justify-between">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-semibold rounded-full shadow-sm transition-colors"
        >
          + Add {activeTab === 'jigs' ? 'Jig' : 'USB'}
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-full shadow transition-transform active:scale-95"
        >
          Done
        </button>
      </div>
    </div>
  );
}
