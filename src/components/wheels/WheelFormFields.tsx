import { StepperControl } from "../ui/StepperControl";
import { TextInput } from "../ui/TextInput";
import { SwitchButton } from "../ui/SwitchButton";
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
    <div className="flex flex-col gap-[var(--ui-gap)] w-full">
      <TextInput
        label="Wheel Name"
        value={value.name}
        autoFocus={autoFocusName}
        onChange={e => onChange({ name: e.target.value })}
        onFocus={e => autoFocusName && e.target.select()}
        onKeyDown={blurOnEnter}
        placeholder="e.g. SG-250 Original"
      />

      <StepperControl
        label="Diameter"
        value={value.D}
        onChange={(val) => onChange({ D: val })}
        min={100}
        max={300}
        step={1}
        unit="mm"
        displayDecimals={1}
      />

      <div className="flex flex-col">
        <SwitchButton
          checked={!!value.isHoning}
          title="Honing Wheel"
          subtitle={value.isHoning ? 'Locks default base to Front' : 'Standard sharpening wheel'}
          onChange={(checked) => {
            onChange({
              isHoning: checked,
              baseForHn: checked ? 'front' : value.baseForHn,
              ...(checked && { isWearable: false, remeasureInterval: undefined, remeasureIntervalUnit: undefined }),
            });
          }}
        />

        <div className={`grid transition-all duration-300 ease-in-out ${value.isHoning ? 'opacity-0 invisible' : 'opacity-100 visible'}`} style={{ gridTemplateRows: !value.isHoning ? "1fr" : "0fr" }}>
          <div className="overflow-hidden min-h-0 -mx-[var(--ui-gap)] px-[var(--ui-gap)] -mb-[var(--ui-gap)] pb-[var(--ui-gap)]">
            <div className="pt-[var(--ui-gap)]">
              <SwitchButton
                checked={value.baseForHn === 'front'}
                title="Default Base"
                subtitle={value.baseForHn === 'front' ? 'Front (Trailing edge)' : 'Rear (Leading edge)'}
                checkedLabel="FRONT"
                uncheckedLabel="REAR"
                onChange={(checked) => onChange({ baseForHn: checked ? 'front' : 'rear' })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <SwitchButton
          checked={!!value.isWearable && !value.isHoning}
          disabled={!!value.isHoning}
          title="Wears down over time"
          subtitle={value.isHoning ? 'Honing wheels do not wear' : 'Track diameter changes'}
          onChange={(checked) => {
            if (value.isHoning) return;
            onChange({
              isWearable: checked,
              remeasureInterval: checked ? (value.remeasureInterval || 30) : undefined,
              remeasureIntervalUnit: checked ? (value.remeasureIntervalUnit || 'days') : undefined,
            });
          }}
        />

        <div className={`grid transition-all duration-300 ease-in-out ${!(value.isWearable && !value.isHoning) ? 'opacity-0 invisible' : 'opacity-100 visible'}`} style={{ gridTemplateRows: value.isWearable && !value.isHoning ? "1fr" : "0fr" }}>
          <div className="overflow-hidden min-h-0">
            <div className="flex flex-col gap-1.5 pt-[var(--ui-gap)]">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">Remind me to re-measure every:</span>
              <div className="flex items-center gap-[var(--ui-gap)]">
                <input
                  type="number"
                  min="1"
                  className="neu-concave border border-black/40 shadow-inner rounded-[var(--ui-radius-core)] p-[var(--ui-gap)] text-base font-mono font-bold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition w-24 text-center"
                  value={value.remeasureInterval || 30}
                  onChange={e => onChange({ remeasureInterval: parseInt(e.target.value, 10) || undefined })}
                />
                <select
                  className="neu-concave border border-black/40 shadow-inner rounded-[var(--ui-radius-core)] p-[var(--ui-gap)] text-sm font-semibold text-white bg-transparent focus:border-[var(--color-accent)] outline-none transition flex-1 appearance-none"
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
