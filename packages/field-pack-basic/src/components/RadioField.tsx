import type { RadioField as RadioFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function RadioFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<RadioFieldSchema>) {
  const groupId = fieldControlId(field.id);
  const stringValue = value == null ? "" : String(value);

  return (
    <FieldWrapper field={field} error={error} controlId={groupId}>
      <div
        className="rfb-radio-group"
        role="radiogroup"
        aria-invalid={error ? true : undefined}
      >
        {field.options.map((opt) => {
          const optionId = `${groupId}-${String(opt.value)}`;
          return (
            <label key={optionId} className="rfb-radio" htmlFor={optionId}>
              <input
                id={optionId}
                name={field.name}
                type="radio"
                className="rfb-radio__input"
                value={String(opt.value)}
                checked={stringValue === String(opt.value)}
                disabled={disabled || readOnly}
                onChange={() => onChange(opt.value)}
                onBlur={onBlur}
              />
              <span className="rfb-radio__label">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
}
