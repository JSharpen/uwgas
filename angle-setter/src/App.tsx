import { computeWheelResults } from "./math/tormek";
// ==============================================================================
// UWGAS (Universal Wet Grinder Angle Setter)
// Precision Tormek / Wet Grinder USB Height Calculator
// ==============================================================================

import * as React from 'react';
import { IconKebab } from './icons';
import ImportExportPanel from './components/ImportExportPanel';
import PreferencesView from './components/settings/PreferencesView';
import GlossaryPage from './components/GlossaryPage';
import ProgressionView from './components/ProgressionView';
import ThemeLab from './components/ThemeLab';
import MiniSelect from './components/MiniSelect';
import GlobalSetupCard from './components/calculator/GlobalSetupCard';
import ProgressionEditor from './components/calculator/ProgressionEditor';
import WheelManagerView from './components/wheels/WheelManagerView';
import PresetManagerModal from './components/presets/PresetManagerModal';
import SavePresetDialog from './components/presets/SavePresetDialog';
import MachineManagerView from './components/settings/MachineManagerView';
import HardwareManagerView from './components/settings/HardwareManagerView';
import useModalLayout from './hooks/useModalLayout';

import type { JigConfig, UsbConfig,
  GlobalState,
  MachineConfig,
  
  SessionPreset,
  SessionStep,
  Wheel,
} from './types/core';
import {
  normalizeWheel,
} from './utils/normalizers';
import { _load, readPersistedState, writePersistedState } from './state/storage';
import { DEFAULT_CONSTANTS, DEFAULT_GLOBAL, DEFAULT_WHEELS, DEFAULT_JIGS, DEFAULT_USBS } from './state/defaults';
import { BTN } from './ui/buttons';
import { APP_VERSION, APP_VERSION_DISPLAY } from './version';


type ImportSections = {
  global: boolean;
  constants: boolean;
  wheels: boolean;
  sessionSteps: boolean;
  sessionPresets: boolean;
  heightMode: boolean;
};

type ImportModes = {
  [K in keyof ImportSections]: 'merge' | 'overwrite';
};

