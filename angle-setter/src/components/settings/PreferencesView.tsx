import React from 'react';

type Props = {
  heightMode: 'hn' | 'hr';
  setHeightMode: (mode: 'hn' | 'hr') => void;
};

export default function PreferencesView({ heightMode, setHeightMode }: Props) {
  return (
    <section className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold u-text panel-header">General Preferences</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="card-elevated flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold u-text">Measurement Reference Base</span>
              <span className="text-xs u-text-muted max-w-sm">
                Choose whether you measure your Support Bar (USB) height from the machine casing (Datum) or from the grindstone surface (Wheel). This preference applies globally to your calculations.
              </span>
            </div>
            
            <div className="flex bg-neutral-950 rounded-full border border-neutral-800/60 p-0.5 select-none text-xs w-32 shrink-0">
              <button
                className={`flex-1 rounded-full font-bold tracking-wider py-1.5 uppercase ${heightMode === 'hn' ? 'bg-neutral-800 text-neutral-200 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                onClick={() => setHeightMode('hn')}
              >
                Datum
              </button>
              <button
                className={`flex-1 rounded-full font-bold tracking-wider py-1.5 uppercase ${heightMode === 'hr' ? 'bg-neutral-800 text-neutral-200 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                onClick={() => setHeightMode('hr')}
              >
                Wheel
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
