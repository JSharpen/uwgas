// src/icons.tsx
import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & {
  className?: string;
};

/** Close / dismiss (X) */
export function IconClose({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M7 7l10 10m0-10L7 17"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Three vertical dots ("kebab" menu) */
export function IconKebab({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="6" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="18" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Classic three-line hamburger menu (horizontal) */
export function IconHamburger({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Trash can / delete */
export function IconTrash({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M9 3h6m-7 4h8m-6 0v10m4-10v10M5 7h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Plus / add */
export function IconPlus({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Arrow up (for move up / sort) */
export function IconArrowUp({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M6 15l6-6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Arrow down (for move down / sort) */
export function IconArrowDown({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Pencil / edit */
export function IconEdit({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M12.3 4.3l7.4 7.4-9.6 9.6H4.4v-5.7l9.6-9.6zM16 8l-4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Generic sort ascending (small to large bars) */
export function IconSortAsc({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M8 6h8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M10 10h6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M12 14h4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M14 18h2" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

/** Generic sort descending (large to small bars) */
export function IconSortDesc({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M14 6h2" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M12 10h4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M10 14h6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M8 18h8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

/** Sharpening Wheel / Disc */
export function IconDisc({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...rest}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

/** Sharpening Machine / Grinder */
export function IconGrinder({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...rest}>
      <rect x="7" y="10" width="10" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <rect x="3" y="12" width="4" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <rect x="17" y="12" width="4" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <path d="M12 10V7M10 7h4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

export function IconEdgeLeading(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Blade (positioned top right, pointing left into the wheel) */}
      <path d="M11 6 L21 2 L19 12 Z" fill="currentColor" stroke="none" />
      <path d="M11 6 L21 2 L19 12 Z" />
      {/* Wheel (bottom left) */}
      <circle cx="10" cy="14" r="7" />
      {/* Arrow on wheel indicating rotation INTO the edge (counter-clockwise) */}
      <path d="M3.5 11.5 A 7 7 0 0 1 10 7" />
      <path d="M8.5 5.5 L10 7 L8 8.5" />
    </svg>
  );
}

export function IconEdgeTrailing(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Blade (positioned top right, pointing left) */}
      <path d="M11 6 L21 2 L19 12 Z" fill="currentColor" stroke="none" />
      <path d="M11 6 L21 2 L19 12 Z" />
      {/* Wheel (bottom left) */}
      <circle cx="10" cy="14" r="7" />
      {/* Arrow on wheel indicating rotation AWAY from the edge (clockwise) */}
      <path d="M10 7 A 7 7 0 0 1 16.5 11.5" />
      <path d="M17.5 9.5 L16.5 11.5 L14.5 10.5" />
    </svg>
  );
}

export function IconCalculator(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="16" y1="14" x2="16" y2="14.01" />
      <line x1="12" y1="14" x2="12" y2="14.01" />
      <line x1="8" y1="14" x2="8" y2="14.01" />
      <line x1="16" y1="18" x2="16" y2="18.01" />
      <line x1="12" y1="18" x2="12" y2="18.01" />
      <line x1="8" y1="18" x2="8" y2="18.01" />
    </svg>
  );
}

export function IconSettings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function IconChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
