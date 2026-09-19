import * as React from 'react';
import { useUIStore } from '../state/uiStore';
import { useStore } from '../state/store';
import { ContextBar } from '../components/layout/ContextBar';

import MachineManagerView from '../components/settings/MachineManagerView';
import WheelManagerView from '../components/wheels/WheelManagerView';
import JigManagerView from '../components/settings/JigManagerView';
import UsbManagerView from '../components/settings/UsbManagerView';

export default function EquipmentView() {
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
        <div className="neu-convex rounded-full border border-black/40 p-1 flex bg-neutral-950 shadow-lg relative z-20 shrink-0">
          <button
            onClick={() => {
              setEquipmentTab('wheels');
              useUIStore.getState().setExpandedEquipmentId(null);
            }}
            className={`flex-1 h-11 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition-all active:scale-95 ${
              equipmentTab === 'wheels'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            Wheels
          </button>
          <button
            onClick={() => {
              setEquipmentTab('machines');
              useUIStore.getState().setExpandedEquipmentId(null);
            }}
            className={`flex-1 h-11 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition-all active:scale-95 ${
              equipmentTab === 'machines'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            Machines
          </button>
          <button
            onClick={() => {
              setEquipmentTab('jigs');
              useUIStore.getState().setExpandedEquipmentId(null);
            }}
            className={`flex-1 h-11 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition-all active:scale-95 ${
              equipmentTab === 'jigs'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            Jigs
          </button>
          <button
            onClick={() => {
              setEquipmentTab('usbs');
              useUIStore.getState().setExpandedEquipmentId(null);
            }}
            className={`flex-1 h-11 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition-all active:scale-95 ${
              equipmentTab === 'usbs'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            USBs
          </button>
        </div>
      )}

      {equipmentTab === 'wheels' && <WheelManagerView />}
      {equipmentTab === 'jigs' && <JigManagerView />}
      {equipmentTab === 'usbs' && <UsbManagerView />}
      {equipmentTab === 'machines' && <MachineManagerView />}
    </div>
  );
}
