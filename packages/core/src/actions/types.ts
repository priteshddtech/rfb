import type {
  FieldAction,
  FieldEvent,
  FormField,
  FormSchema,
  SelectOption,
} from "@rfb-ddt/schema";

/**
 * Runtime context passed to every action. Implementations of this interface
 * typically delegate to the form engine so state mutations re-render the UI.
 */
export interface ActionContext {
  schema: FormSchema;
  /** Snapshot of the current values (use `getValue` for live access). */
  values: Record<string, unknown>;
  /** The event that triggered this chain (informational). */
  event: FieldEvent;
  /** The field whose event fired (informational). */
  sourceField: FormField | undefined;

  /* ---------- Reads ---------- */
  getValue(fieldName: string): unknown;
  getField(fieldId: string): FormField | undefined;

  /* ---------- Writes (re-render-causing) ---------- */
  /**
   * Programmatically set a field value. Does NOT cascade further `change`
   * events to avoid loops. Pass `silent: false` to opt-in to cascading.
   */
  setValue(
    fieldName: string,
    value: unknown,
    options?: { silent?: boolean },
  ): void;

  /** `undefined` clears any override; declarative conditions then resume control. */
  setVisibilityOverride(fieldId: string, visible: boolean | undefined): void;
  setDisabledOverride(fieldId: string, disabled: boolean | undefined): void;
  setDynamicOptions(fieldId: string, options: SelectOption[] | undefined): void;

  goToPage?(pageId: string): void;
}

export interface ActionRunOptions {
  /**
   * Maximum chain depth — prevents accidental infinite loops when an action
   * triggers another event. Default: 10.
   */
  maxDepth?: number;
  /**
   * When the runner catches an error from a single action, it logs and
   * continues with the next one by default. Set false to throw.
   */
  continueOnError?: boolean;
}

export interface ActionRunResult {
  ran: number;
  skipped: number;
  errors: { action: FieldAction; error: unknown }[];
}
