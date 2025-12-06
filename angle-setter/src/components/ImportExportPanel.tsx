import * as React from 'react';

type ImportExportResult = { error?: string; summary?: string };
type ImportSectionKey =
  | 'global'
  | 'constants'
  | 'wheels'
  | 'sessionSteps'
  | 'sessionPresets'
  | 'heightMode'
  | 'calibSnapshots'
  | 'calibAppliedIds';

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
  calibSnapshots: 'Calibrations',
  calibAppliedIds: 'Applied calibration refs',
};

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
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleDownload = () => {
    const blob = new Blob([exportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uwgas-export.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Downloaded export JSON.');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

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

  const allChecked = Object.values(exportSections).every(Boolean);
  const anyChecked = Object.values(exportSections).some(Boolean);
  const allImportChecked = Object.values(importSections).every(Boolean);

  return (
    <section className="border u-border rounded-lg p-3 u-surface flex flex-col gap-3 max-w-xl motion-panel">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold u-text panel-header">Import / Export</h2>
        <button
          type="button"
          className="px-2 py-1 rounded border u-border u-surface text-xs u-text"
          onClick={handleUploadClick}
        >
          Upload JSON
        </button>
      </div>
      <div className="flex flex-col gap-2 text-xs">
        <span className="u-text-muted">Export (JSON file):</span>
        <div className="rounded border u-border u-surface p-2 flex flex-col gap-2 motion-card">
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] u-text">Include in export</span>
            <button
              type="button"
              className="px-2 py-1 rounded border u-border u-surface text-[0.7rem] u-text"
              onClick={() => {
                const next = !allChecked;
                (Object.keys(exportSections) as ImportSectionKey[]).forEach(k => {
                  if (exportSections[k] !== next) {
                    onToggleExportSection(k);
                  }
                });
                setStatus(next ? 'All sections selected.' : 'All sections toggled off.');
              }}
            >
              {allChecked ? 'Uncheck all' : 'Check all'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {(Object.keys(SECTION_LABELS) as ImportSectionKey[]).map(key => {
              const checked = exportSections[key];
              return (
                <label
                  key={key}
                  className="flex items-center gap-2 rounded px-2 py-1 hover:bg-accent-tint cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={checked}
                    onChange={() => onToggleExportSection(key)}
                  />
                  <span className="u-text">{SECTION_LABELS[key] || key}</span>
                </label>
              );
            })}
          </div>
          {!anyChecked && (
            <div className="text-warning text-[0.7rem]">
              Warning: nothing selected - export will only include version metadata.
            </div>
          )}
        </div>
        <div className="rounded border u-border u-surface p-2 flex flex-col gap-2 motion-card">
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] u-text">Apply on import</span>
            <button
              type="button"
              className="px-2 py-1 rounded border u-border u-surface text-[0.7rem] u-text"
              onClick={() => {
                const next = !allImportChecked;
                (Object.keys(importSections) as ImportSectionKey[]).forEach(k => {
                  if (importSections[k] !== next) {
                    onToggleImportSection(k);
                  }
                });
                setStatus(next ? 'All import sections selected.' : 'All import sections toggled off.');
              }}
            >
              {allImportChecked ? 'Uncheck all' : 'Check all'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {(Object.keys(SECTION_LABELS) as ImportSectionKey[]).map(key => {
              const checked = importSections[key];
              const mode = importModes[key] || 'merge';
              return (
                <div
                  key={key}
                  className="flex flex-col gap-1 rounded px-2 py-1 hover:bg-accent-tint"
                >
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-accent"
                      checked={checked}
                      onChange={() => onToggleImportSection(key)}
                    />
                    <span className="u-text">{SECTION_LABELS[key] || key}</span>
                  </label>
                  <div className="flex items-center gap-2 pl-6 text-[0.7rem] u-text-muted">
                    <span>Mode:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        className="accent-accent"
                        checked={mode === 'merge'}
                        onChange={() => onChangeImportMode(key, 'merge')}
                      />
                      <span>Merge (safe)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        className="accent-amber-500"
                        checked={mode === 'overwrite'}
                        onChange={() => onChangeImportMode(key, 'overwrite')}
                      />
                      <span>Overwrite</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
          {!Object.values(importSections).some(Boolean) && (
            <div className="text-warning text-[0.7rem]">
              Warning: no sections selected for import - importing will only update version metadata.
            </div>
          )}
        </div>
        <textarea
          className="w-full h-28 rounded border u-border u-surface px-2 py-1 font-mono text-[0.75rem] u-text"
          value={exportText}
          readOnly
        />
        <div className="flex items-center justify-between">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="px-2 py-1 rounded border border-accent bg-accent-tint hover:bg-neutral-900 text-accent"
            onClick={handleDownload}
          >
            Download JSON
          </button>
        </div>
        {status && <div className="text-[0.75rem] text-warning-soft">{status}</div>}
      </div>
    </section>
  );
}

export default ImportExportPanel;
