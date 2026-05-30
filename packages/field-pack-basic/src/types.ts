import type { FormField, SelectOption } from "@rfb-ddt/schema";
import type { ComponentType } from "react";

export interface FieldComponentProps<
  TField extends FormField = FormField,
> {
  field: TField;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onClick?: () => void;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /**
   * When `true`, the field is being rendered as a static preview (e.g. inside
   * the builder canvas) and should avoid side effects such as remote fetches.
   */
  preview?: boolean;
  /**
   * Optional dynamic options that override the field's own static / api
   * options. Used by the actions engine (e.g. `loadOptions` populating a
   * dependent dropdown).
   */
  dynamicOptions?: SelectOption[];
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
  "checkboxGroup",
  "radio",
  "signature",
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
  "color",
  "scale",
  "photo",
  "voice",
  "gdpr",
  "youtube",
  "pdf",
  "countdown",
  "matrix",
  "recaptcha",
] as const;

export type BasicFieldType = (typeof BASIC_FIELD_TYPES)[number];
