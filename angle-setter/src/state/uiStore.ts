import { create } from 'zustand';

export type ImportSections = {
  global: boolean;
  constants: boolean;
  wheels: boolean;
  sessionSteps: boolean;
  sessionPresets: boolean;
  heightMode: boolean;
};

export type ImportModes = {
  [K in keyof ImportSections]: 'merge' | 'overwrite';
};

export interface UIState {
  view: 'calculator' | 'wheels' | 'settings';
  settingsView: 'root' | 'machine' | 'hardware' | 'measurement' | 'import' | 'glossary';
  isSetupPanelOpen: boolean;
  selectedPresetId: string;
  isPresetDialogOpen: boolean;
  isPresetDialogClosing: boolean;
  presetNameDraft: string;
  isPresetManagerOpen: boolean;
  isPresetManagerClosing: boolean;
  isConfirmingClear: boolean;
  focusWheelId: string | null;
  exportSections: ImportSections;
  importSections: ImportSections;
  importModes: ImportModes;

  // Actions
  setView: (view: 'calculator' | 'wheels' | 'settings') => void;
  setSettingsView: (
    view: 'root' | 'machine' | 'hardware' | 'measurement' | 'import' | 'glossary'
  ) => void;
  setSetupPanelOpen: (isOpen: boolean) => void;
  toggleSetupPanel: () => void;
  setSelectedPresetId: (id: string) => void;
  setPresetDialogOpen: (isOpen: boolean) => void;
  setPresetDialogClosing: (isClosing: boolean) => void;
  setPresetNameDraft: (name: string) => void;
  setPresetManagerOpen: (isOpen: boolean) => void;
  setPresetManagerClosing: (isClosing: boolean) => void;
  setIsConfirmingClear: (confirming: boolean) => void;
  setFocusWheelId: (wheelId: string | null) => void;
  setExportSections: (
    sections: ImportSections | ((prev: ImportSections) => ImportSections)
  ) => void;
  setImportSections: (
    sections: ImportSections | ((prev: ImportSections) => ImportSections)
  ) => void;
  setImportModes: (modes: ImportModes | ((prev: ImportModes) => ImportModes)) => void;
}

const DEFAULT_IMPORT_SECTIONS: ImportSections = {
  global: true,
  constants: true,
  wheels: true,
  sessionSteps: true,
  sessionPresets: true,
  heightMode: true,
};

const DEFAULT_IMPORT_MODES: ImportModes = {
  global: 'merge',
  constants: 'merge',
  wheels: 'merge',
  sessionSteps: 'merge',
  sessionPresets: 'merge',
  heightMode: 'overwrite',
};

export const useUIStore = create<UIState>((set) => ({
  view: 'calculator',
  settingsView: 'root',
  isSetupPanelOpen: false,
  selectedPresetId: '',
  isPresetDialogOpen: false,
  isPresetDialogClosing: false,
  presetNameDraft: '',
  isPresetManagerOpen: false,
  isPresetManagerClosing: false,
  isConfirmingClear: false,
  focusWheelId: null,
  exportSections: { ...DEFAULT_IMPORT_SECTIONS },
  importSections: { ...DEFAULT_IMPORT_SECTIONS },
  importModes: { ...DEFAULT_IMPORT_MODES },

  setView: (view) => set({ view }),
  setSettingsView: (settingsView) => set({ settingsView }),
  setSetupPanelOpen: (isSetupPanelOpen) => set({ isSetupPanelOpen }),
  toggleSetupPanel: () => set((state) => ({ isSetupPanelOpen: !state.isSetupPanelOpen })),
  setSelectedPresetId: (selectedPresetId) => set({ selectedPresetId }),
  setPresetDialogOpen: (isPresetDialogOpen) => set({ isPresetDialogOpen }),
  setPresetDialogClosing: (isPresetDialogClosing) => set({ isPresetDialogClosing }),
  setPresetNameDraft: (presetNameDraft) => set({ presetNameDraft }),
  setPresetManagerOpen: (isPresetManagerOpen) => set({ isPresetManagerOpen }),
  setPresetManagerClosing: (isPresetManagerClosing) => set({ isPresetManagerClosing }),
  setIsConfirmingClear: (isConfirmingClear) => set({ isConfirmingClear }),
  setFocusWheelId: (focusWheelId) => set({ focusWheelId }),
  setExportSections: (sections) =>
    set((state) => ({
      exportSections:
        typeof sections === 'function' ? sections(state.exportSections) : sections,
    })),
  setImportSections: (sections) =>
    set((state) => ({
      importSections:
        typeof sections === 'function' ? sections(state.importSections) : sections,
    })),
  setImportModes: (modes) =>
    set((state) => ({
      importModes: typeof modes === 'function' ? modes(state.importModes) : modes,
    })),
}));
