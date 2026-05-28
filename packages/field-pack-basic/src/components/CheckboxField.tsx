import type { CheckboxField as CheckboxFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function CheckboxFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<CheckboxFieldSchema>) {
  const id = fieldControlId(field.id);
  const checked = value === true;

  return (
    <FieldWrapper field={field} error={error} controlId={id} showLabel={false}>
      <label className="rfb-checkbox" htmlFor={id}>
        <input
          id={id}
          name={field.name}
          type="checkbox"
          className="rfb-checkbox__input"
          checked={checked}
          disabled={disabled || readOnly}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
        />
        <span className="rfb-checkbox__label">
          {field.label}
          {field.required && (
            <span className="rfb-field__required" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </span>
      </label>
    </FieldWrapper>
  );
}
