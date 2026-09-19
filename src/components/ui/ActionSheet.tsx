import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ActionSheetContextType = {
  isOpen: boolean;
  onClose: () => void;
};

const ActionSheetContext = React.createContext<ActionSheetContextType | null>(null);

const useActionSheetContext = () => {
  const context = React.useContext(ActionSheetContext);
  if (!context) {
    throw new Error('ActionSheet components must be used within an ActionSheet Root');
  }
  return context;
};

type ActionSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function ActionSheet({ isOpen, onClose, children }: ActionSheetProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [isNativeOpen, setIsNativeOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      // Force a second render so Framer Motion mounts INSIDE an already-open dialog
      setIsNativeOpen(true);
    } else {
      setIsNativeOpen(false);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    // Prevent escape key from instantly closing without animation, we intercept it
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <ActionSheetContext.Provider value={{ isOpen, onClose }}>
      <dialog
        ref={dialogRef}
        className={`action-sheet fixed inset-0 m-0 h-full w-full max-h-none max-w-none bg-transparent backdrop:bg-transparent p-0 flex-col justify-end outline-none z-50 pointer-events-none ${isOpen || isNativeOpen ? 'flex' : 'hidden'}`}
      >
        <AnimatePresence 
          onExitComplete={() => {
            if (dialogRef.current?.open) {
              dialogRef.current.close();
            }
          }}
        >
          {isNativeOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute inset-0 bg-black/75 backdrop-blur-md pointer-events-auto"
                onClick={onClose}
              />
              
              {/* Sheet */}
              {children}
            </>
          )}
        </AnimatePresence>
      </dialog>
    </ActionSheetContext.Provider>
  );
}

export function ActionSheetContent({ children, title }: { children: React.ReactNode, title?: string }) {
  const { onClose } = useActionSheetContext();

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={0.05}
      onDragEnd={(_e, info) => {
        if (info.offset.y > 100 || info.velocity.y > 500) {
          onClose();
        }
      }}
      className="relative z-10 w-full max-w-lg mx-auto bg-[#18181b] border-t sm:border-x border-white/10 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] pb-[calc(env(safe-area-inset-bottom)+16px)] pointer-events-auto"
    >
      {/* Subtle Edge Highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none rounded-t-3xl z-0" />

      {/* Handle Bar & Title */}
      <div className="relative z-10 flex flex-col items-center pt-3 pb-3 px-6 shrink-0 touch-none">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mb-3" />
        {title && <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>}
      </div>

      {children}
    </motion.div>
  );
}

export function ActionSheetScrollable({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 overflow-y-auto overscroll-contain px-4 sm:px-6 pb-6 flex flex-col gap-2.5"
         onPointerDownCapture={(e) => e.stopPropagation()} // Prevent dragging the sheet when interacting with the scrollable area
    >
      {children}
    </div>
  );
}

type ActionSheetItemProps = {
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  meta?: React.ReactNode;
  onClick?: () => void;
};

export function ActionSheetItem({ children, selected, disabled, meta, onClick }: ActionSheetItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`flex items-center justify-between p-4 rounded-2xl border transition-all min-h-[48px] ${
        selected 
          ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 shadow-sm font-bold' 
          : disabled
            ? 'bg-black/20 border-white/5 text-white/30 cursor-not-allowed opacity-50'
            : 'bg-black/30 hover:bg-white/5 active:bg-white/10 border-white/5 text-white/90 active:scale-[0.98]'
      }`}
      onClick={onClick}
    >
      <span className="font-semibold text-sm sm:text-base text-left truncate">{children}</span>
      {meta && (
        <span className={`text-xs font-mono ml-2 shrink-0 ${selected ? 'text-amber-300/80 font-bold' : disabled ? 'text-white/20' : 'text-white/40'}`}>
          {meta}
        </span>
      )}
    </button>
  );
}

ActionSheet.Content = ActionSheetContent;
ActionSheet.Scrollable = ActionSheetScrollable;
ActionSheet.Item = ActionSheetItem;
