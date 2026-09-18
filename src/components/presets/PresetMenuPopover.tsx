import * as React from 'react';
import { useUIStore } from '../../state/uiStore';
import { useStore } from '../../state/store';
import { useShallow } from 'zustand/react/shallow';

export function PresetMenuPopover() {
  const isOpen = useUIStore(s => s.isPresetMenuOpen);
  const setOpen = useUIStore(s => s.setPresetMenuOpen);
  
  const sessionPresets = useStore(useShallow(s => s.sessionPresets));
  const machines = useStore(useShallow(s => s.machines));
  const usbs = useStore(useShallow(s => s.usbs));
  const global = useStore(useShallow(s => s.global));
  const selectedPresetId = useUIStore(s => s.selectedPresetId);
  const setSelectedPresetId = useUIStore(s => s.setSelectedPresetId);
  
  const loadPreset = useStore(s => s.loadPreset);
  
  const onLoadPreset = (id: string) => {
    setSelectedPresetId(id);
    if (id) loadPreset(id);
    setOpen(false);
  };
  
  // Animation state
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  React.useEffect(() => {
    if (isOpen || isVisible) {
      document.body.style.overflow = 'hidden';
      // Prevent mobile bounce
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen, isVisible]);
  
  if (!isOpen && !isVisible) return null;
  
  return (
    <>
      {/* Backdrop that only covers the main content area, sitting behind the dropdown but in front of the page */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm -z-10 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setOpen(false)}
      />
      
      {/* The Popover itself, absolutely positioned below the ContextBar */}
      <div 
        className={`absolute top-[calc(100%+12px)] left-0 right-0 z-10 bg-[#18181b]/95 backdrop-blur-xl border border-amber-400/50 rounded-3xl shadow-[0_0_30px_rgba(251,191,36,0.2)] transition-all duration-200 origin-top flex flex-col max-h-[70vh] overflow-hidden ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'}`}
      >
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <button
            type="button"
            className={`w-full p-4 rounded-2xl text-left transition-all ${
              !selectedPresetId ? 'bg-amber-400/10 border border-amber-400/30' : 'neu-button border border-transparent'
            }`}
            onClick={() => onLoadPreset('')}
          >
            <div className="font-bold text-[13px] text-white">None (Custom Setup)</div>
            <div className="text-[11px] text-white/40 mt-1">Clear active preset selection</div>
          </button>
          
          {sessionPresets.map(p => {
            const isSelected = p.id === selectedPresetId;
            const isAngleBound = p.context?.targetAngle !== undefined;
            const displayAngle = isAngleBound ? p.context!.targetAngle : global.targetAngle;

            const machineIds = new Set<string>();
            const usbIds = new Set<string>();
            
            let needsMachineFallback = p.steps.length === 0;
            let needsUsbFallback = p.steps.length === 0;

            p.steps.forEach(s => {
              if (s.machineId) machineIds.add(s.machineId);
              else needsMachineFallback = true;
              
              if (s.usbId) usbIds.add(s.usbId);
              else needsUsbFallback = true;
            });
            
            if (needsMachineFallback) {
              if (p.context?.machineId) machineIds.add(p.context.machineId);
              else machineIds.add(global.activeMachineId || machines[0]?.id || '');
            }
            
            if (needsUsbFallback) {
              if (p.context?.usbId) usbIds.add(p.context.usbId);
              else usbIds.add(global.activeUsbId || usbs[0]?.id || '');
            }
            
            const reqMachines = Array.from(machineIds).map(id => {
              const isBound = p.context?.machineId === id || p.steps.some(s => s.machineId === id);
              const found = machines?.find(m => m.id === id);
              return { item: found || { id, name: 'Unknown Machine' }, isBound };
            });
            
            const reqUsbs = Array.from(usbIds).map(id => {
              const isBound = p.context?.usbId === id || p.steps.some(s => s.usbId === id);
              const found = usbs?.find(u => u.id === id);
              return { item: found || { id, name: 'Unknown USB' }, isBound };
            });

            return (
              <button
                key={p.id}
                type="button"
                className={`w-full p-4 rounded-2xl text-left transition-all ${
                  isSelected ? 'bg-amber-400/10 border border-amber-400/30' : 'neu-button border border-transparent'
                }`}
                onClick={() => onLoadPreset(p.id)}
              >
                <div className="flex items-center gap-2 w-full min-w-0">
                  <span className={`font-bold text-[13px] truncate ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                    {p.name}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-1 mt-2 w-full">
                  <span className="shrink-0 text-[10px] text-white/40 font-medium mr-1">{p.steps.length} step{p.steps.length === 1 ? '' : 's'}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[8.5px] font-mono truncate max-w-[80px] ${
                    isAngleBound 
                      ? 'bg-emerald-500/5 border border-emerald-500/30 text-emerald-400' 
                      : 'neu-concave border border-white/5 text-white/40'
                  }`}>
                    {displayAngle}°
                  </span>
                  
                  {reqMachines.map(({ item, isBound }) => item && (
                    <span key={`m-${item.id}`} className={`rounded px-1.5 py-0.5 text-[8.5px] font-mono truncate flex-1 min-w-[50px] text-center ${
                      isBound
                        ? 'bg-cyan-500/5 border border-cyan-500/30 text-cyan-400' 
                        : 'neu-concave border border-white/5 text-white/40'
                    }`}>
                      {item.name}
                    </span>
                  ))}
                  
                  {reqUsbs.map(({ item, isBound }) => item && (
                    <span key={`u-${item.id}`} className={`rounded px-1.5 py-0.5 text-[8.5px] font-mono truncate flex-1 min-w-[50px] text-center ${
                      isBound
                        ? 'bg-cyan-500/5 border border-cyan-500/30 text-cyan-400' 
                        : 'neu-concave border border-white/5 text-white/40'
                    }`}>
                      {item.name}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
