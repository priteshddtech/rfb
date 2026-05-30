import { BASIC_FIELD_TYPES } from "@rfb-ddt/field-pack-basic";
import type { ComponentType, SVGProps } from "react";
import {
  IconAddress,
  IconCalendar,
  IconCamera,
  IconCaptcha,
  IconCheck,
  IconChecks,
  IconChevronDown,
  IconClock,
  IconCode,
  IconColor,
  IconDivider,
  IconEye,
  IconHash,
  IconHeading,
  IconImage,
  IconLabelTag,
  IconLink,
  IconLock,
  IconMail,
  IconMatrix,
  IconMic,
  IconParagraph,
  IconPdf,
  IconPhone,
  IconRadio,
  IconRepeater,
  IconRichText,
  IconScale,
  IconShield,
  IconSignature,
  IconSlider,
  IconSpacer,
  IconStar,
  IconText,
  IconTextarea,
  IconTimer,
  IconType,
  IconUpload,
  IconUserBadge,
  IconUsers,
  IconYoutube,
} from "./icons.js";
import type { ToolboxFieldMeta } from "./types.js";

export type FieldIcon = ComponentType<Omit<SVGProps<SVGSVGElement>, "children">>;

/** Groups shown as accordions in the toolbox, in display order. */
export type ToolboxGroup =
  | "quick"
  | "input"
  | "choice"
  | "layout"
  | "static"
  | "media"
  | "advanced";

interface ToolboxMetaConfig {
  label: string;
  description?: string;
  group: ToolboxGroup;
  icon: FieldIcon;
}

const META: Record<string, ToolboxMetaConfig> = {
  text: {
    label: "Text",
    description: "Single line input",
    group: "input",
    icon: IconText,
  },
  textarea: {
    label: "Textarea",
    description: "Multi-line text",
    group: "input",
    icon: IconTextarea,
  },
  richtext: {
    label: "Rich text",
    description: "WYSIWYG editor",
    group: "input",
    icon: IconRichText,
  },
  email: {
    label: "Email",
    description: "Email address",
    group: "input",
    icon: IconMail,
  },
  password: {
    label: "Password",
    description: "Masked input",
    group: "input",
    icon: IconLock,
  },
  phone: {
    label: "Phone",
    description: "Telephone number",
    group: "input",
    icon: IconPhone,
  },
  url: {
    label: "URL",
    description: "Web link",
    group: "input",
    icon: IconLink,
  },
  number: {
    label: "Number",
    description: "Numeric input",
    group: "input",
    icon: IconHash,
  },
  date: {
    label: "Date",
    description: "Date picker",
    group: "input",
    icon: IconCalendar,
  },
  time: {
    label: "Time",
    description: "Time picker",
    group: "input",
    icon: IconClock,
  },
  select: {
    label: "Dropdown",
    description: "Select one or more",
    group: "choice",
    icon: IconChevronDown,
  },
  checkbox: {
    label: "Checkbox",
    description: "Yes / no",
    group: "choice",
    icon: IconCheck,
  },
  checkboxGroup: {
    label: "Checkbox group",
    description: "Pick many (with image cards)",
    group: "choice",
    icon: IconChecks,
  },
  radio: {
    label: "Radio",
    description: "Choose one option",
    group: "choice",
    icon: IconRadio,
  },
  signature: {
    label: "Signature",
    description: "Draw a signature",
    group: "advanced",
    icon: IconSignature,
  },
  file: {
    label: "File Upload",
    description: "Upload a file",
    group: "advanced",
    icon: IconUpload,
  },
  rating: {
    label: "Rating",
    description: "Star rating",
    group: "advanced",
    icon: IconStar,
  },
  slider: {
    label: "Slider",
    description: "Range / slider",
    group: "advanced",
    icon: IconSlider,
  },
  html: {
    label: "HTML",
    description: "Custom HTML block",
    group: "static",
    icon: IconCode,
  },
  heading: {
    label: "Heading",
    description: "Heading text",
    group: "static",
    icon: IconHeading,
  },
  label: {
    label: "Label",
    description: "Standalone label",
    group: "static",
    icon: IconLabelTag,
  },
  span: {
    label: "Span",
    description: "Inline text",
    group: "static",
    icon: IconType,
  },
  image: {
    label: "Image",
    description: "Static image",
    group: "static",
    icon: IconImage,
  },
  paragraph: {
    label: "Paragraph",
    description: "Block of text",
    group: "static",
    icon: IconParagraph,
  },
  divider: {
    label: "Divider",
    description: "Horizontal rule",
    group: "static",
    icon: IconDivider,
  },
  spacer: {
    label: "Spacer",
    description: "Vertical spacing",
    group: "static",
    icon: IconSpacer,
  },
  hidden: {
    label: "Hidden",
    description: "Hidden value",
    group: "advanced",
    icon: IconEye,
  },
  /* ----------------------- Quick Fields ----------------------- */
  firstName: {
    label: "First Name",
    description: "Given name input",
    group: "quick",
    icon: IconUserBadge,
  },
  lastName: {
    label: "Last Name",
    description: "Family name input",
    group: "quick",
    icon: IconUserBadge,
  },
  fullName: {
    label: "Full Name",
    description: "Combined name input",
    group: "quick",
    icon: IconUsers,
  },
  address: {
    label: "Address",
    description: "Adds 5 fields (line 1, line 2, city, state, country)",
    group: "quick",
    icon: IconAddress,
  },
  /* ----------------------- New rich fields ----------------------- */
  color: {
    label: "Color Picker",
    description: "Native color input",
    group: "input",
    icon: IconColor,
  },
  scale: {
    label: "Scale Rating",
    description: "Linear scale 1—N",
    group: "choice",
    icon: IconScale,
  },
  photo: {
    label: "Take a Photo",
    description: "Camera capture",
    group: "media",
    icon: IconCamera,
  },
  voice: {
    label: "Voice Recorder",
    description: "Capture audio",
    group: "media",
    icon: IconMic,
  },
  gdpr: {
    label: "GDPR Consent",
    description: "Consent checkbox with policy link",
    group: "advanced",
    icon: IconShield,
  },
  youtube: {
    label: "YouTube Embed",
    description: "Embed a YouTube video",
    group: "media",
    icon: IconYoutube,
  },
  pdf: {
    label: "PDF Embed",
    description: "Embed a PDF file",
    group: "media",
    icon: IconPdf,
  },
  countdown: {
    label: "Countdown Timer",
    description: "Counts down to a target",
    group: "static",
    icon: IconTimer,
  },
  matrix: {
    label: "Input Matrix",
    description: "Rows × columns of choices",
    group: "choice",
    icon: IconMatrix,
  },
  recaptcha: {
    label: "reCAPTCHA",
    description: "Bot protection",
    group: "advanced",
    icon: IconCaptcha,
  },
  repeater: {
    label: "Repeater",
    description: "Repeating group of fields (invoice items, contacts…)",
    group: "layout",
    icon: IconRepeater,
  },
};

