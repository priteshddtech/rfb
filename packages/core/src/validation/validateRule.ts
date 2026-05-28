import type { ValidationRule } from "@rfb-ddt/schema";
import type {
  CustomValidatorFn,
  FieldError,
  FieldValidationContext,
} from "../registry/types.js";
import { isEmptyValue } from "./isEmpty.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRule(
  rule: ValidationRule,
  ctx: FieldValidationContext,
  getValidator: (id: string) => CustomValidatorFn | undefined,
): FieldError | null {
  const { field, value } = ctx;
  const base = {
    fieldName: field.name,
    fieldId: field.id,
    rule: rule.type,
  };

  switch (rule.type) {
    case "required": {
      if (field.type === "checkbox") {
        if (value !== true) {
          return { ...base, message: rule.message ?? `${field.label ?? field.name} is required` };
        }
        return null;
      }
      if (isEmptyValue(value)) {
        return { ...base, message: rule.message ?? `${field.label ?? field.name} is required` };
      }
      return null;
    }
    case "minLength": {
      if (typeof value !== "string" || value.length < rule.value) {
        return {
          ...base,
          message: rule.message ?? `Minimum length is ${rule.value}`,
        };
      }
      return null;
    }
    case "maxLength": {
      if (typeof value === "string" && value.length > rule.value) {
        return {
          ...base,
          message: rule.message ?? `Maximum length is ${rule.value}`,
        };
      }
      return null;
    }
    case "min": {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num) || num < rule.value) {
        return { ...base, message: rule.message ?? `Minimum value is ${rule.value}` };
      }
      return null;
    }
    case "max": {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num) || num > rule.value) {
        return { ...base, message: rule.message ?? `Maximum value is ${rule.value}` };
      }
      return null;
    }
    case "pattern": {
      if (typeof value !== "string") return null;
      const regex = new RegExp(rule.value);
      if (!regex.test(value)) {
        return { ...base, message: rule.message ?? "Invalid format" };
      }
      return null;
    }
    case "email": {
      if (typeof value !== "string" || !EMAIL_PATTERN.test(value)) {
        return { ...base, message: rule.message ?? "Invalid email address" };
      }
      return null;
    }
    case "custom": {
      const validator = getValidator(rule.validatorId);
      if (!validator) {
        return {
          ...base,
          message: `Unknown validator: ${rule.validatorId}`,
        };
      }
      return validator(ctx);
    }
    default:
      return null;
  }
}
