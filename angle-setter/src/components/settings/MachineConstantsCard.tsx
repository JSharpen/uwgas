import * as React from 'react';
import type { CalibrationSnapshot, MachineConstants } from '../../types/core';
import { _nz } from '../../utils/numbers';
import { blurOnEnter } from '../../utils/dom';
import MiniSelect from '../MiniSelect';

const RESIDUAL_SYMBOL = '\u03b5';

type BaseCardProps = {
  title: string;
  snap: CalibrationSnapshot | null;
  options: { value: string; label: string }[];
  appliedId: string;
  display: { hc: number; o: number };
  constantsInputMode: 'normal' | 'failsafe';
  onChange: (val: string) => void;
  onChangeField: (field: 'hc' | 'o', value: string) => void;
};

export function BaseCard({
  title,
  snap,
  options,
  appliedId,
  display,
  onChange,
  onChangeField,
}: BaseCardProps) {
  const isLocked = Boolean(snap);
  const baseKey: 'rear' | 'front' = title.toLowerCase().includes('rear') ? 'rear' : 'front';
  const hcId = `${baseKey}-const-hc`;
  const oId = `${baseKey}-const-o`;
  const [hcDraft, setHcDraft] = React.useState<string>(() => String(display.hc ?? ''));
  const [oDraft, setODraft] = React.useState<string>(() => String(display.o ?? ''));

  // Keep local drafts in sync when the source changes
  React.useEffect(() => {
    setHcDraft(String(display.hc ?? ''));
    setODraft(String(display.o ?? ''));
  }, [display.hc, display.o, appliedId]);

  const residual = snap?.diagnostics?.maxAbsResidualMm;
  let sourceCls = 'text-neutral-400';
  if (typeof residual === 'number' && Number.isFinite(residual)) {
    if (residual <= 0.05) sourceCls = 'text-accent';
    else if (residual <= 0.1) sourceCls = 'text-accent-soft';
    else if (residual <= 0.2) sourceCls = 'text-warning';
    else sourceCls = 'text-danger';
  }

  const handleCommit = React.useCallback(
    (field: 'hc' | 'o', value: string) => {
      onChangeField(field, value);
    },
    [onChangeField]
  );

  return (
    <div className="rounded border border-neutral-700 bg-neutral-950/40 p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-neutral-200">
        <span>{title}</span>
        <MiniSelect
          value={appliedId}
          options={options}
          onChange={onChange}
          widthClass="w-56"
          menuWidthClass="w-64"
        />
      </div>
      <div className={`text-[0.7rem] ${sourceCls}`}>
        {snap ? (
          <>
            Source: {(snap.baseTag || snap.base || 'rear').toString().replace(/^\w/, c => c.toUpperCase())} calibration
            {snap.name?.trim() ? ` "${snap.name.trim()}"` : ''} {snap.createdAt ? `(${snap.createdAt.slice(0, 10)})` : ''} ({snap.count} pts
            {residual != null ? `, max |resid| ${residual.toFixed(3)} mm` : ''}
            {snap.angleErrorDeg != null ? `, ~${snap.angleErrorDeg.toFixed(3)} deg` : ''})
          </>
        ) : (
          'Source: Manual input'
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor={hcId} className="w-16 text-neutral-300 text-xs">
            hc (mm)
          </label>
          {isLocked ? (
            <div className="w-40 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-sm text-right text-neutral-400 select-none">
              {display.hc}
            </div>
          ) : (
            <input
              type="number"
              inputMode="decimal"
              id={hcId}
              className="w-40 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right"
              value={hcDraft ?? ''}
              onChange={e => setHcDraft(e.target.value)}
              onBlur={e => handleCommit('hc', e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  blurOnEnter(e);
                  handleCommit('hc', e.currentTarget.value);
                }
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={oId} className="w-16 text-neutral-300 text-xs">
            o (mm)
          </label>
          {isLocked ? (
            <div className="w-40 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-sm text-right text-neutral-400 select-none">
              {display.o}
            </div>
          ) : (
            <input
              type="number"
              inputMode="decimal"
              id={oId}
              className="w-40 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-right"
              value={oDraft ?? ''}
              onChange={e => setODraft(e.target.value)}
              onBlur={e => handleCommit('o', e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  blurOnEnter(e);
                  handleCommit('o', e.currentTarget.value);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export type MachineConstantsCardProps = {
  constants: MachineConstants;
  setConstants: React.Dispatch<React.SetStateAction<MachineConstants>>;
  calibSnapshots: CalibrationSnapshot[];
  calibAppliedIds: { rear: string; front: string };
  setCalibAppliedIds: React.Dispatch<
    React.SetStateAction<{ rear: string; front: string }>
  >;
  constantsInputMode?: 'normal' | 'failsafe';
};

export function MachineConstantsCard({
  constants,
  setConstants,
  calibSnapshots,
  calibAppliedIds,
  setCalibAppliedIds,
  constantsInputMode = 'normal',
}: MachineConstantsCardProps) {
  const rearSnap = calibSnapshots.find(s => s.id === calibAppliedIds.rear) || null;
  const frontSnap = calibSnapshots.find(s => s.id === calibAppliedIds.front) || null;

  const sortByDateDesc = (list: CalibrationSnapshot[]) =>
    [...list].sort((a, b) => {
      const da = Date.parse(a.createdAt || '') || 0;
      const db = Date.parse(b.createdAt || '') || 0;
      return db - da;
    });

  const formatOption = (snap: CalibrationSnapshot, fallbackLabel: string) => {
    const label =
      snap.name?.trim() ||
      snap.createdAt?.slice(0, 10) ||
      fallbackLabel ||
      'Calibration';
    const resid = Number.isFinite(snap.diagnostics?.maxAbsResidualMm)
      ? `, ${RESIDUAL_SYMBOL} ${snap.diagnostics.maxAbsResidualMm.toFixed(3)} mm`
      : '';
    return {
      value: snap.id,
      label: `${(snap.baseTag || fallbackLabel)
        .toString()
        .replace(/^\w/, c => c.toUpperCase())} - ${label} (${snap.count} pts${resid})`,
    };
  };

  const rearOptions = [
    { value: '', label: 'Manual input' },
    ...sortByDateDesc(calibSnapshots.filter(s => s.base === 'rear')).map(s =>
      formatOption(s, 'Rear')
    ),
  ];

  const frontOptions = [
    { value: '', label: 'Manual input' },
    ...sortByDateDesc(calibSnapshots.filter(s => s.base === 'front')).map(s =>
      formatOption(s, 'Front')
    ),
  ];

  const rearDisplay = rearSnap ? { hc: rearSnap.hc, o: rearSnap.o } : constants.rear;
  const frontDisplay = frontSnap ? { hc: frontSnap.hc, o: frontSnap.o } : constants.front;

  return (
    <section className="panel-card panel-card--strong flex flex-col gap-0 max-w-xl motion-panel">
      <div className="panel-card__header">
        <h2 className="text-sm font-semibold u-text panel-header">Machine constants</h2>
      </div>
      <div className="panel-card__body flex flex-col gap-2">
        <p className="text-xs u-text-muted">
          Rear and front base geometry for the active machine. Calibration will update these
          values; you can also tweak them manually.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <BaseCard
            title="Rear base"
            snap={rearSnap}
            options={rearOptions}
            appliedId={calibAppliedIds.rear}
            display={rearDisplay}
            constantsInputMode={constantsInputMode}
            onChange={val => setCalibAppliedIds(prev => ({ ...prev, rear: val || '' }))}
            onChangeField={(field, value) =>
              setConstants(c => ({
                ...c,
                rear: { ...c.rear, [field]: _nz(value, c.rear[field]) },
              }))
            }
          />
          <BaseCard
            title="Front base"
            snap={frontSnap}
            options={frontOptions}
            appliedId={calibAppliedIds.front}
            display={frontDisplay}
            constantsInputMode={constantsInputMode}
            onChange={val => setCalibAppliedIds(prev => ({ ...prev, front: val || '' }))}
            onChangeField={(field, value) =>
              setConstants(c => ({
                ...c,
                front: { ...c.front, [field]: _nz(value, c.front[field]) },
              }))
            }
          />
        </div>
      </div>
    </section>
  );
}

export default MachineConstantsCard;
