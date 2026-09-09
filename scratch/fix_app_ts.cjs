const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Remove the injected code from the top
appCode = appCode.replace(`export default function App() {
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
  }, [view]); // Re-run if view changes`, "export default function App() {");

// Inject it after view is declared
appCode = appCode.replace(
  "const [view, setView] = React.useState<'calculator' | 'wheels' | 'settings'>('calculator');",
  `const [view, setView] = React.useState<'calculator' | 'wheels' | 'settings'>('calculator');
  const headerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        document.documentElement.style.setProperty('--progression-header-bottom', \`\${rect.bottom}px\`);
      }
    });
    observer.observe(headerRef.current);
    const rect = headerRef.current.getBoundingClientRect();
    document.documentElement.style.setProperty('--progression-header-bottom', \`\${rect.bottom}px\`);
    return () => observer.disconnect();
  }, [view]);`
);

fs.writeFileSync('src/App.tsx', appCode);
