import type { DateField as DateFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function DateFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<DateFieldSchema>) {
  const id = fieldControlId(field.id);
  const stringValue = value == null ? "" : String(value);

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <input
        id={id}
        name={field.name}
        type="date"
        className="rfb-input rfb-input--date"
        value={stringValue}
        min={field.min}
        max={field.max}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </FieldWrapper>
  );
}
