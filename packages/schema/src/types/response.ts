import type { FormId } from "./form.js";

/**
 * JSON payload produced when an end user submits a form.
 */
export interface FormResponse {
  formId: FormId;
  /** ISO-8601 timestamp. */
  submittedAt: string;
  data: Record<string, unknown>;
  meta?: {
    userAgent?: string;
    locale?: string;
    pageUrl?: string;
    [key: string]: unknown;
  };
}
