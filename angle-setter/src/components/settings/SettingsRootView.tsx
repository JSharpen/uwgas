import * as React from 'react';
import { IconChevronRight } from '../../icons';
import { APP_VERSION, APP_VERSION_DISPLAY } from '../../version';

export type SettingsSection = 'machine' | 'hardware' | 'measurement' | 'import' | 'glossary';

type Props = {
  onSelectSection: (section: SettingsSection) => void;
};

export default function SettingsRootView({ onSelectSection }: Props) {
  const sections: { id: SettingsSection; label: string; desc: string }[] = [
    { id: 'machine', label: 'Machines', desc: 'Profiles, constants, and calibration' },
    { id: 'hardware', label: 'Hardware', desc: 'Jigs and Universal Support Bars' },
    { id: 'measurement', label: 'Measurement', desc: 'Calculation & measurement modes' },
    { id: 'import', label: 'Import / Export', desc: 'Backup and restore data' },
    { id: 'glossary', label: 'Glossary', desc: 'Terminology and formulas' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-20 w-full">
      <div className="flex flex-col items-center py-4 mb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <div className="text-xs text-white/40 font-mono mt-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          v{APP_VERSION_DISPLAY} (Build {APP_VERSION})
        </div>
      </div>

      <div className="bg-[#262626] rounded-3xl border border-white/10 shadow-lg relative flex flex-col overflow-hidden">
        {/* Subtle Top Edge Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

        {sections.map((sec, i) => (
          <button
            key={sec.id}
            type="button"
            className={`group relative z-10 flex items-center justify-between p-5 text-left hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer ${
              i < sections.length - 1 ? 'border-b border-white/5' : ''
            }`}
            onClick={() => onSelectSection(sec.id)}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-semibold text-white tracking-wide group-hover:text-white transition-colors">
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


