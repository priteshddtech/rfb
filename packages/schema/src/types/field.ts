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
}

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
}

export interface CheckboxField extends FieldBase {
  type: "checkbox";
}

export interface RadioField extends FieldBase {
  type: "radio";
  options: SelectOption[];
  optionsSource?: OptionsSource;
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
  | DateField
  | HiddenField
  | HtmlBlockField
  | HeadingField
  | LabelField
  | SpanField
  | ImageField
  | ParagraphField
  | DividerField
  | SpacerField;

/** Any field, including plugin-defined `type` values. */
export type FormField = BuiltinFormField | CustomField;

export interface CustomField extends FieldBase {
  type: string;
}
