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
        className={`absolute inset-0 bg-black/60 transition-opacity duration-250 ${isClosing ? 'opacity-0' : 'opacity-100 animate-in fade-in'}`}
        onClick={handleClose}
      />
      
      {/* Sheet */}
      <div 
        className={`relative w-full bg-neutral-900 border-t border-neutral-700 rounded-t-2xl shadow-2xl flex flex-col max-h-[80vh] transition-transform duration-250 ease-out ${isClosing ? 'translate-y-full' : 'animate-in slide-in-from-bottom-full'}`}
      >
        <div className="flex flex-col items-center pt-3 pb-2 px-4 shrink-0">
          <div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-4" />
          <h3 className="text-base font-bold text-white mb-2">{title}</h3>
        </div>

        <div className="overflow-y-auto overscroll-contain px-4 pb-8 flex flex-col gap-2">
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isSelected ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'}`}
                onClick={() => handleSelect(opt.value)}
              >
                <span className="font-semibold text-left">{opt.label}</span>
                {opt.meta && (
                  <span className={`text-sm ${isSelected ? 'text-accent/80' : 'text-neutral-400'}`}>
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
