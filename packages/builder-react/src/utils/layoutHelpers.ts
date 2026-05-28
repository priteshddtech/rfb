import type {
  FormField,
  FormLayout,
  FormPage,
  FormSchema,
  LayoutType,
} from "@rfb-ddt/schema";

/* ---------- Page model helpers ---------- */

export function isMultiPage(schema: FormSchema): boolean {
  const t = schema.layout?.type;
  if (!t || t === "single") return false;
  return !!schema.layout?.pages?.length;
}

/** Whether the form uses paged layout (steps OR tabs). */
export function hasPagedLayout(schema: FormSchema): boolean {
  return schema.layout?.type === "steps" || schema.layout?.type === "tabs";
}

export function getPages(schema: FormSchema): FormPage[] {
  return schema.layout?.pages ?? [];
}

export function getPageById(
  schema: FormSchema,
  pageId: string | null,
): FormPage | null {
  if (!pageId) return null;
  return getPages(schema).find((p) => p.id === pageId) ?? null;
}

export function getPageIndex(schema: FormSchema, pageId: string | null): number {
  if (!pageId) return -1;
  return getPages(schema).findIndex((p) => p.id === pageId);
}

/** Order-preserving list of fields visible in the active page. */
export function getActivePageFields(
  schema: FormSchema,
  activePageId: string | null,
): FormField[] {
  if (!hasPagedLayout(schema)) return schema.fields;
  const page = getPageById(schema, activePageId);
  if (!page) return [];
  const byId = new Map(schema.fields.map((f) => [f.id, f]));
  const out: FormField[] = [];
  for (const id of page.fieldIds) {
    const f = byId.get(id);
    if (f) out.push(f);
  }
  return out;
}

/* ---------- Layout mutators ---------- */

