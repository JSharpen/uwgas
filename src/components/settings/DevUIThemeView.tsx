import * as React from 'react';
import { useDevStore, initialState } from '../../state/devStore';

export default function DevUIThemeView() {
  const state = useDevStore();

  return (
    <div className="w-full flex flex-col gap-6 p-4 pb-24">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-black uppercase tracking-widest text-white/90">
          UI Theme Lab
        </h2>
        <div className="flex flex-col gap-3">
          <p className="text-xs text-white/50 leading-relaxed max-w-sm">
            Adjust CSS variables injected into the root document to instantly
            evaluate layout constraints.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const config: Record<string, number | string> = {};
                for (const [k, value] of Object.entries(initialState)) {
                  const key = k as keyof typeof initialState;
                  if (state[key] !== value) {
                    config[`--${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}`] = state[key] + (typeof state[key] === 'number' && key !== 'uiScale' ? 'px' : '');
                  }
                }
                navigator.clipboard.writeText(JSON.stringify(config, null, 2));
              }}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors"
            >
              Copy CSS Config
            </button>
            <button
              type="button"
              onClick={state.resetToDefaults}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold py-2 px-3 rounded-xl transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 border border-white/10 rounded-3xl p-4 bg-white/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Debugging Modes</h3>
          
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-white/90">Visual Layout Bounds</label>
              <select 
                className="bg-black border border-white/10 text-xs px-2 py-1 rounded-lg text-amber-400 font-mono"
                value={state.debugLayoutMode}
                onChange={(e) => state.setDebugLayoutMode(e.target.value as any)}
              >
                <option value="none">Off (Production)</option>
                <option value="semantic">Semantic (Containers)</option>
                <option value="universal">Universal (All)</option>
                <option value="touch">Touch Ergonomics</option>
                <option value="wireframe">Wireframe</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border border-white/10 rounded-3xl p-4 bg-white/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Global Dimensions</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-white/90">Global UI Scale</label>
              <span className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">{state.uiScale.toFixed(2)}x</span>
            </div>
            <input type="range" min="0.5" max="2.0" step="0.05" value={state.uiScale} onChange={(e) => state.setUiScale(parseFloat(e.target.value))} className="w-full accent-amber-400" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-white/90">UI Roundness Radius</label>
              <span className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">{state.uiRadius}px</span>
            </div>
            <input type="range" min="0" max="48" step="2" value={state.uiRadius} onChange={(e) => state.setUiRadius(parseInt(e.target.value, 10))} className="w-full accent-amber-400" />
          </div>
        </div>

        <div className="flex flex-col gap-4 border border-white/10 rounded-3xl p-4 bg-white/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Progression Cards</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-white/90">Step Card Height</label>
              <span className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">{state.stepCardHeight}px</span>
            </div>
            <input type="range" min="44" max="160" step="1" value={state.stepCardHeight} onChange={(e) => state.setStepCardHeight(parseInt(e.target.value, 10))} className="w-full accent-amber-400" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-white/90">Card Stack Gap</label>
              <span className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">{state.cardStackGap}px</span>
            </div>
            <input type="range" min="0" max="32" step="1" value={state.cardStackGap} onChange={(e) => state.setCardStackGap(parseInt(e.target.value, 10))} className="w-full accent-amber-400" />
          </div>
        </div>

        <div className="flex flex-col gap-4 border border-white/10 rounded-3xl p-4 bg-white/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Context Bar</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-white/90">Top Bar Thickness</label>
              <span className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">{state.topBarThickness}px</span>
            </div>
            <input type="range" min="44" max="120" step="4" value={state.topBarThickness} onChange={(e) => state.setTopBarThickness(parseInt(e.target.value, 10))} className="w-full accent-amber-400" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-white/90">Scroll Mask Top Fade</label>
              <span className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">{state.maskTopFade}px</span>
            </div>
            <input type="range" min="0" max="200" step="1" value={state.maskTopFade} onChange={(e) => state.setMaskTopFade(parseInt(e.target.value, 10))} className="w-full accent-amber-400" />
          </div>
        </div>

        <div className="flex flex-col gap-4 border border-white/10 rounded-3xl p-4 bg-white/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Bottom Summary</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-white/90">Scroll Mask Bottom Fade</label>
              <span className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">{state.maskBottomFade}px</span>
            </div>
            <input type="range" min="0" max="300" step="1" value={state.maskBottomFade} onChange={(e) => state.setMaskBottomFade(parseInt(e.target.value, 10))} className="w-full accent-amber-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
