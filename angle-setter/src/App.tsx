import { computeWheelResults } from "./math/tormek";
// ==============================================================================
// UWGAS (Universal Wet Grinder Angle Setter)
// Precision Tormek / Wet Grinder USB Height Calculator
// ==============================================================================

import * as React from 'react';
import { IconCalculator, IconDisc, IconSettings } from './icons';
import ImportExportPanel from './components/ImportExportPanel';
import SettingsRootView from './components/settings/SettingsRootView';
import MeasurementSettingsView from './components/settings/MeasurementSettingsView';
import GlossaryPage from './components/GlossaryPage';
import ProgressionView from './components/ProgressionView';
import GlobalSetupCard from './components/calculator/GlobalSetupCard';
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
import { readPersistedState, writePersistedState } from './state/storage';
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
    'root' | 'machine' | 'hardware' | 'measurement' | 'import' | 'glossary'
  >('root');

  const showDevHeader = import.meta.env.DEV;
  const [isSetupPanelOpen, setIsSetupPanelOpen] = React.useState(false);
  // Global click-outside to collapse panels
  React.useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent | MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      // If clicking inside a card, drawer, or action sheet, don't collapse.
      // We look for common container classes or explicit interactables.
      const isInteractive = target.closest('.bg-\\[\\#262626\\], .bg-neutral-900, .action-sheet, button, input, select, [role="dialog"]');
      if (!isInteractive) {
        setIsSetupPanelOpen(false);
        window.dispatchEvent(new CustomEvent('collapseAll'));
      }
    };
    
    // Use pointerdown so it fires before click (which might be intercepted by scroll)
    document.addEventListener('pointerdown', handleGlobalPointerDown);
    return () => document.removeEventListener('pointerdown', handleGlobalPointerDown);
  }, []);

  // Preset dialogs state
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>('');
  const [isPresetDialogOpen, setIsPresetDialogOpen] = React.useState(false);
  const [isPresetDialogClosing, setIsPresetDialogClosing] = React.useState(false);
  const [presetNameDraft, setPresetNameDraft] = React.useState('');

  const [isPresetManagerOpen, setIsPresetManagerOpen] = React.useState(false);
  const [isPresetManagerClosing, setIsPresetManagerClosing] = React.useState(false);

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

  // ======= Calculations & Machine Configuration =======
  const targetAngleSymbol = 'θ';

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

  const exportText = React.useMemo(() => {
    const payload: Record<string, unknown> = {};
    if (exportSections.global) payload.global = global;
    if (exportSections.constants) {
      payload.machines = machines;
      if (defaultMachineId) payload.defaultMachineId = defaultMachineId;
      payload.jigs = jigs;
      payload.usbs = usbs;
    }
    if (exportSections.wheels) payload.wheels = wheels;
    if (exportSections.sessionSteps) payload.sessionSteps = sessionSteps;
    if (exportSections.sessionPresets) payload.sessionPresets = sessionPresets;
    if (exportSections.heightMode) payload.heightMode = heightMode;
    return JSON.stringify(payload, null, 2);
  }, [exportSections, global, machines, defaultMachineId, jigs, usbs, wheels, sessionSteps, sessionPresets, heightMode]);

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
    <div className="min-h-dvh bg-[#09090b] text-white p-3 sm:p-4 pb-[140px] flex flex-col gap-4 max-w-4xl mx-auto selection:bg-amber-400/30 selection:text-white">
      {view === 'settings' && (
        <div className="fixed top-3 right-4 text-xs text-white/30 font-mono tracking-wider pointer-events-none z-30" aria-label={`App version ${APP_VERSION}`}>
          v{APP_VERSION_DISPLAY}
        </div>
      )}
      {showDevHeader && (
        <div className="self-start px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-mono font-bold text-amber-400">
          UWGAS DEV BUILD
        </div>
      )}

      {/* ================= CALCULATOR VIEW ================= */}
      {view === 'calculator' && (
        <div className="flex flex-col gap-4">
          {/* Global Setup Card */}
          <GlobalSetupCard jigs={jigs} usbs={usbs} sessionSteps={sessionSteps}
            machines={machines}
            defaultMachineId={defaultMachineId}
            setDefaultMachineId={setDefaultMachineId}
            sessionPresets={sessionPresets}
            selectedPresetId={selectedPresetId}
            onLoadPreset={(id) => {
              setSelectedPresetId(id);
              if (id) handleLoadPreset(id);
            }}
            onOpenSavePreset={() => setIsPresetDialogOpen(true)}
            onOpenManagePresets={() => setIsPresetManagerOpen(true)}
            global={global}
            setGlobal={setGlobal}
            isSetupPanelOpen={isSetupPanelOpen}
            setIsSetupPanelOpen={setIsSetupPanelOpen}
            heightMode={heightMode}
            targetAngleSymbol={targetAngleSymbol}
            constants={machines.find(m => m.id === defaultMachineId)?.constants || machines[0]?.constants}
          />

          {/* Progression Section */}
          <section className="flex flex-col gap-0 w-full max-w-[576px] mx-auto">
            <div className="sticky top-2 z-20 flex items-center justify-between mb-4 px-2 py-2 bg-[#262626]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
              <div className="flex-1 flex justify-start">
                <button
                  type="button"
                  className="h-9 px-3 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-red-500/10 text-red-500 hover:bg-red-500/20 active:bg-red-500/25 border border-red-500/20 transition disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center active:scale-95"
                  onClick={() => setSessionSteps([])}
                  disabled={sessionSteps.length === 0}
                >
                  Clear All
                </button>
              </div>
              
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-widest uppercase truncate px-2">
                Progression
              </h2>
              
              <div className="flex-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="h-9 px-3 sm:px-4 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500 transition shadow-[0_0_15px_rgba(251,191,36,0.2)] flex items-center justify-center active:scale-95"
                >
                  + Add Step
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <div className="mt-1">
                {sessionSteps.length === 0 ? (
                  <div className="text-sm text-white/40 bg-[#262626] border border-white/10 rounded-3xl p-8 flex flex-col gap-4 items-center text-center shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />
                    <p className="text-white/60 relative z-10 font-medium">No sharpening steps defined yet.</p>
                    <div className="flex flex-col w-full gap-3 mt-2 relative z-10">
                      <button
                        type="button"
                        className="w-full bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold h-12 px-4 rounded-2xl transition flex items-center justify-center text-sm"
                        onClick={handleLoadDefaultProgression}
                      >
                        Load Standard Progression
                      </button>
                      <button
                        type="button"
                        className="w-full border border-white/10 hover:bg-white/5 active:bg-white/10 text-white/70 hover:text-white font-bold h-12 px-4 rounded-2xl transition flex items-center justify-center text-sm"
                        onClick={handleAddStep}
                      >
                        Add Blank Step
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 w-full">
                    <ProgressionView
                      wheelResults={wheelResults}
                      machines={machines}
                      defaultMachineId={defaultMachineId}
                      usbs={usbs}
                      wheels={wheels}
                      globalUsbId={global.activeUsbId}
                      heightMode={heightMode}
                      calcMode={global.calcMode}
                      showAdvancedStepOverrides={global.showAdvancedStepOverrides}
                      onUpdateStep={handleUpdateStep}
                      onDeleteStep={handleDeleteStep}
                      onMoveStep={handleMoveStep}
                    />
                  </div>
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
          {settingsView === 'root' && (
            <SettingsRootView onSelectSection={(sec) => setSettingsView(sec)} />
          )}

          {settingsView === 'measurement' && (
            <MeasurementSettingsView 
              heightMode={heightMode} 
              setHeightMode={setHeightMode}
              global={global}
              setGlobal={setGlobal}
              onBack={() => setSettingsView('root')}
            />
          )}

          {settingsView === 'hardware' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <button 
                type="button" 
                onClick={() => setSettingsView('root')} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 text-white/70 hover:text-white transition w-fit min-h-[44px] text-xs font-bold"
              >
                <span>&larr;</span>
                <span>Back to Settings</span>
              </button>
              <HardwareManagerView
                jigs={jigs}
                usbs={usbs}
                onUpdateJig={handleUpdateJig}
                onAddJig={handleAddJig}
                onDeleteJig={handleDeleteJig}
                onUpdateUsb={handleUpdateUsb}
                onAddUsb={handleAddUsb}
                onDeleteUsb={handleDeleteUsb}
                onClose={() => setSettingsView('root')}
              />
            </div>
          )}

          {settingsView === 'machine' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <button 
                type="button" 
                onClick={() => setSettingsView('root')} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 text-white/70 hover:text-white transition w-fit min-h-[44px] text-xs font-bold"
              >
                <span>&larr;</span>
                <span>Back to Settings</span>
              </button>
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
            </div>
          )}

          
          {settingsView === 'import' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200 pb-20">
              <button 
                type="button" 
                onClick={() => setSettingsView('root')} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 text-white/70 hover:text-white transition w-fit min-h-[44px] text-xs font-bold"
              >
                <span>&larr;</span>
                <span>Back to Settings</span>
              </button>
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
            </div>
          )}

          {settingsView === 'glossary' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <button 
                type="button" 
                onClick={() => setSettingsView('root')} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 text-white/70 hover:text-white transition w-fit min-h-[44px] text-xs font-bold"
              >
                <span>&larr;</span>
                <span>Back to Settings</span>
              </button>
              <GlossaryPage />
            </div>
          )}
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

      {/* ================= BOTTOM TAB BAR ================= */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#18181b]/95 backdrop-blur-lg border-t border-white/10 flex items-center justify-around z-40 pb-safe shadow-2xl">
        <button
          type="button"
          onClick={() => setView('calculator')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${view === 'calculator' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white/80'}`}
          aria-label="Calculator View"
        >
          <div className={`flex items-center justify-center w-12 h-10 rounded-2xl transition-all ${view === 'calculator' ? 'bg-amber-400/10' : ''}`}>
            <IconCalculator className="w-6 h-6" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setView('wheels')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${view === 'wheels' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white/80'}`}
          aria-label="Wheels View"
        >
          <div className={`flex items-center justify-center w-12 h-10 rounded-2xl transition-all ${view === 'wheels' ? 'bg-amber-400/10' : ''}`}>
            <IconDisc className="w-6 h-6" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setView('settings')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${view === 'settings' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white/80'}`}
          aria-label="Settings View"
        >
          <div className={`flex items-center justify-center w-12 h-10 rounded-2xl transition-all ${view === 'settings' ? 'bg-amber-400/10' : ''}`}>
            <IconSettings className="w-6 h-6" />
          </div>
        </button>
      </div>
    </div>
  );
}
