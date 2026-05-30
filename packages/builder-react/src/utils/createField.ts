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

/**
 * Build a single text field with custom label / preferred name. Used by the
 * Quick Fields virtual types (First Name, Last Name, etc.).
 */
function makeText(
  existingFields: FormField[],
  label: string,
  preferredName: string,
  extra?: Partial<FormField>,
): FormField {
  const id = nextFieldId();
  const name = uniqueFieldName(preferredName, existingFields);
  return {
    id,
    type: "text",
    name,
    dbField: name,
    label,
    placeholder: "",
    props: { gridSpan: 12, group: "General" },
    ...(extra ?? {}),
  };
}

/**
 * Multi-field factory. Returns one or many fields depending on the type.
 * Composite virtual types (e.g. `address`) expand into a stack of fields.
 */
export function createDefaultFields(
  type: string,
  existingFields: FormField[],
): FormField[] {
  switch (type) {
    /* ---------- Quick fields (virtual) ---------- */
    case "firstName":
      return [
        makeText(existingFields, "First Name", "firstName", {
          placeholder: "Jane",
        }),
      ];
    case "lastName":
      return [
        makeText(existingFields, "Last Name", "lastName", {
          placeholder: "Doe",
        }),
      ];
    case "fullName":
      return [
        makeText(existingFields, "Full Name", "fullName", {
          placeholder: "Jane Doe",
        }),
      ];
    case "address": {
      // Track the working list so each generated field's name is unique
      // *relative to the existing list **plus** prior fields in this batch*.
      const working = [...existingFields];
      const out: FormField[] = [];
      const push = (
        label: string,
        preferredName: string,
        extra: Partial<FormField> = {},
      ) => {
        const f = makeText(working, label, preferredName, extra);
        working.push(f);
        out.push(f);
      };
      push("Address Line 1", "addressLine1", {
        placeholder: "Street address",
      });
      push("Address Line 2", "addressLine2", {
        placeholder: "Apt, suite, etc. (optional)",
      });
      push("City", "city");
      push("State / Province", "state");
      push("Country", "country");
      return out;
    }
    default:
      return [createDefaultField(type, existingFields)];
  }
}

/**
 * Single-field factory. Kept for backwards compatibility; new callers should
 * use {@link createDefaultFields}.
 */
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
    /* ---------- New field types ---------- */
    case "color":
      return {
        ...base,
        type: "color",
        label: "Pick a color",
        defaultValue: "#2563eb",
        showSwatch: true,
      };
    case "scale":
      return {
        ...base,
        type: "scale",
        label: "Rating",
        min: 1,
        max: 5,
        step: 1,
        minLabel: "Poor",
        maxLabel: "Excellent",
        display: "buttons",
      };
    case "photo":
      return {
        ...base,
        type: "photo",
        label: "Take a photo",
        facingMode: "environment",
      };
    case "voice":
      return {
        ...base,
        type: "voice",
        label: "Record a message",
        maxDuration: 120,
      };
    case "gdpr":
      return {
        ...base,
        type: "gdpr",
        label: undefined,
        consentText:
          "I agree to the processing of my personal data in accordance with the privacy policy.",
        policyLabel: "Privacy policy",
        policyUrl: "",
        required: true,
      };
    case "youtube":
      return {
        ...base,
        type: "youtube",
        label: "YouTube video",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        height: 315,
      };
    case "pdf":
      return {
        ...base,
        type: "pdf",
        label: "PDF document",
        url: "",
        height: 480,
      };
    case "countdown":
      return {
        ...base,
        type: "countdown",
        label: "Countdown",
        target: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
        showLabels: true,
        onComplete: "stop",
      };
    case "matrix":
      return {
        ...base,
        type: "matrix",
        label: "Rate the following",
        rows: [
          { id: "r1", label: "Ease of use" },
          { id: "r2", label: "Value for money" },
          { id: "r3", label: "Support quality" },
        ],
        columns: [
          { label: "Poor", value: "1" },
          { label: "Okay", value: "2" },
          { label: "Good", value: "3" },
          { label: "Excellent", value: "4" },
        ],
        multiple: false,
        defaultValue: {},
      };
    case "recaptcha":
      return {
        ...base,
        type: "recaptcha",
        label: undefined,
        siteKey: "",
        variant: "v2-checkbox",
        theme: "light",
      };
    case "text":
    default:
      return { ...base, type: "text", placeholder: "" };
  }
}
