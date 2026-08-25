import * as React from 'react';
import { IconClose } from '../icons';
import { BTN } from '../ui/buttons';

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
        'fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-black/60 pt-12 md:pt-0 pb-[calc(env(safe-area-inset-bottom)+16px)] px-4 min-h-[100dvh] motion-overlay ' +
        (closing ? 'motion-overlay--closing' : '')
      }
      style={overlayStyle}
    >
      <div
        className={
          'w-full max-w-md rounded-lg border u-border u-surface p-4 shadow-xl max-h-[90vh] overflow-y-auto motion-dialog ' +
          (closing ? 'motion-dialog--closing' : '')
        }
        style={dialogStyle}
      >
        <div className="modal-shell__header">
          <h3 className="modal-shell__title">{title}</h3>
          <button
            type="button"
            className={BTN.close}
            onClick={onClose}
            aria-label="Close"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-shell__body">
          {hasSubtitle ? <p className="modal-shell__lede">{subtitle}</p> : null}
          <div>{children}</div>
        </div>

        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export default ModalShell;
