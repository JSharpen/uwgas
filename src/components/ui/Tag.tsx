import * as React from 'react';

export type TagIntent = 'default' | 'accent' | 'warning' | 'success' | 'info';
export type TagAppearance = 'solid' | 'outline' | 'ghost' | 'concave';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  intent?: TagIntent;
  appearance?: TagAppearance;
  shape?: 'rounded' | 'pill';
  uppercase?: boolean;
  mono?: boolean;
  badge?: React.ReactNode;
  badgeIntent?: TagIntent;
}

export function Tag({ 
  intent = 'default',
  appearance = 'outline',
  shape = 'rounded',
  uppercase,
  mono,
  badge,
  badgeIntent = 'default',
  className = '', 
  children, 
  ...props 
}: TagProps) {
  let styleClasses = '';
  let defaultMono = true;
  let defaultUppercase = false;

  // 1. Resolve base colors and typography defaults based on intent + appearance
  if (appearance === 'solid') {
    defaultUppercase = true;
    defaultMono = false;
    
    switch (intent) {
      case 'warning':
        styleClasses = 'bg-amber-400 text-black shadow-[0_0_8px_rgba(251,191,36,0.5)] font-bold';
        break;
      case 'success':
        styleClasses = 'bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)] font-bold';
        break;
      case 'info':
        styleClasses = 'bg-blue-500 text-black shadow-[0_0_8px_rgba(59,130,246,0.5)] font-bold';
        break;
      case 'accent':
        styleClasses = 'bg-[var(--color-accent)] text-black shadow-[0_0_8px_var(--color-accent)] font-bold';
        break;
      case 'default':
      default:
        styleClasses = 'bg-white text-black font-bold';
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
        styleClasses = 'text-amber-400/70';
        break;
      case 'success':
        styleClasses = 'text-emerald-400/70';
        break;
      case 'info':
        styleClasses = 'text-blue-400/70';
        break;
      case 'accent':
        styleClasses = 'text-[var(--color-accent)]/70';
        break;
      case 'default':
      default:
        styleClasses = 'neu-concave border border-white/5 text-white/40';
        break;
    }
  } else if (appearance === 'concave') {
    switch (intent) {
      case 'warning':
        styleClasses = 'neu-concave border border-black/40 shadow-inner text-amber-400 font-bold';
        break;
      case 'success':
        styleClasses = 'neu-concave border border-black/40 shadow-inner text-emerald-400 font-bold';
        break;
      case 'info':
        styleClasses = 'neu-concave border border-black/40 shadow-inner text-blue-400 font-bold';
        break;
      case 'accent':
        styleClasses = 'neu-concave border border-black/40 shadow-inner text-[var(--color-accent)] font-bold';
        break;
      case 'default':
      default:
        styleClasses = 'neu-concave border border-black/40 shadow-inner text-white/70 font-bold';
        break;
    }
  }

  // 2. Resolve Overrides
  const shapeClasses = shape === 'pill' ? 'rounded-full' : 'rounded-[var(--ui-radius-core)]';
  const isMono = mono ?? defaultMono;
  const isUppercase = uppercase ?? defaultUppercase;
  
  // 3. Assemble
  // Standardized padding strictly enforced as px-2 pt-[3px] pb-[1px] to perfectly center uppercase text
  // If badge exists, remove right padding to let the badge sit flush
  const paddingClasses = badge ? 'pl-2 pr-0.5 pt-[3px] pb-[1px]' : 'px-2 pt-[3px] pb-[1px]';
  const baseClasses = `inline-flex items-center justify-center ${paddingClasses} text-[9px] shrink-0 truncate text-center transition-all ${shapeClasses} ${isMono ? 'font-mono' : ''} ${isUppercase ? 'uppercase tracking-widest' : ''}`;

  let badgeClasses = '';
  if (badge) {
    switch (badgeIntent) {
      case 'warning':
        badgeClasses = 'bg-red-500/10 text-red-500 border border-red-500/20';
        break;
      case 'accent':
        badgeClasses = 'bg-amber-500/15 text-amber-400 border border-amber-500/20';
        break;
      case 'success':
        badgeClasses = 'bg-emerald-500 text-black';
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

  return (
    <span className={`${baseClasses} ${styleClasses} ${className}`.trim()} {...props}>
      {children}
      {badge && (
        <span className={`ml-1.5 px-1.5 py-[1px] rounded-[var(--ui-radius-core)] flex items-center justify-center font-bold font-sans tracking-normal -translate-y-[1px] ${badgeClasses}`}>
          {badge}
        </span>
      )}
    </span>
  );
}

