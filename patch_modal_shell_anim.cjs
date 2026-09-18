const fs = require('fs');
let code = fs.readFileSync('src/components/ModalShell.tsx', 'utf8');

// 1. Add isClosingLocal state
const shellSignature = `export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
  overlayStyle,
  dialogStyle,
  closing = false,
}: ModalShellProps) {
  const [isClosingLocal, setIsClosingLocal] = React.useState(false);
  const isClosing = closing || isClosingLocal;
  
  const handleClose = React.useCallback(() => {
    if (isClosingLocal) return;
    setIsClosingLocal(true);
    setTimeout(() => {
      onClose();
    }, 200);
  }, [isClosingLocal, onClose]);`;

code = code.replace(/export function ModalShell\(\{[\s\S]*?closing = false,\n\}: ModalShellProps\) \{/, shellSignature);

// 2. Replace onClose with handleClose
// In the native escape key useEffect:
code = code.replace(/onClose\(\);\n    \};\n    dialog\.addEventListener\('cancel', handleCancel\);/, `handleClose();\n    };\n    dialog.addEventListener('cancel', handleCancel);`);

// 3. Replace onClose with handleClose in the onClick
code = code.replace(/onClick=\{\(e\) => \{\n        if \(e\.target === dialogRef\.current\) onClose\(\);\n      \}\}/, `onClick={(e) => {\n        if (e.target === dialogRef.current) handleClose();\n      }}`);

// 4. Update the effect dependencies that previously had [closing]
code = code.replace(/if \(dialog && !dialog\.open && !closing\) \{/, `if (dialog && !dialog.open && !isClosing) {`);
code = code.replace(/\}, \[closing\]\);/, `}, [isClosing]);`);

// 5. Update the CSS class conditionals from (closing ? ...) to (isClosing ? ...)
code = code.replace(/\(closing \? 'motion-overlay--closing ' : ''\)/, `(isClosing ? 'motion-overlay--closing ' : '')`);
code = code.replace(/\(closing \? 'motion-dialog--closing' : ''\)/, `(isClosing ? 'motion-dialog--closing' : '')`);

fs.writeFileSync('src/components/ModalShell.tsx', code);
console.log("Patched ModalShell to wait for closing animation!");
