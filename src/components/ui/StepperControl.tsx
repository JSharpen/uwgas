import React, { useCallback, useRef } from 'react';

interface StepperControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  displayDecimals?: number;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
}

type StepperButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const StepperButton: React.FC<StepperButtonProps> = ({ className = '', ...props }) => {
  return (
    <button
      type="button"
      className={`w-12 h-10 shrink-0 neu-button flex items-center justify-center text-white/80 font-bold transition active:scale-95 touch-manipulation ${className}`}
      onContextMenu={(e) => e.preventDefault()}
      {...props}
    />
  );
};

export const StepperControl: React.FC<StepperControlProps> = ({
  label,
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  unit,
  displayDecimals,
  onReset,
  resetLabel = 'Reset',
  className = '',
}) => {
  const intervalRef = useRef<number | null>(null);
  const [localText, setLocalText] = React.useState<string | null>(null);

  // Sync external value to local text only when not typing (localText is null)
  const displayValue = localText !== null 
    ? localText 
    : (Number.isNaN(value) ? '' : (displayDecimals !== undefined ? value.toFixed(displayDecimals) : String(value)));

  const increment = useCallback(() => {
    setLocalText(null);
    onChange(Math.min(max, value + step));
  }, [onChange, max, value, step]);

  const decrement = useCallback(() => {
    setLocalText(null);
    onChange(Math.max(min, value - step));
  }, [onChange, min, value, step]);

  const startLongPress = useCallback(
    (action: () => void) => {
      intervalRef.current = window.setTimeout(() => {
        intervalRef.current = window.setInterval(action, 50);
      }, 500);
    },
    []
  );

  const stopLongPress = useCallback(() => {
    if (intervalRef.current !== null) {
      clearTimeout(intervalRef.current);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return (
    <div className={`flex-1 flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1 flex justify-between select-none">
        <span>{label}</span>
        {onReset && (
          <span
            className="text-white/30 hover:text-white cursor-pointer transition-colors"
            onClick={onReset}
          >
            {resetLabel}
          </span>
        )}
      </label>
      <div className="neu-concave border border-black/40 rounded-[var(--ui-radius-core)] flex items-center justify-between p-1 shadow-inner select-none">
        <StepperButton
          onClick={decrement}
          className="rounded-[calc(var(--ui-radius-core)-0.25rem)]"
          onPointerDown={() => startLongPress(decrement)}
          onPointerUp={stopLongPress}
          onPointerLeave={stopLongPress}
        >
          -
        </StepperButton>
        <div className="flex-1 flex justify-center items-center overflow-hidden px-2 relative group">
          <input
            type="text"
            inputMode="decimal"
            className="text-center text-sm tabular-nums font-bold text-white tracking-wider bg-transparent outline-none appearance-none min-w-[20px]"
            style={{ width: `${Math.max(2, String(displayValue).length)}ch` }}
            value={displayValue}
            onChange={(e) => {
              const text = e.target.value;
              setLocalText(text);
              const trimmed = text.trim();
              if (trimmed === '') {
                onChange(NaN);
                return;
              }
              const val = Number(trimmed.replace(',', '.'));
              if (!Number.isNaN(val)) {
                onChange(val);
              }
            }}
            onFocus={(e) => e.target.select()}
            onBlur={() => {
              setLocalText(null);
              if (!Number.isNaN(value)) {
                onChange(Math.max(min, Math.min(max, value)));
              }
            }}
          />
          {unit && (
            <span className="text-sm font-bold text-white tracking-wider pointer-events-none ml-1">
              {unit}
            </span>
          )}
        </div>
        <StepperButton
          onClick={increment}
          className="rounded-[calc(var(--ui-radius-core)-0.25rem)]"
          onPointerDown={() => startLongPress(increment)}
          onPointerUp={stopLongPress}
          onPointerLeave={stopLongPress}
        >
          +
        </StepperButton>
      </div>
    </div>
  );
};
