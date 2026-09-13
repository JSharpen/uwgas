import * as React from 'react';
import { useUIStore } from '../../state/uiStore';
import { IconCalculator, IconDisc, IconSettings } from '../../icons';

export function BottomTabBar() {
  const view = useUIStore((s) => s.view);
  const setView = useUIStore((s) => s.setView);

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
          className={`flex items-center justify-center w-12 h-10 rounded-2xl transition-all ${
            view === 'calculator' ? 'bg-amber-400/10' : ''
          }`}
        >
          <IconCalculator className="w-6 h-6" />
        </div>
      </button>
      <button
        type="button"
        onClick={() => setView('wheels')}
        className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
          view === 'wheels' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white/80'
        }`}
        aria-label="Wheels View"
      >
        <div
          className={`flex items-center justify-center w-12 h-10 rounded-2xl transition-all ${
            view === 'wheels' ? 'bg-amber-400/10' : ''
          }`}
        >
          <IconDisc className="w-6 h-6" />
        </div>
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
          className={`flex items-center justify-center w-12 h-10 rounded-2xl transition-all ${
            view === 'settings' ? 'bg-amber-400/10' : ''
          }`}
        >
          <IconSettings className="w-6 h-6" />
        </div>
      </button>
    </nav>
  );
}
