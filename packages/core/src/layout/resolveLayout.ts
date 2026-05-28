import type { FieldId, FormField, FormSchema } from "@rfb-ddt/schema";

export function getLayoutPageCount(schema: FormSchema): number {
  const layout = schema.layout;
  if (!layout || layout.type === "single" || !layout.pages?.length) {
    return 1;
  }
  return layout.pages.length;
}

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

  const idSet = new Set<FieldId>(page.fieldIds);
  return schema.fields.filter((field) => idSet.has(field.id));
}
