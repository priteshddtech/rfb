import type { FormField } from "@rfb-ddt/schema";
import type { ComponentType } from "react";

export interface FieldComponentProps<
  TField extends FormField = FormField,
> {
  field: TField;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /**
   * When `true`, the field is being rendered as a static preview (e.g. inside
   * the builder canvas) and should avoid side effects such as remote fetches.
   */
  preview?: boolean;
}

export type FieldComponent<TField extends FormField = FormField> =
  ComponentType<FieldComponentProps<TField>>;

/** Built-in field type ids provided by this package. */
export const BASIC_FIELD_TYPES = [
  "text",
  "textarea",
  "email",
  "password",
  "phone",
  "url",
  "number",
  "select",
  "checkbox",
  "radio",
  "date",
  "time",
  "file",
  "rating",
  "slider",
  "hidden",
  "html",
  "heading",
  "label",
  "span",
  "image",
  "paragraph",
  "divider",
  "spacer",
] as const;

export type BasicFieldType = (typeof BASIC_FIELD_TYPES)[number];
