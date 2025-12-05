import * as React from 'react';
import GlossaryCard from './GlossaryCard';

function GlossaryPage(): React.ReactElement {
  const terms = [
    { term: 'hc', description: 'Vertical distance from datum to USB when jig is horizontal.' },
    { term: 'o', description: 'Horizontal offset from datum to USB centerline.' },
    { term: 'ε', description: 'Max absolute residual of the calibration fit (mm).' },
    { term: 'pts', description: 'Number of measurement rows used in that calibration.' },
    { term: 'Manual input', description: 'Use typed constants instead of a saved calibration.' },
  ];

  return (
    <section className="border border-neutral-700 rounded-lg p-3 bg-neutral-900/30 flex flex-col gap-3 max-w-3xl motion-panel">
      <div>
        <h2 className="text-sm font-semibold text-neutral-200">Glossary & diagrams</h2>
        <p className="text-xs text-neutral-300">
          Symbols and terms used throughout the app. (Space reserved for diagrams and formulas.)
        </p>
      </div>
      <GlossaryCard items={terms} />
      <div className="rounded border border-dashed border-neutral-700 bg-neutral-950/40 p-4 text-xs text-neutral-400 motion-card">
        Diagram placeholder: add schematic of bases, hc/o vectors, and measurement references.
      </div>
    </section>
  );
}

export default GlossaryPage;
