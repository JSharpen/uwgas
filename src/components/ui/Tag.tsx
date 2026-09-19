import * as React from 'react';

export type TagIntent = 'default' | 'accent' | 'warning' | 'success' | 'info';
export type TagAppearance = 'solid' | 'outline' | 'ghost';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  intent?: TagIntent;
  appearance?: TagAppearance;
  shape?: 'rounded' | 'pill';
  uppercase?: boolean;
  mono?: boolean;
}

export function Tag({ 
  intent = 'default',
  appearance = 'outline',
  shape = 'rounded',
  uppercase,
  mono,
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
  }

  // 2. Resolve Overrides
  const shapeClasses = shape === 'pill' ? 'rounded-full' : 'rounded';
  const isMono = mono ?? defaultMono;
  const isUppercase = uppercase ?? defaultUppercase;
  
  // 3. Assemble
  // Standardized padding strictly enforced as px-2 py-0.5 to prevent layout drift
  const baseClasses = `inline-flex items-center justify-center px-2 py-0.5 text-[9px] shrink-0 truncate text-center transition-all ${shapeClasses} ${isMono ? 'font-mono' : ''} ${isUppercase ? 'uppercase tracking-widest' : ''}`;

  return (
    <span className={`${baseClasses} ${styleClasses} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}

