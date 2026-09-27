import * as React from 'react';
import { useUIStore } from '../state/uiStore';
import { useStore } from '../state/store';
import { ContextBar } from '../components/layout/ContextBar';

import MachineManagerView from '../components/settings/MachineManagerView';
import WheelManagerView from '../components/wheels/WheelManagerView';
import JigManagerView from '../components/settings/JigManagerView';
import UsbManagerView from '../components/settings/UsbManagerView';
import SegmentedControl from '../components/ui/SegmentedControl';
import { isMachineUnmapped } from '../utils/machineStatus';

// We will compute options dynamically inside component

export default function HardwareView() {
  const machines = useStore(s => s.machines);
  const hasUnmappedMachines = machines.some(isMachineUnmapped);

  const equipmentTab = useUIStore((s) => s.equipmentTab);
  const setEquipmentTab = useUIStore((s) => s.setEquipmentTab);
  const calibratingMachineId = useUIStore((s) => s.calibratingMachineId);
  const expandedEquipmentId = useUIStore(s => s.expandedEquipmentId);

  // Clear expanded equipment state when navigating away from the equipment view
  React.useEffect(() => {
    return () => {
      useUIStore.getState().setExpandedEquipmentId(null);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-200 max-w-[576px] mx-auto w-full">
      {!calibratingMachineId && expandedEquipmentId ? (
        <>
          <ContextBar.Slot name="left">
            <ContextBar.Button
              variant="ghost-danger"
              onClick={() => {
                useUIStore.getState().setTopBarConfirmation({
                  message: `Delete ${equipmentTab === 'jigs' ? 'Jig' : equipmentTab === 'usbs' ? 'USB' : equipmentTab === 'machines' ? 'Machine' : 'Wheel'}?`,
                  confirmLabel: 'Delete',
                  cancelLabel: 'Cancel',
                  onConfirm: () => {
                    const id = expandedEquipmentId;
                    if (equipmentTab === 'jigs') useStore.getState().deleteJig(id);
                    else if (equipmentTab === 'usbs') useStore.getState().deleteUsb(id);
                    else if (equipmentTab === 'machines') useStore.getState().deleteMachine(id);
                    else if (equipmentTab === 'wheels') useStore.getState().deleteWheel(id);
                    useUIStore.getState().setExpandedEquipmentId(null);
                  }
                });
              }}
            >
              Delete
            </ContextBar.Button>
          </ContextBar.Slot>
          <ContextBar.Slot name="center">
            <ContextBar.AmbientInfo>
              Edit {equipmentTab === 'jigs' ? 'Jig' : equipmentTab === 'usbs' ? 'USB' : equipmentTab === 'machines' ? 'Machine' : 'Wheel'}
            </ContextBar.AmbientInfo>
          </ContextBar.Slot>
        </>
      ) : !calibratingMachineId ? (
        <>
          <ContextBar.Slot name="center">
            <ContextBar.AmbientInfo>
              {equipmentTab === 'jigs' ? 'Jigs' : equipmentTab === 'usbs' ? 'Support Bars' : equipmentTab === 'machines' ? 'Machines' : 'Wheels'}
            </ContextBar.AmbientInfo>
          </ContextBar.Slot>
          <ContextBar.Slot name="right">
            <ContextBar.Button
              variant="primary"
              onClick={() => {
                if (equipmentTab === 'jigs') window.dispatchEvent(new CustomEvent('openAddHardwareModal'));
                else if (equipmentTab === 'usbs') window.dispatchEvent(new CustomEvent('openAddHardwareModal'));
                else if (equipmentTab === 'machines') window.dispatchEvent(new CustomEvent('openAddMachineModal'));
                else if (equipmentTab === 'wheels') window.dispatchEvent(new CustomEvent('openAddWheelModal'));
              }}
            >
              + Add
            </ContextBar.Button>
          </ContextBar.Slot>
        </>
      ) : null}

      {!calibratingMachineId && (
        <SegmentedControl
          value={equipmentTab}
          onChange={(tab) => {
            setEquipmentTab(tab);
            useUIStore.getState().setExpandedEquipmentId(null);
          }}
          options={[
            { value: 'wheels' as const, label: 'Wheels' },
            { 
              value: 'machines' as const, 
              label: (
                <div className="flex items-center gap-1.5 relative">
                  Machines
                  {hasUnmappedMachines && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
                </div>
              ) 
            },
            { value: 'jigs' as const, label: 'Jigs' },
            { value: 'usbs' as const, label: 'USBs' },
          ]}
          ariaLabel="Hardware sections"
        />
      )}

      {equipmentTab === 'wheels' && <WheelManagerView />}
      {equipmentTab === 'jigs' && <JigManagerView />}
      {equipmentTab === 'usbs' && <UsbManagerView />}
      {equipmentTab === 'machines' && <MachineManagerView />}
    </div>
  );
}
