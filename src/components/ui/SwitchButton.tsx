import React from 'react';
import { Tag } from './Tag';

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
  checkedLabel,
  uncheckedLabel,
}: SwitchButtonProps) {
  const baseClasses = "flex items-center justify-between w-full p-[var(--ui-gap)] rounded-[var(--ui-radius-core)] transition active:scale-[0.98] cursor-pointer";
  const shapeClass = (checked && !disabled) 
    ? 'neu-button-pressed active-concave' 
    : 'neu-button active-concave';
  const opacityClass = disabled ? 'opacity-50' : '';

  const hasCustomLabels = checkedLabel !== undefined || uncheckedLabel !== undefined;

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
      <div className="flex flex-col items-start min-w-0 text-left flex-1 pr-2">
        <span className="text-sm font-bold text-white truncate w-full">
          {title}
        </span>
        {subtitle && (
          <div className="text-[10px] text-white/40 font-mono mt-0.5 truncate max-w-[200px] sm:max-w-none">
            {subtitle}
          </div>
        )}
      </div>

      {hasCustomLabels ? (
        checked ? (
          <Tag appearance="convex" intent="default">{checkedLabel || ''}</Tag>
        ) : (
          <Tag appearance="concave" intent="default">{uncheckedLabel || ''}</Tag>
        )
      ) : (
        <div className="shrink-0 ml-4 mr-1 flex items-center justify-center w-8 h-8 pointer-events-none">
          <div
            className={`w-5 h-5 rounded-full transition-all duration-200 ${
              checked
                ? 'bg-[radial-gradient(circle_at_40%_40%,_#fbbf24_0%,_#f59e0b_100%)] shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),0_0_8px_rgba(251,191,36,0.5)] border border-black/0'
                : 'neu-concave border border-black/40'
            }`}
          />
        </div>
      )}
    </button>
  );
}

export interface SwitchToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * Compact neumorphic tactile toggle switch.
 * Designed to sit inside setting rows and compact toolbars while maintaining
 * a 44px ergonomic touch area.
 */
export function SwitchToggle({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
  className = '',
}: SwitchToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
      className={`min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer select-none bg-transparent ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${className}`.trim()}
    >
      <div
        className={`w-12 h-7 rounded-full p-1 transition-all duration-200 neu-concave relative flex items-center ${
          checked
            ? 'border border-amber-400/60 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
            : 'border border-white/10'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full transition-transform duration-200 ease-out ${
            checked
              ? 'translate-x-5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
              : 'translate-x-0 bg-white/40'
          }`}
        />
      </div>
    </button>
  );
}

