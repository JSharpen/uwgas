import * as React from 'react';

export type GlossaryItem = {
  term: string;
  description: string;
  category?: string;
  formula?: string;
};

export type GlossaryCardProps = {
  title?: string;
  items: GlossaryItem[];
  className?: string;
};

function GlossaryCard({ title = 'Glossary', items, className }: GlossaryCardProps): React.ReactElement {
  return (
    <div
      className={
        'bg-[#262626] rounded-3xl border border-white/10 shadow-lg p-6 relative overflow-hidden flex flex-col gap-4 ' +
        (className || '')
      }
    >
      {/* Top Edge Highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

      {title && (
        <div className="text-base sm:text-lg font-bold text-white tracking-wide relative z-10 flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-mono text-white/40 font-normal">{items.length} {items.length === 1 ? 'entry' : 'entries'}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 relative z-10">
        {items.map((item, idx) => (
          <div
            key={item.term}
            className="bg-black/20 hover:bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 transition-colors motion-list-item"
            style={{ '--motion-order': idx } as React.CSSProperties}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-amber-400 text-base tracking-tight">{item.term}</span>
              </div>
              {item.category && (
                <span className="rounded-full text-[10px] font-bold px-2.5 py-0.5 bg-amber-400/15 text-amber-300 border border-amber-400/20 uppercase tracking-wider">
                  {item.category}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
              {item.description}
            </p>

            {item.formula && (
              <div className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 font-mono text-amber-300 text-xs tracking-wide self-start mt-1">
                {item.formula}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GlossaryCard;
