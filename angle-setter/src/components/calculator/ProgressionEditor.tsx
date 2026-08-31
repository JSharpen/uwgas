import * as React from 'react';
import type { SessionStep, Wheel } from '../../types/core';
import { BTN } from '../../ui/buttons';
import { IconTrash } from '../../icons';
import { blurOnEnter } from '../../utils/dom';
import MiniSelect from '../MiniSelect';
import GrindDirToggle from '../GrindDirToggle';

const STEP_REMOVE_DURATION_MS = 380;

export type ProgressionEditorProps = {
  sessionSteps: SessionStep[];
  wheels: Wheel[];
  machines: import('../../types/core').MachineConfig[];
  defaultMachineId?: string;
  usbs: import("../../types/core").UsbConfig[];
  onUpdateStep: (id: string, patch: Partial<SessionStep>) => void;
  onUpdateWheel: (id: string, patch: Partial<Wheel>) => void;
  onDeleteStep: (id: string) => void;
  onAddStep: () => void;
  onLoadDefaultProgression: () => void;
  onMoveStep: (index: number, direction: -1 | 1) => void;
  targetAngleSymbol?: string;
  progressionBodyPaddingX?: string;
  progressionBodyPaddingY?: string;
  progressionBodyGap?: string;
  progressionCardMinHeight?: string;
};

