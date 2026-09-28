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
            });
          }}
        />

        <div className={`grid transition-all duration-300 ease-in-out ${!(value.isWearable && !value.isHoning) ? 'opacity-0 invisible' : 'opacity-100 visible'}`} style={{ gridTemplateRows: value.isWearable && !value.isHoning ? "1fr" : "0fr" }}>
          <div className="overflow-hidden min-h-0">
            <div className="flex items-center gap-2 pt-[var(--ui-gap)]">
              <div className="flex-1 min-w-0">
                <SwitchButton
                  title="Reminders"
                  checked={value.remeasureInterval !== undefined}
                  className="h-10 !py-0 !px-3"
                  onChange={(checked) => {
                    if (!checked) {
                      onChange({ remeasureInterval: undefined });
                    } else {
                      onChange({ remeasureInterval: 30, remeasureIntervalUnit: 'days' });
                    }
                  }}
                />
              </div>
              <div className={`w-36 shrink-0 transition-opacity ${value.remeasureInterval === undefined ? 'opacity-30 pointer-events-none' : ''}`}>
                <StepperControl
                  value={value.remeasureInterval ?? 30}
                  onChange={(val) => onChange({ remeasureInterval: val, remeasureIntervalUnit: 'days' })}
                  min={1}
                  step={1}
                  unit="D"
                  variant="mini"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WheelFormFields;
