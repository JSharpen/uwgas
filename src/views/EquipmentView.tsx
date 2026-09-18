import * as React from 'react';
import { useUIStore } from '../state/uiStore';

import MachineManagerView from '../components/settings/MachineManagerView';
import WheelManagerView from '../components/wheels/WheelManagerView';
import JigManagerView from '../components/settings/JigManagerView';
import UsbManagerView from '../components/settings/UsbManagerView';

export default function EquipmentView() {
  const equipmentTab = useUIStore((s) => s.equipmentTab);
  const setEquipmentTab = useUIStore((s) => s.setEquipmentTab);
  const calibratingMachineId = useUIStore((s) => s.calibratingMachineId);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-200 max-w-[576px] mx-auto w-full">
      {!calibratingMachineId && (
        <div className="neu-convex rounded-full border border-black/40 p-1 flex bg-neutral-950 shadow-lg relative z-20 shrink-0">
          <button
            onClick={() => setEquipmentTab('machines')}
            className={`flex-1 h-11 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition-all active:scale-95 ${
              equipmentTab === 'machines'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            Machines
          </button>
          <button
            onClick={() => setEquipmentTab('wheels')}
            className={`flex-1 h-11 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition-all active:scale-95 ${
              equipmentTab === 'wheels'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            Wheels
          </button>
          <button
            onClick={() => setEquipmentTab('jigs')}
            className={`flex-1 h-11 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition-all active:scale-95 ${
              equipmentTab === 'jigs'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            Jigs
          </button>
          <button
            onClick={() => setEquipmentTab('usbs')}
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
