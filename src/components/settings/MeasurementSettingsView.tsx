import { useStore } from '../../state/store';


export type MeasurementSettingsViewProps = Record<string, never>;

export default function MeasurementSettingsView() {
  const heightMode = useStore((s) => s.heightMode);
  const setHeightMode = useStore((s) => s.setHeightMode);
  const calcMode = useStore((s) => s.global.calcMode);
  const useProtrusionMode = useStore((s) => s.global.useProtrusionMode);
  const showAdvancedStepOverrides = useStore((s) => s.global.showAdvancedStepOverrides);
  const setGlobal = useStore((s) => s.setGlobal);
  return (
    <section className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200 max-w-3xl mx-auto pb-20">

      <div className="flex flex-col gap-4">
        {/* Calculation Solver Mode */}
        <div className="card-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold u-text">Calculation Solver Mode</span>
            <span className="text-xs u-text-muted max-w-sm">
              Choose whether the app solves for the required Support Bar Height (assuming a fixed knife projection) or solves for Projection A (assuming the USB is locked).
            </span>
          </div>
          
          <div className="flex bg-neutral-950 rounded-full border border-neutral-800/60 p-0.5 select-none text-xs w-full sm:w-48 shrink-0">
            <button
              className={`flex-1 rounded-full font-bold tracking-wider py-1.5 uppercase ${calcMode !== 'projection' ? 'bg-neutral-800 text-neutral-200 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setGlobal(g => ({ ...g, calcMode: 'height' }))}
            >
              Height
            </button>
            <button
              className={`flex-1 rounded-full font-bold tracking-wider py-1.5 uppercase ${calcMode === 'projection' ? 'bg-neutral-800 text-neutral-200 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setGlobal(g => ({ ...g, calcMode: 'projection' }))}
            >
              Projection
            </button>
          </div>
        </div>

        {/* Projection Input Style */}
        <div className="card-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold u-text">Projection Input Style</span>
            <span className="text-xs u-text-muted max-w-sm">
              Standard Projection (A) measures from the USB to the edge. Protrusion (Pb) measures the blade stick-out from the jig collar using calipers.
            </span>
          </div>
          
          <div className="flex bg-neutral-950 rounded-full border border-neutral-800/60 p-0.5 select-none text-xs w-full sm:w-48 shrink-0">
            <button
              className={`flex-1 rounded-full font-bold tracking-wider py-1.5 uppercase ${!useProtrusionMode ? 'bg-neutral-800 text-neutral-200 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setGlobal(g => ({ ...g, useProtrusionMode: false }))}
            >
              Proj A
            </button>
            <button
              className={`flex-1 rounded-full font-bold tracking-wider py-1.5 uppercase ${useProtrusionMode ? 'bg-neutral-800 text-neutral-200 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setGlobal(g => ({ ...g, useProtrusionMode: true }))}
            >
              Caliper Pb
            </button>
          </div>
        </div>

        {/* Height Reference */}
        <div className="card-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold u-text">Measurement Reference Base</span>
            <span className="text-xs u-text-muted max-w-sm">
              Measure Support Bar (USB) height from the machine casing (Datum) or from the grindstone surface (Wheel).
            </span>
          </div>
          
          <div className="flex bg-neutral-950 rounded-full border border-neutral-800/60 p-0.5 select-none text-xs w-full sm:w-48 shrink-0">
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

        {/* Interface - Per-Step Overrides */}
        <div className="card-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 mt-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold u-text">Per-Step Hardware Overrides</span>
            <span className="text-xs u-text-muted max-w-sm">
              Enable the ability to override the Machine and Support Bar (USB) on individual steps in your progression, and display them on the step cards.
            </span>
          </div>
          
          <label className="flex items-center cursor-pointer shrink-0 mr-2">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={!!showAdvancedStepOverrides} onChange={e => setGlobal(g => ({ ...g, showAdvancedStepOverrides: e.target.checked }))} />
              <div className={`block w-12 h-7 rounded-full transition-colors ${showAdvancedStepOverrides ? 'bg-primary' : 'bg-neutral-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${showAdvancedStepOverrides ? 'transform translate-x-5' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>
    </section>
  );
}

