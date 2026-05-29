import type { ModalSize } from "@rfb-ddt/schema";
import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

export interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  /** Click on the backdrop closes the modal. Default: true. */
  closeOnBackdrop?: boolean;
  /** Escape key closes the modal. Default: true. */
  closeOnEscape?: boolean;
  /** Render the "X" close button. Default: true. */
  showCloseButton?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Accessible modal shell built on the native `<dialog>` element so we get
 * focus trapping, Escape handling, and inert-background semantics for free.
 *
 * Form submission inside the modal works exactly the same as inline — the
 * inner `<form>` retains its own submit / Enter behaviour because we do not
 * use `method="dialog"`.
 */
export function FormModal({
  open,
  onClose,
  title,
  description,
  size = "medium",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  children,
}: FormModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // Sync the imperative dialog API with the React `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      // showModal handles focus + backdrop + inert background.
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Fire onClose when the dialog is dismissed (via Escape, close button, etc.).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handler = () => onClose();
    dialog.addEventListener("close", handler);
    return () => dialog.removeEventListener("close", handler);
  }, [onClose]);

  // Optionally cancel Escape closes.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (closeOnEscape) return;
    const handler = (event: Event) => event.preventDefault();
    dialog.addEventListener("cancel", handler);
    return () => dialog.removeEventListener("cancel", handler);
  }, [closeOnEscape]);

  function handleBackdropClick(event: ReactMouseEvent<HTMLDialogElement>) {
    if (!closeOnBackdrop) return;
    // When user clicks the backdrop, the event target is the dialog element
    // itself (the inner content is in a child div).
    if (event.target === dialogRef.current) {
      onClose();
    }
  }

  const dialogClass = [
    "rfb-modal",
    `rfb-modal--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <dialog
      ref={dialogRef}
      className={dialogClass}
      onClick={handleBackdropClick}
      aria-labelledby={title ? "rfb-modal-title" : undefined}
      aria-describedby={description ? "rfb-modal-desc" : undefined}
    >
      <div className="rfb-modal__panel">
        {(title || showCloseButton) && (
          <header className="rfb-modal__header">
            {title && (
              <h2 id="rfb-modal-title" className="rfb-modal__title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="rfb-modal__close"
                onClick={onClose}
                aria-label="Close"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </header>
        )}

        {description && (
          <p id="rfb-modal-desc" className="rfb-modal__description">
            {description}
          </p>
        )}

        <div className="rfb-modal__body">{children}</div>
      </div>
    </dialog>
  );
}
