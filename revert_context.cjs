const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');

// Remove import
code = code.replace("import { motion, AnimatePresence } from 'framer-motion';\n", "");

// Restore header and slots
const replaceRegex = /const stateKey =[\s\S]*?<\/header>/;

const replacement = `return (
    <>
      {/* Invisible spacer to reserve layout flow space since header is fixed */}
      <div className="w-full shrink-0" style={{ height: \`calc(\${headerActualHeight}px + var(--card-stack-gap, 12px) - 1rem)\` }} />
      <header ref={headerRef} className="touch-none fixed top-3 sm:top-4 left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-50 flex items-center justify-between px-2 py-2 bg-[#09090b] border border-amber-500/30 ring-1 ring-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.15)] rounded-3xl transition-all duration-300 mx-auto" style={{ minHeight: 'var(--top-bar-thickness, 60px)' } as React.CSSProperties}>

      {leftSlot}
      {centerSlot}
      {rightSlot}
      
      {/* Preset Menu Popover anchors to this header */}
      <PresetMenuPopover />
    </header>`;

code = code.replace(replaceRegex, replacement);
fs.writeFileSync('src/components/layout/ContextBar.tsx', code);
console.log("Reverted ContextBar to instant snapping!");