function makePageId(): string {
  return `page_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Ensures `schema.layout.pages` contains at least one page when the layout
 * type is `steps` or `tabs`. Existing un-paged fields are folded into the
 * first page so nothing disappears from the builder when switching modes.
 */
export function ensurePagedLayout(
  schema: FormSchema,
  type: "steps" | "tabs",
): { schema: FormSchema; activePageId: string } {
  const existing = schema.layout?.pages ?? [];
  if (existing.length > 0) {
    const layout: FormLayout = { ...schema.layout, type, pages: existing };
    return { schema: { ...schema, layout }, activePageId: existing[0]!.id };
  }

  const id = makePageId();
  const firstPage: FormPage = {
    id,
    title: type === "steps" ? "Step 1" : "Tab 1",
    fieldIds: schema.fields.map((f) => f.id),
  };
  const layout: FormLayout = { type, pages: [firstPage] };
  return { schema: { ...schema, layout }, activePageId: id };
}

export function setLayoutType(
  schema: FormSchema,
  type: LayoutType,
): { schema: FormSchema; activePageId: string | null } {
  if (type === "single") {
    return {
      schema: { ...schema, layout: { type: "single" } },
      activePageId: null,
    };
  }
  return ensurePagedLayout(schema, type);
}

export function addPage(
  schema: FormSchema,
  title?: string,
): { schema: FormSchema; newPageId: string } {
  const pages = getPages(schema);
  const id = makePageId();
  const type = schema.layout?.type ?? "steps";
  const fallbackTitle =
    type === "tabs" ? `Tab ${pages.length + 1}` : `Step ${pages.length + 1}`;
  const newPage: FormPage = {
    id,
    title: title ?? fallbackTitle,
    fieldIds: [],
  };
  const layout: FormLayout = {
    type: type === "single" ? "steps" : type,
    pages: [...pages, newPage],
  };
  return { schema: { ...schema, layout }, newPageId: id };
}

export function updatePage(
  schema: FormSchema,
  pageId: string,
  patch: Partial<FormPage>,
): FormSchema {
  const pages = getPages(schema).map((p) =>
    p.id === pageId ? { ...p, ...patch } : p,
  );
  return {
    ...schema,
    layout: { ...schema.layout, type: schema.layout?.type ?? "steps", pages },
  };
}

/**
 * Removes a page, taking its fields with it (they're deleted from
 * `schema.fields` too). Returns the page id that should become active.
 */
export function removePage(
  schema: FormSchema,
  pageId: string,
): { schema: FormSchema; nextActiveId: string | null } {
  const pages = getPages(schema);
  if (pages.length <= 1) return { schema, nextActiveId: pageId };

  const removedIndex = pages.findIndex((p) => p.id === pageId);
  if (removedIndex < 0) return { schema, nextActiveId: pageId };

  const removed = pages[removedIndex]!;
  const removedIds = new Set(removed.fieldIds);
  const nextPages = pages.filter((p) => p.id !== pageId);
  const nextFields = schema.fields.filter((f) => !removedIds.has(f.id));

  const nextActiveIndex = Math.max(0, removedIndex - 1);
  const nextActiveId = nextPages[nextActiveIndex]?.id ?? null;

  return {
    schema: {
      ...schema,
      fields: nextFields,
      layout: {
        ...schema.layout,
        type: schema.layout?.type ?? "steps",
        pages: nextPages,
      },
    },
    nextActiveId,
  };
}

export function reorderPages(
  schema: FormSchema,
  activeId: string,
  overId: string,
): FormSchema {
  if (activeId === overId) return schema;
  const pages = [...getPages(schema)];
  const from = pages.findIndex((p) => p.id === activeId);
  const to = pages.findIndex((p) => p.id === overId);
  if (from < 0 || to < 0) return schema;
  const [moved] = pages.splice(from, 1);
  pages.splice(to, 0, moved!);
  return {
    ...schema,
    layout: { ...schema.layout, type: schema.layout?.type ?? "steps", pages },
  };
}

/* ---------- Field mutators that respect the active page ---------- */

/** Append/insert a new field, putting it on the active page when paged. */
export function insertFieldInPagedSchema(
  schema: FormSchema,
  field: FormField,
  activePageId: string | null,
  insertAfterFieldId?: string,
): FormSchema {
  const fields = [...schema.fields, field];

  if (!hasPagedLayout(schema)) {
    if (insertAfterFieldId) {
      const idx = schema.fields.findIndex((f) => f.id === insertAfterFieldId);
      if (idx >= 0) {
        const next = [...schema.fields];
        next.splice(idx + 1, 0, field);
        return { ...schema, fields: next };
      }
    }
    return { ...schema, fields };
  }

  const pages = getPages(schema).map((p) => {
    if (p.id !== activePageId) return p;
    if (insertAfterFieldId) {
      const idx = p.fieldIds.indexOf(insertAfterFieldId);
      if (idx >= 0) {
        const nextIds = [...p.fieldIds];
        nextIds.splice(idx + 1, 0, field.id);
        return { ...p, fieldIds: nextIds };
      }
    }
    return { ...p, fieldIds: [...p.fieldIds, field.id] };
  });

  return {
    ...schema,
    fields,
    layout: { ...schema.layout!, pages },
  };
}

export function removeFieldFromPagedSchema(
  schema: FormSchema,
  fieldId: string,
): FormSchema {
  const fields = schema.fields.filter((f) => f.id !== fieldId);
  if (!hasPagedLayout(schema)) return { ...schema, fields };

  const pages = getPages(schema).map((p) => ({
    ...p,
    fieldIds: p.fieldIds.filter((id) => id !== fieldId),
  }));

  return {
    ...schema,
    fields,
    layout: { ...schema.layout!, pages },
  };
}

export function reorderFieldsInPage(
  schema: FormSchema,
  activeId: string,
  overId: string,
  pageId: string | null,
): FormSchema {
  if (activeId === overId) return schema;

  if (!hasPagedLayout(schema) || !pageId) {
    const fields = [...schema.fields];
    const from = fields.findIndex((f) => f.id === activeId);
    const to = fields.findIndex((f) => f.id === overId);
    if (from < 0 || to < 0) return schema;
    const [moved] = fields.splice(from, 1);
    fields.splice(to, 0, moved!);
    return { ...schema, fields };
  }

  const pages = getPages(schema).map((p) => {
    if (p.id !== pageId) return p;
    const ids = [...p.fieldIds];
    const from = ids.indexOf(activeId);
    const to = ids.indexOf(overId);
    if (from < 0 || to < 0) return p;
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved!);
    return { ...p, fieldIds: ids };
  });

  return { ...schema, layout: { ...schema.layout!, pages } };
}

export function moveFieldInPage(
  schema: FormSchema,
  fieldId: string,
  direction: "up" | "down",
  pageId: string | null,
): FormSchema {
  if (!hasPagedLayout(schema) || !pageId) {
    const fields = [...schema.fields];
    const idx = fields.findIndex((f) => f.id === fieldId);
    if (idx < 0) return schema;
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= fields.length) return schema;
    const [m] = fields.splice(idx, 1);
    fields.splice(target, 0, m!);
    return { ...schema, fields };
  }

  const pages = getPages(schema).map((p) => {
    if (p.id !== pageId) return p;
    const ids = [...p.fieldIds];
    const idx = ids.indexOf(fieldId);
    if (idx < 0) return p;
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= ids.length) return p;
    const [m] = ids.splice(idx, 1);
    ids.splice(target, 0, m!);
    return { ...p, fieldIds: ids };
  });
  return { ...schema, layout: { ...schema.layout!, pages } };
}

/** Adds the duplicate to the same page as the source field. */
export function duplicateFieldInPagedSchema(
  schema: FormSchema,
  fieldId: string,
): { schema: FormSchema; duplicateId: string | null } {
  const sourceIndex = schema.fields.findIndex((f) => f.id === fieldId);
  if (sourceIndex < 0) return { schema, duplicateId: null };
  const source = schema.fields[sourceIndex]!;

  const used = new Set(schema.fields.map((f) => f.name));
  let copyName = `${source.name}_copy`;
  let suffix = 1;
  while (used.has(copyName)) {
    suffix += 1;
    copyName = `${source.name}_copy_${suffix}`;
  }
  const newId = `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const clone = { ...source, id: newId, name: copyName } as FormField;

  const fields = [...schema.fields];
  fields.splice(sourceIndex + 1, 0, clone);

  if (!hasPagedLayout(schema)) {
    return { schema: { ...schema, fields }, duplicateId: newId };
  }

  const pages = getPages(schema).map((p) => {
    const idx = p.fieldIds.indexOf(fieldId);
    if (idx < 0) return p;
    const ids = [...p.fieldIds];
    ids.splice(idx + 1, 0, newId);
    return { ...p, fieldIds: ids };
  });

  return {
    schema: { ...schema, fields, layout: { ...schema.layout!, pages } },
    duplicateId: newId,
  };
}
