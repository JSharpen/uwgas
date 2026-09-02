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
    <div className="flex flex-col gap-4 pb-20">
      <div className="flex flex-col items-center py-4 mb-2">
        <h1 className="text-xl font-bold u-text tracking-wide">Settings</h1>
        <div className="text-xs text-neutral-500 font-mono mt-1">
          v{APP_VERSION_DISPLAY} (Build {APP_VERSION})
        </div>
      </div>

      <div className="panel-card panel-card--strong flex flex-col overflow-hidden mx-1 shadow-md">
        {sections.map((sec, i) => (
          <button
            key={sec.id}
            type="button"
            className={`flex items-center justify-between p-4 text-left hover:bg-white/5 active:bg-white/10 transition-colors ${
              i < sections.length - 1 ? 'border-b u-border border-neutral-800/50' : ''
            }`}
            onClick={() => onSelectSection(sec.id)}
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium u-text">{sec.label}</span>
              <span className="text-[11px] text-neutral-500 mt-0.5">{sec.desc}</span>
            </div>
            <IconChevronRight className="w-5 h-5 text-neutral-600" />
          </button>
        ))}
      </div>
    </div>
  );
}

