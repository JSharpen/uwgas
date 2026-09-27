import * as React from 'react';

export interface SettingGroupProps {
  /** Optional category title displayed above the container */
  title?: string;
  /** Optional secondary caption displayed under the title */
  caption?: string;
  /** Grouped SettingItem children */
  children: React.ReactNode;
  /** Optional additional CSS classes on the outer container */
  className?: string;
}

/**
 * Shared neumorphic group container for settings views.
 * Enforces concentric rounding, drop-shadow, inner top highlight,
 * and automatic hairline dividers between setting rows.
 */
export function SettingGroup({
  title,
  caption,
  children,
  className = '',
}: SettingGroupProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {title && (
        <div className="flex flex-col gap-0.5 px-1">
          <h3 className="text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase">
            {title}
          </h3>
          {caption && <p className="text-xs text-white/30">{caption}</p>}
        </div>
      )}

      <div
        className={`neu-convex rounded-[var(--ui-radius-mid)] border border-black/40 shadow-lg relative flex flex-col overflow-hidden ${className}`.trim()}
      >
        {/* Subtle Top Edge Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-[var(--ui-radius-mid)] z-0" />

        {/* Child Setting Items with Hairline Dividers */}
        <div className="relative z-10 flex flex-col divide-y divide-white/5">
          {children}
        </div>
      </div>
    </div>
  );
}

export default SettingGroup;

