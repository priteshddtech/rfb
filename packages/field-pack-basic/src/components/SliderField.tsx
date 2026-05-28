import type { SliderField as SliderFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function SliderFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<SliderFieldSchema>) {
  const id = fieldControlId(field.id);
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const step = field.step ?? 1;
  const current = value == null || value === "" ? min : Number(value);

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <div className="rfb-slider">
        <input
          id={id}
          name={field.name}
          type="range"
          className="rfb-slider__input"
          min={min}
          max={max}
          step={step}
          value={current}
          disabled={disabled || readOnly}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(Number(e.target.value))}
          onBlur={onBlur}
        />
        <output className="rfb-slider__value">{current}</output>
      </div>
    </FieldWrapper>
  );
}
