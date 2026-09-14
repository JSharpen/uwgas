import * as React from 'react';
import { useStore, usePresetState } from '../state/store';
import { useUIStore } from '../state/uiStore';
import { IconFolder } from '../icons';

export default function PresetsView() {
  const presetState = usePresetState();
  const sessionPresets = presetState.sessionPresets;
  const machines = useStore((s) => s.machines);
  const usbs = useStore((s) => s.usbs);
  const renamePreset = useStore((s) => s.renamePreset);
  
  const selectedPresetId = useUIStore(s => s.selectedPresetId);
  const expandedPresetId = useUIStore(s => s.expandedPresetId);
  const setExpandedPresetId = useUIStore(s => s.setExpandedPresetId);

  const [presetRenameId, setPresetRenameId] = React.useState<string | null>(null);
  const [presetRenameValue, setPresetRenameValue] = React.useState('');

  // Listen for ContextBar rename button clicks
  React.useEffect(() => {
    const handleRenameEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const p = sessionPresets.find(preset => preset.id === customEvent.detail);
      if (p) {
        setPresetRenameId(p.id);
        setPresetRenameValue(p.name);
      }
    };
    window.addEventListener('beginRenamePreset', handleRenameEvent);
    return () => window.removeEventListener('beginRenamePreset', handleRenameEvent);
  }, [sessionPresets]);

  // Clear expanded preset on unmount
  React.useEffect(() => {
    return () => setExpandedPresetId(null);
  }, [setExpandedPresetId]);

  const handleCommitRename = () => {
    const trimmed = presetRenameValue.trim();
    if (presetRenameId && trimmed.length > 0) {
      const conflicts = sessionPresets.some(
        p => p.id !== presetRenameId && p.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (!conflicts) {
        renamePreset(presetRenameId, trimmed);
      }
    }
    setPresetRenameId(null);
  };

  const handleCancelRename = () => {
    setPresetRenameId(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Presets</h1>
          <p className="text-sm text-white/50 font-medium mt-1">
            Manage your saved setups and progressions.
          </p>
        </div>
      </div>

      {sessionPresets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-3xl border border-white/5 text-center mt-8">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
            <IconFolder className="w-8 h-8" />
          </div>
          <p className="text-white/60 font-medium">No presets saved yet.</p>
          <p className="text-sm text-white/40 mt-1">
            Save a progression from the calculator to see it here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessionPresets.map(p => {
            const isActive = p.id === selectedPresetId;
            const isExpanded = p.id === expandedPresetId;
            const isEditing = p.id === presetRenameId;
            
            const renameTrimmed = presetRenameValue.trim();
            const renameConflicts =
              isEditing &&
              sessionPresets.some(
                existing => existing.id !== p.id && existing.name.toLowerCase() === renameTrimmed.toLowerCase()
              );
            
            const hwStep = p.includeHardware ? p.steps.find(s => s.machineId || s.usbId) : null;
            const machineId = p.context?.machineId || hwStep?.machineId;
            const usbId = p.context?.usbId || hwStep?.usbId;
            const machine = machineId ? machines?.find(m => m.id === machineId) : null;
            const usb = usbId ? usbs?.find(u => u.id === usbId) : null;
            const hwStr = [machine?.name, usb?.name].filter(Boolean).join(' • ');

            return (
              <div 
                key={p.id}
                className={`w-full neu-convex border ${isActive ? 'border-amber-500/50' : isExpanded ? 'border-amber-400/30' : 'border-black/40'} rounded-3xl transition-all duration-300 flex flex-col shadow-lg overflow-hidden`}
              >
                {/* Header (Always Visible) */}
                <div
                  className={`w-full px-5 py-4 flex flex-col justify-center items-start cursor-pointer transition-colors ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5 active:bg-white/10'}`}
                  onClick={(e) => {
                    // Prevent expansion toggle if clicking input
                    if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') return;
                    if (!isEditing) {
                      setExpandedPresetId(isExpanded ? null : p.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 w-full min-w-0 h-[22px]">
                    {isEditing ? (
                      <input
                        type="text"
                        className="flex-1 h-full bg-black/40 border border-amber-400/60 rounded px-2 text-[15px] text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                        value={presetRenameValue}
                        onChange={e => setPresetRenameValue(e.target.value)}
                        onBlur={handleCommitRename}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleCommitRename();
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className={`font-bold text-[15px] truncate ${isActive ? 'text-amber-400' : isExpanded ? 'text-amber-400/80' : 'text-white'}`}>
                          {p.name}
                        </span>
                        {(p.context?.machineId || p.includeHardware) && (
                          <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0">
                            HW Bound
                          </span>
                        )}
                        {p.context?.targetAngle !== undefined && (
                          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0">
                            {p.context.targetAngle}°
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {isEditing && renameConflicts && (
                    <div className="text-[10px] text-amber-400 font-medium mt-1">
                      Name already exists.
                    </div>
                  )}
                  <div className={`flex items-center gap-2 text-xs mt-1 truncate w-full text-left ${isActive ? 'text-amber-400/60' : 'text-white/40'}`}>
                    <span>{p.steps.length} step{p.steps.length === 1 ? '' : 's'}</span>
                    <span className="opacity-50">•</span>
                    <span>{p.context?.targetAngle !== undefined ? `${p.context.targetAngle}°` : '__° (TBD)'}</span>
                    {(p.context?.machineId || p.includeHardware) && hwStr && (
                      <>
                        <span className="opacity-50">•</span>
                        <span className="truncate text-cyan-400/70">{hwStr}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Details Pane */}
                <div 
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-5 pt-0 flex flex-col gap-4 border-t border-white/5 mt-2">
                      
                      {/* Properties Section */}
                      <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Properties</h4>
                        <div className="bg-black/30 rounded-2xl p-3 flex flex-col gap-2 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>Target Angle</span>
                            <span className="text-white font-medium">{p.context?.targetAngle !== undefined ? `${p.context.targetAngle}°` : 'Not saved (Uses Global)'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hardware</span>
                            <span className="text-white font-medium">{hwStr || 'Not saved (Uses Global)'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Steps</span>
                            <span className="text-white font-medium">{p.steps.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sequence Section */}
                      {p.steps.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Sequence</h4>
                          <div className="flex flex-col gap-1.5">
                            {p.steps.map((s, i) => (
                              <div key={i} className="bg-black/20 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                                <span className="text-white/80 font-medium">
                                  {i + 1}. {s.wheelName}
                                </span>
                                {s.angleOffset !== 0 && (
                                  <span className="text-amber-400/80 font-mono">
                                    {s.angleOffset > 0 ? '+' : ''}{s.angleOffset}°
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
