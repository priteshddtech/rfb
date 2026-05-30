import type { ValidationRule } from "./validation.js";

export type FieldId = string;

/** Operators for simple show/hide and enable/disable rules. */
export type ConditionOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "empty"
  | "notEmpty";

export interface FieldCondition {
  when: {
    fieldId: FieldId;
    operator: ConditionOperator;
    value?: unknown;
  };
  then: "show" | "hide" | "enable" | "disable";
}

/* ---------- Event bindings ---------- */

/** Events that can trigger an action chain on a field. */
export type FieldEvent = "load" | "change" | "click" | "focus" | "blur";

/** A precondition that gates a single action (separate from FieldCondition). */
export interface ActionCondition {
  fieldId: FieldId;
  operator: ConditionOperator;
  value?: unknown;
}

interface FieldActionShared {
  /** Optional id for debugging / referencing. */
  id?: string;
  /** Optional precondition; the action only runs when this is truthy. */
  when?: ActionCondition;
}

/** Set one or more fields visible. */
export interface FieldActionShow extends FieldActionShared {
  type: "show";
  targets: FieldId[];
}

export interface FieldActionHide extends FieldActionShared {
  type: "hide";
  targets: FieldId[];
}

export interface FieldActionEnable extends FieldActionShared {
  type: "enable";
  targets: FieldId[];
}

export interface FieldActionDisable extends FieldActionShared {
  type: "disable";
  targets: FieldId[];
}

/** Reset visibility / disabled overrides so declarative rules take over again. */
export interface FieldActionResetOverrides extends FieldActionShared {
  type: "resetOverrides";
  targets: FieldId[];
}

/** Set the value of one or more fields. */
export interface FieldActionSetValue extends FieldActionShared {
  type: "setValue";
  targets: FieldId[];
  value: unknown;
}

/** Copy a value from another field into the targets. */
export interface FieldActionCopyValue extends FieldActionShared {
  type: "copyValue";
  targets: FieldId[];
  sourceFieldId: FieldId;
}

/** Clear (reset to empty) the targets. */
export interface FieldActionClearValue extends FieldActionShared {
  type: "clearValue";
  targets: FieldId[];
}

/** Fetch options from an API and apply them to one or more select/radio fields. */
export interface FieldActionLoadOptions extends FieldActionShared {
  type: "loadOptions";
  targets: FieldId[];
  /** Re-uses the same shape as `OptionsSourceApi` (url + mapping). */
  source: OptionsSourceApi;
  /**
   * Optional placeholder for `{value}` token in the URL, where `value` is
   * the source field's current value. Defaults to `{value}`.
   */
  valueToken?: string;
}

/** Pop a browser alert (mostly for testing / debugging). */
export interface FieldActionAlert extends FieldActionShared {
  type: "alert";
  message: string;
}

/** Navigate to a specific step / tab by page id. */
export interface FieldActionGoToPage extends FieldActionShared {
  type: "goToPage";
  pageId: string;
}

/**
 * Run arbitrary JavaScript. The body receives a single `ctx` argument with:
 * `{ values, getValue, setValue, setVisible, setDisabled, setOptions, schema, event }`.
 * Use sparingly; prefer the typed actions above when possible.
 */
export interface FieldActionCustom extends FieldActionShared {
  type: "custom";
  code: string;
}

export type FieldAction =
  | FieldActionShow
  | FieldActionHide
  | FieldActionEnable
  | FieldActionDisable
  | FieldActionResetOverrides
  | FieldActionSetValue
  | FieldActionCopyValue
  | FieldActionClearValue
  | FieldActionLoadOptions
  | FieldActionAlert
  | FieldActionGoToPage
  | FieldActionCustom;

export type FieldActionType = FieldAction["type"];

/** A bundle of actions to run when an event fires on a field. */
export interface FieldEventBinding {
  id: string;
  event: FieldEvent;
  actions: FieldAction[];
}

