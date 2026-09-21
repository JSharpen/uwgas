import * as React from 'react';
import { createPortal } from 'react-dom';

export type SlotName = 'left' | 'center' | 'right';

export interface SlotProps {
  name: SlotName;
  children: React.ReactNode;
}

export function Slot({ name, children }: SlotProps) {
  // We need to force a re-render after mount just in case the shell wasn't in the DOM 
  // during the very first render pass.
  const [, setTick] = React.useState(0);
  React.useEffect(() => setTick(1), []);

  // Dynamically calculate the target on EVERY render.
  // This fixes the bug where React re-uses the <Slot> component instance but changes the 'name' prop.
  const target = document.getElementById(`context-bar-${name}`);

  if (!target) return null;
  return createPortal(children, target);
}

// --- BUTTON COMPONENTS ---

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'ghost-danger' | 'nav';
}

export function Button({ variant = 'ghost', className = '', children, ...props }: ButtonProps) {
  const baseStyles = "h-11 px-3 sm:px-4 rounded-[var(--ui-radius-core)] font-bold text-[10px] sm:text-xs uppercase tracking-wider transition flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed";
  
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = "bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.15)] active:scale-95";
      break;
    case 'ghost':
      variantStyles = "bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 disabled:bg-transparent disabled:border-white/5 disabled:text-white/20";
      break;
    case 'ghost-danger':
      variantStyles = "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 active:scale-95";
      break;
    case 'danger':
      variantStyles = "bg-red-500 text-white hover:bg-red-400 active:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-95";
      break;
    case 'nav':
      // Like ghost, but optimized for left slot back buttons etc
      variantStyles = "bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95";
      break;
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}

// --- CENTER LAYOUT COMPONENTS ---

export function Title({ title, subtitle }: { title: string; subtitle?: string }) {
  if (subtitle) {
    return (
      <div className="flex flex-col items-center justify-center mx-2 overflow-hidden">
        <h2 className="text-xs font-bold tracking-widest uppercase truncate text-amber-400 leading-tight">
          {title}
        </h2>
        <span className="text-[10px] text-white/50 truncate font-mono">
          {subtitle}
        </span>
      </div>
    );
  }

  return (
    <h2 className="text-[10px] sm:text-xs font-bold tracking-widest uppercase truncate text-white/40 mx-2 text-center">
      {title}
    </h2>
  );
}

export function DropdownTitle({ 
  title, 
  isOpen, 
  onClick, 
  isPrimary = false 
}: { 
  title: string; 
  isOpen: boolean; 
  onClick: () => void;
  isPrimary?: boolean;
}) {
  return (
    <button 
      type="button"
      className="flex-shrink flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors mx-2 min-w-0 cursor-pointer"
      onClick={onClick}
    >
      <h2 className={`text-xs sm:text-sm font-bold tracking-widest uppercase truncate ${isPrimary ? 'text-amber-400' : 'text-white/60'}`}>
        {title}
      </h2>
      <span className={`text-[10px] text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
  );
}

export function AmbientInfo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] sm:text-xs font-bold tracking-widest uppercase truncate text-white/40 mx-2 text-center">
      {children}
    </h2>
  );
}

