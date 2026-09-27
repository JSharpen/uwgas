import * as React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  variant?: 'neu' | 'neu-convex' | 'solid' | 'outline' | 'ghost';
  intent?: 'default' | 'accent' | 'focus' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fluid?: boolean;
  style?: React.CSSProperties;
};

export function Button({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button', 
  className = '', 
  variant = 'neu', 
  intent = 'default',
  size = 'md',
  fluid = false,
  style = {}
}: ButtonProps) {
  const baseClasses = 'flex items-center justify-center gap-1.5 transition-all font-bold uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'p-2.5 text-[9px] rounded-lg',
    md: 'p-3.5 text-[11px] rounded-2xl',
    lg: 'p-4 text-[13px] rounded-[1.25rem]'
  };
  
  let variantClasses = '';
  const intentStyle: React.CSSProperties = { ...style };
  
  if (variant === 'neu') {
    variantClasses = 'neu-button border border-black/40 text-white/80 hover:text-white active:scale-95';
  } else if (variant === 'neu-convex') {
    variantClasses = 'neu-convex border border-black/40 shadow-lg active:scale-95 hover:text-white';
    if (intent === 'accent') variantClasses += ' text-[var(--color-accent)]';
    if (intent === 'focus') variantClasses += ' text-[var(--color-focus)]';
    if (intent === 'danger') variantClasses += ' text-red-400';
    if (intent === 'default') variantClasses += ' text-white/80';
  } else if (variant === 'solid') {
    variantClasses = 'text-neutral-950 shadow-lg active:scale-95 border';
    if (intent === 'accent') { variantClasses += ' bg-[var(--color-accent)] border-[var(--color-accent)]'; }
    if (intent === 'focus') { variantClasses += ' bg-[var(--color-focus)] border-[var(--color-focus)]'; }
    if (intent === 'danger') { variantClasses += ' bg-red-500 border-red-500 text-white'; }
    if (intent === 'default') { variantClasses += ' bg-white text-black border-white'; }
  } else if (variant === 'outline') {
    variantClasses = 'neu-button active:scale-[0.98] border';
    if (intent === 'accent') {
      intentStyle.borderColor = 'color-mix(in srgb, var(--color-accent) 30%, transparent)';
      intentStyle.color = 'var(--color-accent)';
    } else if (intent === 'focus') {
      intentStyle.borderColor = 'color-mix(in srgb, var(--color-focus) 30%, transparent)';
      intentStyle.color = 'var(--color-focus)';
    }
  } else if (variant === 'ghost') {
    variantClasses = 'bg-transparent border border-transparent hover:bg-white/5 active:bg-white/10 active:scale-95';
    if (intent === 'accent') variantClasses += ' text-[var(--color-accent)]';
    if (intent === 'focus') variantClasses += ' text-[var(--color-focus)]';
    if (intent === 'danger') variantClasses += ' text-red-500';
    if (intent === 'default') variantClasses += ' text-white/60 hover:text-white';
  }

  const fluidClasses = fluid ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses} ${fluidClasses} ${className}`}
      style={intentStyle}
    >
      {children}
    </button>
  );
}
