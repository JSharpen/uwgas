const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');

const returnRegex = /  return \([\s\S]*?\);\n\}/;

const newReturn = `  return (
    <>
      {/* Invisible spacer to reserve layout flow space since header is fixed */}
      <div className="w-full shrink-0" style={{ height: \`calc(\${headerActualHeight}px + var(--card-stack-gap, 12px) - 1rem)\` }} />
      <header ref={headerRef} className="touch-none fixed top-3 sm:top-4 left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-50 bg-[#09090b] border border-amber-500/30 ring-1 ring-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.15)] rounded-3xl transition-all duration-300 mx-auto overflow-hidden" style={{ minHeight: 'var(--top-bar-thickness, 60px)' }}>
        
        <AnimatePresence initial={false}>
          <motion.div
            key={stateKey}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="absolute inset-0 w-full h-full flex items-center justify-between px-2"
          >
            {leftSlot}
            {centerSlot}
            {rightSlot}
          </motion.div>
        </AnimatePresence>

        {/* Preset Menu Popover anchors to this header */}
        <PresetMenuPopover />
      </header>
    </>
  );
}`;

code = code.replace(returnRegex, newReturn);
fs.writeFileSync('src/components/layout/ContextBar.tsx', code);
console.log("Fixed context bar render logic!");
