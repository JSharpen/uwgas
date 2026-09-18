import * as React from 'react';
import { useUIStore } from '../../state/uiStore';
import { useStore } from '../../state/store';
import { IconCalculator, IconDisc, IconSettings, IconFolder } from '../../icons';
import { isWheelOverdue } from '../../utils/wheelWear';

export function BottomTabBar() {
  const view = useUIStore((s) => s.view);
  const setView = useUIStore((s) => s.setView);
  const wheels = useStore((s) => s.wheels);
  const hasOverdueWheels = wheels.some(isWheelOverdue);

  return (
    <nav className="touch-none fixed bottom-[-10px] left-0 right-0 h-[calc(74px_+_env(safe-area-inset-bottom))] pb-[calc(10px_+_env(safe-area-inset-bottom))] bg-[#18181b]/95 backdrop-blur-lg border-t border-white/5 flex items-center justify-around z-40 shadow-2xl">
      <button
        type="button"
        onClick={() => setView('calculator')}
        className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
          view === 'calculator'
            ? 'text-amber-400 font-bold'
            : 'text-white/40 hover:text-white/80'
        }`}
        aria-label="Calculator View"
      >
        <div
          className={`flex items-center justify-center w-12 h-8 rounded-2xl transition-all ${
            view === 'calculator' ? 'bg-amber-400/10' : ''
          }`}
        >
          <IconCalculator className="w-[22px] h-[22px]" />
        </div>
        <span className="text-[9px] mt-0.5 tracking-wide">Calc</span>
      </button>
      
      <button
        type="button"
        onClick={() => setView('equipment')}
        className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
          view === 'equipment' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white/80'
        }`}
        aria-label="Equipment View"
      >
        <div
          className={`flex items-center justify-center w-12 h-8 rounded-2xl transition-all relative ${
            view === 'equipment' ? 'bg-amber-400/10' : ''
          }`}
        >
          <IconDisc className="w-[22px] h-[22px]" />
          {hasOverdueWheels && (
            <div className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] border border-[#18181b]" />
          )}
        </div>
        <span className="text-[9px] mt-0.5 tracking-wide">Equipment</span>
      </button>
      
      <button
        type="button"
        onClick={() => setView('presets')}
        className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
          view === 'presets' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white/80'
        }`}
        aria-label="Presets View"
      >
        <div
          className={`flex items-center justify-center w-12 h-8 rounded-2xl transition-all ${
            view === 'presets' ? 'bg-amber-400/10' : ''
          }`}
        >
          <IconFolder className="w-[22px] h-[22px]" />
        </div>
        <span className="text-[9px] mt-0.5 tracking-wide">Presets</span>
      </button>
      
      <button
        type="button"
        onClick={() => setView('settings')}
        className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
          view === 'settings' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white/80'
        }`}
        aria-label="Settings View"
      >
        <div
          className={`flex items-center justify-center w-12 h-8 rounded-2xl transition-all ${
            view === 'settings' ? 'bg-amber-400/10' : ''
          }`}
        >
          <IconSettings className="w-[22px] h-[22px]" />
        </div>
        <span className="text-[9px] mt-0.5 tracking-wide">Settings</span>
      </button>
    </nav>
  );
}
