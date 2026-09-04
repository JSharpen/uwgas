import * as React from 'react';
import type { JigConfig, UsbConfig, MachineConfig, GlobalState, Wheel, CalibrationProfile } from '../../types/core';
import ModalShell from '../ModalShell';
import { IconGrinder, IconEdit, IconTrash } from '../../icons';
import useModalLayout from '../../hooks/useModalLayout';
import CalibrationWizard from '../CalibrationWizard';

type Props = {
  jigs: JigConfig[];
  usbs: UsbConfig[];
  global: GlobalState;
  wheels: Wheel[];
  machines: MachineConfig[];
  defaultMachineId?: string;
  onAddMachine: (m: MachineConfig) => void;
  onUpdateMachine: (id: string, m: Partial<MachineConfig>) => void;
  onDeleteMachine: (id: string) => void;
  onSetDefaultMachine: (id: string) => void;
};

export default function MachineManagerView({
  jigs,
  usbs,
  global,
  wheels,
  machines,
  defaultMachineId,
  onAddMachine,
  onUpdateMachine,
  onDeleteMachine,
  onSetDefaultMachine,
}: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  
  const [editingMachineId, setEditingMachineId] = React.useState<string | null>(null);
  const [deletingMachineId, setDeletingMachineId] = React.useState<string | null>(null);
  
  const [draftName, setDraftName] = React.useState('');
  const [draftAxleDiameter, setDraftAxleDiameter] = React.useState<number>(12);
  const [draftConstants, setDraftConstants] = React.useState<MachineConfig['constants']>({
    rear: { hc: 0, o: 0 },
    front: { hc: 0, o: 0 }
  });
  
  const [calibratingMachineId, setCalibratingMachineId] = React.useState<string | null>(null);

  const { overlayStyle, getDialogStyle } = useModalLayout();

  const openEdit = (m: MachineConfig) => {
    setEditingMachineId(m.id);
    setDraftName(m.name);
    setDraftAxleDiameter(m.axleDiameter ?? 12);
    setDraftConstants(m.constants);
    setIsEditModalOpen(true);
  };

  const closeEdit = () => {
    setIsEditModalOpen(false);
    setEditingMachineId(null);
  };

  const openAdd = () => {
    setDraftName('');
    setDraftAxleDiameter(12);
    setDraftConstants({
      rear: { hc: 0, o: 0 },
      front: { hc: 0, o: 0 }
    });
    setIsAddModalOpen(true);
  };

  const closeAdd = () => {
    setIsAddModalOpen(false);
  };
  
  if (calibratingMachineId) {
    const activeMachine = machines.find(m => m.id === calibratingMachineId) || machines[0];
    return (
      <CalibrationWizard jigs={jigs} usbs={usbs}
        global={global}
        activeMachine={activeMachine}
        wheels={wheels}
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
        onCancel={() => setCalibratingMachineId(null)}
      />
    );
  }

  const activeMachineToEdit = machines.find(m => m.id === editingMachineId);

  const getBestProfile = (profiles: CalibrationProfile[]): string | null => {
    if (!profiles || profiles.length === 0) return null;
    let best = profiles[0];
    for (const p of profiles) {
      const bestRes = Math.max(best.rear?.diagnostics.maxAbsResidualMm || 0, best.front?.diagnostics.maxAbsResidualMm || 0);
      const currRes = Math.max(p.rear?.diagnostics.maxAbsResidualMm || 0, p.front?.diagnostics.maxAbsResidualMm || 0);
      if (currRes < bestRes) best = p;
    }
    return best.id;
  };

  const activeMachineBestProfileId = activeMachineToEdit?.calibrationProfiles ? getBestProfile(activeMachineToEdit.calibrationProfiles) : null;

  return (
    <section className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 max-w-3xl mx-auto pb-20 w-full">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Machine Manager</h2>
        <button
          type="button"
          className="px-4 h-11 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition flex items-center justify-center cursor-pointer"
          onClick={openAdd}
        >
          + Add Machine
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {machines.map((m, idx) => (
          <div
            key={m.id}
            className="bg-[#262626] rounded-3xl border border-white/10 shadow-lg p-6 flex flex-col gap-4 relative overflow-hidden group transition-all"
            style={{ '--motion-order': idx } as React.CSSProperties}
          >
            {/* Subtle Top Edge Highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

            {deletingMachineId === m.id ? (
              <div className="flex flex-col gap-3 p-5 items-center justify-center bg-red-500/10 border border-red-500/20 rounded-2xl text-center relative z-10">
                <span className="text-sm font-bold text-red-400">Delete {m.name}?</span>
                <span className="text-xs text-white/50">This action cannot be undone.</span>
                <div className="flex gap-3 w-full max-w-xs mt-2">
                  <button
                    type="button"
                    className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs uppercase tracking-wide transition flex items-center justify-center cursor-pointer"
                    onClick={() => setDeletingMachineId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wide shadow-lg transition flex items-center justify-center cursor-pointer disabled:opacity-30"
                    disabled={machines.length <= 1}
                    onClick={() => { onDeleteMachine(m.id); setDeletingMachineId(null); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                    <IconGrinder className="w-6 h-6 text-[var(--color-accent)] shrink-0" />
                    <span className="font-bold text-base sm:text-lg text-white tracking-wide truncate">{m.name}</span>
                    {m.id === defaultMachineId && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 text-[10px] uppercase font-bold tracking-widest shrink-0">
                        Default
                      </span>
                    )}
                    {(!m.calibrationProfiles || m.calibrationProfiles.length === 0) && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase font-bold tracking-widest shrink-0">
                        Geometry Unmapped
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition cursor-pointer"
                      onClick={() => openEdit(m)}
                      title="Edit Machine"
                    >
                      <IconEdit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition cursor-pointer disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-white/40"
                      onClick={() => setDeletingMachineId(m.id)}
                      title="Delete Machine"
                      disabled={machines.length <= 1}
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative z-10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Axle Diameter</span>
                    <span className="font-mono text-sm font-bold text-white">{m.axleDiameter ?? 12} mm</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                      <span className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest font-bold">Rear Base</span>
                      <span className="font-mono text-xs text-white/80">
                        hc: <b className="text-white font-bold">{m.constants.rear.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.rear.o.toFixed(1)}</b>
                      </span>
                    </div>
                    <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                      <span className="text-[10px] text-[var(--color-focus)] uppercase tracking-widest font-bold">Front Base</span>
                      <span className="font-mono text-xs text-white/80">
                        hc: <b className="text-white font-bold">{m.constants.front.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.front.o.toFixed(1)}</b>
                      </span>
                    </div>
                  </div>
                </div>

                {m.id !== defaultMachineId && (
                  <div className="flex justify-end relative z-10">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-white/80 hover:text-white uppercase tracking-wider transition cursor-pointer"
                      onClick={() => onSetDefaultMachine(m.id)}
                    >
                      Set as Default
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <ModalShell
          title="Add Machine"
          onClose={closeAdd}
          overlayStyle={overlayStyle}
          dialogStyle={getDialogStyle({ liftByKeyboard: true })}
        >
          <div className="flex flex-col gap-4">
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Identity</h4>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-white">Machine Name</span>
                <input
                  type="text"
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                  placeholder="e.g. Tormek T-8"
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  autoFocus
                />
              </label>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Hardware</h4>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-white">Axle Diameter (mm)</span>
                <input
                  type="number"
                  step="0.1"
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                  value={draftAxleDiameter}
                  onChange={e => setDraftAxleDiameter(Number(e.target.value))}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                className="px-4 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs uppercase tracking-wide transition cursor-pointer flex items-center justify-center"
                onClick={closeAdd}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-6 h-11 rounded-xl bg-[var(--color-accent)] hover:brightness-110 text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" 
                disabled={!draftName.trim()}
                onClick={() => {
                  onAddMachine({
                    id: crypto.randomUUID(),
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

      {/* Edit Modal */}
      {isEditModalOpen && activeMachineToEdit && (
        <ModalShell
          title="Edit Machine"
          onClose={closeEdit}
          overlayStyle={overlayStyle}
          dialogStyle={getDialogStyle({ liftByKeyboard: true })}
        >
          <div className="flex flex-col gap-4">
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Identity</h4>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-white">Machine Name</span>
                <input
                  type="text"
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                />
              </label>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Hardware</h4>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-white">Axle Diameter (mm)</span>
                <input
                  type="number"
                  step="0.1"
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold font-mono text-white focus:border-[var(--color-accent)] outline-none transition w-full"
                  value={draftAxleDiameter}
                  onChange={e => setDraftAxleDiameter(Number(e.target.value))}
                />
              </label>
            </div>
            
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Geometry Mapping</h4>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-[var(--color-accent)] hover:brightness-110 text-neutral-950 font-bold text-xs uppercase tracking-wide transition cursor-pointer"
                  onClick={() => {
                    setCalibratingMachineId(activeMachineToEdit.id);
                    closeEdit();
                  }}
                >
                  New Mapping
                </button>
              </div>
              
              {activeMachineToEdit.calibrationProfiles && activeMachineToEdit.calibrationProfiles.length > 0 ? (
                <div className="mt-1 flex flex-col gap-2">
                  {activeMachineToEdit.calibrationProfiles.map(p => {
                    const isActive = activeMachineToEdit.activeCalibrationId === p.id;
                    const isBest = activeMachineBestProfileId === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3.5 text-xs rounded-2xl border transition-all ${
                          isActive
                            ? 'border-[var(--color-accent)]/50 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]'
                            : 'border-white/5 bg-black/40'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white truncate">{p.name}</span>
                            {isBest && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-bold shrink-0">
                                Best Residuals
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-white/40 font-mono">
                            {new Date(p.createdAt).toLocaleDateString()} &middot; {p.scope === 'both' ? 'Dual Base' : p.scope === 'rear' ? 'Rear Only' : 'Front Only'}
                          </span>
                        </div>
                        
                        {isActive ? (
                          <span className="text-[var(--color-accent)] font-bold text-xs uppercase tracking-wider px-2">Active</span>
                        ) : (
                          <button
                            type="button"
                            className="text-[var(--color-accent)] font-bold text-xs uppercase tracking-wider hover:underline px-2 cursor-pointer"
                            onClick={() => {
                              const newConstants = { ...activeMachineToEdit.constants };
                              if (p.rear) newConstants.rear = { hc: p.rear.hc, o: p.rear.o };
                              if (p.front) newConstants.front = { hc: p.front.hc, o: p.front.o };
                              onUpdateMachine(activeMachineToEdit.id, {
                                activeCalibrationId: p.id,
                                constants: newConstants
                              });
                            }}
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-white/40 mt-1">
                  No geometry mappings saved. Run the mapper to measure your machine.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                className="px-4 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs uppercase tracking-wide transition cursor-pointer flex items-center justify-center"
                onClick={closeEdit}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-6 h-11 rounded-xl bg-[var(--color-accent)] hover:brightness-110 text-neutral-950 font-bold text-xs uppercase tracking-wide shadow-lg transition flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" 
                disabled={!draftName.trim()}
                onClick={() => {
                  onUpdateMachine(activeMachineToEdit.id, { 
                    name: draftName.trim(),
                    axleDiameter: draftAxleDiameter
                  });
                  closeEdit();
                }}
              >
                Save changes
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </section>
  );
}

