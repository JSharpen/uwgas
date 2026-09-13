import { useEffect } from 'react';

// Centralised reference counter for body locks to prevent components fighting
let lockCount = 0;

export function useBodyLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    
    lockCount++;
    if (lockCount === 1) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [isLocked]);
}

