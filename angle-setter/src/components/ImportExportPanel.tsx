import * as React from 'react';

type ImportExportPanelProps = {
  exportText: string;
  onImportText: (raw: string) => string | null;
};

function ImportExportPanel({ exportText, onImportText }: ImportExportPanelProps) {
  const [importText, setImportText] = React.useState('');
  const [status, setStatus] = React.useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(exportText)
      .then(() => setStatus('Export copied to clipboard.'))
      .catch(() => setStatus('Could not copy to clipboard.'));
  };

  const handleImport = () => {
    const err = onImportText(importText);
    if (err) {
      setStatus(err);
      return;
    }
    setStatus('Import applied.');
  };

  return (
    <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/30 flex flex-col gap-3 max-w-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-200">Import / Export</h2>
        <button
          type="button"
          className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-200"
          onClick={handleCopy}
        >
          Copy export
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="flex flex-col gap-2">
          <span className="text-neutral-300">Export (read-only JSON):</span>
          <textarea
            className="w-full h-32 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 font-mono text-[0.75rem] text-neutral-200"
            value={exportText}
            readOnly
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-neutral-300">Import (paste JSON):</span>
          <textarea
            className="w-full h-32 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 font-mono text-[0.75rem] text-neutral-200"
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder="Paste exported JSON here"
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="px-2 py-1 rounded border border-emerald-500 bg-emerald-900/40 hover:bg-emerald-900 text-emerald-50"
              onClick={handleImport}
            >
              Import state
            </button>
          </div>
        </div>
      </div>
      {status && <div className="text-[0.75rem] text-amber-200">{status}</div>}
    </section>
  );
}

export default ImportExportPanel;
