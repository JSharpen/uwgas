import * as React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * A shared neumorphic divider component.
 * Renders a recessed, machined groove using the app's established 145deg lighting model.
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className = '',
  ...props
}) => {
  const baseClass =
    orientation === 'vertical'
      ? 'neu-divider-v self-stretch shrink-0'
      : 'neu-divider-h w-full shrink-0';
  return <div className={`${baseClass} ${className}`.trim()} {...props} />;
};

export default Divider;

