import type { FormField, FormSchema } from "@rfb-ddt/schema";

export function updateFieldInSchema(
  schema: FormSchema,
  fieldId: string,
  patch: Partial<FormField>,
): FormSchema {
  return {
    ...schema,
    fields: schema.fields.map((field) =>
      field.id === fieldId ? ({ ...field, ...patch } as FormField) : field,
    ),
  };
}

export function removeFieldFromSchema(
  schema: FormSchema,
  fieldId: string,
): FormSchema {
  return {
    ...schema,
    fields: schema.fields.filter((field) => field.id !== fieldId),
  };
}

export function reorderFieldsInSchema(
  schema: FormSchema,
  activeId: string,
  overId: string,
): FormSchema {
  const fields = [...schema.fields];
  const oldIndex = fields.findIndex((f) => f.id === activeId);
  const newIndex = fields.findIndex((f) => f.id === overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return schema;

  const [removed] = fields.splice(oldIndex, 1);
  fields.splice(newIndex, 0, removed!);

  return { ...schema, fields };
}

export function insertFieldInSchema(
  schema: FormSchema,
  field: FormField,
  index?: number,
): FormSchema {
  const fields = [...schema.fields];
  const at = index == null ? fields.length : index;
  fields.splice(at, 0, field);
  return { ...schema, fields };
}

export function moveFieldInSchema(
  schema: FormSchema,
  fieldId: string,
  direction: "up" | "down",
): FormSchema {
  const fields = [...schema.fields];
  const index = fields.findIndex((f) => f.id === fieldId);
  if (index < 0) return schema;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= fields.length) return schema;
  const [item] = fields.splice(index, 1);
  fields.splice(target, 0, item!);
  return { ...schema, fields };
}

export function duplicateFieldInSchema(
  schema: FormSchema,
  fieldId: string,
): { schema: FormSchema; duplicateId: string | null } {
  const index = schema.fields.findIndex((f) => f.id === fieldId);
  if (index < 0) return { schema, duplicateId: null };
  const source = schema.fields[index]!;
  const used = new Set(schema.fields.map((f) => f.name));
  let copyName = `${source.name}_copy`;
  let suffix = 1;
  while (used.has(copyName)) {
    suffix += 1;
    copyName = `${source.name}_copy_${suffix}`;
  }
  const newId = `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const clone = {
    ...source,
    id: newId,
    name: copyName,
  } as FormField;
  const fields = [...schema.fields];
  fields.splice(index + 1, 0, clone);
  return { schema: { ...schema, fields }, duplicateId: newId };
}

export function resizeFieldInSchema(
  schema: FormSchema,
  fieldId: string,
  span: number,
): FormSchema {
  const clamped = Math.max(1, Math.min(12, Math.round(span)));
  return updateFieldInSchema(schema, fieldId, {
    props: {
      ...(schema.fields.find((f) => f.id === fieldId)?.props ?? {}),
      gridSpan: clamped,
    },
  } as Partial<FormField>);
}
