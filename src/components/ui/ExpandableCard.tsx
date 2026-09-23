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
  /** When true, immediately scrolls the card into the visible working window in parallel with the expansion animation */
  scrollOnExpand?: boolean;
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
  scrollOnExpand = false,
  ...rest
}, ref) => {
  const localRef = React.useRef<HTMLDivElement | null>(null);
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const prevExpandedRef = React.useRef(isExpanded);

  const setMergedRef = React.useCallback((node: HTMLDivElement | null) => {
    localRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [ref]);

  React.useEffect(() => {
    const wasExpanded = prevExpandedRef.current;
    prevExpandedRef.current = isExpanded;

    if (scrollOnExpand && !wasExpanded && isExpanded) {
      // Fire on next animation frame so React has committed child DOM,
      // enabling simultaneous smooth scroll alongside the 300ms CSS expansion
      requestAnimationFrame(() => {
        if (!localRef.current) return;
        const outerRect = localRef.current.getBoundingClientRect();
        const headerHeight = headerRef.current ? headerRef.current.offsetHeight : 88;
        const contentHeight = contentRef.current ? contentRef.current.scrollHeight : 0;
        const totalTargetHeight = headerHeight + contentHeight;

        const headerBottomStr = getComputedStyle(document.documentElement).getPropertyValue('--progression-header-bottom').trim();
        const headerBottom = headerBottomStr ? parseFloat(headerBottomStr) : 76;

        const gapStr = getComputedStyle(document.documentElement).getPropertyValue('--card-stack-gap').trim();
        const gap = gapStr ? parseFloat(gapStr) : 12;

        const setupClearanceStr = getComputedStyle(document.documentElement).getPropertyValue('--setup-bar-clearance').trim();
        const bottomClearance = setupClearanceStr ? parseFloat(setupClearanceStr) : 74;

        const topLimit = headerBottom + gap;
        const bottomLimit = window.innerHeight - bottomClearance - gap;
        const visibleHeight = Math.max(100, bottomLimit - topLimit);

        // Center card within the visible working window if it fits; otherwise align top with safe margin
        const targetTopInViewport = totalTargetHeight <= visibleHeight
          ? topLimit + (visibleHeight - totalTargetHeight) / 2
          : topLimit;

        const currentCardDocTop = window.scrollY + outerRect.top;
        const targetScrollY = currentCardDocTop - targetTopInViewport;

        window.scrollTo({
          top: Math.max(0, targetScrollY),
          behavior: 'smooth'
        });
      });
    }
  }, [isExpanded, scrollOnExpand]);
  const customStyles = {
    ...style,
    ...(index !== undefined ? { '--motion-order': index } : {})
  } as React.CSSProperties;

  return (
    <div
      ref={setMergedRef}
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
        ref={headerRef}
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
        <div ref={contentRef} className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
});

export default ExpandableCard;