/**
 * Minimum properties every field must support.
 * `type` is a string so custom field packs can register new types.
 */
export interface FieldBase {
  id: FieldId;
  type: string;
  /** Name used in submitted JSON (`FormResponse.data`). */
  name: string;
  /**
   * Database column / API key that the value maps to on the server side.
   * Defaults to {@link FieldBase.name} when omitted.
   */
  dbField?: string;
  label?: string;
  /** Helper text shown under the field. */
  description?: string;
  placeholder?: string;
  required?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  defaultValue?: unknown;
  validation?: ValidationRule[];
  conditions?: FieldCondition[];
  /** Imperative event-driven action chains. */
  events?: FieldEventBinding[];
  /** Extra space-separated CSS class names. */
  className?: string;
  /**
   * Inline style overrides applied to the field's root wrapper.
   * Keys are React-style camelCase CSS properties (e.g. `marginTop`,
   * `borderTopWidth`). Values may be strings (e.g. `"10px"`, `"#fff"`) or
   * raw numbers (interpreted as `px` by React).
   */
  style?: Record<string, string | number>;
  /** Preset semantic size token. */
  size?: "small" | "medium" | "large";
  /** Extension point for field-pack / theme / host metadata. */
  props?: Record<string, unknown>;
}

export interface TextField extends FieldBase {
  type: "text";
  inputMode?: "text" | "email" | "tel" | "url" | "numeric";
  maxLength?: number;
}

export interface TextareaField extends FieldBase {
  type: "textarea";
  rows?: number;
  maxLength?: number;
  /** When true, render a lightweight rich-text editor instead of a plain textarea. */
  richText?: boolean;
  /** Subset of toolbar buttons to expose when `richText` is true. */
  richTextToolbar?: RichTextToolbarButton[];
}

export type RichTextToolbarButton =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "h1"
  | "h2"
  | "h3"
  | "paragraph"
  | "ul"
  | "ol"
  | "link"
  | "clear";

export interface EmailField extends FieldBase {
  type: "email";
  maxLength?: number;
}

export interface PasswordField extends FieldBase {
  type: "password";
  maxLength?: number;
  /** Show / hide toggle. Default: true. */
  showToggle?: boolean;
}

export interface PhoneField extends FieldBase {
  type: "phone";
  maxLength?: number;
}

export interface UrlField extends FieldBase {
  type: "url";
  maxLength?: number;
}

export interface FileField extends FieldBase {
  type: "file";
  accept?: string;
  multiple?: boolean;
}

export interface RatingField extends FieldBase {
  type: "rating";
  max?: number;
}

export interface SliderField extends FieldBase {
  type: "slider";
  min?: number;
  max?: number;
  step?: number;
}

export interface TimeField extends FieldBase {
  type: "time";
  min?: string;
  max?: string;
  step?: number;
}

