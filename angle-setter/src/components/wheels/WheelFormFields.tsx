import type { Wheel } from '../../types/core';
import { blurOnEnter } from '../../utils/dom';

export type WheelFormValue = Pick<Wheel, 'name' | 'D' | 'DText' | 'angleOffset' | 'isHoning' | 'baseForHn'>;

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
    <div className="flex flex-col gap-4">
      {/* Identity Card */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
        <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Identity</h4>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-white">Wheel Name</span>
          <input
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-[var(--color-accent)] outline-none transition w-full"
            value={value.name}
            autoFocus={autoFocusName}
            onChange={e => onChange({ name: e.target.value })}
            onFocus={e => autoFocusName && e.target.select()}
            onKeyDown={blurOnEnter}
            placeholder="e.g. SG-250 Original"
          />
        </label>
      </div>

      {/* Geometry Card */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
        <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Geometry</h4>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-white">Diameter (mm)</span>
            <input
              type="text"
              inputMode="decimal"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-base font-mono font-bold text-white focus:border-[var(--color-accent)] outline-none transition w-full appearance-none"
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

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-white whitespace-nowrap">Angle Offset (&beta;&deg;)</span>
            <input
              type="number"
              step="0.1"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-base font-mono font-bold text-white focus:border-[var(--color-accent)] outline-none transition w-full appearance-none"
              value={value.angleOffset ?? 0}
              onKeyDown={blurOnEnter}
              onFocus={e => e.target.select()}
              onChange={e => onChange({ angleOffset: Number(e.target.value) })}
            />
          </label>
        </div>
      </div>

      {/* Hardware Card */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
        <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Hardware</h4>
        
        <label className="flex items-center gap-3 p-3 bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl transition-colors cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-white/10 bg-black/40 accent-[var(--color-accent)] focus:ring-[var(--color-accent)]"
            checked={value.isHoning}
            onChange={e =>
              onChange({
                isHoning: e.target.checked,
                baseForHn: e.target.checked ? 'front' : value.baseForHn,
              })
            }
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Honing wheel?</span>
            <span className="text-xs text-white/40">Locks default base to Front Base</span>
          </div>
        </label>

        {!value.isHoning && (
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Default Base</span>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition select-none ${
                  value.baseForHn === 'rear'
                    ? 'bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] border-[var(--color-accent)]/50 text-white font-bold'
                    : 'bg-black/20 border-white/5 text-white/60 hover:bg-white/5'
                }`}
              >
                <input
                  type="radio"
                  name="defaultBaseForHn"
                  className="w-4 h-4 accent-[var(--color-accent)]"
                  checked={value.baseForHn === 'rear'}
                  onChange={() => onChange({ baseForHn: 'rear' })}
                />
                <span className="text-sm">Rear <span className="text-[10px] opacity-60">(Leading)</span></span>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition select-none ${
                  value.baseForHn === 'front'
                    ? 'bg-sky-500/20 border-sky-500/50 text-white font-bold'
                    : 'bg-black/20 border-white/5 text-white/60 hover:bg-white/5'
                }`}
              >
                <input
                  type="radio"
                  name="defaultBaseForHn"
                  className="w-4 h-4 accent-sky-400"
                  checked={value.baseForHn === 'front'}
                  onChange={() => onChange({ baseForHn: 'front' })}
                />
                <span className="text-sm">Front <span className="text-[10px] opacity-60">(Trailing)</span></span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WheelFormFields;

