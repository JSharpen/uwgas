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
  headerClassName = 'w-full p-4 sm:p-5 flex flex-col justify-center items-start',
  headerStyle = {},
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
        const headerHeight = headerRef.current ? headerRef.current.offsetHeight : 108;
        const contentChild = contentRef.current?.firstElementChild as HTMLElement | null;
        const contentHeight = contentRef.current 
          ? Math.max(contentRef.current.scrollHeight, contentChild?.scrollHeight || 0, contentChild?.offsetHeight || 0)
          : 0;
        const totalTargetHeight = headerHeight + contentHeight;

        // Check if an existing open card above us is currently collapsing.
        // In single-expand accordions, the previous card begins collapsing at the exact same moment.
        // If it sits above us in the document, its collapse will shift our card upwards by its height!
        let collapsingHeightAbove = 0;
        const allCardGrids = document.querySelectorAll<HTMLElement>('[data-card-grid="true"]');
        allCardGrids.forEach((gridEl) => {
          const cardParent = gridEl.closest<HTMLElement>('[data-expandable-card="true"]');
          if (cardParent && cardParent !== localRef.current) {
            const cardParentRect = cardParent.getBoundingClientRect();
            // If the collapsing card is visually above our card and has height > 10px
            if (cardParentRect.top < outerRect.top && gridEl.offsetHeight > 10) {
              collapsingHeightAbove += gridEl.offsetHeight;
            }
          }
        });

        const headerBottomStr = getComputedStyle(document.documentElement).getPropertyValue('--progression-header-bottom').trim();
        const headerBottom = headerBottomStr ? parseFloat(headerBottomStr) : 76;

        const gapStr = getComputedStyle(document.documentElement).getPropertyValue('--card-stack-gap').trim();
        const gap = gapStr ? parseFloat(gapStr) : 12;

        const setupClearanceStr = getComputedStyle(document.documentElement).getPropertyValue('--setup-bar-clearance').trim();
        // Determine the bottom obstruction: setup bar if active, otherwise detect nav tab bar top, or fallback
        const navEl = document.querySelector('nav');
        const navRect = navEl?.getBoundingClientRect();
        const navTop = (navRect && navRect.top > 0) ? navRect.top : (window.innerHeight - 64);
        const bottomObstruction = setupClearanceStr ? (window.innerHeight - parseFloat(setupClearanceStr)) : navTop;

        const topLimit = headerBottom + gap;
        const bottomLimit = bottomObstruction - gap;
        const visibleHeight = Math.max(100, bottomLimit - topLimit);

        // The card's final document position will be its current position minus any card collapsing above it
        const currentCardDocTop = window.scrollY + outerRect.top - collapsingHeightAbove;
        const currentCardDocBottom = currentCardDocTop + totalTargetHeight;

        let targetScrollY = window.scrollY;

        if (totalTargetHeight <= visibleHeight) {
          const cardViewportTop = currentCardDocTop - window.scrollY;
          const cardViewportBottom = currentCardDocBottom - window.scrollY;

          if (cardViewportBottom > bottomLimit) {
            // Card bottom extends past bottom limit; scroll down just enough to reveal it
            targetScrollY = currentCardDocBottom - bottomLimit;
          } else if (cardViewportTop < topLimit) {
            // Card top is tucked behind top header; scroll up just enough to reveal it
            targetScrollY = currentCardDocTop - topLimit;
          } else {
            // Already fully visible within safe window - no scroll needed
            targetScrollY = window.scrollY;
          }
        } else {
          // Card is taller than visible window; pin top to topLimit so header and primary controls are visible
          targetScrollY = currentCardDocTop - topLimit;
        }

        const finalTargetScrollY = Math.max(0, targetScrollY);
        const startScrollY = window.scrollY;
        const scrollDistance = finalTargetScrollY - startScrollY;

        if (Math.abs(scrollDistance) < 2) return;

        const startTime = performance.now();
        const duration = 300;

        const step = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(1, elapsed / duration);

          // Smooth ease-out cubic curve (matches native CSS transition deceleration)
          const ease = 1 - Math.pow(1 - progress, 3);
          const currentY = startScrollY + scrollDistance * ease;

          window.scrollTo(0, currentY);

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            // Final check on completion to ensure exact pixel alignment
            window.scrollTo(0, finalTargetScrollY);
          }
        };

        requestAnimationFrame(step);
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
      data-expandable-card="true"
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
        className={`${headerClassName} cursor-pointer transition-colors relative z-10 hover:bg-white/5 active:bg-white/10`}
        style={headerStyle}
        onClick={onToggle}
      >
        
        {header}
      </div>

      {/* Expanded Details Pane */}
      <div
        data-card-grid="true"
        className="grid transition-[grid-template-rows] duration-300 ease-in-out relative z-10"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div ref={contentRef} className="overflow-hidden shadow-[inset_0_16px_16px_-16px_rgba(0,0,0,0.8)] bg-black/20">
          {children}
        </div>
      </div>
    </div>
  );
});

export default ExpandableCard;
