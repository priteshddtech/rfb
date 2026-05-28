/**
 * Convert a human-readable label into a snake_case field name.
 *
 * - lowercases
 * - replaces non-alphanumeric runs with a single underscore
 * - trims leading / trailing underscores
 * - prefixes with `_` if the result starts with a digit
 *
 * @example
 * labelToName("First Name")        // "first_name"
 * labelToName("E-Mail Address!")   // "e_mail_address"
 * labelToName("123 Reasons")       // "_123_reasons"
 */
export function labelToName(label: string): string {
  const trimmed = label.trim().toLowerCase();
  if (!trimmed) return "";
  let slug = trimmed.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (!slug) return "";
  if (/^\d/.test(slug)) slug = `_${slug}`;
  return slug;
}

/**
 * Determine whether the provided field `name` looks like it was auto-generated
 * for the given `type` (e.g. `"text"`, `"text_1"`, `"email_3"`).
 *
 * Used to decide whether typing a label should refresh the name automatically.
 */
export function isDefaultFieldName(name: string, type: string): boolean {
  if (!name) return true;
  const escapedType = type.replace(/[^a-z0-9]/gi, "_");
  return new RegExp(`^${escapedType}(_\\d+)?$`, "i").test(name);
}
