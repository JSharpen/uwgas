import React, { type InputHTMLAttributes } from 'react';

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function NumberInput({ label, className, ...props }: NumberInputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
          {label}
        </span>
      )}
      <input
        type="number"
        className={`neu-concave border border-black/40 shadow-inner rounded-[var(--ui-radius-core)] p-[var(--ui-gap)] text-sm font-bold font-mono text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full ${className || ''}`}
        {...props}
      />
    </label>
  );
}
