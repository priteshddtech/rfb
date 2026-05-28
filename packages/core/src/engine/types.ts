import type { FormResponse, FormSchema } from "@rfb-ddt/schema";
import type { FieldError } from "../registry/types.js";

export interface FormEngineOptions {
  schema: FormSchema;
  initialValues?: Record<string, unknown>;
  /** Register built-in field types (text, select, etc.). Default: true. */
  registerBuiltins?: boolean;
}

export interface SubmitContext {
  schema: FormSchema;
  values: Record<string, unknown>;
  response: FormResponse;
}

export type BeforeSubmitHook = (
  ctx: Omit<SubmitContext, "response"> & { response?: FormResponse },
) =>
  | BeforeSubmitResult
  | void
  | Promise<BeforeSubmitResult | void>;

export type AfterSubmitHook = (
  ctx: SubmitContext,
) => void | Promise<void>;

export interface BeforeSubmitResult {
  /** Cancel submission (validation already passed). */
  cancel?: boolean;
  reason?: string;
  /** Replace values before building the final response. */
  values?: Record<string, unknown>;
}

export interface SubmitResult {
  ok: boolean;
  response?: FormResponse;
  errors?: FieldError[];
  cancelled?: boolean;
  reason?: string;
}

export interface FormEngineState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  currentPageIndex: number;
}
