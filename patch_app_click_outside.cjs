const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const hookCode = `  // Global click-outside to collapse panels
  React.useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent | MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      // If clicking inside a card, drawer, or action sheet, don't collapse.
      // We look for common container classes or explicit interactables.
      const isInteractive = target.closest('.bg-\\[\\#262626\\], .bg-neutral-900, .action-sheet, button, input, select');
      if (!isInteractive) {
        setIsSetupPanelOpen(false);
        window.dispatchEvent(new CustomEvent('collapseAll'));
      }
    };
    
    // Use pointerdown so it fires before click (which might be intercepted by scroll)
    document.addEventListener('pointerdown', handleGlobalPointerDown);
    return () => document.removeEventListener('pointerdown', handleGlobalPointerDown);
  }, []);

  const [isWheelConfigOpen,`;

code = code.replace('  const [isWheelConfigOpen,', hookCode);

fs.writeFileSync('src/App.tsx', code);
