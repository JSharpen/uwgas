import * as React from 'react';
import { useStore } from '../../state/store';
import { useUIStore } from '../../state/uiStore';
import { useShallow } from 'zustand/react/shallow';

export function EmptyProgressionState() {
  const sessionPresets = useStore(useShallow(s => s.sessionPresets));
  const loadPreset = useStore(s => s.loadPreset);
  const setSelectedPresetId = useUIStore(s => s.setSelectedPresetId);
  const machines = useStore(s => s.machines);
  const usbs = useStore(s => s.usbs);

  // Get up to 3 most recent presets
  const recentPresets = [...sessionPresets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const handleLoadPreset = (id: string) => {
    setSelectedPresetId(id);
    loadPreset(id);
  };

  return (
    <div className="flex flex-col gap-4">
      {recentPresets.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest pl-2">Quick Start</h3>
          <div className="flex flex-col gap-2">
            {recentPresets.map(p => {
              const hwStep = p.includeHardware ? p.steps.find(s => s.machineId || s.usbId) : null;
              const machine = hwStep?.machineId ? machines?.find(m => m.id === hwStep.machineId) : null;
              const usb = hwStep?.usbId ? usbs?.find(u => u.id === hwStep.usbId) : null;
              const hwStr = [machine?.name, usb?.name].filter(Boolean).join(' • ');

              return (
                <button
                  key={p.id}
                  type="button"
                  className="w-full neu-convex border border-black/40 hover:border-amber-500/30 active:bg-white/5 text-white h-[72px] px-5 rounded-3xl transition flex flex-col justify-center items-start shadow-lg cursor-pointer"
                  onClick={() => handleLoadPreset(p.id)}
                >
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <span className="font-bold text-amber-400 text-[15px] truncate">{p.name}</span>
                    {p.includeHardware && (
                      <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0">
                        HW Bound
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40 mt-1 truncate w-full text-left">
                    <span>{p.steps.length} step{p.steps.length === 1 ? '' : 's'}</span>
                    <span className="opacity-50">•</span>
                    <span>__° (TBD)</span>
                    {p.includeHardware && hwStr && (
                      <>
                        <span className="opacity-50">•</span>
                        <span className="truncate text-cyan-400/70">{hwStr}</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {recentPresets.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 border border-white/5 bg-white/[0.02] rounded-3xl text-center px-6">
          <span className="text-white/40 text-sm font-medium">No presets saved yet.</span>
          <span className="text-white/30 text-xs mt-1">Tap <strong className="text-white/50">+ Add Step</strong> in the top bar to begin.</span>
        </div>
      )}
    </div>
  );
}
