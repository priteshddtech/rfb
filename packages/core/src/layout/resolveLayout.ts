import type { FormField, FormSchema } from "@rfb-ddt/schema";

export function getLayoutPageCount(schema: FormSchema): number {
  const layout = schema.layout;
  if (!layout || layout.type === "single" || !layout.pages?.length) {
    return 1;
  }
  return layout.pages.length;
}

/**
 * Returns the fields for the given page index, preserving the order of
 * `page.fieldIds` (so per-page reordering in the builder is respected).
 * Falls back to all fields when the form is single-page.
 */
export function getFieldsForPage(
  schema: FormSchema,
  pageIndex: number,
): FormField[] {
  const layout = schema.layout;
  if (!layout || layout.type === "single" || !layout.pages?.length) {
    return schema.fields;
  }

  const page = layout.pages[pageIndex];
  if (!page) return [];

  const fieldsById = new Map(schema.fields.map((f) => [f.id, f]));
  const ordered: FormField[] = [];
  for (const id of page.fieldIds) {
    const field = fieldsById.get(id);
    if (field) ordered.push(field);
  }
  return ordered;
}
