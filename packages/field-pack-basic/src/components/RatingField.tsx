import type { RatingField as RatingFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function RatingFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<RatingFieldSchema>) {
  const id = fieldControlId(field.id);
  const max = field.max ?? 5;
  const current = Number(value) || 0;
  const isInteractive = !disabled && !readOnly;

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <div
        id={id}
        className="rfb-rating"
        role="radiogroup"
        aria-invalid={error ? true : undefined}
        onBlur={onBlur}
      >
        {Array.from({ length: max }).map((_, index) => {
          const star = index + 1;
          const isActive = current >= star;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={current === star}
              aria-label={`${star} star`}
              className={
                "rfb-rating__star" +
                (isActive ? " rfb-rating__star--active" : "")
              }
              disabled={!isInteractive}
              onClick={() => onChange(star)}
            >
              {isActive ? "★" : "☆"}
            </button>
          );
        })}
      </div>
    </FieldWrapper>
  );
}
