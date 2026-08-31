import * as React from 'react';
import type { JigConfig, UsbConfig, MachineConfig, GlobalState, Wheel, CalibrationProfile } from '../../types/core';
import ModalShell from '../ModalShell';
import { BTN } from '../../ui/buttons';
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
    <section className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold u-text panel-header">Machine Manager</h2>
        <button type="button" className={BTN.primaryFlat} onClick={openAdd}>
          + Add Machine
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {machines.map((m, idx) => (
          <div key={m.id} className="card-elevated flex flex-col motion-card" style={{ '--motion-order': idx } as React.CSSProperties}>
            {deletingMachineId === m.id ? (
              <div className="flex flex-col gap-2 p-4 items-center justify-center min-h-[96px]">
                <span className="text-sm font-semibold u-text">Delete this machine?</span>
                <span className="text-xs u-text-muted">This cannot be undone.</span>
                <div className="flex gap-2 w-full mt-2">
                  <button type="button" className={`${BTN.ghost} flex-1`} onClick={() => setDeletingMachineId(null)}>Cancel</button>
                  <button type="button" className={`${BTN.danger} flex-1`} disabled={machines.length <= 1} onClick={() => { onDeleteMachine(m.id); setDeletingMachineId(null); }}>Delete</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 p-3 pb-0">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <IconGrinder className="w-6 h-6 text-primary shrink-0" />
                    <span className="font-semibold text-sm u-text truncate">{m.name}</span>
                    {m.id === defaultMachineId && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[0.65rem] uppercase font-bold shrink-0">
                        Default
                      </span>
                    )}
                    {(!m.calibrationProfiles || m.calibrationProfiles.length === 0) && (
                      <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30 text-[0.65rem] uppercase font-bold shrink-0 border">
                        Geometry Unmapped
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 u-text-muted hover:u-text transition-colors"
                      onClick={() => openEdit(m)}
                      title="Edit"
                    >
                      <IconEdit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded hover:bg-red-500/10 text-red-500/70 hover:text-red-500 transition-colors"
                      onClick={() => setDeletingMachineId(m.id)}
                      title="Delete"
                      disabled={machines.length <= 1}
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs u-text-muted font-medium">Hardware</span>
                    <span className="font-mono text-xs u-text">Axle: {m.axleDiameter ?? 12} mm</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-xs u-text-muted font-medium">Constants (hc, o)</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase u-text-muted">Rear</span>
                        <span className="font-mono">{m.constants.rear.hc.toFixed(1)}, {m.constants.rear.o.toFixed(1)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase u-text-muted">Front</span>
                        <span className="font-mono">{m.constants.front.hc.toFixed(1)}, {m.constants.front.o.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {m.id !== defaultMachineId && (
                  <div className="px-3 pb-3 flex justify-end">
                    <button type="button" className={`${BTN.ghost} text-[11px] py-1 px-2 h-auto`} onClick={() => onSetDefaultMachine(m.id)}>
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
            <div className="rounded-lg border u-border u-surface p-3 sm:p-4 flex flex-col gap-3">
              <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">Identity</h4>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium u-text">Machine Name</span>
                <input
                  type="text"
                  className="rounded border u-border bg-black/5 dark:bg-white/5 px-3 py-2 text-sm u-focus-ring w-full"
                  placeholder="e.g. Tormek T-8"
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  autoFocus
                />
              </label>
            </div>

            <div className="rounded-lg border u-border u-surface p-3 sm:p-4 flex flex-col gap-3">
              <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">Hardware</h4>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium u-text">Axle Diameter (mm)</span>
                <input
                  type="number"
                  step="0.1"
                  className="rounded border u-border bg-black/5 dark:bg-white/5 px-3 py-2 text-sm u-focus-ring w-full font-mono"
                  value={draftAxleDiameter}
                  onChange={e => setDraftAxleDiameter(Number(e.target.value))}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button type="button" className={BTN.ghost} onClick={closeAdd}>Cancel</button>
              <button 
                type="button" 
                className={BTN.primary} 
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
            <div className="rounded-lg border u-border u-surface p-3 sm:p-4 flex flex-col gap-3">
              <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">Identity</h4>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium u-text">Machine Name</span>
                <input
                  type="text"
                  className="rounded border u-border bg-black/5 dark:bg-white/5 px-3 py-2 text-sm u-focus-ring w-full"
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                />
              </label>
            </div>

            <div className="rounded-lg border u-border u-surface p-3 sm:p-4 flex flex-col gap-3">
              <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">Hardware</h4>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium u-text">Axle Diameter (mm)</span>
                <input
                  type="number"
                  step="0.1"
                  className="rounded border u-border bg-black/5 dark:bg-white/5 px-3 py-2 text-sm u-focus-ring w-full font-mono"
                  value={draftAxleDiameter}
                  onChange={e => setDraftAxleDiameter(Number(e.target.value))}
                />
              </label>
            </div>
            
            <div className="rounded-lg border u-border u-surface p-3 sm:p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wider">Geometry Mapping</h4>
                <button type="button" className={`${BTN.primary} text-xs py-1 px-2 h-auto`} onClick={() => {
                  setCalibratingMachineId(activeMachineToEdit.id);
                  closeEdit();
                }}>
                  New Mapping
                </button>
              </div>
              
              {activeMachineToEdit.calibrationProfiles && activeMachineToEdit.calibrationProfiles.length > 0 ? (
                <div className="mt-1 flex flex-col gap-2">
                  {activeMachineToEdit.calibrationProfiles.map(p => {
                    const isActive = activeMachineToEdit.activeCalibrationId === p.id;
                    const isBest = activeMachineBestProfileId === p.id;
                    return (
                      <div key={p.id} className={`flex items-center justify-between p-2 text-xs rounded border ${isActive ? 'border-primary bg-primary/5' : 'border-neutral-200 dark:border-neutral-800'}`}>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold truncate u-text">{p.name}</span>
                            {isBest && (
                              <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 text-[9px] uppercase font-bold shrink-0">
                                Best Residuals
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] u-text-muted">
                            {new Date(p.createdAt).toLocaleDateString()} &middot; {p.scope === 'both' ? 'Dual Base' : p.scope === 'rear' ? 'Rear Only' : 'Front Only'}
                          </span>
                        </div>
                        
                        {isActive ? (
                          <span className="text-primary font-bold px-2">Active</span>
                        ) : (
                          <button type="button" className="text-primary font-semibold hover:underline px-2" onClick={() => {
                            const newConstants = { ...activeMachineToEdit.constants };
                            if (p.rear) newConstants.rear = { hc: p.rear.hc, o: p.rear.o };
                            if (p.front) newConstants.front = { hc: p.front.hc, o: p.front.o };
                            onUpdateMachine(activeMachineToEdit.id, {
                              activeCalibrationId: p.id,
                              constants: newConstants
                            });
                          }}>
                            Activate
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs u-text-muted mt-1">
                  No geometry mappings saved. Run the mapper to measure your machine.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button type="button" className={BTN.ghost} onClick={closeEdit}>Cancel</button>
              <button 
                type="button" 
                className={BTN.primary} 
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
