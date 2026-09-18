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
    <div className="flex flex-col gap-4">
      {/* Identity Card */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
        <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Identity</h4>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-white">Wheel Name</span>
          <input
            className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-[var(--color-accent)] outline-none transition w-full"
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
        <div className="flex flex-col">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-white">Diameter (mm)</span>
            <input
              type="text"
              inputMode="decimal"
              className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-base font-mono font-bold text-white focus:border-[var(--color-accent)] outline-none transition w-full appearance-none"
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
        </div>
      </div>

      {/* Hardware Card */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
        <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Hardware</h4>
        
        <label className="flex items-center gap-3 p-3 bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl transition-colors cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-white/5 bg-black/40 accent-[var(--color-accent)] focus:ring-[var(--color-accent)]"
            checked={value.isHoning}
            onChange={e => {
              const isHoning = e.target.checked;
              onChange({
                isHoning,
                baseForHn: isHoning ? 'front' : value.baseForHn,
                ...(isHoning && { isWearable: false, remeasureInterval: undefined, remeasureIntervalUnit: undefined }),
              });
            }}
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Honing wheel?</span>
            <span className="text-xs text-white/40">Locks default base to Front Base</span>
          </div>
        </label>

        <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: !value.isHoning ? "1fr" : "0fr" }}>
          <div className="overflow-hidden min-h-0">
            <div className="flex flex-col gap-2 pt-3">
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
          </div>
        </div>
      </div>

      {/* Measurement & Wear Card */}
      <div className={`bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-opacity ${value.isHoning ? 'opacity-50 pointer-events-none' : ''}`}>
        <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Measurement & Wear</h4>
        
        <label className="flex items-center gap-3 p-3 bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl transition-colors cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-white/5 bg-black/40 accent-[var(--color-accent)] focus:ring-[var(--color-accent)]"
            checked={value.isWearable || false}
            disabled={value.isHoning}
            onChange={e => {
              const isWearable = e.target.checked;
              onChange({
                isWearable,
                remeasureInterval: isWearable ? (value.remeasureInterval || 30) : undefined,
                remeasureIntervalUnit: isWearable ? (value.remeasureIntervalUnit || 'days') : undefined,
              });
            }}
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Wheel wears down over time?</span>
            <span className="text-xs text-white/40">
              {value.isHoning ? 'Honing wheels do not wear down.' : 'Enables reminders to re-measure diameter'}
            </span>
          </div>
        </label>

        <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: value.isWearable && !value.isHoning ? "1fr" : "0fr" }}>
          <div className="overflow-hidden min-h-0">
            <div className="flex flex-col gap-2 pt-3">
              <span className="text-sm font-semibold text-white pl-1">Remind me to re-measure every:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-base font-mono font-bold text-white focus:border-[var(--color-accent)] outline-none transition w-24 text-center"
                  value={value.remeasureInterval || 30}
                  onChange={e => onChange({ remeasureInterval: parseInt(e.target.value, 10) || undefined })}
                />
                <select
                  className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-[var(--color-accent)] outline-none transition flex-1 appearance-none"
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

