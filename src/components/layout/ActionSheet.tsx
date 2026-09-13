import * as React from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ActionSheet({ isOpen, onClose, children }: Props) {
  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 250);
  };

  return (
    <div className="action-sheet fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-250 ${isClosing ? 'opacity-0' : 'opacity-100 animate-in fade-in'}`}
        onClick={handleClose}
      />
      
      {/* Sheet */}
      <div 
        className={`relative w-full max-w-lg mx-auto neu-convex border-t sm:border-x border-black/40 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] transition-transform duration-250 ease-out pb-[calc(env(safe-area-inset-bottom)+16px)] ${isClosing ? 'translate-y-full' : 'animate-in slide-in-from-bottom-full'}`}
      >
        {/* Subtle Edge Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-t-3xl z-0" />

        {/* Handle Bar */}
        <div className="relative z-10 flex flex-col items-center pt-3 pb-2 px-6 shrink-0" onClick={handleClose}>
          <div className="w-12 h-1.5 bg-white/20 rounded-full mb-1 cursor-pointer" />
        </div>

        {/* Content */}
        <div className="relative z-10 overflow-y-auto overscroll-contain px-2 sm:px-6 pb-6 flex flex-col gap-2.5">
          {children}
        </div>
      </div>
    </div>
  );
}
