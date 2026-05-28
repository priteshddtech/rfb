import type { TextField as TextFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function TextFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<TextFieldSchema>) {
  const id = fieldControlId(field.id);
  const stringValue = value == null ? "" : String(value);
  const inputType =
    field.inputMode === "email"
      ? "email"
      : field.inputMode === "tel"
        ? "tel"
        : field.inputMode === "url"
          ? "url"
          : "text";

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <input
        id={id}
        name={field.name}
        type={inputType}
        className="rfb-input"
        value={stringValue}
        placeholder={field.placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={field.maxLength}
        inputMode={field.inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [field.description && `${id}-desc`, error && `${id}-error`]
            .filter(Boolean)
            .join(" ") || undefined
        }
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </FieldWrapper>
  );
}