export function ProgressionEditor({ usbs,
  sessionSteps,
  wheels,
  machines,
  defaultMachineId,
  onUpdateStep,
  onUpdateWheel,
  onDeleteStep,
  onAddStep,
  onLoadDefaultProgression,
  onMoveStep,
  targetAngleSymbol = '\u03b2',
  progressionBodyPaddingX = 'px-3',
  progressionBodyPaddingY = 'py-2',
  progressionBodyGap = 'gap-2',
  progressionCardMinHeight,
}: ProgressionEditorProps) {
  const [removingStepIds, setRemovingStepIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const stepRemoveTimersRef = React.useRef<Map<string, number>>(new Map());

  const requestDeleteStep = (id: string) => {
    if (removingStepIds.has(id)) return;
    setRemovingStepIds(prev => new Set(prev).add(id));
    const timer = window.setTimeout(() => {
      onDeleteStep(id);
      setRemovingStepIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      stepRemoveTimersRef.current.delete(id);
    }, STEP_REMOVE_DURATION_MS);
    stepRemoveTimersRef.current.set(id, timer);
  };

  return (
    <div className="flex flex-col card-stack text-xs">
      {/* Empty state when no steps exist */}
      {sessionSteps.length === 0 && (
        <div className="text-xs text-neutral-400 border border-dashed border-neutral-700 rounded p-4 flex flex-col gap-3 items-center text-center">
          <p>
            No steps defined yet. Build a sharpening progression sequence across your grinding and honing wheels.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              className={BTN.primary}
              onClick={onLoadDefaultProgression}
            >
              + Load Standard (Grind + Hone)
            </button>
            <button
              type="button"
              className={BTN.base}
              onClick={onAddStep}
              disabled={wheels.length === 0}
            >
              + Add Custom Step
            </button>
          </div>
        </div>
      )}

      {/* Steps list */}
      {sessionSteps.length > 0 && (
        <div className="flex flex-col card-stack">
          {sessionSteps.map((step, index) => {
            const wheel =
              wheels.find(w => w.id === step.wheelId) || {
                id: '',
                name: 'Select wheel...',
                D: 0,
                DText: '',
                angleOffset: 0,
                baseForHn: 'rear',
                isHoning: false,
              };
            const isHoning = wheel.isHoning;
            const isRemoving = removingStepIds.has(step.id);
            const removingStyle: React.CSSProperties | undefined = isRemoving
              ? ({
                  '--motion-exit-duration': `${STEP_REMOVE_DURATION_MS}ms`,
                } as React.CSSProperties)
              : undefined;

            return (
              <div
                key={step.id}
                className={`card-elevated flex flex-col motion-list-item ${
                  isRemoving ? 'motion-list-item--removing' : ''
                }`}
                style={
                  {
                    '--motion-order': Math.min(index, 2),
                    minHeight: isRemoving ? undefined : progressionCardMinHeight,
                    ...removingStyle,
                  } as React.CSSProperties
                }
              >
                {/* Header bar: step badge + wheel selector + D editor + delete */}
                <div className="card-elevated__header wheel-card__header flex flex-nowrap items-center justify-between gap-1.5 px-2 py-1.5 min-h-[40px]">
                  {/* Left: Step badge + Wheel selector (elastic) */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {/* Step badge */}
                    <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[0.7rem] font-mono text-neutral-100 shrink-0 shadow-sm">
                      {index + 1}
                    </div>

                    {/* Wheel selector */}
                    <MiniSelect
                      value={step.wheelId}
                      options={[
                        { value: '', label: 'Select wheel...' },
                        ...wheels.map(w => ({
                          value: w.id,
                          label: w.name,
                          meta: w.isHoning ? 'honing' : undefined,
                        })),
                      ]}
                      onChange={id => {
                        const newWheel = wheels.find(w => w.id === id);
                        if (!newWheel) return;
                        onUpdateStep(step.id, {
                          wheelId: newWheel.id,
                          base: newWheel.isHoning ? 'front' : step.base,
                        });
                      }}
                      widthClass="flex-1 min-w-0"
                      menuWidthClass="w-56 sm:w-64"
                      emptyLabel="No wheels defined"
                      renderOption={opt => (
                        <>
                          <div className="dropdown-item__title text-[0.75rem]">
                            {opt.label}
                          </div>
                          {opt.meta ? (
                            <div className="dropdown-item__meta text-[0.7rem]">
                              {opt.meta}
                            </div>
                          ) : null}
                        </>
                      )}
                      renderLabel={opt => (opt ? opt.label : 'Select wheel...')}
                    />
                  </div>

                  {/* RIGHT: D editor + delete (fixed, shrink-0) */}
                  <div className="flex items-center gap-1 flex-nowrap shrink-0 ml-1">


                    <button
                      type="button"
                      className={`${BTN.iconPlain} text-danger w-6 h-6 p-0 flex items-center justify-center`}
                      onClick={() => requestDeleteStep(step.id)}
                      title="Delete step"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body: base toggle / angle offset / sort */}
                <div
                  className={`card-elevated__body ${progressionBodyPaddingX} ${progressionBodyPaddingY} flex items-center justify-between ${progressionBodyGap}`}
                >
                  {/* Left: base select + angle offset */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <GrindDirToggle
                        base={step.base}
                        isHoning={isHoning}
                        canToggle={!isHoning}
                        showLabel
                        onToggle={() =>
                          onUpdateStep(step.id, {
                            base: step.base === 'rear' ? 'front' : 'rear',
                          })
                        }
                      />

                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-400 text-xs">
                          {targetAngleSymbol} offset
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="w-14 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-xs font-mono"
                          value={step.angleOffset === 0 ? '' : step.angleOffset}
                          placeholder="0"
                          onFocus={e => {
                            if (e.target.value !== '') {
                              e.target.select();
                            }
                          }}
                          onChange={e => {
                            const text = e.target.value;
                            if (text.trim() === '') {
                              onUpdateStep(step.id, { angleOffset: 0 });
                              return;
                            }
                            const val = Number(text);
                            if (!Number.isNaN(val)) {
                              onUpdateStep(step.id, { angleOffset: val });
                            }
                          }}
                        />
                        <span className="text-neutral-400 text-xs">°</span>
                      </div>
                    </div>

                    {/* Hardware overrides */}
                    <div className="flex items-center justify-between w-full pt-1.5 border-t border-neutral-800/40">
                      <div className="flex items-center gap-2">
                        {machines && machines.length > 0 && (
                          <MiniSelect
                            value={step.machineId || defaultMachineId || ''}
                            options={machines.map(m => ({ value: m.id, label: m.name }))}
                            onChange={val => onUpdateStep(step.id, { machineId: val })}
                            widthClass="min-w-[100px] text-[10px]"
                            menuWidthClass="min-w-[120px]"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                          <MiniSelect
                            value={step.usbId || ''}
                            options={[{ value: '', label: 'USB (Global)' }, ...usbs.map(u => ({ value: u.id, label: u.name, meta: `${u.Ds} mm` }))]}
                            onChange={val => onUpdateStep(step.id, { usbId: val || undefined })}
                            widthClass="min-w-[90px] text-[10px]"
                            menuWidthClass="min-w-[120px]"
                          />
                        </div>
                        
                        <label className="flex items-center gap-1 text-[10px] text-neutral-400">
                          <span className="font-bold font-mono">D=</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            className="w-[44px] sm:w-[50px] rounded border border-neutral-700 bg-neutral-950 px-1 py-0.5 text-right text-xs font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!wheel.id}
                            value={
                              wheel.DText !== undefined
                                ? wheel.DText
                                : Number.isNaN(wheel.D)
                                ? ''
                                : String(wheel.D)
                            }
                            onKeyDown={blurOnEnter}
                            onFocus={e => e.target.select()}
                            onChange={e => {
                              const text = e.target.value;
                              const patch: Partial<Wheel> = { DText: text };

                              const trimmed = text.trim();
                              if (trimmed === '') {
                                patch.D = NaN as unknown as number;
                                onUpdateWheel(wheel.id, patch);
                                return;
                              }

                              const val = Number(trimmed.replace(',', '.'));
                              if (!Number.isNaN(val)) {
                                patch.D = Math.round(val * 100) / 100;
                              }
                              onUpdateWheel(wheel.id, patch);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right: sort controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className={BTN.icon}
                      onClick={() => onMoveStep(index, -1)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={BTN.icon}
                      onClick={() => onMoveStep(index, 1)}
                      disabled={index === sessionSteps.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add step button */}
          <button
            type="button"
            className={`${BTN.primary} w-full text-center mt-1`}
            onClick={onAddStep}
            disabled={wheels.length === 0}
          >
            + Add step
          </button>
        </div>
      )}
    </div>
  );
}

export default ProgressionEditor;
