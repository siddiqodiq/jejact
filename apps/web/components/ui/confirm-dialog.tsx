"use client";

import { useEffect } from "react";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  /** Label for the destructive action, e.g. "Disconnect". */
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * In-app replacement for window.confirm, styled with the design tokens.
 * Escape or a backdrop click cancels.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-sm rounded-3xl border border-hairline bg-surface p-6 shadow-2xl">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p
          id="confirm-dialog-message"
          className="mt-2 text-sm leading-relaxed text-ink-secondary"
        >
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button
            autoFocus
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            disabled={busy}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
