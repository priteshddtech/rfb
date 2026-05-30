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
  /**
   * What happens after a successful submission. Composed of independent
   * pieces — message, redirect, emails, webhooks — that can be enabled
   * together (e.g. flash a message, then redirect after 2s).
   */
  submission?: SubmissionSettings;
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

/**
 * Post-submission behaviour. Client-side (message, redirect, reset) is
 * handled by `@rfb-ddt/renderer-react`. Server-side hooks (emails, webhooks)
 * are exposed in the schema for backends to pick up — the renderer doesn't
 * send emails or call webhooks directly.
 */
export interface SubmissionSettings {
  /** Configurable success view. When omitted, a default thank-you is shown. */
  successMessage?: SuccessMessage;
  /** Redirect the browser after a successful submit. */
  successRedirect?: SuccessRedirect;
  /** Custom view rendered when the submit fails. */
  errorMessage?: ErrorMessage;
  /**
   * Email notifications fired by the backend after a successful submit.
   * The renderer does NOT send these — your SaaS / WordPress backend must
   * read `schema.settings.submission.emailNotifications` and dispatch them.
   */
  emailNotifications?: EmailNotification[];
  /**
   * Webhooks fired by the backend after a successful submit. Same caveat as
   * above — the renderer only carries the configuration.
   */
  webhooks?: WebhookConfig[];
  /** Reset form values after a successful submit. Default: true. */
  resetAfterSubmit?: boolean;
}

export interface SuccessMessage {
  /** Heading shown above the body (e.g. "Thank you!"). */
  title?: string;
  /** Main body text. Supports `{field.name}` tokens at render time. */
  body: string;
  /** Show a "Submit another response" button under the message. */
  showSubmitAgain?: boolean;
  /** Override the label of the submit-again button. */
  submitAgainLabel?: string;
}

export interface SuccessRedirect {
  /** Destination URL. Supports `{field.name}` tokens. */
  url: string;
  /** Delay in ms before redirecting (lets the success message be seen). */
  delay?: number;
  /** Open the destination in a new tab instead of replacing the page. */
  openInNewTab?: boolean;
}

export interface ErrorMessage {
  title?: string;
  body: string;
  /** Show a "Try again" button to dismiss the error and return to the form. */
  showRetry?: boolean;
  /** Override the label of the retry button. */
  retryLabel?: string;
}

export interface EmailNotification {
  id: string;
  /** Recipient. Supports `{field.name}` tokens. */
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  /** Body (HTML or plain text). Supports `{field.name}` tokens. */
  body: string;
  /** Sender display name. */
  fromName?: string;
  /** Sender address (must be permitted by your backend). */
  fromEmail?: string;
  /** Reply-to address (often the submitter's email). */
  replyTo?: string;
  /**
   * Only send this notification when the condition is met (e.g. only email
   * sales when `interest === "demo"`).
   */
  when?: SubmissionCondition;
}

export interface WebhookConfig {
  id: string;
  url: string;
  method?: "POST" | "PUT" | "PATCH";
  /** Custom request headers. */
  headers?: Record<string, string>;
  /**
   * Payload template (raw string). If omitted, the backend posts the raw
   * `FormResponse` JSON. Supports `{field.name}` tokens.
   */
  payload?: string;
  /** Content-type header shorthand. Defaults to `application/json`. */
  contentType?: string;
  /**
   * If true, a failed webhook call should NOT block the user-facing success
   * flow (the backend just logs the failure). Default: true.
   */
  failOpen?: boolean;
  /** Retry count on transient failure. Default: 0. */
  retries?: number;
  when?: SubmissionCondition;
}

/** Simple field-based condition for gating an email / webhook. */
export interface SubmissionCondition {
  fieldName: string;
  operator: "equals" | "notEquals" | "contains" | "empty" | "notEmpty";
  value?: unknown;
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
