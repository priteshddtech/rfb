import type { ColorField as ColorFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function ColorFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<ColorFieldSchema>) {
  const id = fieldControlId(field.id);
  const current = typeof value === "string" && value ? value : "#000000";
  const showSwatch = field.showSwatch !== false;

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <div className="rfb-color">
        <input
          id={id}
          name={field.name}
          type="color"
          className="rfb-color__picker"
          value={current}
          disabled={disabled || readOnly}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        {showSwatch && (
          <span
            className="rfb-color__swatch"
            style={{ background: current }}
            aria-hidden="true"
          />
        )}
        <span className="rfb-color__value">{current}</span>
      </div>
    </FieldWrapper>
  );
}
