import * as React from 'react';
import { ModalShell } from '../ModalShell';

type ModalSelectorProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function ModalSelector({ isOpen, onClose, title, subtitle, children }: ModalSelectorProps) {
  if (!isOpen) return null;
  return (
    <ModalShell title={title} subtitle={subtitle} onClose={onClose}>
      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto px-2 -mx-2 py-2 -my-2">
        {children}
      </div>
    </ModalShell>
  );
}

type ModalSelectorItemProps = {
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  meta?: React.ReactNode;
  intent?: 'accent' | 'focus';
  onClick?: () => void;
};

export function ModalSelectorItem({ children, selected, disabled, meta, intent = 'accent', onClick }: ModalSelectorItemProps) {
  const colorVar = intent === 'accent' ? 'var(--color-accent)' : 'var(--color-focus)';
  
  return (
    <button
      type="button"
      disabled={disabled}
      className={`w-full flex items-center justify-between p-3.5 text-left rounded-[var(--ui-radius-core)] transition-all min-h-[48px] ${
        selected 
          ? `neu-button-active border` 
          : disabled
            ? 'bg-black/20 border border-white/5 text-white/30 cursor-not-allowed opacity-50'
            : 'neu-button border border-black/40 active:scale-[0.98] cursor-pointer'
      }`}
      style={selected ? { 
        borderColor: `color-mix(in srgb, ${colorVar} 30%, transparent)`, 
        backgroundColor: `color-mix(in srgb, ${colorVar} 5%, transparent)` 
      } : {}}
      onClick={() => {
        if (!disabled && onClick) {
          onClick();
        }
      }}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-bold text-[13px] text-white truncate">{children}</span>
        {meta && (
          <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: `color-mix(in srgb, ${colorVar} 80%, white)` }}>
            {meta}
          </span>
        )}
      </div>
      
      {selected ? (
        <div className="flex items-center gap-1.5 px-2 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorVar, boxShadow: `0 0 8px ${colorVar}` }}></div>
          <span className="font-bold text-[10px] uppercase tracking-wider" style={{ color: colorVar }}>Active</span>
        </div>
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-white/10 shrink-0 ml-4"></div>
      )}
    </button>
  );
}

ModalSelector.Item = ModalSelectorItem;
