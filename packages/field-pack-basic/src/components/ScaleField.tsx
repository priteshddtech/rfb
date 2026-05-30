import type { ScaleField as ScaleFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function ScaleFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<ScaleFieldSchema>) {
  const id = fieldControlId(field.id);
  const min = field.min ?? 1;
  const max = field.max ?? 5;
  const step = field.step ?? 1;
  const display = field.display ?? "buttons";

  if (display === "range") {
    return (
      <FieldWrapper field={field} error={error} controlId={id}>
        <div className="rfb-scale rfb-scale--range">
          <input
            id={id}
            name={field.name}
            type="range"
            min={min}
            max={max}
            step={step}
            value={Number(value ?? min)}
            disabled={disabled || readOnly}
            aria-invalid={error ? true : undefined}
            onChange={(e) => onChange(Number(e.target.value))}
            onBlur={onBlur}
          />
          <div className="rfb-scale__legend">
            <span>{field.minLabel ?? min}</span>
            <span className="rfb-scale__current">
              {value == null || value === "" ? "—" : String(value)}
            </span>
            <span>{field.maxLabel ?? max}</span>
          </div>
        </div>
      </FieldWrapper>
    );
  }

  // buttons (default)
  const buttons: number[] = [];
  for (let i = min; i <= max; i += step) buttons.push(i);

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <div className="rfb-scale rfb-scale--buttons" role="radiogroup">
        {buttons.map((n) => {
          const active = Number(value) === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled || readOnly}
              className={[
                "rfb-scale__btn",
                active && "rfb-scale__btn--active",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onChange(n)}
              onBlur={onBlur}
            >
              {n}
            </button>
          );
        })}
      </div>
      {(field.minLabel || field.maxLabel) && (
        <div className="rfb-scale__legend">
          <span>{field.minLabel ?? ""}</span>
          <span>{field.maxLabel ?? ""}</span>
        </div>
      )}
    </FieldWrapper>
  );
}
