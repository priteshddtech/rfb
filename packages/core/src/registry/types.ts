import type { FormField, ValidationRule } from "@rfb-ddt/schema";

export interface FieldError {
  fieldName: string;
  fieldId: string;
  message: string;
  rule?: ValidationRule["type"];
}

export interface FieldValidationContext {
  field: FormField;
  value: unknown;
  values: Record<string, unknown>;
}

export type CustomValidatorFn = (
  ctx: FieldValidationContext,
) => FieldError | null;

export interface FieldTypeDefinition {
  type: string;
  /** Collects user input and appears in `FormResponse.data`. Default: true. */
  isInput?: boolean;
  getDefaultValue?: (field: FormField) => unknown;
  validate?: (ctx: FieldValidationContext) => FieldError | null;
}
