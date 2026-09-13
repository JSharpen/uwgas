import * as React from 'react';
import { useUIStore } from '../../state/uiStore';
import { useStore } from '../../state/store';
import { useShallow } from 'zustand/react/shallow';

export function PresetMenuPopover() {
  const isOpen = useUIStore(s => s.isPresetMenuOpen);
  const setOpen = useUIStore(s => s.setPresetMenuOpen);
  
  const sessionPresets = useStore(useShallow(s => s.sessionPresets));
  const selectedPresetId = useUIStore(s => s.selectedPresetId);
  const setSelectedPresetId = useUIStore(s => s.setSelectedPresetId);
  
  const loadPreset = useStore(s => s.loadPreset);
  const setPresetDialogOpen = useUIStore(s => s.setPresetDialogOpen);
  const setPresetManagerOpen = useUIStore(s => s.setPresetManagerOpen);
  
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
            return (
              <button
                key={p.id}
                type="button"
                className={`w-full p-4 rounded-2xl text-left transition-all ${
                  isSelected ? 'bg-amber-400/10 border border-amber-400/30' : 'neu-button border border-transparent'
                }`}
                onClick={() => onLoadPreset(p.id)}
              >
                <div className={`font-bold text-[13px] ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                  {p.name}
                </div>
                <div className="text-[11px] text-white/40 mt-1">
                  {p.steps.length} step{p.steps.length === 1 ? '' : 's'}
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="p-4 bg-[#18181b] border-t border-white/5 flex gap-3 shrink-0">
          <button 
            type="button"
            className="flex-1 h-11 py-2 text-xs font-bold text-white/70 hover:text-white neu-button rounded-xl transition flex items-center justify-center"
            onClick={() => {
              setOpen(false);
              setPresetDialogOpen(true);
            }}
          >
            Save Current
          </button>
          <button 
            type="button"
            className="flex-1 h-11 py-2 text-xs font-bold text-white/70 hover:text-white neu-button rounded-xl transition flex items-center justify-center"
            onClick={() => {
              setOpen(false);
              setPresetManagerOpen(true);
            }}
          >
            Manage Presets
          </button>
        </div>
      </div>
    </>
  );
}
