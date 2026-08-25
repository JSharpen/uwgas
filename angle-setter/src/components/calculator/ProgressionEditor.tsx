import * as React from 'react';
import type { SessionStep, Wheel } from '../../types/core';
import { BTN } from '../../ui/buttons';
import { IconTrash } from '../../icons';
import { blurOnEnter } from '../../utils/dom';
import MiniSelect from '../MiniSelect';
import GrindDirToggle from '../GrindDirToggle';
import ModalShell from '../ModalShell';
import useModalLayout from '../../hooks/useModalLayout';

const STEP_REMOVE_DURATION_MS = 380;

export type ProgressionEditorProps = {
  sessionSteps: SessionStep[];
  wheels: Wheel[];
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

export function ProgressionEditor({
  sessionSteps,
  wheels,
  onUpdateStep,
  onUpdateWheel,
  onDeleteStep,
  onAddStep,
  onLoadDefaultProgression,
  onMoveStep,
  targetAngleSymbol = '\u03b2',
  progressionBodyPaddingX = 'px-3',
  progressionBodyPaddingY = 'py-2',
  progressionBodyGap = 'gap-3',
  progressionCardMinHeight = '6.5rem',
}: ProgressionEditorProps) {
  const { overlayStyle: modalOverlayStyle, getDialogStyle: getModalDialogStyle } =
    useModalLayout();

  const [removingStepIds, setRemovingStepIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const stepRemoveTimersRef = React.useRef<Map<string, number>>(new Map());

  // Step notes modal
  const [isStepNotesVisible, setIsStepNotesVisible] = React.useState(false);
  const [isStepNotesClosing, setIsStepNotesClosing] = React.useState(false);
  const [stepNotesDraft, setStepNotesDraft] = React.useState('');
  const stepNotesStepIdRef = React.useRef<string | null>(null);

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

  const handleOpenNotes = (step: SessionStep) => {
    stepNotesStepIdRef.current = step.id;
    setStepNotesDraft(step.notes || '');
    setIsStepNotesVisible(true);
    setIsStepNotesClosing(false);
  };

  const handleCloseNotes = () => {
    setIsStepNotesClosing(true);
    window.setTimeout(() => {
      setIsStepNotesVisible(false);
      setIsStepNotesClosing(false);
      stepNotesStepIdRef.current = null;
    }, 200);
  };

  const handleSaveNotes = () => {
    const id = stepNotesStepIdRef.current;
    if (id) {
      onUpdateStep(id, { notes: stepNotesDraft.trim() });
    }
    handleCloseNotes();
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
                <div className="card-elevated__header wheel-card__header flex flex-wrap items-center gap-x-1 gap-y-1 px-2 py-1.5 min-h-[44px]">
                  <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                    {/* Step badge */}
                    <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[0.7rem] font-mono text-neutral-100 -ml-1 shadow-sm">
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
                      widthClass="min-w-[9rem] max-w-[11rem]"
                      menuWidthClass="w-52"
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

                  {/* RIGHT: D editor + delete */}
                  <div className="flex items-center gap-1 flex-nowrap ml-auto">
                    <label className="flex items-center gap-1 text-[0.7rem] text-neutral-300">
                      <span>D</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="w-[64px] rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-[0.8rem] font-mono mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
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

                          const normalised = trimmed.replace(',', '.');
                          const val = Number(normalised);

                          if (!Number.isNaN(val)) {
                            patch.D = Math.round(val * 100) / 100;
                          }
                          onUpdateWheel(wheel.id, patch);
                        }}
                      />
                      <span>mm</span>
                    </label>

                    <button
                      type="button"
                      className={`${BTN.iconPlain} text-danger ml-1`}
                      onClick={() => requestDeleteStep(step.id)}
                      title="Delete step"
                    >
                      <IconTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Body: base toggle / angle offset / notes / sort */}
                <div
                  className={`${progressionBodyPaddingX} ${progressionBodyPaddingY} grid grid-cols-[1fr_1fr_auto] ${progressionBodyGap} items-stretch`}
                >
                  {/* Left column: base select (top) + angle offset (bottom) */}
                  <div className="flex flex-col gap-2 h-full justify-between">
                    <div className="flex items-center gap-2">
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
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-neutral-400 text-[0.7rem]">
                        {targetAngleSymbol} offset
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="w-14 rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-right text-xs font-mono"
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
                      <span className="text-neutral-400 text-[0.7rem]">°</span>
                    </div>
                  </div>

                  {/* Middle column: notes button */}
                  <div className="flex flex-col gap-2 items-start h-full relative justify-center">
                    <button
                      type="button"
                      className={`${BTN.base} self-start text-xs ${
                        step.notes?.trim() ? 'border-accent text-accent font-medium' : ''
                      }`}
                      onClick={() => handleOpenNotes(step)}
                    >
                      {step.notes?.trim() ? 'Notes (edit)' : 'Add Notes'}
                    </button>
                    {step.notes?.trim() && (
                      <p className="text-[0.65rem] text-neutral-400 line-clamp-1 italic">
                        {step.notes}
                      </p>
                    )}
                  </div>

                  {/* Right column: sort controls */}
                  <div className="flex flex-col justify-center items-end h-full min-w-[52px]">
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
                      className={`${BTN.icon} mt-1`}
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

      {/* Step Notes Modal */}
      {isStepNotesVisible && (
        <ModalShell
          title="Step notes"
          subtitle="Add notes or specific instructions for this sharpening step."
          onClose={handleCloseNotes}
          closing={isStepNotesClosing}
          overlayStyle={modalOverlayStyle}
          dialogStyle={getModalDialogStyle()}
        >
          <div className="mt-1 flex flex-col gap-3">
            <textarea
              className="w-full min-h-[6rem] rounded border u-border u-surface p-2 text-xs u-text focus:ring-1 focus:ring-accent"
              autoFocus
              value={stepNotesDraft}
              onChange={e => setStepNotesDraft(e.target.value)}
              placeholder="e.g. Light pressure only, 5 passes per side, deburr stroke..."
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className={BTN.ghost}
                onClick={handleCloseNotes}
              >
                Cancel
              </button>
              <button
                type="button"
                className={BTN.primary}
                onClick={handleSaveNotes}
              >
                Save Notes
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

export default ProgressionEditor;
