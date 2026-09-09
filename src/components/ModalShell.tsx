import * as React from 'react';
import { IconClose } from '../icons';

export type ModalShellProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  overlayStyle?: React.CSSProperties;
  dialogStyle?: React.CSSProperties;
  closing?: boolean;
};

export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
  overlayStyle,
  dialogStyle,
  closing = false,
}: ModalShellProps) {
  const hasSubtitle = Boolean(subtitle);

  return (
    <div
      className={
        'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 backdrop-blur-sm p-4 sm:p-6 pb-[calc(env(safe-area-inset-bottom)+16px)] min-h-[100dvh] motion-overlay ' +
        (closing ? 'motion-overlay--closing' : '')
      }
      style={overlayStyle}
    >
      <div
        className={
          'relative w-full max-w-lg bg-[#262626] rounded-3xl border border-white/10 shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto motion-dialog ' +
          (closing ? 'motion-dialog--closing' : '')
        }
        style={dialogStyle}
      >
        {/* Subtle Edge Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl z-0" />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between gap-4 pb-4 border-b border-white/10 mb-4">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">{title}</h3>
            {hasSubtitle ? <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-normal">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-colors shrink-0"
            onClick={onClose}
            aria-label="Close"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-col gap-4 text-white">
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ModalShell;
