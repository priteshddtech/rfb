import { BASIC_FIELD_TYPES } from "@rfb-ddt/field-pack-basic";
import type { ComponentType, SVGProps } from "react";
import {
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconCode,
  IconDivider,
  IconEye,
  IconHash,
  IconHeading,
  IconImage,
  IconLabelTag,
  IconLink,
  IconLock,
  IconMail,
  IconParagraph,
  IconPhone,
  IconRadio,
  IconSlider,
  IconSpacer,
  IconStar,
  IconText,
  IconTextarea,
  IconType,
  IconUpload,
} from "./icons.js";
import type { ToolboxFieldMeta } from "./types.js";

export type FieldIcon = ComponentType<Omit<SVGProps<SVGSVGElement>, "children">>;

interface ToolboxMetaConfig {
  label: string;
  description?: string;
  group: "input" | "choice" | "layout" | "static" | "advanced";
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
  radio: {
    label: "Radio",
    description: "Choose one option",
    group: "choice",
    icon: IconRadio,
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
};

export const FIELD_ICONS: Record<string, FieldIcon> = Object.fromEntries(
  Object.entries(META).map(([type, m]) => [type, m.icon]),
);

export const DEFAULT_TOOLBOX_FIELDS: ToolboxFieldMeta[] = BASIC_FIELD_TYPES.map(
  (type) => {
    const m = META[type];
    return {
      type,
      label: m?.label ?? type,
      description: m?.description,
      group: m?.group ?? "advanced",
    };
  },
);

export const TOOLBOX_DRAG_PREFIX = "toolbox:";

export function toolboxDragId(type: string): string {
  return `${TOOLBOX_DRAG_PREFIX}${type}`;
}

export function parseToolboxDragId(id: string): string | null {
  if (!id.startsWith(TOOLBOX_DRAG_PREFIX)) return null;
  return id.slice(TOOLBOX_DRAG_PREFIX.length);
}

export const CANVAS_DROP_ID = "canvas-drop";