export interface NumberField extends FieldBase {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectOption {
  label: string;
  value: string | number | boolean;
  /** Optional thumbnail image displayed alongside or above the label. */
  image?: string;
  /** Alt text for `image`. Defaults to `label`. */
  imageAlt?: string;
  /** Secondary descriptive text shown under the label (card layouts). */
  description?: string;
  /** Disable a single option without removing it from the list. */
  disabled?: boolean;
}

/**
 * How the option list is populated. When `optionsSource` is absent or
 * `type === "static"`, the field's own `options` array is used (legacy
 * behaviour). When `type === "api"`, options are fetched at runtime.
 */
export type OptionsSource =
  | { type: "static" }
  | OptionsSourceApi;

export interface OptionsSourceApi {
  type: "api";
  /** Endpoint URL. Required. */
  url: string;
  method?: "GET" | "POST";
  /** Optional headers (e.g. for auth / content-type). */
  headers?: Record<string, string>;
  /** Optional JSON body string for POST requests. */
  body?: string;
  /**
   * Dot-path into the JSON response that yields the array of items.
   * Empty / omitted means the response itself is the array.
   * Example: `"data.items"` for `{ data: { items: [...] } }`.
   */
  resultsPath?: string;
  /** Property in each item that holds the option's value. */
  valueKey: string;
  /** Property in each item that holds the option's label. */
  labelKey: string;
}

export interface SelectField extends FieldBase {
  type: "select";
  options: SelectOption[];
  optionsSource?: OptionsSource;
  multiple?: boolean;
  /** Enable typeahead filter input + custom dropdown. */
  searchable?: boolean;
  /** Allow the user to add free-text values not in the option list. */
  creatable?: boolean;
}

export interface CheckboxField extends FieldBase {
  type: "checkbox";
}

export interface RadioField extends FieldBase {
  type: "radio";
  options: SelectOption[];
  optionsSource?: OptionsSource;
  /** Layout for the option list. `list` = stacked, `grid` = card grid (works well with images). */
  display?: "list" | "grid";
  /** Approximate number of columns when `display === "grid"`. */
  columns?: number;
}

export interface CheckboxGroupField extends FieldBase {
  type: "checkboxGroup";
  options: SelectOption[];
  optionsSource?: OptionsSource;
  display?: "list" | "grid";
  columns?: number;
  /** Minimum number of selections required. */
  minSelected?: number;
  /** Maximum number of selections allowed. */
  maxSelected?: number;
}

export interface DateField extends FieldBase {
  type: "date";
  min?: string;
  max?: string;
}

export interface HiddenField extends FieldBase {
  type: "hidden";
}

/** Static HTML block (heading, paragraph, divider, etc.). */
export interface HtmlBlockField extends FieldBase {
  type: "html";
  content: string;
}

/* ---------- Static / presentational fields ---------- */

export interface HeadingField extends FieldBase {
  type: "heading";
  content: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** Standalone label/title block (not a form field's label). */
export interface LabelField extends FieldBase {
  type: "label";
  content: string;
}

/** Inline span of text. */
export interface SpanField extends FieldBase {
  type: "span";
  content: string;
}

export interface ImageField extends FieldBase {
  type: "image";
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  /** Optional click-through link. */
  href?: string;
}

export interface ParagraphField extends FieldBase {
  type: "paragraph";
  content: string;
}

export interface DividerField extends FieldBase {
  type: "divider";
  /** Stroke style. Default `solid`. */
  variant?: "solid" | "dashed" | "dotted";
}

/** Pure vertical whitespace with configurable height (px). */
export interface SpacerField extends FieldBase {
  type: "spacer";
  height?: number;
}

/** Native color picker (`<input type="color">`). Value is a hex string. */
export interface ColorField extends FieldBase {
  type: "color";
  /** Show the picked colour as a swatch next to the input. Default: true. */
  showSwatch?: boolean;
}

/**
 * Linear scale rating (Google-Forms style). Renders either a row of
 * numeric buttons or a native range slider.
 */
export interface ScaleField extends FieldBase {
  type: "scale";
  min?: number;
  max?: number;
  step?: number;
  /** Label shown under the minimum value (e.g. "Not at all"). */
  minLabel?: string;
  /** Label shown under the maximum value (e.g. "Extremely"). */
  maxLabel?: string;
  /** Render as buttons (default) or a continuous range slider. */
  display?: "buttons" | "range";
}

/**
 * Photo capture — a file input with `accept="image/*"` and
 * `capture` set so mobile browsers go straight to the camera.
 */
export interface PhotoField extends FieldBase {
  type: "photo";
  /** Front (`"user"`) or back (`"environment"`) camera. Default: environment. */
  facingMode?: "environment" | "user";
  /** Max file size in bytes (validated client-side). */
  maxSize?: number;
}

/**
 * Voice recorder. Uses MediaRecorder under the hood; the stored value is
 * a base64-encoded audio blob (data URL).
 */
export interface VoiceField extends FieldBase {
  type: "voice";
  /** Hard limit in seconds. Default: 120. */
  maxDuration?: number;
  /** Mime type hint passed to MediaRecorder (e.g. `"audio/webm"`). */
  mimeType?: string;
}

/** GDPR / consent checkbox with explanatory text and optional policy link. */
export interface GdprField extends FieldBase {
  type: "gdpr";
  /** The consent statement rendered alongside the checkbox. */
  consentText?: string;
  /** Optional URL pointing to your privacy policy. */
  policyUrl?: string;
  /** Visible label for the policy link. */
  policyLabel?: string;
}

/** YouTube video embed (presentational — not a submittable input). */
export interface YoutubeField extends FieldBase {
  type: "youtube";
  /** Full YouTube URL or just the 11-character video id. */
  url: string;
  width?: number | string;
  height?: number | string;
  /** Show video controls. Default: true. */
  controls?: boolean;
}

/** PDF embed (presentational). */
export interface PdfField extends FieldBase {
  type: "pdf";
  url: string;
  width?: number | string;
  height?: number | string;
}

/** Countdown timer pointing to a target date/time. */
export interface CountdownField extends FieldBase {
  type: "countdown";
  /** ISO date/time the timer counts down to. */
  target: string;
  /** What happens when the timer hits zero. */
  onComplete?: "stop" | "continue";
  /** Show "days / hours / minutes / seconds" labels. Default: true. */
  showLabels?: boolean;
}

/** Matrix question — rows of statements × columns of choices. */
export interface MatrixField extends FieldBase {
  type: "matrix";
  /** Statements asked once per row. */
  rows: { id: string; label: string }[];
  /** Columns are the choice options offered per row. */
  columns: SelectOption[];
  /** Allow multiple selections per row (checkbox matrix). */
  multiple?: boolean;
}

/**
 * reCAPTCHA placeholder. Real validation happens server-side; the renderer
 * mounts the Google widget when a `siteKey` is set and otherwise shows a
 * preview box.
 */
export interface RecaptchaField extends FieldBase {
  type: "recaptcha";
  /** Site key — without this, the widget renders as a placeholder. */
  siteKey?: string;
  variant?: "v2-checkbox" | "v2-invisible" | "v3";
  theme?: "light" | "dark";
}

/** Canvas-based signature pad. The value is a base64-encoded PNG data URL. */
export interface SignatureField extends FieldBase {
  type: "signature";
  /** Canvas width in CSS px. Defaults to `null` which means fill container. */
  width?: number;
  /** Canvas height in CSS px. Defaults to 160. */
  height?: number;
  /** Stroke color used when drawing. Defaults to `#111827`. */
  penColor?: string;
  /** Stroke width in px. Defaults to 2. */
  penWidth?: number;
  /** Pad background color. Defaults to `#ffffff`. */
  backgroundColor?: string;
  /** Show a clear button under the pad. Defaults to true. */
  clearable?: boolean;
}

/**
 * Built-in field types. Field packs can add more via `CustomField`
 * or by extending the union in their own package.
 */
export type BuiltinFormField =
  | TextField
  | TextareaField
  | EmailField
  | PasswordField
  | PhoneField
  | UrlField
  | FileField
  | RatingField
  | SliderField
  | TimeField
  | NumberField
  | SelectField
  | CheckboxField
  | RadioField
  | CheckboxGroupField
  | DateField
  | HiddenField
  | HtmlBlockField
  | HeadingField
  | LabelField
  | SpanField
  | ImageField
  | ParagraphField
  | DividerField
  | SpacerField
  | SignatureField
  | ColorField
  | ScaleField
  | PhotoField
  | VoiceField
  | GdprField
  | YoutubeField
  | PdfField
  | CountdownField
  | MatrixField
  | RecaptchaField;

/** Any field, including plugin-defined `type` values. */
export type FormField = BuiltinFormField | CustomField;

export interface CustomField extends FieldBase {
  type: string;
}
