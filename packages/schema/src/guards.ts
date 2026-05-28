import type { FormSchema } from "./types/form.js";

export function isFormSchema(value: unknown): value is FormSchema {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<FormSchema>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.version === "string" &&
    Array.isArray(candidate.fields)
  );
}
