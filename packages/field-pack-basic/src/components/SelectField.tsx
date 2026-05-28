import type { SelectField as SelectFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function SelectFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<SelectFieldSchema>) {
  const id = fieldControlId(field.id);

  if (field.multiple) {
    const selected = Array.isArray(value)
      ? value.map(String)
      : value == null
        ? []
        : [String(value)];

    return (
      <FieldWrapper field={field} error={error} controlId={id}>
        <select
          id={id}
          name={field.name}
          className="rfb-select"
          multiple
          disabled={disabled || readOnly}
          value={selected}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions).map(
              (opt) => opt.value,
            );
            onChange(values);
          }}
          onBlur={onBlur}
        >
          {field.options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  }

  const stringValue = value == null ? "" : String(value);

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <select
        id={id}
        name={field.name}
        className="rfb-select"
        disabled={disabled || readOnly}
        value={stringValue}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      >
        <option value="" disabled={field.required}>
          {field.placeholder ?? "Select…"}
        </option>
        {field.options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
