import * as React from 'react';
import { useDevStore } from '../../state/devStore';

export default function DevUIThemeView() {
  const {
    uiScale,
    stepCardHeight,
    cardStackGap,
    pillBottom,
    topBarThickness,
    uiRadius,
    debugLayoutMode,
    setUiScale,
    setStepCardHeight,
    setCardStackGap,
    setPillBottom,
    setTopBarThickness,
    setUiRadius,
    setDebugLayoutMode,
    resetToDefaults,
  } = useDevStore();

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-20 w-full animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="flex flex-col items-center py-4 mb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">UI & Theme Lab</h1>
        <p className="text-sm text-white/50 mt-1">Real-time Layout Configuration</p>
      </div>

      <div className="neu-convex border border-black/40 rounded-3xl p-4 sm:p-5 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Scaling Parameters</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const state = useDevStore.getState();
                const config = {
                  uiScale: state.uiScale,
                  stepCardHeight: state.stepCardHeight,
                  cardStackGap: state.cardStackGap,
                  pillBottom: state.pillBottom,
                  topBarThickness: state.topBarThickness,
                  uiRadius: state.uiRadius,
                };
                navigator.clipboard.writeText(JSON.stringify(config, null, 2));
                alert('Copied dev configuration to clipboard!');
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 active:bg-amber-400/30 text-amber-400 transition-colors"
            >
              Copy to Clipboard
            </button>
            <button
              type="button"
              onClick={resetToDefaults}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/70 hover:text-white transition-colors"
            >
              Reset Defaults
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 mt-2">
          {/* Debug Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="debug-mode" className="text-sm font-semibold text-amber-400">
                Debug Layout Mode
              </label>
              <select
                id="debug-mode"
                value={debugLayoutMode}
                onChange={(e) => setDebugLayoutMode(e.target.value as any)}
                className="w-full bg-black/40 border border-amber-400/20 text-white rounded-xl p-3 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer appearance-none"
              >
                <option value="none">Off (Production Look)</option>
                <option value="semantic">Semantic (Containers & Cards)</option>
                <option value="universal">Universal (All Elements)</option>
                <option value="touch">Touch Ergonomics (Interactive Elements)</option>
                <option value="wireframe">Wireframe (Borders Only)</option>
              </select>
            </div>
            <p className="text-xs text-white/40 leading-snug">
              Applies structural debugging CSS rules across the entire app. Use Semantic to see panel boundaries, Universal to see DOM depth, Touch to evaluate mobile targets, and Wireframe to strip away textures.
            </p>
          </div>

          {/* Global UI Scale */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <label htmlFor="ui-scale" className="text-sm font-semibold text-white/90">
                Global UI Scale <span className="text-white/40 font-normal ml-1">(rem)</span>
              </label>
              <span className="text-amber-400 font-mono font-bold text-sm bg-amber-400/10 px-2 py-0.5 rounded-md">
                {uiScale.toFixed(2)}x
              </span>
            </div>
            <input
              id="ui-scale"
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={uiScale}
              onChange={(e) => setUiScale(parseFloat(e.target.value))}
              className="w-full accent-amber-400"
            />
            <p className="text-xs text-white/40 leading-snug">
              Adjusts the root font-size, proportionally scaling the entire user interface including typography and layout spacing.
            </p>
          </div>

          {/* Step Card Height */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <label htmlFor="card-height" className="text-sm font-semibold text-white/90">
                Step Card Height <span className="text-white/40 font-normal ml-1">(px)</span>
              </label>
              <span className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">
                {stepCardHeight}px
              </span>
            </div>
            <input
              id="card-height"
              type="range"
              min="44"
              max="160"
              step="1"
              value={stepCardHeight}
              onChange={(e) => setStepCardHeight(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400"
            />
            <p className="text-xs text-white/40 leading-snug">
              Overrides <code className="bg-white/10 px-1 rounded">--step-card-height</code>. Default: 88px. Adjusts the vertical footprint of progression steps.
            </p>
          </div>

          {/* Card Stack Gap */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <label htmlFor="card-gap" className="text-sm font-semibold text-white/90">
                Card Stack Gap <span className="text-white/40 font-normal ml-1">(px)</span>
              </label>
              <span className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">
                {cardStackGap}px
              </span>
            </div>
            <input
              id="card-gap"
              type="range"
              min="0"
              max="32"
              step="1"
              value={cardStackGap}
              onChange={(e) => setCardStackGap(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400"
            />
            <p className="text-xs text-white/40 leading-snug">
              Overrides <code className="bg-white/10 px-1 rounded">--card-stack-gap</code>. Default: 12px. Adjusts the vertical spacing between progression steps.
            </p>
          </div>
          
          {/* Pill Bottom Padding */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <label htmlFor="pill-bottom" className="text-sm font-semibold text-white/90">
                Summary Pill Bottom Offset <span className="text-white/40 font-normal ml-1">(px)</span>
              </label>
              <span className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">
                {pillBottom}px
              </span>
            </div>
            <input
              id="pill-bottom"
              type="range"
              min="0"
              max="200"
              step="4"
              value={pillBottom}
              onChange={(e) => setPillBottom(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400"
            />
            <p className="text-xs text-white/40 leading-snug">
              Overrides <code className="bg-white/10 px-1 rounded">--pill-bottom</code>. Default: 72px. Adjusts the clearance from the tab bar for the main global setup pill.
            </p>
          </div>

          {/* Top Bar Thickness */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <label htmlFor="top-bar" className="text-sm font-semibold text-white/90">
                Top Bar Thickness <span className="text-white/40 font-normal ml-1">(px)</span>
              </label>
              <span className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">
                {topBarThickness}px
              </span>
            </div>
            <input
              id="top-bar"
              type="range"
              min="44"
              max="120"
              step="4"
              value={topBarThickness}
              onChange={(e) => setTopBarThickness(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400"
            />
            <p className="text-xs text-white/40 leading-snug">
              Overrides <code className="bg-white/10 px-1 rounded">--top-bar-thickness</code>. Default: 60px. Sets the total vertical footprint of the sticky progression header.
            </p>
          </div>

          {/* UI Radius */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <label htmlFor="ui-radius" className="text-sm font-semibold text-white/90">
                UI Roundness Radius <span className="text-white/40 font-normal ml-1">(px)</span>
              </label>
              <span className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">
                {uiRadius}px
              </span>
            </div>
            <input
              id="ui-radius"
              type="range"
              min="0"
              max="48"
              step="2"
              value={uiRadius}
              onChange={(e) => setUiRadius(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400"
            />
            <p className="text-xs text-white/40 leading-snug">
              Overrides <code className="bg-white/10 px-1 rounded">--ui-radius</code>. Default: 24px. Smooths or sharpens the primary bounding corners of cards and panels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

