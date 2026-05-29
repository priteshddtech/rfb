import type { FormField } from "@rfb-ddt/schema";

let fieldCounter = 0;

function nextFieldId(): string {
  fieldCounter += 1;
  return `field_${Date.now()}_${fieldCounter}`;
}

function uniqueFieldName(type: string, fields: FormField[]): string {
  const base = type.replace(/[^a-z0-9]/gi, "_");
  let name = base;
  let index = 1;
  const used = new Set(fields.map((f) => f.name));
  while (used.has(name)) {
    name = `${base}_${index}`;
    index += 1;
  }
  return name;
}

export function createDefaultField(
  type: string,
  existingFields: FormField[],
): FormField {
  const id = nextFieldId();
  const name = uniqueFieldName(type, existingFields);
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  const base = {
    id,
    type,
    name,
    dbField: name,
    label,
    props: {
      gridSpan: 12,
      group: "General",
    },
  };

  switch (type) {
    case "textarea":
      return { ...base, type: "textarea", rows: 4 };
    case "richtext": {
      const richName = uniqueFieldName("richtext", existingFields);
      return {
        ...base,
        type: "textarea",
        name: richName,
        dbField: richName,
        label: "Rich text",
        rows: 6,
        richText: true,
      };
    }
    case "email":
      return {
        ...base,
        type: "email",
        placeholder: "you@example.com",
        validation: [{ type: "email" }],
      };
    case "password":
      return { ...base, type: "password", showToggle: true };
    case "phone":
      return { ...base, type: "phone", placeholder: "+1 555 123 4567" };
    case "url":
      return { ...base, type: "url", placeholder: "https://example.com" };
    case "file":
      return { ...base, type: "file" };
    case "rating":
      return { ...base, type: "rating", max: 5 };
    case "slider":
      return { ...base, type: "slider", min: 0, max: 100, step: 1 };
    case "time":
      return { ...base, type: "time" };
    case "number":
      return { ...base, type: "number" };
    case "select":
      return {
        ...base,
        type: "select",
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ],
      };
    case "radio":
      return {
        ...base,
        type: "radio",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      };
    case "checkbox":
      return {
        ...base,
        type: "checkbox",
        defaultValue: false,
        props: { ...base.props, gridSpan: 6 },
      };
    case "checkboxGroup":
      return {
        ...base,
        type: "checkboxGroup",
        label: "Checkbox group",
        defaultValue: [],
        display: "list",
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ],
      };
    case "signature":
      return {
        ...base,
        type: "signature",
        label: "Signature",
        height: 160,
        penColor: "#111827",
        penWidth: 2,
        backgroundColor: "#ffffff",
        clearable: true,
      };
    case "date":
      return { ...base, type: "date" };
    case "hidden":
      return { ...base, type: "hidden", label: undefined };
    case "html":
      return {
        ...base,
        type: "html",
        label: "HTML block",
        content: "<p>Custom HTML content</p>",
      };
    case "heading":
      return {
        ...base,
        type: "heading",
        label: undefined,
        content: "Heading",
        level: 2,
      };
    case "label":
      return {
        ...base,
        type: "label",
        label: undefined,
        content: "Label text",
      };
    case "span":
      return {
        ...base,
        type: "span",
        label: undefined,
        content: "Inline text",
      };
    case "image":
      return {
        ...base,
        type: "image",
        label: undefined,
        src: "https://placehold.co/600x300?text=Image",
        alt: "Image",
      };
    case "paragraph":
      return {
        ...base,
        type: "paragraph",
        label: undefined,
        content:
          "This is a paragraph. Use it to display longer descriptive text.",
      };
    case "divider":
      return {
        ...base,
        type: "divider",
        label: undefined,
        variant: "solid",
      };
    case "spacer":
      return {
        ...base,
        type: "spacer",
        label: undefined,
        height: 24,
      };
    case "text":
    default:
      return { ...base, type: "text", placeholder: "" };
  }
}
