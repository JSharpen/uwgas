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

export type TopBarConfirmation = {
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  centerAction?: {
    label: string;
    onClick: () => void;
  };
};

export interface UIState {
  view: 'calculator' | 'wheels' | 'settings';
  settingsView: 'root' | 'machine' | 'hardware' | 'measurement' | 'import' | 'glossary' | 'dev' | 'dev-ui' | 'dev-state' | 'dev-interaction';
  isSetupPanelOpen: boolean;
  activeUsbTab: 'rear' | 'front';
  activeSheet: 'none' | 'jig' | 'usb' | 'preset' | 'machine';
  selectedPresetId: string;
  isPresetMenuOpen: boolean;
  isPresetDialogOpen: boolean;
  isPresetDialogClosing: boolean;
  presetNameDraft: string;
  clearAfterSave: boolean;
  isPresetManagerOpen: boolean;
  isPresetManagerClosing: boolean;
  isConfirmingClear: boolean; // Note: to be replaced by topBarConfirmation eventually, but keeping for now
  topBarConfirmation: TopBarConfirmation | null;
  focusWheelId: string | null;
  exportSections: ImportSections;
  importSections: ImportSections;
  importModes: ImportModes;

  // Actions
  setView: (view: 'calculator' | 'wheels' | 'settings') => void;
  setSettingsView: (
    view: 'root' | 'machine' | 'hardware' | 'measurement' | 'import' | 'glossary' | 'dev' | 'dev-ui' | 'dev-state' | 'dev-interaction'
  ) => void;
  setSetupPanelOpen: (isOpen: boolean) => void;
  setActiveUsbTab: (tab: 'rear' | 'front') => void;
  setActiveSheet: (sheet: 'none' | 'jig' | 'usb' | 'preset' | 'machine') => void;
  toggleSetupPanel: () => void;
  setSelectedPresetId: (id: string) => void;
  setPresetMenuOpen: (isOpen: boolean) => void;
  setPresetDialogOpen: (isOpen: boolean) => void;
  setPresetDialogClosing: (isClosing: boolean) => void;
  setPresetNameDraft: (name: string) => void;
  setClearAfterSave: (clearAfterSave: boolean) => void;
  setPresetManagerOpen: (isOpen: boolean) => void;
  setPresetManagerClosing: (isClosing: boolean) => void;
  setIsConfirmingClear: (confirming: boolean) => void;
  setTopBarConfirmation: (conf: TopBarConfirmation | null) => void;
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
  activeUsbTab: 'rear',
  activeSheet: 'none',
  selectedPresetId: '',
  isPresetMenuOpen: false,
  isPresetDialogOpen: false,
  isPresetDialogClosing: false,
  presetNameDraft: '',
  clearAfterSave: false,
  isPresetManagerOpen: false,
  isPresetManagerClosing: false,
  isConfirmingClear: false,
  topBarConfirmation: null,
  focusWheelId: null,
  exportSections: { ...DEFAULT_IMPORT_SECTIONS },
  importSections: { ...DEFAULT_IMPORT_SECTIONS },
  importModes: { ...DEFAULT_IMPORT_MODES },

  setView: (view) => set({ view }),
  setSettingsView: (settingsView) => set({ settingsView }),
  setSetupPanelOpen: (isSetupPanelOpen) => set({ isSetupPanelOpen }),
  setActiveUsbTab: (activeUsbTab) => set({ activeUsbTab }),
  setActiveSheet: (activeSheet) => set({ activeSheet }),
  toggleSetupPanel: () => set((state) => ({ isSetupPanelOpen: !state.isSetupPanelOpen })),
  setSelectedPresetId: (selectedPresetId) => set({ selectedPresetId }),
  setPresetMenuOpen: (isPresetMenuOpen) => set({ isPresetMenuOpen }),
  setPresetDialogOpen: (isPresetDialogOpen) => set({ isPresetDialogOpen }),
  setPresetDialogClosing: (isPresetDialogClosing) => set({ isPresetDialogClosing }),
  setPresetNameDraft: (presetNameDraft) => set({ presetNameDraft }),
  setClearAfterSave: (clearAfterSave) => set({ clearAfterSave }),
  setPresetManagerOpen: (isPresetManagerOpen) => set({ isPresetManagerOpen }),
  setPresetManagerClosing: (isPresetManagerClosing) => set({ isPresetManagerClosing }),
  setIsConfirmingClear: (isConfirmingClear) => set({ isConfirmingClear }),
  setTopBarConfirmation: (topBarConfirmation) => set({ topBarConfirmation }),
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