export const FIELD_ICONS: Record<string, FieldIcon> = Object.fromEntries(
  Object.entries(META).map(([type, m]) => [type, m.icon]),
);

/**
 * Virtual toolbox types — these don't have a unique field-type in the schema,
 * they map to existing types with preset flags (e.g. `richtext` -> textarea
 * with `richText: true`). They're inserted into the toolbox manually after
 * the base list.
 */
const VIRTUAL_TOOLBOX_TYPES = [
  "richtext",
  "firstName",
  "lastName",
  "fullName",
  "address",
] as const;

export const DEFAULT_TOOLBOX_FIELDS: ToolboxFieldMeta[] = [
  ...BASIC_FIELD_TYPES.map((type) => {
    const m = META[type];
    return {
      type: type as string,
      label: m?.label ?? type,
      description: m?.description,
      group: m?.group ?? "advanced",
    };
  }),
  ...VIRTUAL_TOOLBOX_TYPES.map((type) => {
    const m = META[type];
    return {
      type: type as string,
      label: m?.label ?? type,
      description: m?.description,
      group: m?.group ?? "advanced",
    };
  }),
];

export const TOOLBOX_DRAG_PREFIX = "toolbox:";

export function toolboxDragId(type: string): string {
  return `${TOOLBOX_DRAG_PREFIX}${type}`;
}

export function parseToolboxDragId(id: string): string | null {
  if (!id.startsWith(TOOLBOX_DRAG_PREFIX)) return null;
  return id.slice(TOOLBOX_DRAG_PREFIX.length);
}

export const CANVAS_DROP_ID = "canvas-drop";
