import * as React from 'react';

export type TagIntent = 'default' | 'accent' | 'warning' | 'success' | 'good' | 'info';
export type TagAppearance = 'solid' | 'outline' | 'ghost' | 'concave' | 'convex';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  intent?: TagIntent;
  appearance?: TagAppearance;
  shape?: 'rounded' | 'pill';
  uppercase?: boolean;
  mono?: boolean;
  numeric?: boolean;
  bold?: boolean;
  badge?: React.ReactNode;
  badgeIntent?: TagIntent;
}

export function Tag({ 
  intent = 'default',
  appearance = 'outline',
  shape = 'rounded',
  uppercase,
  mono,
  numeric,
  bold,
  badge,
  badgeIntent = 'default',
  className = '', 
  children, 
  ...props 
}: TagProps) {
  let styleClasses = '';
  let defaultMono = false;
  let defaultUppercase = false;

  // 1. Resolve base colors and typography defaults based on intent + appearance
  if (appearance === 'solid') {
    defaultUppercase = true;
    defaultMono = false;
    
    switch (intent) {
      case 'warning':
        styleClasses = 'bg-amber-400 text-black border border-transparent bg-clip-padding';
        break;
      case 'success':
        styleClasses = 'bg-emerald-500 text-black border border-transparent bg-clip-padding';
        break;
      case 'good':
        styleClasses = 'bg-lime-400 text-black border border-transparent bg-clip-padding';
        break;
      case 'info':
        styleClasses = 'bg-blue-500 text-black border border-transparent bg-clip-padding';
        break;
      case 'accent':
        styleClasses = 'bg-[var(--color-accent)] text-black border border-transparent bg-clip-padding';
        break;
      case 'default':
      default:
        styleClasses = 'bg-white text-black border border-transparent bg-clip-padding';
        break;
    }
  } else if (appearance === 'outline') {
    switch (intent) {
      case 'warning':
        styleClasses = 'bg-amber-500/5 text-amber-400 border border-amber-500/30';
        break;
      case 'success':
        styleClasses = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
        break;
      case 'good':
        styleClasses = 'bg-lime-500/20 text-lime-400 border border-lime-500/30';
        break;
      case 'info':
        styleClasses = 'bg-blue-500/10 text-blue-300 border border-blue-500/30';
        break;
      case 'accent':
        styleClasses = 'bg-[color-mix(in_srgb,var(--color-accent)_5%,transparent)] text-[var(--color-accent)] border border-[var(--color-accent)]/30';
        break;
      case 'default':
      default:
        styleClasses = 'neu-concave border border-white/5 text-white/70';
        break;
    }
  } else if (appearance === 'ghost') {
    switch (intent) {
      case 'warning':
        styleClasses = 'neu-concave border border-white/5 text-amber-400';
        break;
      case 'success':
        styleClasses = 'neu-concave border border-white/5 text-emerald-400';
        break;
      case 'good':
        styleClasses = 'neu-concave border border-white/5 text-lime-400';
        break;
      case 'info':
        styleClasses = 'neu-concave border border-white/5 text-blue-400';
        break;
      case 'accent':
        styleClasses = 'neu-concave border border-white/5 text-[var(--color-accent)]';
        break;
      case 'default':
      default:
        styleClasses = 'neu-concave border border-white/5 text-white/40';
        break;
    }
  } else if (appearance === 'concave') {
    switch (intent) {
      case 'warning':
        styleClasses = 'neu-concave border border-white/5 text-amber-400';
        break;
      case 'success':
        styleClasses = 'neu-concave border border-white/5 text-emerald-400';
        break;
      case 'good':
        styleClasses = 'neu-concave border border-white/5 text-lime-400';
        break;
      case 'info':
        styleClasses = 'neu-concave border border-white/5 text-blue-400';
        break;
      case 'accent':
        styleClasses = 'neu-concave border border-white/5 text-[var(--color-accent)]';
        break;
      case 'default':
      default:
        styleClasses = 'neu-concave border border-white/5 text-white';
        break;
    }
  } else if (appearance === 'convex') {
    switch (intent) {
      case 'warning':
        styleClasses = 'neu-convex border border-amber-500/30 text-amber-400';
        break;
      case 'success':
        styleClasses = 'neu-convex border border-emerald-500/30 text-emerald-400';
        break;
      case 'good':
        styleClasses = 'neu-convex border border-lime-500/30 text-lime-400';
        break;
      case 'info':
        styleClasses = 'neu-convex border border-blue-500/30 text-blue-400';
        break;
      case 'accent':
        styleClasses = 'neu-convex border border-[var(--color-accent)]/30 text-[var(--color-accent)]';
        break;
      case 'default':
      default:
        styleClasses = 'neu-badge-convex text-white';
        break;
    }
  }

  // 2. Resolve Overrides
  const shapeClasses = shape === 'pill' ? 'rounded-full' : 'rounded-[var(--ui-radius-core)]';
  const isMono = mono ?? defaultMono;
  const isUppercase = uppercase ?? defaultUppercase;
  
  // 3. Assemble
  // Standardized padding: Text tags preserve pt-[3px] pb-[1px] for uppercase centering.
  // Numeric tags use py-[2px] to lift numbers into perfect vertical optical center.
  const paddingClasses = numeric 
    ? (badge ? 'pl-2 pr-0.5 py-[2px]' : 'px-2 py-[2px]')
    : (badge ? 'pl-2 pr-0.5 pt-[3px] pb-[1px]' : 'px-2 pt-[3px] pb-[1px]');
  const baseClasses = `inline-flex items-center justify-center ${paddingClasses} text-[9px] shrink-0 truncate text-center transition-all ${shapeClasses} ${isMono ? 'font-mono' : ''} ${isUppercase ? 'uppercase tracking-widest' : ''} ${bold ? 'font-bold' : ''}`;

  let badgeClasses = '';
  if (badge) {
    if (appearance === 'solid') {
      badgeClasses = 'bg-black/15 text-black border border-black/20 shadow-sm';
    } else {
      switch (badgeIntent) {
        case 'warning':
          badgeClasses = 'bg-red-500/10 text-red-500 border border-red-500/20';
          break;
        case 'accent':
          badgeClasses = 'bg-amber-500/15 text-amber-400 border border-amber-500/20';
          break;
        case 'success':
          badgeClasses = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
          break;
        case 'good':
          badgeClasses = 'bg-lime-500/15 text-lime-400 border border-lime-500/20';
          break;
        case 'info':
          badgeClasses = 'bg-blue-500 text-white';
          break;
        case 'default':
        default:
          badgeClasses = 'bg-white/10 text-white/90 border border-white/5';
          break;
      }
    }
  }

  // Concentric math: Inner Radius = Outer Radius - Uniform Padding (2px)
  const badgeShapeClasses = shape === 'pill'
    ? 'rounded-full'
    : 'rounded-[calc(var(--ui-radius-core)-2px)]';

  return (
    <span className={`${baseClasses} ${styleClasses} ${className}`.trim()} {...props}>
      {children}
      {badge && (
        <span className={`ml-1.5 px-1 pt-[2px] pb-[1px] text-[8px] leading-none ${badgeShapeClasses} inline-flex justify-center font-medium font-sans tracking-normal shrink-0 ${badgeClasses} ${numeric ? '' : '-translate-y-px'}`}>
          {badge}
        </span>
      )}
    </span>
  );
}

