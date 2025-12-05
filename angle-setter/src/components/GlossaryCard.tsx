import * as React from 'react';

type GlossaryItem = {
  term: string;
  description: string;
};

type GlossaryCardProps = {
  title?: string;
  items: GlossaryItem[];
  className?: string;
};

function GlossaryCard({ title = 'Glossary', items, className }: GlossaryCardProps): React.ReactElement {
  return (
    <div
      className={
        'rounded border border-neutral-700 bg-neutral-950/60 p-3 text-[0.75rem] text-neutral-200 ' +
        (className || '')
      }
    >
      <div className="text-neutral-300 font-semibold text-[0.8rem] mb-1">{title}</div>
      <div className="flex flex-col gap-1 text-neutral-300">
        {items.map(item => (
          <div key={item.term} className="flex gap-2">
            <span className="font-mono text-neutral-100 min-w-[3.5rem]">{item.term}</span>
            <span className="text-neutral-300">{item.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GlossaryCard;
