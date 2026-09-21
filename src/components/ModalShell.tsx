import * as React from 'react';

export type ModalShellProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  overlayStyle?: React.CSSProperties;
  dialogStyle?: React.CSSProperties;
  closing?: boolean;
};

export function ModalShell({
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
  }, [isClosingLocal, onClose]);
  const hasSubtitle = Boolean(subtitle);
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open && !isClosing) {
      dialog.showModal();
    }
  }, [isClosing]);

    // Handle native escape key
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      handleClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [handleClose]);

  

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) handleClose();
      }}
      className={
        'z-50 m-auto overflow-y-auto bg-transparent p-[var(--ui-gap)] pb-[calc(env(safe-area-inset-bottom)+var(--ui-gap))] motion-overlay ' +
        (isClosing ? 'motion-overlay--closing ' : '') + 
        'backdrop:bg-black/75 backdrop:backdrop-blur-sm'
      }
      style={overlayStyle}
    >
      <div
        className={
          'relative w-full max-w-lg neu-convex rounded-[var(--ui-radius-mid)] border border-black/40 shadow-2xl p-[var(--ui-gap)] flex flex-col max-h-[90vh] overflow-y-auto motion-dialog mx-auto ' +
          (isClosing ? 'motion-dialog--closing' : '')
        }
        style={dialogStyle}
      >
        {/* Subtle Edge Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-[var(--ui-radius-mid)] z-0" />

        {/* Header */}
        <div className="relative z-10 flex flex-col gap-1 pb-4 border-b border-white/5 mb-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">{title}</h3>
          {hasSubtitle ? <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-normal">{subtitle}</p> : null}
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-col gap-4 text-white">
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex justify-end gap-3">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

export default ModalShell;
