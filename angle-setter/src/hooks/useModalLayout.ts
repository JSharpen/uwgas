import * as React from 'react';

type ModalDialogStyleOptions = {
  liftByKeyboard?: boolean;
  liftCapPx?: number;
  maxHeight?: string;
  extra?: React.CSSProperties;
};

/**
 * Centralised modal layout handling: adjusts for virtual keyboards and safe areas,
 * and provides overlay/dialog styles that keep headers visible.
 */
export function useModalLayout() {
  const [modalShift, setModalShift] = React.useState(0);
  const [modalViewportOffset, setModalViewportOffset] = React.useState(0);

  const modalOverlayPadding = modalShift
    ? `calc(${modalShift}px + env(safe-area-inset-bottom) + 16px)`
    : undefined;

  const overlayStyle = React.useMemo(() => {
    const style: React.CSSProperties = {};
    if (modalOverlayPadding) style.paddingBottom = modalOverlayPadding;
    if (modalViewportOffset) style.transform = `translateY(${modalViewportOffset}px)`;
    return Object.keys(style).length ? style : undefined;
  }, [modalOverlayPadding, modalViewportOffset]);

  const getDialogStyle = React.useCallback(
    (options: ModalDialogStyleOptions = {}) => {
      const { liftByKeyboard = false, liftCapPx = 140, maxHeight, extra } = options;
      const style: React.CSSProperties = {
        maxHeight: maxHeight || (modalShift ? `calc(100dvh - ${modalShift}px - 24px)` : '90vh'),
        ...extra,
      };
      if (liftByKeyboard && modalShift) {
        style.transform = `translateY(-${Math.min(modalShift, liftCapPx)}px)`;
      }
      return style;
    },
    [modalShift]
  );

  // Track virtual keyboard / visual viewport changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const updateShift = () => {
      const shrink = Math.max(0, window.innerHeight - vv.height);
      const isMobile = window.innerWidth < 768;
      const next = isMobile ? Math.min(shrink, 180) : 0;
      setModalShift(next);
      setModalViewportOffset(isMobile ? vv.offsetTop || 0 : 0);
    };

    updateShift();
    vv.addEventListener('resize', updateShift);
    vv.addEventListener('scroll', updateShift);
    window.addEventListener('orientationchange', updateShift);
    return () => {
      vv.removeEventListener('resize', updateShift);
      vv.removeEventListener('scroll', updateShift);
      window.removeEventListener('orientationchange', updateShift);
    };
  }, []);

  return { overlayStyle, getDialogStyle };
}

export default useModalLayout;
