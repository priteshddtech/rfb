import type { NumberField as NumberFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function NumberFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<NumberFieldSchema>) {
  const id = fieldControlId(field.id);
  const displayValue =
    value === null || value === undefined || value === ""
      ? ""
      : String(value);

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <input
        id={id}
        name={field.name}
        type="number"
        className="rfb-input rfb-input--number"
        value={displayValue}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        step={field.step}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? undefined : Number(raw));
        }}
        onBlur={onBlur}
      />
    </FieldWrapper>
  );
}
