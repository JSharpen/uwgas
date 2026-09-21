import React, { type InputHTMLAttributes } from 'react';

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function TextInput({ label, className, ...props }: TextInputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
          {label}
        </span>
      )}
      <input
        type="text"
        className={`neu-concave border border-black/40 shadow-inner rounded-[var(--ui-radius-core)] p-[var(--ui-gap)] text-sm font-semibold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full ${className || ''}`}
        {...props}
      />
    </label>
  );
}
