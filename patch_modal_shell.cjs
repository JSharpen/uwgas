const fs = require('fs');
let code = fs.readFileSync('src/components/ModalShell.tsx', 'utf8');

// 1. Remove IconClose import
code = code.replace("import { IconClose } from '../icons';\n", "");

// 2. Add isPopping variable outside the component
code = code.replace(
  "export type ModalShellProps",
  "let isPopping = false;\n\nexport type ModalShellProps"
);

// 3. Add popstate hook inside ModalShell
const popstateHook = `  // Handle native escape key
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  // Handle swipe-back (popstate)
  React.useEffect(() => {
    if (closing) return;
    
    window.history.pushState({ modal: true }, '');
    
    const handlePopState = () => {
      isPopping = true;
      onClose();
      setTimeout(() => { isPopping = false; }, 100);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal && !isPopping) {
        window.history.back();
      }
    };
  }, [closing, onClose]);`;

code = code.replace(
  /\/\/ Handle native escape key[\s\S]*?\}, \[onClose\]\);/,
  popstateHook
);

// 4. Add onClick to dialog
code = code.replace(
  /<dialog\n\s*ref=\{dialogRef\}/,
  `<dialog\n      ref={dialogRef}\n      onClick={(e) => {\n        if (e.target === dialogRef.current) onClose();\n      }}`
);

// 5. Remove X button from header
const headerRegex = /<div className="relative z-10 flex items-start justify-between gap-4 pb-4 border-b border-white\/5 mb-4">[\s\S]*?<\/button>\n\s*<\/div>/;
const newHeader = `<div className="relative z-10 flex flex-col gap-1 pb-4 border-b border-white/5 mb-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">{title}</h3>
          {hasSubtitle ? <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-normal">{subtitle}</p> : null}
        </div>`;

code = code.replace(headerRegex, newHeader);

fs.writeFileSync('src/components/ModalShell.tsx', code);
console.log("Patched ModalShell!");
