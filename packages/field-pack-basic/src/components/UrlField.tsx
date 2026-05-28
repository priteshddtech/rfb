import type { UrlField as UrlFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function UrlFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<UrlFieldSchema>) {
  const id = fieldControlId(field.id);
  const stringValue = value == null ? "" : String(value);

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <input
        id={id}
        name={field.name}
        type="url"
        className="rfb-input"
        value={stringValue}
        placeholder={field.placeholder ?? "https://example.com"}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={field.maxLength}
        inputMode="url"
        autoComplete="url"
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </FieldWrapper>
  );
}
