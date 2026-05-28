import type { FieldCondition, FormField } from "@rfb-ddt/schema";
import { isEmptyValue } from "../validation/isEmpty.js";

export function getFieldValueById(
  fieldId: string,
  fields: FormField[],
  values: Record<string, unknown>,
): unknown {
  const field = fields.find((f) => f.id === fieldId);
  if (!field) return undefined;
  return values[field.name];
}

export function evaluateCondition(
  condition: FieldCondition,
  fields: FormField[],
  values: Record<string, unknown>,
): boolean {
  const current = getFieldValueById(condition.when.fieldId, fields, values);
  const { operator, value } = condition.when;

  switch (operator) {
    case "equals":
      return current === value;
    case "notEquals":
      return current !== value;
    case "contains":
      if (typeof current === "string" && typeof value === "string") {
        return current.includes(value);
      }
      if (Array.isArray(current)) return current.includes(value);
      return false;
    case "empty":
      return isEmptyValue(current);
    case "notEmpty":
      return !isEmptyValue(current);
    default:
      return false;
  }
}
