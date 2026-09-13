import * as React from 'react';
import { IconChevronRight } from '../../icons';
import { useUIStore } from '../../state/uiStore';

export default function DevRootView() {
  const setSettingsView = useUIStore((s) => s.setSettingsView);

  const sections: { id: 'dev-ui' | 'dev-interaction' | 'dev-state'; label: string; desc: string }[] = [
    { id: 'dev-ui', label: 'UI & Theme Lab', desc: 'Scaling sliders, layout testing' },
    { id: 'dev-interaction', label: 'Setup Interaction Style', desc: 'Toggle between drawer, modal, and accordion styles' },
    { id: 'dev-state', label: 'State & Storage Tools', desc: 'State injection, console logs, nuke' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-20 w-full animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="flex flex-col items-center py-4 mb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">Developer Suite</h1>
        <p className="text-sm text-white/50 mt-1">Advanced Diagnostics & Prototyping</p>
      </div>

      <div className="neu-convex rounded-3xl border border-amber-400/20 shadow-lg relative flex flex-col overflow-hidden">
        {/* Subtle Top Edge Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-400/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

        {sections.map((sec, i) => (
          <button
            key={sec.id}
            type="button"
            className={`group relative z-10 flex items-center justify-between p-4 sm:p-5 text-left hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer ${
              i < sections.length - 1 ? 'border-b border-white/5' : ''
            }`}
            onClick={() => setSettingsView(sec.id)}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-semibold text-amber-400/90 tracking-wide group-hover:text-amber-400 transition-colors">
                {sec.label}
              </span>
              <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
                {sec.desc}
              </span>
            </div>
            <IconChevronRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

