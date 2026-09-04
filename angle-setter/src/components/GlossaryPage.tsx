import * as React from 'react';
import GlossaryCard, { type GlossaryItem } from './GlossaryCard';

const GLOSSARY_TERMS: GlossaryItem[] = [
  {
    term: 'hc',
    category: 'Machine Constants',
    description: 'Vertical distance from the grinder casing datum line to the Universal Support Bar (USB) centerline when the jig is horizontal.',
    formula: 'hc (Vertical Datum Constant, mm)',
  },
  {
    term: 'o',
    category: 'Machine Constants',
    description: 'Horizontal offset from the wheel/axle centerline to the Universal Support Bar (USB) centerline.',
    formula: 'o (Horizontal Base Offset, mm)',
  },
  {
    term: 'Da',
    category: 'Machine Constants',
    description: 'Main grinder drive shaft / axle diameter. Standard Tormek drive shaft is 12.0 mm.',
    formula: 'Da = 12.0 mm',
  },
  {
    term: 'Ds',
    category: 'Machine Constants',
    description: 'Universal Support Bar (USB) leg diameter. Standard Tormek USB bar is 12.0 mm.',
    formula: 'Ds = 12.0 mm',
  },
  {
    term: 'hn',
    category: 'Geometry & Setup',
    description: 'Normal height measured from the machine top casing datum line to the top surface of the Universal Support Bar.',
    formula: 'hn = Height to Casing Datum (mm)',
  },
  {
    term: 'hr',
    category: 'Geometry & Setup',
    description: 'Radial height measured directly from the grinding wheel outer circumference to the top surface of the Universal Support Bar.',
    formula: 'hr = Height to Wheel Rim (mm)',
  },
  {
    term: 'A',
    category: 'Geometry & Setup',
    description: 'Projection length measured from the knife jig stop collar to the apex of the blade cutting edge.',
    formula: 'A = Projection Distance (mm)',
  },
  {
    term: 'Pb',
    category: 'Geometry & Setup',
    description: 'Protrusion stick-out measured from jig clamp body to the blade edge using a digital caliper depth rod.',
    formula: 'Pb = Caliper Protrusion (mm)',
  },
  {
    term: 'β (Beta)',
    category: 'Geometry & Setup',
    description: 'Target bevel angle per side (half-angle in degrees, e.g. 15.0° per side for a 30.0° inclusive edge).',
    formula: 'β = Target Bevel Half-Angle (°)',
  },
  {
    term: 'Δβ (Delta Beta)',
    category: 'Geometry & Setup',
    description: 'Micro-bevel angle bump added for progressive sharpening or honing stages.',
    formula: 'Δβ = Step Angle Offset (°)',
  },
  {
    term: 'D',
    category: 'Geometry & Setup',
    description: 'Grinding wheel outer diameter. As wheels are dressed or wear down, diameter decreases.',
    formula: 'D = Wheel Diameter (mm)',
  },
  {
    term: 'Dj',
    category: 'Geometry & Setup',
    description: 'Diameter of the knife sharpening jig clamp collar.',
    formula: 'Dj = Jig Clamp Collar (mm)',
  },
  {
    term: 'ε (Epsilon)',
    category: 'Calibration',
    description: 'Maximum absolute residual error of the non-linear least-squares calibration regression fit (mm).',
    formula: 'ε = max |CA_calc - CA_meas| (mm)',
  },
  {
    term: 'pts',
    category: 'Calibration',
    description: 'Number of distinct height measurement rows used in machine calibration regression solver.',
    formula: 'pts ∈ {3, 4, 5}',
  },
  {
    term: 'Manual input',
    category: 'Calibration',
    description: 'Directly specified machine geometry constants (hc and o) entered without running the calibration regression solver.',
    formula: 'Direct constant override',
  },
  {
    term: 'Edge Leading',
    category: 'Grinding Modes',
    description: 'Grinding into the blade edge (Rear base on standard wet grinder). Provides rapid metal removal with minimal burr.',
    formula: 'Base = Rear (Leading)',
  },
  {
    term: 'Edge Trailing',
    category: 'Grinding Modes',
    description: 'Grinding with wheel rotation away from blade edge (Front base and leather honing wheel). Preferred for fine finishing.',
    formula: 'Base = Front (Trailing)',
  },
];

const CATEGORIES = ['All', 'Machine Constants', 'Geometry & Setup', 'Calibration', 'Grinding Modes'];

function GlossaryPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredTerms = React.useMemo(() => {
    return GLOSSARY_TERMS.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        query === '' ||
        item.term.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.formula && item.formula.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full motion-panel">
      {/* Root Container */}
      <section className="bg-[#262626] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Top Edge Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

        {/* Header */}
        <div className="relative z-10 flex flex-col gap-1 border-b border-white/10 pb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Glossary &amp; Geometric Reference</h2>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-normal">
            Universal Wet Grinder Angle Setter mathematical parameters, machine constants, and geometric definitions.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="relative z-10 flex flex-col gap-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              className="w-full h-12 bg-black/30 border border-white/10 focus:border-amber-400/60 rounded-2xl px-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
              placeholder="Search symbols, constants, or formulas (e.g. hc, projection, beta)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white px-2 py-1 rounded-lg bg-white/5 transition"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all whitespace-nowrap min-h-[38px] cursor-pointer select-none ${
                    isActive
                      ? 'bg-amber-400 text-black shadow-md shadow-amber-950/20'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtered Glossary List */}
        <div className="relative z-10">
          {filteredTerms.length > 0 ? (
            <GlossaryCard items={filteredTerms} title={selectedCategory === 'All' ? 'All Terminology' : selectedCategory} />
          ) : (
            <div className="bg-black/20 border border-dashed border-white/10 rounded-2xl p-8 text-center flex flex-col items-center gap-2">
              <span className="text-2xl">🔍</span>
              <p className="text-sm font-semibold text-white">No matching terms found</p>
              <p className="text-xs text-white/40">Try searching for a different symbol or clear your filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Schematic Technical Diagram Callout */}
        <div className="relative z-10 bg-black/30 rounded-3xl border border-white/10 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>📐 Machine Geometry Schematic</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 uppercase">
                Vector Model
              </span>
            </h3>
            <span className="text-xs text-white/40 font-mono">Tormek Pure Math Model</span>
          </div>

          <p className="text-xs text-white/70 leading-relaxed font-normal">
            The mathematical model relates the grinding wheel radius (R = D/2), machine vertical datum constant (hc), horizontal base offset (o), Universal Support Bar height (hn or hr), and knife projection distance (A) to solve for the exact bevel angle (β).
          </p>

          {/* SVG Diagram */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-center overflow-x-auto">
            <svg viewBox="0 0 520 260" className="w-full max-w-lg text-white/90 select-none" aria-label="UWGAS Geometry Schematic">
              {/* Grid Lines */}
              <defs>
                <pattern id="diagGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="520" height="260" fill="url(#diagGrid)" rx="12" />

              {/* Machine Datum Line */}
              <line x1="40" y1="190" x2="480" y2="190" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="50" y="206" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace" fontWeight="bold">MACHINE DATUM (hc reference)</text>

              {/* Grinder Wheel */}
              <circle cx="170" cy="130" r="85" fill="none" stroke="#52525b" strokeWidth="2.5" />
              <circle cx="170" cy="130" r="14" fill="#27272a" stroke="#71717a" strokeWidth="1.5" />
              {/* Wheel Diameter Label */}
              <text x="170" y="134" fill="#a1a1aa" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Dₐ Axle</text>
              <text x="170" y="70" fill="#f59e0b" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Wheel (D)</text>

              {/* USB Rear Base (Sky Blue) */}
              <circle cx="280" cy="80" r="10" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="2" />
              <text x="280" y="62" fill="#38bdf8" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">USB (Ds)</text>

              {/* Height Vector hn / hc */}
              <line x1="330" y1="190" x2="330" y2="80" stroke="#f59e0b" strokeWidth="1.5" />
              <polygon points="330,75 326,85 334,85" fill="#f59e0b" />
              <polygon points="330,195 326,185 334,185" fill="#f59e0b" />
              <text x="340" y="140" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">hₙ (Height)</text>

              {/* Offset Vector o */}
              <line x1="170" y1="230" x2="280" y2="230" stroke="#38bdf8" strokeWidth="1.5" />
              <polygon points="165,230 175,226 175,234" fill="#38bdf8" />
              <polygon points="285,230 275,226 275,234" fill="#38bdf8" />
              <text x="225" y="246" fill="#38bdf8" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">o (Offset)</text>

              {/* Knife Blade & Projection */}
              <line x1="280" y1="80" x2="210" y2="72" stroke="#e4e4e7" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="210" cy="72" r="3" fill="#f59e0b" />
              <text x="245" y="68" fill="#e4e4e7" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Projection (A)</text>
              <text x="188" y="55" fill="#f59e0b" fontSize="12" fontFamily="monospace" fontWeight="bold">β Angle</text>
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
}

export default GlossaryPage;
