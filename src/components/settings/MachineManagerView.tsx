import * as React from 'react';
import { generateId } from "../../utils/id";
import type { MachineConfig, CalibrationProfile } from '../../types/core';
import ModalShell from '../ModalShell';
import { IconGrinder } from '../../icons';
import useModalLayout from '../../hooks/useModalLayout';
import CalibrationWizard from '../CalibrationWizard';
import ExpandableCard from '../ui/ExpandableCard';

import { useMachineState } from '../../state/store';

import { useUIStore } from '../../state/uiStore';

export default function MachineManagerView() {
  const {
    machines,
    defaultMachineId,
    addMachine: onAddMachine,
    updateMachine: onUpdateMachine,
    
    setDefaultMachineId: onSetDefaultMachine,
  } = useMachineState();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    
  const expandedEquipmentId = useUIStore(s => s.expandedEquipmentId);
  const setExpandedEquipmentId = useUIStore(s => s.setExpandedEquipmentId);
  
  // Clean up expanded state on unmount
  React.useEffect(() => {
    return () => setExpandedEquipmentId(null);
  }, [setExpandedEquipmentId]);

    
  const [draftName, setDraftName] = React.useState('');
  const [draftAxleDiameter, setDraftAxleDiameter] = React.useState<number>(12);
  const [draftConstants, setDraftConstants] = React.useState<MachineConfig['constants']>({
    rear: { hc: 0, o: 0 },
    front: { hc: 0, o: 0 }
  });
  
  const calibratingMachineId = useUIStore(s => s.calibratingMachineId);
  const setCalibratingMachineId = useUIStore(s => s.setCalibratingMachineId);
  const [mappingSelectionMachineId, setMappingSelectionMachineId] = React.useState<string | null>(null);

  const { overlayStyle, getDialogStyle } = useModalLayout();

  
  const openAdd = React.useCallback(() => {
    setDraftName('');
    setDraftAxleDiameter(12);
    setDraftConstants({
      rear: { hc: 0, o: 0 },
      front: { hc: 0, o: 0 }
    });
    setIsAddModalOpen(true);
  }, []);

  React.useEffect(() => {
    window.addEventListener('openAddMachineModal', openAdd);
    return () => window.removeEventListener('openAddMachineModal', openAdd);
  }, [openAdd]);

  
  const closeAdd = () => {
    setIsAddModalOpen(false);
  };
  
  if (calibratingMachineId) {
    const activeMachine = machines.find(m => m.id === calibratingMachineId) || machines[0];
    return (
      <CalibrationWizard
        activeMachine={activeMachine}
        onSaveProfile={(profile) => {
          const newProfiles = [...(activeMachine.calibrationProfiles || []), profile];
          const newConstants = { ...activeMachine.constants };
          if (profile.rear) {
            newConstants.rear = { hc: profile.rear.hc, o: profile.rear.o };
          }
          if (profile.front) {
            newConstants.front = { hc: profile.front.hc, o: profile.front.o };
          }
          onUpdateMachine(activeMachine.id, {
            calibrationProfiles: newProfiles,
            activeCalibrationId: profile.id,
            constants: newConstants
          });
          setCalibratingMachineId(null);
        }}
      />
    );
  }


  const getBestProfile = (profiles?: CalibrationProfile[]): string | null => {
    if (!profiles || profiles.length === 0) return null;
    let best = profiles[0];
    for (const p of profiles) {
      const bestRes = Math.max(best.rear?.diagnostics.maxAbsResidualMm || 0, best.front?.diagnostics.maxAbsResidualMm || 0);
      const currRes = Math.max(p.rear?.diagnostics.maxAbsResidualMm || 0, p.front?.diagnostics.maxAbsResidualMm || 0);
      if (currRes < bestRes) best = p;
    }
    return best.id;
  };

  
  return (
    <section className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 max-w-3xl mx-auto pb-20 w-full">

      <div className="flex flex-col gap-4">
        {machines.map((m, idx) => {
          const isExpanded = expandedEquipmentId === m.id;
          
          return (
            <ExpandableCard
              key={m.id}
              isExpanded={isExpanded}
              onToggle={() => setExpandedEquipmentId(isExpanded ? null : m.id)}
              index={idx}
              header={
                <div className="flex items-center gap-2.5 min-w-0 flex-wrap w-full">
                  <IconGrinder className="w-6 h-6 text-[var(--color-accent)] shrink-0" />
                  <span className={`text-base font-medium tracking-wide truncate ${isExpanded ? 'text-amber-400/80' : 'text-white'}`}>{m.name}</span>
                  {m.id === defaultMachineId && (
                    <span className="rounded px-2 py-0.5 text-[9px] font-mono truncate text-center bg-[color-mix(in_srgb,var(--color-accent)_5%,transparent)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 ml-auto sm:ml-0 shrink-0">
                      Default
                    </span>
                  )}
                  {(!m.calibrationProfiles || m.calibrationProfiles.length === 0) && (
                    <span className="rounded px-2 py-0.5 text-[9px] font-mono truncate text-center bg-amber-500/5 text-amber-400 border border-amber-500/30 shrink-0">
                      Unmapped
                    </span>
                  )}
                </div>
              }
            >
              <div className="p-5 pt-0 flex flex-col gap-4 mt-2" onClick={e => e.stopPropagation()}>
                    
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Machine Name</span>
                  <input
                    type="text"
                    className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-semibold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                    defaultValue={m.name}
                    onBlur={e => onUpdateMachine(m.id, { name: e.target.value.trim() })}
                  />
                </label>
                
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Axle Diameter (mm)</span>
                  <input
                    type="number"
                    step="0.1"
                    className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                    defaultValue={m.axleDiameter ?? 12}
                    onBlur={e => onUpdateMachine(m.id, { axleDiameter: Number(e.target.value) })}
                  />
                </label>

                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Geometry Mapping</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="neu-concave border border-black/40 shadow-inner rounded-xl p-3 flex flex-col gap-1">
                      <span className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest font-bold">Rear Base</span>
                      <span className="font-mono text-xs text-white/80">
                        hc: <b className="text-white font-bold">{m.constants.rear.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.rear.o.toFixed(1)}</b>
                      </span>
                    </div>
                    <div className="neu-concave border border-black/40 shadow-inner rounded-xl p-3 flex flex-col gap-1">
                      <span className="text-[10px] text-[var(--color-focus)] uppercase tracking-widest font-bold">Front Base</span>
                      <span className="font-mono text-xs text-white/80">
                        hc: <b className="text-white font-bold">{m.constants.front.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.front.o.toFixed(1)}</b>
                      </span>
                    </div>
                  </div>
                      
                      {m.calibrationProfiles && m.calibrationProfiles.length > 0 ? (() => {
                        const activeProfile = m.calibrationProfiles.find(p => p.id === m.activeCalibrationId);
                        const isBest = activeProfile && getBestProfile(m.calibrationProfiles) === activeProfile.id;
                        return (
                          <div className="mt-2 flex flex-col gap-1">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Active Mapping</span>
                            <button
                              type="button"
                              className="w-full flex items-center justify-between p-3.5 neu-button rounded-2xl transition active:scale-[0.98] cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setMappingSelectionMachineId(m.id); }}
                            >
                              <div className="flex flex-col items-start gap-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm truncate">
                                    {activeProfile ? activeProfile.name : "None selected"}
                                  </span>
                                  {isBest && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-bold shrink-0">
                                      Best
                                    </span>
                                  )}
                                </div>
                                {activeProfile && (
                                  <span className="text-[10px] text-white/40 font-mono">
                                    {activeProfile.scope === 'both' ? 'Dual Base' : activeProfile.scope === 'rear' ? 'Rear Only' : 'Front Only'}
                                  </span>
                                )}
                              </div>
                              
                            </button>
                          </div>
                        );
                      })() : (
                        <button
                          type="button"
                          className="mt-2 w-full flex flex-col items-center justify-center p-4 neu-button border border-[var(--color-accent)]/30 border-dashed rounded-2xl transition active:scale-[0.98] cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); setCalibratingMachineId(m.id); }}
                        >
                          <span className="font-bold text-[var(--color-accent)] text-sm mb-1">No mappings found</span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-accent)]/70">+ Tap to measure machine</span>
                        </button>
                      )}
                    </div>

                    {m.id !== defaultMachineId && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-white/80 uppercase tracking-wider transition active:scale-95 cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); onSetDefaultMachine(m.id); }}
                        >
                          Set as Default
                        </button>
                      </div>
                    )}
                  </div>
            </ExpandableCard>
          );
        })}
      </div>

      {/* Add Modal */}
      {mappingSelectionMachineId && (() => {
        const selectedMachine = machines.find(x => x.id === mappingSelectionMachineId);
        if (!selectedMachine) return null;
        
        return (
          <ModalShell
            title="Select Geometry Mapping"
            subtitle="Choose a saved geometry mapping to use for calculations."
            onClose={() => setMappingSelectionMachineId(null)}
            overlayStyle={overlayStyle}
            dialogStyle={getDialogStyle({ liftByKeyboard: false })}
          >
            {selectedMachine.calibrationProfiles && selectedMachine.calibrationProfiles.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
                {selectedMachine.calibrationProfiles.map(p => {
                  const isActive = selectedMachine.activeCalibrationId === p.id;
                  const isBest = getBestProfile(selectedMachine.calibrationProfiles) === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`flex items-center justify-between p-4 text-left rounded-2xl transition-all cursor-pointer neu-button active:scale-[0.98] ${isActive ? 'border border-[var(--color-accent)]/50 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]' : 'border border-transparent'}`}
                      onClick={() => {
                        const newConstants = { ...selectedMachine.constants };
                        if (p.rear) newConstants.rear = { hc: p.rear.hc, o: p.rear.o };
                        if (p.front) newConstants.front = { hc: p.front.hc, o: p.front.o };
                        onUpdateMachine(selectedMachine.id, {
                          activeCalibrationId: p.id,
                          constants: newConstants
                        });
                        setMappingSelectionMachineId(null);
                      }}
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate">{p.name}</span>
                          {isBest && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-bold shrink-0">
                              Best
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-white/40 font-mono">
                          {new Date(p.createdAt).toLocaleDateString()} &middot; {p.scope === 'both' ? 'Dual Base' : p.scope === 'rear' ? 'Rear Only' : 'Front Only'}
                        </span>
                      </div>
                      
                      {isActive ? (
                        <span className="text-[var(--color-accent)] font-bold text-xs uppercase tracking-wider px-2 shrink-0">Active</span>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0 ml-4"></div>
                      )}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="mt-2 w-full p-4 rounded-2xl neu-button border border-[var(--color-accent)]/30 text-[var(--color-accent)] transition active:scale-[0.98] flex items-center justify-center gap-2 font-bold text-sm cursor-pointer"
                  onClick={() => {
                     setMappingSelectionMachineId(null);
                     setCalibratingMachineId(selectedMachine.id);
                  }}
                >
                  + Create New Mapping
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-white/50">
                No profiles available.
              </div>
            )}
          </ModalShell>
        );
      })()}

      {isAddModalOpen && (
        <ModalShell
          title="Add Machine"
          onClose={closeAdd}
          overlayStyle={overlayStyle}
          dialogStyle={getDialogStyle({ liftByKeyboard: true })}
        >
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Machine Name</span>
              <input
                type="text"
                className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-semibold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                placeholder="e.g. Tormek T-8"
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                autoFocus
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Axle Diameter (mm)</span>
              <input
                type="number"
                step="0.1"
                className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-bold font-mono text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
                value={draftAxleDiameter}
                onChange={e => setDraftAxleDiameter(Number(e.target.value))}
              />
            </label>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                className="px-4 h-11 rounded-xl neu-button text-white/70 font-semibold text-xs uppercase tracking-wide transition active:scale-95 cursor-pointer flex items-center justify-center"
                onClick={closeAdd}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-6 h-11 rounded-xl bg-[var(--color-accent)] text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-[var(--color-accent)]" 
                disabled={!draftName.trim()}
                onClick={() => {
                  onAddMachine({
                    id: generateId(),
                    name: draftName.trim(),
                    axleDiameter: draftAxleDiameter,
                    constants: draftConstants,
                  });
                  closeAdd();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </ModalShell>
      )}

          </section>
  );
}

