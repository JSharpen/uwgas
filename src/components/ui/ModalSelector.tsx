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
      <div className="flex flex-col gap-2.5">
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
  onClick?: () => void;
};

export function ModalSelectorItem({ children, selected, disabled, meta, onClick }: ModalSelectorItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`flex items-center justify-between p-[var(--ui-gap)] rounded-[var(--ui-radius-core)] border transition-all min-h-[48px] ${
        selected 
          ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 shadow-sm font-bold' 
          : disabled
            ? 'bg-black/20 border-white/5 text-white/30 cursor-not-allowed opacity-50'
            : 'bg-black/30 hover:bg-white/5 active:bg-white/10 border-white/5 text-white/90 active:scale-[0.98]'
      }`}
      onClick={() => {
        if (!disabled && onClick) {
          onClick();
        }
      }}
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

ModalSelector.Item = ModalSelectorItem;
