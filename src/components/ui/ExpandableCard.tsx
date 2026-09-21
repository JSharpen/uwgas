import * as React from 'react';

export interface ExpandableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the card is currently expanded */
  isExpanded: boolean;
  /** Callback fired when the card header is clicked */
  onToggle: () => void;
  /** The content to display in the always-visible header region */
  header: React.ReactNode;
  /** The content to display when expanded (handled via CSS grid 0fr/1fr) */
  children: React.ReactNode;
  /** Optional index for staggered animation (--motion-order) */
  index?: number;
  /** Optional custom class names for the outer wrapper */
  className?: string;
  /** Optional custom inline styles for the outer wrapper */
  style?: React.CSSProperties;
  /** Optional custom class names for the header wrapper */
  headerClassName?: string;
  /** Optional custom styles for the header wrapper */
  headerStyle?: React.CSSProperties;
  /** Optional touch event handlers for the header */
  headerTouchHandlers?: {
    onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
    onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
  };
}

/**
 * A shared component implementing the expanding accordion card design language.
 * Features a neu-convex background, amber highlights when active, and smooth 1fr grid transitions.
 */
export const ExpandableCard = React.forwardRef<HTMLDivElement, ExpandableCardProps>(({
  isExpanded,
  onToggle,
  header,
  children,
  index,
  className = '',
  style = {},
  headerClassName = 'w-full p-[var(--ui-gap)] flex flex-col justify-center items-start',
  headerStyle = {},
  headerTouchHandlers = {},
  ...rest
}, ref) => {
  const customStyles = {
    ...style,
    ...(index !== undefined ? { '--motion-order': index } : {})
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      className={`neu-convex rounded-[var(--ui-radius-mid)] border shadow-lg flex flex-col relative overflow-hidden group transition-all duration-300 ${
        isExpanded ? 'border-amber-400/30' : 'border-black/40'
      } ${className}`}
      style={customStyles}
      {...rest}
    >
      {/* Subtle Top Edge Highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-[var(--ui-radius-mid)] z-0" />

      {/* Header (Always Visible) */}
      <div
        className={`${headerClassName} cursor-pointer transition-colors relative z-10 ${
          isExpanded ? 'bg-white/5' : 'hover:bg-white/5 active:bg-white/10'
        }`}
        style={headerStyle}
        onClick={onToggle}
        {...headerTouchHandlers}
      >
        {header}
      </div>

      {/* Expanded Details Pane */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out relative z-10"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
});

export default ExpandableCard;
