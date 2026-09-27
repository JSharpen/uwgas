import * as React from 'react';
import { IconChevronRight } from '../../icons';

export interface SettingItemProps {
  /** Optional icon rendered in a recessed well */
  icon?: React.ReactNode;
  /** Primary label */
  title: React.ReactNode;
  /** Explanatory description */
  description?: React.ReactNode;
  /** Interactive control placed on the right or below (e.g. SegmentedControl, SwitchButton, Tag) */
  control?: React.ReactNode;
  /** Layout orientation: 'horizontal' (default side-by-side) or 'stacked' (vertical full width) */
  layout?: 'horizontal' | 'stacked';
  /** If provided, renders row as an accessible navigation button with chevron */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional custom classes */
  className?: string;
}

/**
 * Standardized row component for settings menus.
 * Conforms to the 44px touch ergonomics and concentric neumorphic rules.
 */
export function SettingItem({
  icon,
  title,
  description,
  control,
  layout = 'horizontal',
  onClick,
  disabled = false,
  className = '',
}: SettingItemProps) {
  const content = (
    <div className="flex items-center gap-3.5 min-w-0 flex-1">
      {icon && (
        <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
          <div className="w-5 h-5 flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1 text-left">
        <span className="text-sm sm:text-base font-semibold text-white tracking-wide">
          {title}
        </span>
        {description && (
          <span className="text-xs text-white/40 leading-relaxed">
            {description}
          </span>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`group relative z-10 flex items-center justify-between py-3.5 pl-4 pr-3.5 sm:py-4 sm:pl-5 sm:pr-4 text-left hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer w-full select-none ${
          disabled ? 'opacity-40 pointer-events-none' : ''
        } ${className}`.trim()}
      >
        {content}
        <IconChevronRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
      </button>
    );
  }

  if (layout === 'stacked') {
    return (
      <div
        className={`relative z-10 flex flex-col gap-3 p-4 sm:p-5 ${
          disabled ? 'opacity-40 pointer-events-none' : ''
        } ${className}`.trim()}
      >
        <div className="flex items-start gap-3.5 min-w-0 w-full">
          {icon && (
            <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-amber-400 shrink-0 shadow-inner mt-0.5">
              <div className="w-5 h-5 flex items-center justify-center">
                {icon}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1 min-w-0 flex-1 text-left">
            <span className="text-sm sm:text-base font-semibold text-white tracking-wide">
              {title}
            </span>
            {description && (
              <span className="text-xs text-white/50 leading-relaxed">
                {description}
              </span>
            )}
          </div>
        </div>
        {control && (
          <div className="w-full pt-1">
            {control}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative z-10 flex items-start justify-between gap-3.5 py-3.5 pl-4 pr-2.5 sm:py-4 sm:pl-5 sm:pr-3 ${
        disabled ? 'opacity-40 pointer-events-none' : ''
      } ${className}`.trim()}
    >
      <div className="flex flex-col min-w-0 flex-1 text-left">
        {/* Row 1: Dedicated Heading Row */}
        <div className="flex items-center gap-3.5 min-w-0">
          {icon && (
            <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <div className="w-5 h-5 flex items-center justify-center">
                {icon}
              </div>
            </div>
          )}
          <span className="text-sm sm:text-base font-semibold text-white tracking-wide leading-snug">
            {title}
          </span>
        </div>

        {/* Row 2: Main Body Text Row (Top-aligned) */}
        {description && (
          <div className="mt-1 flex items-start text-left min-w-0">
            <span className="text-xs text-white/40 leading-relaxed">
              {description}
            </span>
          </div>
        )}
      </div>

      {control && (
        <div className="shrink-0 flex items-center justify-end self-start mt-0.5">
          {control}
        </div>
      )}
    </div>
  );
}

export default SettingItem;

