import React from 'react';

export interface SwitchButtonProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  subtitle?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  checkedLabel?: string;
  uncheckedLabel?: string;
}

export function SwitchButton({
  checked,
  onChange,
  title,
  subtitle,
  disabled,
  className = '',
  checkedLabel = 'Yes',
  uncheckedLabel,
}: SwitchButtonProps) {
  const baseClasses = "flex items-center justify-between w-full p-[var(--ui-gap)] rounded-[var(--ui-radius-core)] transition active:scale-[0.98] cursor-pointer";
  const shapeClass = (checked && !disabled) 
    ? 'neu-concave shadow-inner border border-[var(--color-accent)]/50' 
    : 'neu-button';
  const opacityClass = disabled ? 'opacity-50' : '';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`${baseClasses} ${shapeClass} ${opacityClass} ${className}`.trim()}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
    >
      <div className="flex flex-col items-start min-w-0 text-left">
        <span className={`text-sm font-bold ${checked && !disabled ? 'text-amber-400' : 'text-white'}`}>
          {title}
        </span>
        {subtitle && (
          <span className="text-[10px] text-white/40 font-mono mt-0.5 truncate max-w-[200px] sm:max-w-none">
            {subtitle}
          </span>
        )}
      </div>
      {checked ? (
        <span className="text-amber-400 font-bold text-xs uppercase tracking-wider px-2 shrink-0">{checkedLabel}</span>
      ) : uncheckedLabel ? (
        <span className="text-white/60 font-bold text-xs uppercase tracking-wider px-2 shrink-0">{uncheckedLabel}</span>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0 ml-4"></div>
      )}
    </button>
  );
}
