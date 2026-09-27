import * as React from 'react';

type SurfaceProps = {
  children: React.ReactNode;
  variant?: 'concave' | 'convex' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
};

export function Surface({ children, variant = 'flat', padding = 'md', className = '' }: SurfaceProps) {
  const variantClasses = {
    concave: 'neu-concave border border-black/40 shadow-inner',
    convex: 'neu-convex border border-black/40 shadow-lg',
    flat: 'bg-black/20 border border-white/5',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  return (
    <div className={`${variantClasses[variant]} ${paddingClasses[padding]} rounded-[var(--ui-radius-core)] ${className}`}>
      {children}
    </div>
  );
}
