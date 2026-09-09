const fs = require('fs');

// --- 1. Patch App.tsx ---
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Add useRef and useEffect imports if not present (React is already imported as React)
// Find the component start
appCode = appCode.replace(
  "export default function App() {",
  `export default function App() {
  const headerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        // Update a global CSS variable with the bottom coordinate of the header
        document.documentElement.style.setProperty('--progression-header-bottom', \`\${rect.bottom}px\`);
      }
    });
    observer.observe(headerRef.current);
    // Initial set
    const rect = headerRef.current.getBoundingClientRect();
    document.documentElement.style.setProperty('--progression-header-bottom', \`\${rect.bottom}px\`);
    
    return () => observer.disconnect();
  }, [view]); // Re-run if view changes
`
);

// Add the ref to the Progression Header
appCode = appCode.replace(
  '<div className="sticky top-2 z-20 flex items-center justify-between mb-4 px-2 py-2 bg-[#262626]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300">',
  '<div ref={headerRef} className="sticky top-2 z-20 flex items-center justify-between mb-4 px-2 py-2 bg-[#262626]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300">'
);

// Turn Dev Badge into a watermark
appCode = appCode.replace(
  '<div className="self-start px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-mono font-bold text-amber-400">',
  '<div className="fixed top-1 left-1 opacity-40 pointer-events-none z-[100] px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[9px] font-mono font-bold text-amber-400">'
);

fs.writeFileSync('src/App.tsx', appCode);

// --- 2. Patch GlobalSetupCard.tsx ---
let cardCode = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8');

// Replace the hardcoded 220px math with the CSS variable
// The total subtraction is: bottom tab bar (72px) + desired gap (20px) = 92px.
// So max-h is calc(100dvh - var(--progression-header-bottom, 66px) - 92px)
cardCode = cardCode.replace(
  'max-h-[calc(100dvh-220px)]',
  'max-h-[calc(100dvh-var(--progression-header-bottom,66px)-92px)]'
);

// Also need to use style tag since Tailwind compiler won't parse arbitrary CSS vars dynamically like this if it's too complex, wait.
// Actually, Tailwind arbitrary values `max-h-[calc(...)]` support CSS variables perfectly!
// Let's just use it.

fs.writeFileSync('src/components/calculator/GlobalSetupCard.tsx', cardCode);
