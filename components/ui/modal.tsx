'use client';

import { useEffect, useId, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  description?: string;
  open: boolean;
  title: string;
  onClose: () => void;
  className?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
};

export function Modal({
  children,
  description,
  open,
  title,
  onClose,
  className = '',
  closeOnBackdrop = true,
  closeOnEscape = true,
}: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open || !closeOnEscape) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [closeOnEscape, onClose, open]);

  if (!open) return null;

  function onBackdropMouseDown() {
    if (closeOnBackdrop) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
      role="presentation"
      onMouseDown={onBackdropMouseDown}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full max-w-md rounded-lg border border-foreground/10 bg-app-bg p-5 shadow-2xl ${className}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5">
          {description ? (
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {description}
            </p>
          ) : null}
          <h2 id={titleId} className="text-xl font-semibold text-foreground">
            {title}
          </h2>
        </div>

        {children}
      </section>
    </div>
  );
}
