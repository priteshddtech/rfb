import type { PhoneField as PhoneFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function PhoneFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<PhoneFieldSchema>) {
  const id = fieldControlId(field.id);
  const stringValue = value == null ? "" : String(value);

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <input
        id={id}
        name={field.name}
        type="tel"
        className="rfb-input"
        value={stringValue}
        placeholder={field.placeholder ?? "+1 555 123 4567"}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={field.maxLength}
        inputMode="tel"
        autoComplete="tel"
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </FieldWrapper>
  );
}
