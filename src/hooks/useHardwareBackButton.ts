import { useEffect, useRef } from 'react';
import { useUIStore } from '../state/uiStore';

export function useHardwareBackButton() {
  const isTrappedRef = useRef(false);
  const ignorePopRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      if (ignorePopRef.current) {
        ignorePopRef.current = false;
        return;
      }

      isTrappedRef.current = false; // Browser popped our trap
      const state = useUIStore.getState();
      

      if (state.topBarConfirmation) {
        state.setTopBarConfirmation(null);
        
      } else if (state.isPresetManagerOpen) {
        state.setPresetManagerClosing(true);
        setTimeout(() => {
          useUIStore.getState().setPresetManagerOpen(false);
          useUIStore.getState().setPresetManagerClosing(false);
        }, 200);
        
      } else if (state.isPresetDialogOpen) {
        state.setPresetDialogClosing(true);
        setTimeout(() => {
          useUIStore.getState().setPresetDialogOpen(false);
          useUIStore.getState().setPresetDialogClosing(false);
        }, 180);
        
      } else if (state.isPresetMenuOpen) {
        state.setPresetMenuOpen(false);
        
      } else if (state.view === 'settings' && state.settingsView !== 'root') {
        state.setSettingsView(state.settingsView.startsWith('dev-') ? 'dev' : 'root');
        
      } else if (state.view !== 'calculator') {
        state.setView('calculator');
        
      }

      // We handled one layer. The subscribe below will run because state changed,
      // and if more layers are still open, it will re-push the trap!
    };

    window.addEventListener('popstate', handlePopState);

    const unsubscribe = useUIStore.subscribe((state) => {
      const needsTrap = 
        state.topBarConfirmation !== null ||
        state.isPresetManagerOpen ||
        state.isPresetDialogOpen ||
        state.isPresetMenuOpen ||
        (state.view === 'settings' && state.settingsView !== 'root') ||
        state.view !== 'calculator';

      if (needsTrap && !isTrappedRef.current) {
        // Push a trap state
        window.history.pushState({ trap: true }, '');
        isTrappedRef.current = true;
      } else if (!needsTrap && isTrappedRef.current) {
        // Remove the trap state programmatically
        isTrappedRef.current = false;
        ignorePopRef.current = true;
        window.history.back();
      }
    });

    // Initial check in case it mounts with something open
    const state = useUIStore.getState();
    const needsTrap = 
      state.topBarConfirmation !== null ||
      state.isPresetManagerOpen ||
      state.isPresetDialogOpen ||
      state.isPresetMenuOpen ||
      (state.view === 'settings' && state.settingsView !== 'root') ||
      state.view !== 'calculator';
      
    if (needsTrap && !isTrappedRef.current) {
      window.history.pushState({ trap: true }, '');
      isTrappedRef.current = true;
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      unsubscribe();
    };
  }, []);
}
