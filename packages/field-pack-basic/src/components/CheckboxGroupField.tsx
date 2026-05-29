import type {
  CheckboxGroupField as CheckboxGroupFieldSchema,
  SelectOption,
} from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import { useRemoteOptions } from "../hooks/useRemoteOptions.js";
import type { FieldComponentProps } from "../types.js";

function toArrayValue(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (value == null || value === "") return [];
  return [String(value)];
}

export function CheckboxGroupFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  onFocus,
  onClick,
  error,
  disabled,
  readOnly,
  preview,
  dynamicOptions,
}: FieldComponentProps<CheckboxGroupFieldSchema>) {
  const groupId = fieldControlId(field.id);
  const selected = toArrayValue(value);

  const remote = useRemoteOptions(
    field.optionsSource,
    field.options,
    { preview },
  );
  const options: SelectOption[] = dynamicOptions ?? remote.options;
  const loading = dynamicOptions ? false : remote.loading;
  const loadError = dynamicOptions ? null : remote.error;
  const isApi = field.optionsSource?.type === "api";

  const display = field.display ?? "list";
  const hasImages = options.some((opt) => opt.image);
  const columns = field.columns ?? (hasImages ? 3 : 2);

  const toggle = (rawValue: SelectOption["value"]) => {
    const str = String(rawValue);
    const next = selected.includes(str)
      ? selected.filter((v) => v !== str)
      : [...selected, str];
    if (
      field.maxSelected != null &&
      next.length > field.maxSelected &&
      !selected.includes(str)
    ) {
      return;
    }
    onChange(next);
  };

  return (
    <FieldWrapper field={field} error={error ?? loadError ?? undefined} controlId={groupId}>
      <div
        className={`rfb-checkbox-group rfb-checkbox-group--${display}${hasImages ? " rfb-checkbox-group--cards" : ""}`}
        role="group"
        aria-invalid={error ? true : undefined}
        style={display === "grid"
          ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
          : undefined}
      >
        {loading && (
          <p className="rfb-field__hint">Loading options…</p>
        )}
        {!loading && isApi && preview && options.length === 0 && (
          <p className="rfb-field__hint">
            Loaded from API at runtime
          </p>
        )}
        {options.map((opt) => {
          const optionId = `${groupId}-${String(opt.value)}`;
          const isSelected = selected.includes(String(opt.value));
          const reachedMax =
            field.maxSelected != null &&
            selected.length >= field.maxSelected &&
            !isSelected;
          const optionDisabled =
            disabled || readOnly || loading || opt.disabled || reachedMax;
          return (
            <label
              key={optionId}
              className={`rfb-checkbox-card${opt.image ? " rfb-checkbox-card--image" : ""}${isSelected ? " rfb-checkbox-card--selected" : ""}${optionDisabled ? " rfb-checkbox-card--disabled" : ""}`}
              htmlFor={optionId}
            >
              <input
                id={optionId}
                name={field.name}
                type="checkbox"
                className="rfb-checkbox-card__input"
                value={String(opt.value)}
                checked={isSelected}
                disabled={optionDisabled}
                onChange={() => toggle(opt.value)}
                onBlur={onBlur}
                onFocus={onFocus}
                onClick={onClick}
              />
              {opt.image && (
                <span className="rfb-checkbox-card__media">
                  <img
                    src={opt.image}
                    alt={opt.imageAlt ?? opt.label}
                    loading="lazy"
                  />
                </span>
              )}
              <span className="rfb-checkbox-card__body">
                <span className="rfb-checkbox-card__label">{opt.label}</span>
                {opt.description && (
                  <span className="rfb-checkbox-card__description">
                    {opt.description}
                  </span>
                )}
              </span>
              <span className="rfb-checkbox-card__check" aria-hidden="true" />
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
}
