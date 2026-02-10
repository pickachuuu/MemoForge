'use client';

import { ReactNode, useEffect, useId } from 'react';
import { Cancel01Icon } from 'hugeicons-react';

type MobileBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function MobileBottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: MobileBottomSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[70] lg:hidden transition-[visibility] duration-300 ${
        open ? 'visible' : 'invisible'
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`absolute left-0 right-0 bottom-0 max-h-[80dvh] bg-surface border-t border-border shadow-2xl overflow-hidden transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <div className="flex flex-col">
            <span id={titleId} className="text-sm font-semibold text-foreground">
              {title}
            </span>
            {description && (
              <span className="text-xs text-foreground-muted">{description}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close panel"
          >
            <Cancel01Icon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 pb-5 overflow-y-auto max-h-[calc(80dvh-3.5rem)]">
          {children}
        </div>

        {footer && (
          <div className="px-4 py-3 border-t border-border bg-surface">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