export default function App() {
  // ======= Core state =======
  const [initialState] = React.useState(() => readPersistedState());
  const [global, setGlobal] = React.useState<GlobalState>(initialState.global);
  const [machines, setMachines] = React.useState<MachineConfig[]>(initialState.machines || []);
  const [defaultMachineId, setDefaultMachineId] = React.useState<string | undefined>(initialState.defaultMachineId);
  const [jigs, setJigs] = React.useState<JigConfig[]>(initialState.jigs);
  const [usbs, setUsbs] = React.useState<UsbConfig[]>(initialState.usbs);
  
  const [wheels, setWheels] = React.useState<Wheel[]>(() => {
    const seen = new Set<string>();
    return initialState.wheels
      .map(normalizeWheel)
      .filter(w => {
        if (seen.has(w.id)) return false;
        seen.add(w.id);
        return true;
      });
  });

  const [sessionSteps, setSessionSteps] = React.useState<SessionStep[]>(initialState.sessionSteps);
  const [sessionPresets, setSessionPresets] = React.useState<SessionPreset[]>(initialState.sessionPresets);
  const [heightMode, setHeightMode] = React.useState<'hn' | 'hr'>(initialState.heightMode || 'hn');



  // Persistence effect
  React.useEffect(() => {
    writePersistedState({
      version: 5,
      global,
      machines,
      defaultMachineId,
      jigs,
      usbs,
      wheels,
      sessionSteps,
      sessionPresets,
      heightMode,
    });
  }, [global, machines, defaultMachineId, jigs, usbs, wheels, sessionSteps, sessionPresets, heightMode]);

  // ======= Navigation & UI States =======

  const [view, setView] = React.useState<'calculator' | 'wheels' | 'settings'>('calculator');
  const [settingsView, setSettingsView] = React.useState<
    'machine' | 'hardware' | 'calibration' | 'import' | 'preferences' | 'glossary' | 'themelab'
  >('machine');

  const showDevHeader = import.meta.env.DEV;
  const [isSetupPanelOpen, setIsSetupPanelOpen] = React.useState(true);
  const [isWheelConfigOpen, setIsWheelConfigOpen] = React.useState(false);

  // Preset dialogs state
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>('');
  const [isPresetDialogOpen, setIsPresetDialogOpen] = React.useState(false);
  const [isPresetDialogClosing, setIsPresetDialogClosing] = React.useState(false);
  const [presetNameDraft, setPresetNameDraft] = React.useState('');

  const [isPresetManagerOpen, setIsPresetManagerOpen] = React.useState(false);
  const [isPresetManagerClosing, setIsPresetManagerClosing] = React.useState(false);

  // Progression kebab menu
  const [isProgressionMenuVisible, setIsProgressionMenuVisible] = React.useState(false);
  const [isProgressionMenuClosing, setIsProgressionMenuClosing] = React.useState(false);
  const progressionMenuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        isProgressionMenuVisible &&
        progressionMenuRef.current &&
        !progressionMenuRef.current.contains(event.target as Node)
      ) {
        setIsProgressionMenuClosing(true);
        setTimeout(() => {
          setIsProgressionMenuVisible(false);
          setIsProgressionMenuClosing(false);
        }, 160);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isProgressionMenuVisible]);

  // Import / Export sections
  const [exportSections, setExportSections] = React.useState<ImportSections>({
    global: true,
    constants: true,
    wheels: true,
    sessionSteps: true,
    sessionPresets: true,
    heightMode: true,
  });

  const [importSections, setImportSections] = React.useState<ImportSections>({
    global: true,
    constants: true,
    wheels: true,
    sessionSteps: true,
    sessionPresets: true,
    heightMode: true,
  });

  const [importModes, setImportModes] = React.useState<ImportModes>({
    global: 'merge',
    constants: 'merge',
    wheels: 'merge',
    sessionSteps: 'merge',
    sessionPresets: 'merge',
    heightMode: 'merge',
  });

  // Modal layout styles
  const { overlayStyle: modalOverlayStyle, getDialogStyle: getModalDialogStyle } =
    useModalLayout();

  // Calibration state
  
  

  // ======= Calculations & Machine Configuration =======
  const targetAngleSymbol = 'θ';
  const effectiveAngleSymbol = 'γ';
  const progressionBodyPaddingX = 'px-3';
  const progressionBodyPaddingY = 'py-2';
  const progressionBodyGap = 'gap-2';

  const wheelResults = React.useMemo(
    () => computeWheelResults(wheels, sessionSteps, global, machines, jigs, usbs, defaultMachineId),
    [machines, defaultMachineId, global, sessionSteps, wheels, jigs, usbs]
  );

  
  
  
  const handleAddWheel = (wheel: Omit<Wheel, 'id'>) => {
    setWheels(prev => [...prev, { ...wheel, id: crypto.randomUUID() }]);
  };
  const handleDeleteWheel = (id: string) => {
    setWheels(prev => prev.filter(w => w.id !== id));
  };
  
  const handleUpdateJig = (id: string, patch: Partial<JigConfig>) => setJigs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
  const handleAddJig = (j: JigConfig) => setJigs(prev => [...prev, j]);
  const handleDeleteJig = (id: string) => setJigs(prev => prev.filter(j => j.id !== id));
  
  const handleUpdateUsb = (id: string, patch: Partial<UsbConfig>) => setUsbs(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  const handleAddUsb = (u: UsbConfig) => setUsbs(prev => [...prev, u]);
  const handleDeleteUsb = (id: string) => setUsbs(prev => prev.filter(u => u.id !== id));

  const handleUpdateWheel = (id: string, patch: Partial<Wheel>) => {
    setWheels(prev => prev.map(w => (w.id === id ? { ...w, ...patch } : w)));
  };

  const handleAddStep = () => {
    setSessionSteps(prev => [...prev, {
      id: crypto.randomUUID(),
      wheelId: wheels[0]?.id ?? '',
      base: 'front',
      angleOffset: 0
    }]);
  };
  const handleDeleteStep = (id: string) => {
    setSessionSteps(prev => prev.filter(s => s.id !== id));
  };
  const handleUpdateStep = (id: string, patch: Partial<SessionStep>) => {
    setSessionSteps(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };
  const handleMoveStep = (index: number, direction: -1 | 1) => {
    setSessionSteps(prev => {
      const next = [...prev];
      if (index + direction < 0 || index + direction >= next.length) return next;
      const temp = next[index];
      next[index] = next[index + direction];
      next[index + direction] = temp;
      return next;
    });
  };
  const handleLoadDefaultProgression = () => {
    if (wheels.length > 0) {
      setSessionSteps([{
        id: crypto.randomUUID(),
        wheelId: wheels[0].id,
        base: 'front',
        angleOffset: 0
      }]);
    } else {
      setSessionSteps([]);
    }
  };

  const handleLoadPreset = (id: string) => {
    const preset = sessionPresets.find(p => p.id === id);
    if (!preset) return;
    
    setSessionSteps(preset.steps.map(s => ({
      id: crypto.randomUUID(),
      wheelId: s.wheelId,
      base: s.base,
      angleOffset: s.angleOffset,
      machineId: s.machineId,
      usbId: s.usbId
    })));
  };
  const handleDeletePreset = (id: string) => {
    setSessionPresets(prev => prev.filter(p => p.id !== id));
  };
  const handleRenamePreset = (id: string, newName: string) => {
    setSessionPresets(prev => prev.map(p => (p.id === id ? { ...p, name: newName } : p)));
  };
  const handleSavePreset = () => {
    if (!presetNameDraft.trim()) return;
    setSessionPresets(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: presetNameDraft.trim(),
        createdAt: new Date().toISOString(),
        version: 1,
                steps: sessionSteps.map(s => {
          const w = wheels.find(wx => wx.id === s.wheelId);
          return {
            wheelId: s.wheelId,
            wheelName: w ? w.name : 'Unknown Wheel',
            base: s.base,
            angleOffset: s.angleOffset,
            machineId: s.machineId,
            usbId: s.usbId
          };
        }),
      },
    ]);
    setIsPresetDialogOpen(false);
  };

  const exportText = React.useMemo(() => JSON.stringify(null, null, 2), []);

  const handleImportText = React.useCallback(
    (raw: string) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return { error: 'Import failed: invalid JSON.' };
      }
      if (typeof parsed !== 'object' || parsed === null) {
        return { error: 'Import failed: not an object.' };
      }
      
      const parsedObj = parsed as Record<string, unknown>;
      
      const mergeMapById = <T extends { id: string }>(current: T[], incoming: T[]) => {
        const map = new Map<string, T>();
        current.forEach(item => { if (item && item.id) map.set(item.id, item); });
        incoming.forEach(item => { if (item && item.id) map.set(item.id, item); });
        return Array.from(map.values());
      };

      const appliedSummary: string[] = [];

      if (importSections.global && typeof parsedObj.global === 'object' && parsedObj.global !== null) {
        if (importModes.global === 'overwrite') {
          setGlobal(prev => ({ ...prev, ...(parsedObj.global as Partial<GlobalState>) }));
          appliedSummary.push('global: overwrite');
        } else {
          setGlobal(prev => ({ ...prev, ...(parsedObj.global as Partial<GlobalState>) }));
          appliedSummary.push('global: merge');
        }
      }

      if (importSections.constants && Array.isArray(parsedObj.machines)) {
        if (importModes.constants === 'overwrite') {
          setMachines(parsedObj.machines as MachineConfig[]);
          appliedSummary.push('machines: overwrite');
        } else {
          setMachines(prev => mergeMapById(prev, parsedObj.machines as MachineConfig[]));
          appliedSummary.push('machines: merge');
        }
        if (typeof parsedObj.defaultMachineId === 'string') {
          setDefaultMachineId(parsedObj.defaultMachineId);
        }
      }

      if (importSections.wheels && Array.isArray(parsedObj.wheels)) {
        if (importModes.wheels === 'overwrite') {
          setWheels(parsedObj.wheels as Wheel[]);
          appliedSummary.push('wheels: overwrite');
        } else {
          setWheels(prev => mergeMapById(prev, parsedObj.wheels as Wheel[]));
          appliedSummary.push('wheels: merge');
        }
      }

      if (importSections.sessionSteps && Array.isArray(parsedObj.sessionSteps)) {
        if (importModes.sessionSteps === 'overwrite') {
          setSessionSteps(parsedObj.sessionSteps as SessionStep[]);
          appliedSummary.push('steps: overwrite');
        } else {
          setSessionSteps(prev => mergeMapById(prev, parsedObj.sessionSteps as SessionStep[]));
          appliedSummary.push('steps: merge');
        }
      }

      if (importSections.sessionPresets && Array.isArray(parsedObj.sessionPresets)) {
        if (importModes.sessionPresets === 'overwrite') {
          setSessionPresets(parsedObj.sessionPresets as SessionPreset[]);
          appliedSummary.push('presets: overwrite');
        } else {
          setSessionPresets(prev => mergeMapById(prev, parsedObj.sessionPresets as SessionPreset[]));
          appliedSummary.push('presets: merge');
        }
      }

      if (importSections.heightMode && (parsedObj.heightMode === 'hn' || parsedObj.heightMode === 'hr')) {
        setHeightMode(parsedObj.heightMode);
        appliedSummary.push('heightMode: updated');
      }

      const summary = appliedSummary.length > 0 ? `Import applied (${appliedSummary.join('; ')})` : 'Import did not apply any sections.';
      return { summary };
    },
    [importModes, importSections]
  );

  return (
    <div className="min-h-dvh u-bg p-3 sm:p-4 flex flex-col gap-4 max-w-4xl mx-auto">
      {view === 'settings' && (
        <div className="app-watermark" aria-label={`App version ${APP_VERSION}`}>
          v{APP_VERSION_DISPLAY}
        </div>
      )}
      {showDevHeader && <h1 className="text-lg font-semibold u-text">UWGAS Dev build</h1>}

      {/* Top Navigation Tabs */}
      <div className="flex gap-2 text-sm mb-1">
        <button
          type="button"
          className={view === 'calculator' ? BTN.tabPrimary : BTN.tabGhost}
          onClick={() => setView('calculator')}
        >
          Calculator
        </button>

        <button
          type="button"
          className={view === 'wheels' ? BTN.tabPrimary : BTN.tabGhost}
          onClick={() => setView('wheels')}
        >
          Wheel Manager
        </button>

        <button
          type="button"
          className={view === 'settings' ? BTN.tabPrimary : BTN.tabGhost}
          onClick={() => setView('settings')}
        >
          Settings
        </button>
      </div>

      {/* ================= CALCULATOR VIEW ================= */}
      {view === 'calculator' && (
        <div className="flex flex-col gap-4">
          {/* Global Setup Card */}
          <GlobalSetupCard jigs={jigs} usbs={usbs} sessionSteps={sessionSteps}
            global={global}
            setGlobal={setGlobal}
            isSetupPanelOpen={isSetupPanelOpen}
            setIsSetupPanelOpen={setIsSetupPanelOpen}
            heightMode={heightMode}
            targetAngleSymbol={targetAngleSymbol}
            constants={machines.find(m => m.id === defaultMachineId)?.constants || machines[0]?.constants}
          />

          {/* Progression Section */}
          <section className="panel-card panel-card--allow-overflow motion-panel flex flex-col gap-0 max-w-xl">
            <div
              className="panel-card__header grid items-center gap-2"
              style={{ gridTemplateColumns: 'auto minmax(0, 1fr) auto' }}
            >
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold u-text panel-header">Progression</h2>
              </div>

              {/* Presets dropdown */}
              <div className="w-full min-w-0" style={{ maxWidth: 'min(28rem, calc(100% - 6rem))' }}>
                <MiniSelect
                  value={selectedPresetId || ''}
                  options={[
                    { value: '', label: 'Select preset…' },
                    ...sessionPresets.map(p => ({
                      value: p.id,
                      label: p.name,
                      meta: `${p.steps.length} step${p.steps.length === 1 ? '' : 's'}`,
                    })),
                  ]}
                  onChange={id => {
                    setSelectedPresetId(id);
                    if (id) handleLoadPreset(id);
                  }}
                  align="right"
                  widthClass="w-full min-w-[7.5rem]"
                  menuWidthClass="w-48"
                  emptyLabel="No presets saved"
                  renderOption={opt => (
                    <>
                      <div className="dropdown-item__title text-[0.75rem] truncate">{opt.label}</div>
                      {opt.meta ? (
                        <div className="dropdown-item__meta text-[0.7rem]">{opt.meta}</div>
                      ) : null}
                    </>
                  )}
                  renderLabel={opt => (opt ? opt.label : 'Select preset…')}
                />
              </div>

              {/* Edit / Back toggle + Kebab Menu */}
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  className={`${BTN.base} px-3 text-xs`}
                  onClick={() => setIsWheelConfigOpen(open => !open)}
                >
                  {isWheelConfigOpen ? 'Done' : 'Edit'}
                </button>

                <div ref={progressionMenuRef} className="relative">
                  <button
                    type="button"
                    className={`${BTN.iconPlain} text-neutral-300`}
                    title="Progression options"
                    onClick={() => {
                      if (isProgressionMenuVisible && !isProgressionMenuClosing) {
                        setIsProgressionMenuClosing(true);
                        setTimeout(() => {
                          setIsProgressionMenuVisible(false);
                          setIsProgressionMenuClosing(false);
                        }, 160);
                      } else {
                        setIsProgressionMenuVisible(true);
                        setIsProgressionMenuClosing(false);
                      }
                    }}
                  >
                    <IconKebab className="w-5 h-5" />
                  </button>

                  {isProgressionMenuVisible && (
                    <div
                      className="absolute right-0 mt-1 w-52 rounded border u-border u-surface shadow-lg text-xs z-30 overflow-hidden"
                      style={{
                        transformOrigin: 'top right',
                        animation: `${
                          isProgressionMenuClosing
                            ? 'menuFadeSlideOut 100ms ease-in forwards'
                            : 'menuFadeSlideIn 100ms ease-out forwards'
                        }`,
                      }}
                    >
                      <button
                        type="button"
                        className="menu-item w-full px-3 py-2 text-left"
                        onClick={() => {
                          setIsPresetDialogOpen(true);
                          setIsProgressionMenuVisible(false);
                        }}
                        disabled={sessionSteps.length === 0}
                      >
                        Save as preset
                      </button>
                      <button
                        type="button"
                        className="menu-item w-full px-3 py-2 text-left"
                        onClick={() => {
                          setIsPresetManagerOpen(true);
                          setIsProgressionMenuVisible(false);
                        }}
                      >
                        Manage presets
                      </button>
                      <button
                        type="button"
                        className="menu-item w-full px-3 py-2 text-left"
                        onClick={() => {
                          handleLoadDefaultProgression();
                          setIsProgressionMenuVisible(false);
                        }}
                      >
                        Load standard progression
                      </button>
                      <button
                        type="button"
                        className="menu-item w-full px-3 py-2 text-left text-danger"
                        onClick={() => {
                          setSessionSteps([]);
                          setIsProgressionMenuVisible(false);
                        }}
                        disabled={sessionSteps.length === 0}
                      >
                        Clear progression
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="panel-card__body flex flex-col gap-3">
              <div className="mt-1">
                {isWheelConfigOpen ? (
                  <ProgressionEditor usbs={usbs}
                    sessionSteps={sessionSteps}
                    wheels={wheels}
                    machines={machines}
                    defaultMachineId={defaultMachineId}
                    onUpdateStep={handleUpdateStep}
                    onUpdateWheel={handleUpdateWheel}
                    onDeleteStep={handleDeleteStep}
                    onAddStep={handleAddStep}
                    onLoadDefaultProgression={handleLoadDefaultProgression}
                    onMoveStep={handleMoveStep}
                    targetAngleSymbol={targetAngleSymbol}
                    progressionBodyPaddingX={progressionBodyPaddingX}
                    progressionBodyPaddingY={progressionBodyPaddingY}
                    progressionBodyGap={progressionBodyGap}
                  />
                ) : sessionSteps.length === 0 ? (
                  <div className="text-xs text-neutral-400 border border-dashed u-border rounded p-4 flex flex-col gap-3 items-center text-center">
                    <p>No sharpening steps defined yet.</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={BTN.primary}
                        onClick={handleLoadDefaultProgression}
                      >
                        + Load Standard Progression
                      </button>
                      <button
                        type="button"
                        className={BTN.base}
                        onClick={() => setIsWheelConfigOpen(true)}
                      >
                        Edit Steps Manually
                      </button>
                    </div>
                  </div>
                ) : (
                  <ProgressionView usbs={usbs} globalUsbId={global.activeUsbId}
                    wheelResults={wheelResults}
                    machines={machines}
                    defaultMachineId={defaultMachineId}
                    heightMode={heightMode}
                    calcMode={global.calcMode}
                    angleSymbol={effectiveAngleSymbol}
                    bodyPaddingX={progressionBodyPaddingX}
                    bodyPaddingY={progressionBodyPaddingY}
                    bodyGap={progressionBodyGap}
                  />
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ================= WHEEL MANAGER VIEW ================= */}
      {view === 'wheels' && (
        <WheelManagerView
          wheels={wheels}
          onAddWheel={handleAddWheel}
          onUpdateWheel={handleUpdateWheel}
          onDeleteWheel={handleDeleteWheel}
        />
      )}

      {/* ================= SETTINGS VIEW ================= */}
      {view === 'settings' && (
        <>
          <div className="flex justify-end mb-2">
            <MiniSelect
              value={settingsView === 'calibration' ? 'machine' : settingsView}
                            options={[
                { value: 'machine', label: 'Machines' },
                { value: 'hardware', label: 'Hardware' },
                { value: 'preferences', label: 'Preferences' },
                { value: 'import', label: 'Import / export' },
                { value: 'glossary', label: 'Glossary' },
                { value: 'themelab', label: 'Theme Lab' },
              ]}
              onChange={val => {
                if (val === 'calibration') return;
                setSettingsView(val as typeof settingsView);
              }}
              widthClass="w-52"
              menuWidthClass="w-56"
            />
          </div>

          
                    {settingsView === 'preferences' && (
            <PreferencesView heightMode={heightMode} setHeightMode={setHeightMode} />
          )}

          {settingsView === 'hardware' && (
            <HardwareManagerView
              jigs={jigs}
              usbs={usbs}
              onUpdateJig={handleUpdateJig}
              onAddJig={handleAddJig}
              onDeleteJig={handleDeleteJig}
              onUpdateUsb={handleUpdateUsb}
              onAddUsb={handleAddUsb}
              onDeleteUsb={handleDeleteUsb}
              onClose={() => setSettingsView('machine')}
            />
          )}

          {settingsView === 'machine' && (
            <MachineManagerView jigs={jigs} usbs={usbs}
              global={global}
              wheels={wheels}
              machines={machines}
              defaultMachineId={defaultMachineId}
              onAddMachine={m => setMachines(prev => [...prev, m])}
              onUpdateMachine={(id, patch) => setMachines(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m))}
              onDeleteMachine={id => setMachines(prev => prev.filter(m => m.id !== id))}
              onSetDefaultMachine={id => setDefaultMachineId(id)}
              />
          )}

          
          {settingsView === 'import' && (
            <ImportExportPanel
              exportText={exportText}
              onImportText={handleImportText}
              exportSections={exportSections}
              onToggleExportSection={key =>
                setExportSections(prev => ({ ...prev, [key]: !prev[key] as boolean }))
              }
              importSections={importSections}
              importModes={importModes}
              onToggleImportSection={key =>
                setImportSections(prev => ({ ...prev, [key]: !prev[key] as boolean }))
              }
              onChangeImportMode={(key, mode) =>
                setImportModes(prev => ({ ...prev, [key]: mode }))
              }
            />
          )}

          {settingsView === 'glossary' && <GlossaryPage />}
          {settingsView === 'themelab' && <ThemeLab />}
        </>
      )}

      {/* ================= PRESET MODALS ================= */}
      <PresetManagerModal
        isOpen={isPresetManagerOpen}
        isClosing={isPresetManagerClosing}
        onClose={() => {
          setIsPresetManagerClosing(true);
          setTimeout(() => {
            setIsPresetManagerOpen(false);
            setIsPresetManagerClosing(false);
          }, 200);
        }}
        sessionPresets={sessionPresets}
        selectedPresetId={selectedPresetId}
        onLoadPreset={handleLoadPreset}
        onDeletePreset={handleDeletePreset}
        onRenamePreset={handleRenamePreset}
        overlayStyle={modalOverlayStyle}
        dialogStyle={getModalDialogStyle()}
      />

      <SavePresetDialog
        isOpen={isPresetDialogOpen}
        isClosing={isPresetDialogClosing}
        onClose={() => {
          setIsPresetDialogClosing(true);
          setTimeout(() => {
            setIsPresetDialogOpen(false);
            setIsPresetDialogClosing(false);
            setPresetNameDraft('');
          }, 200);
        }}
        presetNameDraft={presetNameDraft}
        setPresetNameDraft={setPresetNameDraft}
        onSave={handleSavePreset}
        canSave={Boolean(presetNameDraft.trim() && sessionSteps.length > 0)}
        overlayStyle={modalOverlayStyle}
        dialogStyle={getModalDialogStyle()}
      />
    </div>
  );
}
