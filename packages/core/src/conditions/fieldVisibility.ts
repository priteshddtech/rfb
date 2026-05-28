import type { FormField } from "@rfb-ddt/schema";
import { evaluateCondition } from "./evaluateCondition.js";

export function isFieldVisible(
  field: FormField,
  fields: FormField[],
  values: Record<string, unknown>,
): boolean {
  if (field.hidden) return false;

  let visible = true;
  for (const condition of field.conditions ?? []) {
    if (!evaluateCondition(condition, fields, values)) continue;
    if (condition.then === "show") visible = true;
    if (condition.then === "hide") visible = false;
  }

  return visible;
}

export function isFieldDisabled(
  field: FormField,
  fields: FormField[],
  values: Record<string, unknown>,
): boolean {
  if (field.disabled || field.readonly) return true;

  for (const condition of field.conditions ?? []) {
    if (!evaluateCondition(condition, fields, values)) continue;
    if (condition.then === "disable") return true;
    if (condition.then === "enable") return false;
  }

  return false;
}

export function isFieldActive(
  field: FormField,
  fields: FormField[],
  values: Record<string, unknown>,
): boolean {
  return (
    isFieldVisible(field, fields, values) &&
    !isFieldDisabled(field, fields, values)
  );
}
