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

  return (
    <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/30 flex flex-col gap-3 max-w-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-200">Import / Export</h2>
        <button
          type="button"
          className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-200"
          onClick={handleUploadClick}
        >
          Upload JSON
        </button>
      </div>
      <div className="flex flex-col gap-2 text-xs">
        <span className="text-neutral-300">Export (JSON file):</span>
        <div className="rounded border border-neutral-700 bg-neutral-950/60 p-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] text-neutral-200">Include in export</span>
            <button
              type="button"
              className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-[0.7rem] text-neutral-100"
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
                  className="flex items-center gap-2 rounded px-2 py-1 hover:bg-neutral-900 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    className="accent-emerald-500"
                    checked={checked}
                    onChange={() => onToggleExportSection(key)}
                  />
                  <span className="text-neutral-200">{SECTION_LABELS[key] || key}</span>
                </label>
              );
            })}
          </div>
          {!anyChecked && (
            <div className="text-amber-200 text-[0.7rem]">
              Warning: nothing selected — export will only include version metadata.
            </div>
          )}
        </div>
        <textarea
          className="w-full h-28 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 font-mono text-[0.75rem] text-neutral-200"
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
            className="px-2 py-1 rounded border border-emerald-500 bg-emerald-900/40 hover:bg-emerald-900 text-emerald-50"
            onClick={handleDownload}
          >
            Download JSON
          </button>
        </div>
        {status && <div className="text-[0.75rem] text-amber-200">{status}</div>}
      </div>
    </section>
  );
}

export default ImportExportPanel;
