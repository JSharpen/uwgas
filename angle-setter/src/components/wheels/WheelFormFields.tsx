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
      <div className="rounded-lg border u-border u-surface p-3 sm:p-4 flex flex-col gap-3">
        <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wider">Identity</h4>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium u-text">Wheel name</span>
          <input
            className="rounded border u-border bg-black/5 dark:bg-white/5 px-3 py-2 text-sm u-focus-ring w-full"
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
      <div className="rounded-lg border u-border u-surface p-3 sm:p-4 flex flex-col gap-3">
        <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wider">Geometry</h4>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium u-text">Diameter (mm)</span>
            <input
              type="text"
              inputMode="decimal"
              className="rounded border u-border bg-black/5 dark:bg-white/5 px-3 py-2 text-sm u-focus-ring w-full appearance-none font-mono"
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
            <span className="text-sm font-medium u-text whitespace-nowrap">Angle Offset (&beta;&deg;)</span>
            <input
              type="number"
              step="0.1"
              className="rounded border u-border bg-black/5 dark:bg-white/5 px-3 py-2 text-sm u-focus-ring w-full appearance-none font-mono"
              value={value.angleOffset ?? 0}
              onKeyDown={blurOnEnter}
              onFocus={e => e.target.select()}
              onChange={e => onChange({ angleOffset: Number(e.target.value) })}
            />
          </label>
        </div>
      </div>

      {/* Hardware Card */}
      <div className="rounded-lg border u-border u-surface p-3 sm:p-4 flex flex-col gap-3">
        <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wider">Hardware</h4>
        
        <label className="flex items-center gap-3 p-2 -mx-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-400 text-primary focus:ring-primary/50"
            checked={value.isHoning}
            onChange={e =>
              onChange({
                isHoning: e.target.checked,
                baseForHn: e.target.checked ? 'front' : value.baseForHn,
              })
            }
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium u-text">Honing wheel?</span>
            <span className="text-[11px] u-text-muted">Locks default base to Front</span>
          </div>
        </label>

        {!value.isHoning && (
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-sm font-medium u-text">Default base</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  className="w-4 h-4 text-primary focus:ring-primary/50"
                  checked={value.baseForHn === 'rear'}
                  onChange={() => onChange({ baseForHn: 'rear' })}
                />
                <span className="text-sm u-text">Rear <span className="text-[10px] u-text-muted">(Leading)</span></span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  className="w-4 h-4 text-primary focus:ring-primary/50"
                  checked={value.baseForHn === 'front'}
                  onChange={() => onChange({ baseForHn: 'front' })}
                />
                <span className="text-sm u-text">Front <span className="text-[10px] u-text-muted">(Trailing)</span></span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WheelFormFields;
