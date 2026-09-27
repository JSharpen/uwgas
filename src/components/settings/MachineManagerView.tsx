import * as React from 'react';
import { TextInput } from "../ui/TextInput";
import { NumberInput } from "../ui/NumberInput";
import { generateId } from "../../utils/id";
import type { MachineConfig } from '../../types/core';
import ModalShell from '../ModalShell';
import { ModalSelector } from '../ui/ModalSelector';
import { Button, Surface } from '../ui';
import { IconGrinder } from '../../icons';
import useModalLayout from '../../hooks/useModalLayout';
import CalibrationWizard from '../CalibrationWizard';
import ExpandableCard from '../ui/ExpandableCard';
import { Tag } from '../ui/Tag';

import { useMachineState } from '../../state/store';
import { isMachineUnmapped } from '../../utils/machineStatus';

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
  const [mappingSelectionBase, setMappingSelectionBase] = React.useState<{machineId: string, base: 'rear'|'front'} | null>(null);
    
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
  const calibratingProfileId = useUIStore(s => s.calibratingProfileId);
  const setCalibratingMachineId = useUIStore(s => s.setCalibratingMachineId);
  

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
    const initialProfile = activeMachine.calibrationProfiles?.find(p => p.id === calibratingProfileId);
    return (
      <CalibrationWizard
        activeMachine={activeMachine}
        initialProfile={initialProfile}
        onSaveProfile={(profile) => {
          const newProfiles = [...(activeMachine.calibrationProfiles || [])];
          const existingIdx = newProfiles.findIndex(p => p.id === profile.id);
          if (existingIdx >= 0) {
            newProfiles[existingIdx] = profile;
          } else {
            newProfiles.push(profile);
          }
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



  
  return (
    <section className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 max-w-3xl mx-auto pb-20 w-full">

      <div className="flex flex-col gap-4">
        {machines.map((m, idx) => {
          const isExpanded = expandedEquipmentId === m.id;
          
          return (
            <ExpandableCard
              key={m.id}
              isExpanded={isExpanded}
              scrollOnExpand
              onToggle={() => setExpandedEquipmentId(isExpanded ? null : m.id)}
              index={idx}
              header={
                <div className="flex flex-col min-w-0 w-full gap-2">
                  <div className="flex items-center gap-2.5 w-full">
                    <IconGrinder className="w-6 h-6 text-[var(--color-accent)] shrink-0" />
                    <span className={`text-base font-medium tracking-wide truncate ${isExpanded ? 'text-amber-400/80' : 'text-white'}`}>{m.name}</span>
                    {isMachineUnmapped(m) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] ml-auto mr-1 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 min-h-[24px]">
                    {m.id === defaultMachineId && (
                      <Tag intent="accent" appearance="outline">
                        Default
                      </Tag>
                    )}
                    {(!m.calibrationProfiles || m.calibrationProfiles.length === 0) && (
                      <Tag intent="warning" appearance="outline">
                        Unmapped
                      </Tag>
                    )}
                  </div>
                </div>
              }
            >
              <div className="p-4 sm:p-5 pt-0 flex flex-col gap-4 mt-2" onClick={e => e.stopPropagation()}>
                    
                <TextInput
  label="Machine Name"
  defaultValue={m.name}
                    onBlur={e => onUpdateMachine(m.id, { name: e.target.value.trim() })}
/>
                
                <NumberInput
  label="Axle Diameter (mm)"
  defaultValue={m.axleDiameter ?? 12}
                    onBlur={e => onUpdateMachine(m.id, { axleDiameter: Number(e.target.value) })}
/>

                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Geometry Mapping</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Rear */}
                    <Surface variant="concave" padding="md" className="flex flex-col gap-3 justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest font-bold">Rear Base</span>
                        <span className="font-mono text-[11px] text-white/80 whitespace-nowrap">
                          hc: <b className="text-white font-bold">{m.constants.rear.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.rear.o.toFixed(1)}</b>
                        </span>
                        {(() => {
                          const active = m.calibrationProfiles?.find(p => p.rear?.hc === m.constants.rear.hc && p.rear?.o === m.constants.rear.o)
                                      || m.calibrationProfiles?.filter(p => p.rear).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                          if (!active) return null;
                          return (
                            <div 
                               className="text-[9px] text-white/50 mt-1 border-t border-white/5 pt-1.5 flex justify-between items-center"
                            >
                              <span>{new Date(active.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              <span className="font-mono text-amber-300/80">err: {(active.rear?.angleErrorDeg ?? 0).toFixed(3)}°</span>
                            </div>
                          );
                        })()}
                      </div>
                      <Button
                        variant="neu-convex" intent="accent" size="sm" fluid
                        onClick={(e) => { e.stopPropagation(); setMappingSelectionBase({machineId: m.id, base: 'rear'}); }}
                      >
                        Rear Mappings
                      </Button>
                    </Surface>

                    {/* Front */}
                    <Surface variant="concave" padding="md" className="flex flex-col gap-3 justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--color-focus)] uppercase tracking-widest font-bold">Front Base</span>
                        <span className="font-mono text-[11px] text-white/80 whitespace-nowrap">
                          hc: <b className="text-white font-bold">{m.constants.front.hc.toFixed(1)}</b>, o: <b className="text-white font-bold">{m.constants.front.o.toFixed(1)}</b>
                        </span>
                        {(() => {
                          const active = m.calibrationProfiles?.find(p => p.front?.hc === m.constants.front.hc && p.front?.o === m.constants.front.o)
                                      || m.calibrationProfiles?.filter(p => p.front).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                          if (!active) return null;
                          return (
                            <div 
                               className="text-[9px] text-white/50 mt-1 border-t border-white/5 pt-1.5 flex justify-between items-center"
                            >
                              <span>{new Date(active.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              <span className="font-mono text-blue-300/80">err: {(active.front?.angleErrorDeg ?? 0).toFixed(3)}°</span>
                            </div>
                          );
                        })()}
                      </div>
                      <Button
                        variant="neu-convex" intent="focus" size="sm" fluid
                        onClick={(e) => { e.stopPropagation(); setMappingSelectionBase({machineId: m.id, base: 'front'}); }}
                      >
                        Front Mappings
                      </Button>
                    </Surface>
                  </div>
                      
                    </div>

                    {m.id !== defaultMachineId && (
                      <Button
                        variant="neu" intent="default" size="md" fluid
                        onClick={(e) => { e.stopPropagation(); onSetDefaultMachine(m.id); }}
                      >
                        Set as Default
                      </Button>
                    )}
                  </div>
            </ExpandableCard>
          );
        })}
      </div>

      
      {/* Mapping History Modal */}
      {mappingSelectionBase && (() => {
        const selectedMachine = machines.find(x => x.id === mappingSelectionBase.machineId);
        if (!selectedMachine) return null;
        
        const base = mappingSelectionBase.base;
        const titleName = base === 'rear' ? 'Rear Base' : 'Front Base';
        const profiles = (selectedMachine.calibrationProfiles || []).filter(p => p[base]).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const currentHC = selectedMachine.constants[base].hc;
        const currentO = selectedMachine.constants[base].o;

        return (
          <ModalSelector
            isOpen={true}
            onClose={() => setMappingSelectionBase(null)}
            title={`${titleName} Mappings`}
            subtitle="Select a historical mapping to set as active, or map a new one."
          >
            {profiles.map(p => {
              const data = p[base]!;
              const isActive = data.hc === currentHC && data.o === currentO;
              return (
                <ModalSelector.Item
                  key={p.id}
                  selected={isActive}
                  intent={base === 'rear' ? 'accent' : 'focus'}
                  meta={`Err: ${(data.angleErrorDeg ?? 0).toFixed(3)}°`}
                  onClick={() => {
                    if (!isActive) {
                      const newConstants = { ...selectedMachine.constants };
                      newConstants[base] = { hc: data.hc, o: data.o };
                      onUpdateMachine(selectedMachine.id, { constants: newConstants });
                    }
                    setMappingSelectionBase(null);
                  }}
                >
                  {p.name}
                </ModalSelector.Item>
              );
            })}
            
            {profiles.length === 0 && (
              <div className="p-4 text-center text-xs text-white/50 mb-2">
                No {titleName.toLowerCase()} mappings found.
              </div>
            )}

            <Button
              variant="outline"
              intent={base === 'rear' ? 'accent' : 'focus'}
              fluid
              size="md"
              className="mt-2"
              onClick={() => {
                 setMappingSelectionBase(null);
                 setCalibratingMachineId(selectedMachine.id, null, 'intro', base);
              }}
            >
              + Map New {titleName}
            </Button>
          </ModalSelector>
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
            <TextInput
  label="Machine Name"
  placeholder="e.g. Tormek T-8"
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                autoFocus
/>

            <NumberInput
  label="Axle Diameter (mm)"
  value={draftAxleDiameter}
                onChange={e => setDraftAxleDiameter(Number(e.target.value))}
/>

            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="neu" intent="default" size="md"
                onClick={closeAdd}
              >
                Cancel
              </Button>
              <Button 
                variant="solid" intent="accent" size="md"
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
              </Button>
            </div>
          </div>
        </ModalShell>
      )}

          </section>
  );
}

