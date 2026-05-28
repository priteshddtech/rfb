/** Shared validation rules referenced by form fields. */
export type ValidationRule =
  | { type: "required"; message?: string }
  | { type: "minLength"; value: number; message?: string }
  | { type: "maxLength"; value: number; message?: string }
  | { type: "min"; value: number; message?: string }
  | { type: "max"; value: number; message?: string }
  | { type: "pattern"; value: string; message?: string }
  | { type: "email"; message?: string }
  | {
      type: "custom";
      /** Id of a registered validator (plugin / host app). */
      validatorId: string;
      message?: string;
    };
