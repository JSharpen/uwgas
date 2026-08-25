import type { Wheel } from '../../types/core';
import { blurOnEnter } from '../../utils/dom';

export type WheelFormValue = Pick<Wheel, 'name' | 'D' | 'DText' | 'grit' | 'isHoning' | 'baseForHn'>;

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
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs u-text-muted">Wheel name</span>
        <input
          className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm u-focus-ring"
          value={value.name}
          autoFocus={autoFocusName}
          onChange={e => onChange({ name: e.target.value })}
          onFocus={e => autoFocusName && e.target.select()}
          onKeyDown={blurOnEnter}
          placeholder="e.g. SG-250 Original"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs u-text-muted">Diameter (mm)</span>
        <div className="flex items-center gap-2 text-xs">
          <input
            type="text"
            inputMode="decimal"
            className="w-24 rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-right text-sm appearance-none"
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
                patch.D = NaN as unknown as number;
                onChange(patch);
                return;
              }

              const normalised = trimmed.replace(',', '.');
              const val = Number(normalised);

              if (!Number.isNaN(val)) {
                patch.D = Math.round(val * 100) / 100;
              }

              onChange(patch);
            }}
          />
          <span className="text-neutral-400 text-[0.75rem]">mm</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs u-text-muted">Grit / abrasive</span>
        <input
          className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm u-focus-ring"
          value={value.grit ?? ''}
          onChange={e => onChange({ grit: e.target.value })}
          onKeyDown={blurOnEnter}
          placeholder="e.g. 220, 1000, Leather"
        />
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.isHoning}
            onChange={e =>
              onChange({
                isHoning: e.target.checked,
                baseForHn: e.target.checked ? 'front' : value.baseForHn,
              })
            }
          />
          <span className="text-neutral-300">Honing wheel? (Locks to Front base)</span>
        </label>

        {!value.isHoning && (
          <div className="flex items-center gap-3 text-xs text-neutral-300">
            <span>Default base for h?:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={value.baseForHn === 'rear'}
                onChange={() => onChange({ baseForHn: 'rear' })}
              />
              <span>Rear (edge leading)</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={value.baseForHn === 'front'}
                onChange={() => onChange({ baseForHn: 'front' })}
              />
              <span>Front (edge trailing)</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

export default WheelFormFields;
