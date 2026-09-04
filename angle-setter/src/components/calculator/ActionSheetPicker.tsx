import * as React from 'react';

type Option = {
  value: string;
  label: string;
  meta?: React.ReactNode;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: Option[];
  value: string;
  onChange: (val: string) => void;
};

export default function ActionSheetPicker({ isOpen, onClose, title, options, value, onChange }: Props) {
  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    } else {
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 250);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-250 ${isClosing ? 'opacity-0' : 'opacity-100 animate-in fade-in'}`}
        onClick={handleClose}
      />
      
      {/* Sheet */}
      <div 
        className={`relative w-full max-w-lg mx-auto bg-[#262626] border-t sm:border-x border-white/10 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] transition-transform duration-250 ease-out pb-[calc(env(safe-area-inset-bottom)+16px)] ${isClosing ? 'translate-y-full' : 'animate-in slide-in-from-bottom-full'}`}
      >
        {/* Subtle Edge Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-t-3xl z-0" />

        {/* Handle Bar & Title */}
        <div className="relative z-10 flex flex-col items-center pt-3 pb-3 px-6 shrink-0">
          <div className="w-12 h-1.5 bg-white/20 rounded-full mb-3" />
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        </div>

        {/* Options List */}
        <div className="relative z-10 overflow-y-auto overscroll-contain px-4 sm:px-6 pb-6 flex flex-col gap-2.5">
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all min-h-[48px] ${
                  isSelected 
                    ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 shadow-sm font-bold' 
                    : 'bg-black/30 hover:bg-white/5 active:bg-white/10 border-white/5 text-white/90'
                }`}
                onClick={() => handleSelect(opt.value)}
              >
                <span className="font-semibold text-sm sm:text-base text-left truncate">{opt.label}</span>
                {opt.meta && (
                  <span className={`text-xs font-mono ml-2 shrink-0 ${isSelected ? 'text-amber-300/80 font-bold' : 'text-white/40'}`}>
                    {opt.meta}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
