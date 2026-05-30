/**
 * Replace `{fieldName}` tokens in a template string with values from a record.
 *
 * - `{name}` → values.name
 * - `{user.email}` → values.user.email (dot path)
 * - Unknown tokens collapse to the empty string.
 * - Escape a literal `{` by writing `{{`.
 *
 * Used for success/error messages, redirect URLs, email subjects/bodies, and
 * webhook payload templates.
 */
export function interpolate(
  template: string,
  values: Record<string, unknown>,
): string {
  if (!template) return template;
  return template.replace(
    /\{\{|\{([a-zA-Z_$][\w$.]*)\}/g,
    (match, path: string | undefined) => {
      if (match === "{{") return "{";
      if (!path) return "";
      const v = readPath(values, path);
      if (v == null) return "";
      if (typeof v === "object") {
        try {
          return JSON.stringify(v);
        } catch {
          return "";
        }
      }
      return String(v);
    },
  );
}

function readPath(obj: unknown, path: string): unknown {
  if (obj == null) return undefined;
  let current: unknown = obj;
  for (const segment of path.split(".")) {
    if (current && typeof current === "object" && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}
