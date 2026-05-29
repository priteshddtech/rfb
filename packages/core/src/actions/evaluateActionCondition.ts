import type { ActionCondition } from "@rfb-ddt/schema";
import { isEmptyValue } from "../validation/isEmpty.js";
import type { ActionContext } from "./types.js";

/**
 * Evaluates an `ActionCondition` against the current context. Returns true
 * when the condition is satisfied (i.e. the gated action should run).
 */
export function evaluateActionCondition(
  condition: ActionCondition,
  ctx: ActionContext,
): boolean {
  const field = ctx.getField(condition.fieldId);
  if (!field) return false;
  const current = ctx.getValue(field.name);

  switch (condition.operator) {
    case "equals":
      return current === condition.value;
    case "notEquals":
      return current !== condition.value;
    case "contains":
      if (typeof current === "string" && typeof condition.value === "string") {
        return current.includes(condition.value);
      }
      if (Array.isArray(current)) return current.includes(condition.value);
      return false;
    case "empty":
      return isEmptyValue(current);
    case "notEmpty":
      return !isEmptyValue(current);
    default:
      return false;
  }
}
