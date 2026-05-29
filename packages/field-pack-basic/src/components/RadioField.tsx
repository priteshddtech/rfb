import type { RadioField as RadioFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import { useRemoteOptions } from "../hooks/useRemoteOptions.js";
import type { FieldComponentProps } from "../types.js";

export function RadioFieldComponent({
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
}: FieldComponentProps<RadioFieldSchema>) {
  const groupId = fieldControlId(field.id);
  const stringValue = value == null ? "" : String(value);

  const remote = useRemoteOptions(
    field.optionsSource,
    field.options,
    { preview },
  );
  const options = dynamicOptions ?? remote.options;
  const loading = dynamicOptions ? false : remote.loading;
  const loadError = dynamicOptions ? null : remote.error;

  const isApi = field.optionsSource?.type === "api";

  return (
    <FieldWrapper field={field} error={error ?? loadError ?? undefined} controlId={groupId}>
      <div
        className="rfb-radio-group"
        role="radiogroup"
        aria-invalid={error ? true : undefined}
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
          return (
            <label key={optionId} className="rfb-radio" htmlFor={optionId}>
              <input
                id={optionId}
                name={field.name}
                type="radio"
                className="rfb-radio__input"
                value={String(opt.value)}
                checked={stringValue === String(opt.value)}
                disabled={disabled || readOnly || loading}
                onChange={() => onChange(opt.value)}
                onBlur={onBlur}
                onFocus={onFocus}
                onClick={onClick}
              />
              <span className="rfb-radio__label">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
}
