import type { Wheel } from '../../types/core';
import { blurOnEnter } from '../../utils/dom';

export type WheelFormValue = Pick<Wheel, 'name' | 'D' | 'DText' | 'isHoning' | 'baseForHn' | 'isWearable' | 'remeasureInterval' | 'remeasureIntervalUnit'>;

export type WheelFormFieldsProps = {
  value: WheelFormValue;
  onChange: (patch: Partial<WheelFormValue>) => void;
  autoFocusName?: boolean;
};

export function WheelFormFields({
  value,
  onChange,
  autoFocusName = false,
}: WheelFormFieldsProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Wheel Name</span>
          <input
            className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-semibold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full"
            value={value.name}
            autoFocus={autoFocusName}
            onChange={e => onChange({ name: e.target.value })}
            onFocus={e => autoFocusName && e.target.select()}
            onKeyDown={blurOnEnter}
            placeholder="e.g. SG-250 Original"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Diameter (mm)</span>
          <input
            type="text"
            inputMode="decimal"
            className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-base font-mono font-bold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-full appearance-none"
            value={
              value.DText !== undefined
                ? value.DText
                : Number.isNaN(value.D)
                ? ''
                : String(value.D)
            }
            onKeyDown={blurOnEnter}
            onFocus={e => e.target.select()}
            onChange={e => {
              const text = e.target.value;
              const patch: Partial<WheelFormValue> = { DText: text };

              const trimmed = text.trim();
              if (trimmed === '') {
                patch.D = NaN;
                onChange(patch);
                return;
              }

              const val = Number(trimmed.replace(',', '.'));
              if (!Number.isNaN(val)) {
                patch.D = Math.round(val * 100) / 100;
              }
              onChange(patch);
            }}
          />
        </label>

        <button
          type="button"
          role="switch"
          aria-checked={value.isHoning}
          className={`flex items-center justify-between w-full p-3.5 neu-button rounded-xl transition active:scale-[0.98] cursor-pointer ${value.isHoning ? 'border-[var(--color-accent)]/50' : ''}`}
          onClick={() => {
            const isHoning = !value.isHoning;
            onChange({
              isHoning,
              baseForHn: isHoning ? 'front' : value.baseForHn,
              ...(isHoning && { isWearable: false, remeasureInterval: undefined, remeasureIntervalUnit: undefined }),
            });
          }}
        >
          <div className="flex flex-col items-start min-w-0">
            <span className={`text-sm font-bold ${value.isHoning ? 'text-amber-400' : 'text-white'}`}>Honing Wheel</span>
            <span className="text-[10px] text-white/40 font-mono mt-0.5 truncate max-w-[200px] sm:max-w-none">
              {value.isHoning ? 'Locks default base to Front' : 'Standard sharpening wheel'}
            </span>
          </div>
          {value.isHoning ? (
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider px-2 shrink-0">Yes</span>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0 ml-4"></div>
          )}
        </button>

        <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: !value.isHoning ? "1fr" : "0fr" }}>
          <div className="overflow-hidden min-h-0">
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Default Base</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 ${
                    value.baseForHn === 'rear'
                      ? 'neu-button bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] border-[var(--color-accent)]/50 text-white font-bold'
                      : 'neu-button text-white/60'
                  }`}
                  onClick={() => onChange({ baseForHn: 'rear' })}
                >
                  <span className="text-sm">Rear <span className="text-[10px] opacity-60">(Leading)</span></span>
                </button>

                <button
                  type="button"
                  className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 ${
                    value.baseForHn === 'front'
                      ? 'neu-button bg-sky-500/20 border-sky-500/50 text-white font-bold'
                      : 'neu-button text-white/60'
                  }`}
                  onClick={() => onChange({ baseForHn: 'front' })}
                >
                  <span className="text-sm">Front <span className="text-[10px] opacity-60">(Trailing)</span></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={value.isWearable || false}
          disabled={value.isHoning}
          className={`flex items-center justify-between w-full p-3.5 neu-button rounded-xl transition active:scale-[0.98] cursor-pointer ${value.isHoning ? 'opacity-50' : ''} ${value.isWearable && !value.isHoning ? 'border-[var(--color-accent)]/50' : ''}`}
          onClick={() => {
            if (value.isHoning) return;
            const isWearable = !value.isWearable;
            onChange({
              isWearable,
              remeasureInterval: isWearable ? (value.remeasureInterval || 30) : undefined,
              remeasureIntervalUnit: isWearable ? (value.remeasureIntervalUnit || 'days') : undefined,
            });
          }}
        >
          <div className="flex flex-col items-start min-w-0">
            <span className={`text-sm font-bold ${value.isWearable && !value.isHoning ? 'text-amber-400' : 'text-white'}`}>Wears down over time</span>
            <span className="text-[10px] text-white/40 font-mono mt-0.5 truncate max-w-[200px] sm:max-w-none">
              {value.isHoning ? 'Honing wheels do not wear' : 'Track diameter changes'}
            </span>
          </div>
          {value.isWearable && !value.isHoning ? (
             <span className="text-amber-400 font-bold text-xs uppercase tracking-wider px-2 shrink-0">Yes</span>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0 ml-4"></div>
          )}
        </button>

        <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: value.isWearable && !value.isHoning ? "1fr" : "0fr" }}>
          <div className="overflow-hidden min-h-0">
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Remind me to re-measure every:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-base font-mono font-bold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-24 text-center"
                  value={value.remeasureInterval || 30}
                  onChange={e => onChange({ remeasureInterval: parseInt(e.target.value, 10) || undefined })}
                />
                <select
                  className="neu-concave border border-black/40 shadow-inner rounded-xl px-4 py-3 text-sm font-semibold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition flex-1 appearance-none"
                  value={value.remeasureIntervalUnit || 'days'}
                  onChange={e => onChange({ remeasureIntervalUnit: e.target.value as 'days' | 'weeks' | 'months' })}
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WheelFormFields;
