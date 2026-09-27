import * as React from 'react';

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<SegmentedControlOption<T>>;
  className?: string;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  variant?: 'accent' | 'neutral';
  /** When true, the entire slider acts as a single toggle button (flipping state on tap anywhere) */
  isToggle?: boolean;
  /** Orientation of the toggle switch. Defaults to 'horizontal'. */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Shared tactile segmented control with animated sliding pill and dual-layer text mask.
 * Uses geometric clipping so the active text color is physically masked by the moving pill,
 * eliminating color popping, contrast clashes, or deselect flicker.
 */
export function SegmentedControl<T extends string = string>({
  value,
  onChange,
  options,
  className = '',
  ariaLabel = 'Navigation tabs',
  size = 'md',
  variant = 'accent',
  isToggle = false,
  orientation = 'horizontal',
}: SegmentedControlProps<T>) {
  const buttonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const isSm = size === 'sm';
  const count = options.length;
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));

  // --- Full-Pill Toggle Mode (2 Options) ---
  if (isToggle && count === 2) {
    const handleToggle = () => {
      const nextIndex = (selectedIndex + 1) % 2;
      const nextOption = options[nextIndex];
      if (nextOption && !nextOption.disabled) {
        onChange(nextOption.value);
      }
    };

    if (orientation === 'vertical') {
      return (
        <button
          type="button"
          role="switch"
          aria-checked={selectedIndex === 1}
          aria-label={ariaLabel}
          onClick={handleToggle}
          className={`neu-concave rounded-2xl border border-black/40 p-1 relative flex flex-col select-none shrink-0 cursor-pointer overflow-hidden ${className}`.trim()}
        >
          {/* Inner Track: establishes exact coordinate box inside the 4px padding */}
          <div className="relative w-full h-full overflow-hidden rounded-xl">
            {/* Layer 1: Base Layer (Inactive text) */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`flex-1 w-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center select-none text-white/40 p-1 text-center ${
                    option.disabled ? 'opacity-30' : ''
                  }`.trim()}
                >
                  {option.label}
                </div>
              ))}
            </div>

            {/* Layer 2: Sliding Masked Pill (Active text geometrically revealed by the pill) */}
            <div
              className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none z-10 overflow-hidden rounded-xl transition-transform duration-300 ease-out"
              style={{
                transform: `translateY(${selectedIndex * 100}%)`,
              }}
            >
              {/* Pill Background */}
              <div
                className={`absolute inset-0 rounded-xl ${
                  variant === 'neutral'
                    ? 'neu-button shadow-sm'
                    : 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                }`}
              />

              {/* Counter-translated active text container */}
              <div
                className="absolute inset-0 flex flex-col h-[200%] transition-transform duration-300 ease-out"
                style={{
                  transform: `translateY(-${selectedIndex * 50}%)`,
                }}
              >
                {options.map((option) => (
                  <div
                    key={option.value}
                    className={`flex-1 w-full text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center select-none p-1 text-center ${
                      variant === 'neutral' ? 'text-white' : 'text-black'
                    }`}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </button>
      );
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={selectedIndex === 1}
        aria-label={ariaLabel}
        onClick={handleToggle}
        className={`neu-concave rounded-full border border-black/40 ${
          isSm ? 'p-0.5' : 'p-1'
        } relative flex select-none shrink-0 cursor-pointer overflow-hidden ${className}`.trim()}
      >
        {/* Layer 1: Base Layer (Inactive text) */}
        <div className="relative z-0 flex w-full pointer-events-none">
          {options.map((option) => (
            <div
              key={option.value}
              className={`flex-1 ${
                isSm ? 'h-8 text-[10px] px-2.5' : 'h-11 text-[10px] sm:text-xs'
              } font-bold uppercase tracking-wider rounded-full flex items-center justify-center select-none text-white/40 ${
                option.disabled ? 'opacity-30' : ''
              }`.trim()}
            >
              {option.label}
            </div>
          ))}
        </div>

        {/* Layer 2: Sliding Masked Pill (Active text geometrically revealed by the pill) */}
        <div
          className={`absolute ${
            isSm ? 'top-0.5 bottom-0.5 left-0.5 right-0.5' : 'top-1 bottom-1 left-1 right-1'
          } pointer-events-none z-10 overflow-hidden rounded-full transition-transform duration-300 ease-out`}
          style={{
            width: '50%',
            transform: `translateX(${selectedIndex * 100}%)`,
          }}
        >
          {/* Pill Background */}
          <div
            className={`absolute inset-0 ${
              variant === 'neutral'
                ? 'neu-button shadow-sm'
                : 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
            }`}
          />

          {/* Counter-translated active text container */}
          <div
            className="absolute inset-0 flex transition-transform duration-300 ease-out"
            style={{
              width: '200%',
              transform: `translateX(-${selectedIndex * 50}%)`,
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`flex-1 ${
                  isSm ? 'h-8 text-[10px] px-2.5' : 'h-11 text-[10px] sm:text-xs'
                } font-black uppercase tracking-wider rounded-full flex items-center justify-center select-none ${
                  variant === 'neutral' ? 'text-white' : 'text-black'
                }`}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      </button>
    );
  }

  // --- Multi-Tab Segmented Mode ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (options.length === 0) return;

    let targetIndex: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (index + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (index - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = options.length - 1;
    }

    if (targetIndex !== null) {
      const nextOption = options[targetIndex];
      if (nextOption && !nextOption.disabled) {
        buttonRefs.current[targetIndex]?.focus();
        onChange(nextOption.value);
      }
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`neu-concave rounded-full border border-black/40 ${
        isSm ? 'p-0.5' : 'p-1'
      } relative flex select-none shrink-0 overflow-hidden ${className}`.trim()}
    >
      {/* Layer 1: Base Layer (Clickable Inactive Tab Buttons) */}
      <div className="relative z-0 flex w-full">
        {options.map((option, index) => (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={option.value === value}
            aria-label={option.ariaLabel}
            tabIndex={option.value === value ? 0 : -1}
            disabled={option.disabled}
            onClick={() => {
              if (!option.disabled && option.value !== value) {
                onChange(option.value);
              }
            }}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`flex-1 ${
              isSm ? 'h-8 text-[10px] px-2.5' : 'h-11 text-[10px] sm:text-xs'
            } font-bold uppercase tracking-wider rounded-full flex items-center justify-center cursor-pointer select-none text-white/40 hover:text-white/80 transition-colors ${
              option.disabled ? 'opacity-30 cursor-not-allowed' : ''
            }`.trim()}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Layer 2: Sliding Masked Pill (Active text geometrically revealed by the pill) */}
      {count > 0 && (
        <div
          className={`absolute ${
            isSm ? 'top-0.5 bottom-0.5 left-0.5 right-0.5' : 'top-1 bottom-1 left-1 right-1'
          } pointer-events-none z-10 overflow-hidden rounded-full transition-transform duration-300 ease-out`}
          style={{
            width: `${100 / count}%`,
            transform: `translateX(${selectedIndex * 100}%)`,
          }}
        >
          {/* Pill Background */}
          <div
            className={`absolute inset-0 ${
              variant === 'neutral'
                ? 'neu-button shadow-sm'
                : 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
            }`}
          />

          {/* Counter-translated active text container */}
          <div
            className="absolute inset-0 flex transition-transform duration-300 ease-out"
            style={{
              width: `${count * 100}%`,
              transform: `translateX(-${selectedIndex * (100 / count)}%)`,
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`flex-1 ${
                  isSm ? 'h-8 text-[10px] px-2.5' : 'h-11 text-[10px] sm:text-xs'
                } font-black uppercase tracking-wider rounded-full flex items-center justify-center select-none ${
                  variant === 'neutral' ? 'text-white' : 'text-black'
                }`}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SegmentedControl;
