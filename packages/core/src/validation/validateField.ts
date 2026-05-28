import type { FormField } from "@rfb-ddt/schema";
import type { FieldRegistry } from "../registry/FieldRegistry.js";
import type { CustomValidatorFn, FieldError } from "../registry/types.js";
import { validateRule } from "./validateRule.js";

export function validateField(
  field: FormField,
  value: unknown,
  values: Record<string, unknown>,
  registry: FieldRegistry,
): FieldError[] {
  const typeDef = registry.getType(field.type);
  if (typeDef?.isInput === false) return [];

  const ctx = { field, value, values };
  const getValidator: (id: string) => CustomValidatorFn | undefined = (id) =>
    registry.getValidator(id);

  const errors: FieldError[] = [];

  if (field.required) {
    const requiredError = validateRule({ type: "required" }, ctx, getValidator);
    if (requiredError) errors.push(requiredError);
  }

  for (const rule of field.validation ?? []) {
    if (rule.type === "required" && field.required) continue;
    const error = validateRule(rule, ctx, getValidator);
    if (error) errors.push(error);
  }

  if (typeDef?.validate) {
    const customError = typeDef.validate(ctx);
    if (customError) errors.push(customError);
  }

  return errors;
}
