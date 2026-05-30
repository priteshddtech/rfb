import type { FormField } from "@rfb-ddt/schema";
import type { FieldRegistry } from "./FieldRegistry.js";
import type { FieldTypeDefinition } from "./types.js";

const inputDefinition = (
  type: string,
  defaultValue: unknown = "",
): FieldTypeDefinition => ({
  type,
  isInput: true,
  getDefaultValue: (field: FormField) => field.defaultValue ?? defaultValue,
});

const builtinDefinitions: FieldTypeDefinition[] = [
  inputDefinition("text"),
  inputDefinition("textarea"),
  inputDefinition("email"),
  inputDefinition("password"),
  inputDefinition("phone"),
  inputDefinition("url"),
  {
    type: "file",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? null,
  },
  {
    type: "rating",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? 0,
  },
  {
    type: "slider",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? 0,
  },
  inputDefinition("time"),
  {
    type: "number",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? undefined,
  },
  inputDefinition("select"),
  {
    type: "checkbox",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? false,
  },
  inputDefinition("radio"),
  {
    type: "checkboxGroup",
    isInput: true,
    getDefaultValue: (field: FormField) =>
      (field.defaultValue as unknown[] | undefined) ?? [],
  },
  {
    type: "signature",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? "",
  },
  inputDefinition("date"),
  {
    type: "hidden",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? "",
  },
  {
    type: "html",
    isInput: false,
  },
  { type: "heading", isInput: false },
  { type: "label", isInput: false },
  { type: "span", isInput: false },
  { type: "image", isInput: false },
  { type: "paragraph", isInput: false },
  { type: "divider", isInput: false },
  { type: "spacer", isInput: false },
  /* New rich field types (Add fields v2) */
  {
    type: "color",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? "#000000",
  },
  {
    type: "scale",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? null,
  },
  {
    type: "photo",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? null,
  },
  {
    type: "voice",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? "",
  },
  {
    type: "gdpr",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? false,
  },
  {
    type: "matrix",
    isInput: true,
    getDefaultValue: (field: FormField) =>
      (field.defaultValue as Record<string, unknown> | undefined) ?? {},
  },
  {
    type: "recaptcha",
    isInput: true,
    getDefaultValue: (field: FormField) => field.defaultValue ?? "",
  },
  /* Presentational embeds */
  { type: "youtube", isInput: false },
  { type: "pdf", isInput: false },
  { type: "countdown", isInput: false },
  /* Repeater (field array) — stores an array of row objects. */
  {
    type: "repeater",
    isInput: true,
    getDefaultValue: (field: FormField) =>
      (field.defaultValue as unknown[] | undefined) ?? [],
  },
];

export function registerBuiltinFieldTypes(registry: FieldRegistry): void {
  registry.registerTypes(builtinDefinitions);
}
