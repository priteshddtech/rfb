import type { FieldId, FormField } from "./field.js";

export const SCHEMA_VERSION = "1.0.0";

export type FormId = string;

export type FormMode = "add" | "edit" | "view";

export type ModalSize = "small" | "medium" | "large" | "fullscreen";

export interface ModalSettings {
  /** Label for the button that opens the modal. Defaults to the form title. */
  triggerLabel?: string;
  /** Hide the auto-rendered trigger (useful when the host provides one). */
  showTrigger?: boolean;
  /** Modal width preset. Default: `medium`. */
  size?: ModalSize;
  /** Close when clicking the backdrop. Default: true. */
  closeOnBackdrop?: boolean;
  /** Close when pressing Escape. Default: true. */
  closeOnEscape?: boolean;
  /** Render an "X" close button in the modal header. Default: true. */
  showCloseButton?: boolean;
  /** Open the modal automatically on mount (no click required). */
  openOnLoad?: boolean;
  /** Auto-close the modal after a successful submission. Default: true. */
  closeOnSubmit?: boolean;
}

export interface FormSettings {
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  successMessage?: string;
  failureMessage?: string;
  redirectOnSuccess?: string;
  redirectOnFailure?: string;
  /** When false, host handles submission (e.g. custom API). Default: true. */
  postOnSubmit?: boolean;
  rtl?: boolean;
  /** Theme id from `@rfb-ddt/themes` or a custom theme key. */
  theme?: string;
  mode?: FormMode;
  /** Open form inside a modal / dialog. */
  displayAsModal?: boolean;
  /** Modal-specific configuration; only applied when `displayAsModal` is true. */
  modal?: ModalSettings;
  className?: string;
}

export type LayoutType = "single" | "steps" | "tabs";

export interface FormPage {
  id: string;
  title?: string;
  description?: string;
  /** Field ids shown on this page/step/tab. */
  fieldIds: FieldId[];
}

export interface FormLayout {
  type: LayoutType;
  pages?: FormPage[];
}

/**
 * JSON definition of a form (builder output / renderer input).
 */
export interface FormSchema {
  id: FormId;
  version: typeof SCHEMA_VERSION | string;
  title?: string;
  description?: string;
  settings?: FormSettings;
  layout?: FormLayout;
  fields: FormField[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}
