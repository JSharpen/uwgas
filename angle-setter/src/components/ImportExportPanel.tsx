import * as React from 'react';

type ImportExportResult = { error?: string; summary?: string };
type ImportSectionKey =
  | 'global'
  | 'constants'
  | 'wheels'
  | 'sessionSteps'
  | 'sessionPresets'
  | 'heightMode';

type ImportExportPanelProps = {
  exportText: string;
  onImportText: (raw: string) => ImportExportResult;
  exportSections: Record<ImportSectionKey, boolean>;
  onToggleExportSection: (key: ImportSectionKey) => void;
  importSections: Record<ImportSectionKey, boolean>;
  importModes: Record<ImportSectionKey, 'merge' | 'overwrite'>;
  onToggleImportSection: (key: ImportSectionKey) => void;
  onChangeImportMode: (key: ImportSectionKey, mode: 'merge' | 'overwrite') => void;
};

const SECTION_LABELS: Record<ImportSectionKey, string> = {
  global: 'Global settings',
  constants: 'Machine constants',
  wheels: 'Wheels',
  sessionSteps: 'Current progression steps',
  sessionPresets: 'Saved progression presets',
  heightMode: 'Height mode',
};

function CollapseToggle({
  open,
  onToggle,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/60 hover:text-white transition cursor-pointer"
      aria-expanded={open}
      aria-label={label}
      onClick={onToggle}
    >
      <svg
        viewBox="0 0 24 24"
        className={'w-4 h-4 transition-transform ' + (open ? 'rotate-180' : 'rotate-0')}
        aria-hidden="true"
      >
        <path
          d="M7 10l5 5 5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function ImportPanel({
  onImportText,
  importSections,
  importModes,
  onToggleImportSection,
  onChangeImportMode,
  setStatus,
}: {
  onImportText: (raw: string) => ImportExportResult;
  importSections: Record<ImportSectionKey, boolean>;
  importModes: Record<ImportSectionKey, 'merge' | 'overwrite'>;
  onToggleImportSection: (key: ImportSectionKey) => void;
  onChangeImportMode: (key: ImportSectionKey, mode: 'merge' | 'overwrite') => void;
  setStatus: (msg: string | null) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const allImportChecked = Object.values(importSections).every(Boolean);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const raw = String(evt.target?.result ?? '');
      const { error, summary } = onImportText(raw);
      setStatus(error || summary || 'Import applied from file.');
    };
    reader.onerror = () => setStatus('Import failed: could not read file.');
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <section className="bg-[#262626] rounded-3xl border border-white/10 shadow-lg relative flex flex-col overflow-hidden">
      {/* Subtle Top Edge Highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

      <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/5">
        <h2 className="text-lg font-bold text-white tracking-wide">Import Data</h2>
        <CollapseToggle
          open={open}
          onToggle={() => setOpen(v => !v)}
          label={open ? 'Collapse import' : 'Expand import'}
        />
      </div>

      {open && (
        <div className="relative z-10 p-6 flex flex-col gap-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Sections</span>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition cursor-pointer"
              onClick={() => {
                const next = !allImportChecked;
                (Object.keys(importSections) as ImportSectionKey[]).forEach(k => {
                  if (importSections[k] !== next) onToggleImportSection(k);
                });
                setStatus(next ? 'All import sections selected.' : 'All import sections toggled off.');
              }}
            >
              {allImportChecked ? 'Uncheck all' : 'Check all'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(SECTION_LABELS) as ImportSectionKey[]).map(key => {
              const checked = importSections[key];
              const mode = importModes[key] || 'merge';
              return (
                <div key={key} className="bg-black/20 hover:bg-black/30 border border-white/5 hover:border-white/10 rounded-2xl p-3.5 flex flex-col gap-2 transition-all">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-[var(--color-accent)] w-4 h-4 rounded cursor-pointer"
                      checked={checked}
                      onChange={() => onToggleImportSection(key)}
                    />
                    <span className="text-sm font-semibold text-white">{SECTION_LABELS[key] || key}</span>
                  </label>
                  <div className="flex items-center gap-3 pl-6 text-xs text-white/50">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Mode:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`import-mode-${key}`}
                        className="accent-[var(--color-accent)]"
                        checked={mode === 'merge'}
                        onChange={() => onChangeImportMode(key, 'merge')}
                      />
                      <span>Merge (safe)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`import-mode-${key}`}
                        className="accent-amber-500"
                        checked={mode === 'overwrite'}
                        onChange={() => onChangeImportMode(key, 'overwrite')}
                      />
                      <span className="text-amber-400">Overwrite</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {!Object.values(importSections).some(Boolean) && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-3 text-xs">
              Warning: no sections selected - importing will only update version metadata.
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="px-5 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose JSON to import
            </button>
            <span className="text-xs text-white/40">Upload & apply selected sections</span>
          </div>
        </div>
      )}
    </section>
  );
}

function ExportPanel({
  exportText,
  exportSections,
  onToggleExportSection,
  onDownload,
  setStatus,
}: {
  exportText: string;
  exportSections: Record<ImportSectionKey, boolean>;
  onToggleExportSection: (key: ImportSectionKey) => void;
  onDownload: () => void;
  setStatus: (msg: string | null) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const allChecked = Object.values(exportSections).every(Boolean);
  const anyChecked = Object.values(exportSections).some(Boolean);

  return (
    <section className="bg-[#262626] rounded-3xl border border-white/10 shadow-lg relative flex flex-col overflow-hidden">
      {/* Subtle Top Edge Highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

      <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/5">
        <h2 className="text-lg font-bold text-white tracking-wide">Export Data</h2>
        <CollapseToggle
          open={open}
          onToggle={() => setOpen(v => !v)}
          label={open ? 'Collapse export' : 'Expand export'}
        />
      </div>

      {open && (
        <div className="relative z-10 p-6 flex flex-col gap-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Sections</span>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition cursor-pointer"
              onClick={() => {
                const next = !allChecked;
                (Object.keys(exportSections) as ImportSectionKey[]).forEach(k => {
                  if (exportSections[k] !== next) onToggleExportSection(k);
                });
                setStatus(next ? 'All sections selected.' : 'All sections toggled off.');
              }}
            >
              {allChecked ? 'Uncheck all' : 'Check all'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(SECTION_LABELS) as ImportSectionKey[]).map(key => {
              const checked = exportSections[key];
              return (
                <label
                  key={key}
                  className="bg-black/20 hover:bg-black/30 border border-white/5 hover:border-white/10 rounded-2xl p-3.5 flex items-center gap-2.5 cursor-pointer select-none transition-all"
                >
                  <input
                    type="checkbox"
                    className="accent-[var(--color-accent)] w-4 h-4 rounded cursor-pointer"
                    checked={checked}
                    onChange={() => onToggleExportSection(key)}
                  />
                  <span className="text-sm font-semibold text-white">{SECTION_LABELS[key] || key}</span>
                </label>
              );
            })}
          </div>

          {!anyChecked && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-3 text-xs">
              Warning: nothing selected - export will only include version metadata.
            </div>
          )}

          <textarea
            className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-xs text-white/90 focus:border-[var(--color-accent)] outline-none resize-y"
            value={exportText}
            readOnly
          />

          <button
            type="button"
            className="px-6 h-11 bg-[var(--color-accent)] hover:brightness-110 text-neutral-950 font-bold text-xs uppercase tracking-wide rounded-2xl shadow-lg transition self-start flex items-center justify-center cursor-pointer"
            onClick={onDownload}
          >
            Download JSON
          </button>
        </div>
      )}
    </section>
  );
}

function ImportExportPanel({
  exportText,
  onImportText,
  exportSections,
  onToggleExportSection,
  importSections,
  importModes,
  onToggleImportSection,
  onChangeImportMode,
}: ImportExportPanelProps) {
  const [status, setStatus] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-20 w-full">
      <ImportPanel
        onImportText={onImportText}
        importSections={importSections}
        importModes={importModes}
        onToggleImportSection={onToggleImportSection}
        onChangeImportMode={onChangeImportMode}
        setStatus={setStatus}
      />

      <ExportPanel
        exportText={exportText}
        exportSections={exportSections}
        onToggleExportSection={onToggleExportSection}
        onDownload={() => {
          const blob = new Blob([exportText], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'uwgas-export.json';
          a.click();
          URL.revokeObjectURL(url);
          setStatus('Downloaded export JSON.');
        }}
        setStatus={setStatus}
      />

      {status && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl p-4 text-xs font-medium flex items-center gap-2">
          {status}
        </div>
      )}
    </div>
  );
}

export default ImportExportPanel;

