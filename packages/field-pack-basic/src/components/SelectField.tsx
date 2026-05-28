import type { SelectField as SelectFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import { useRemoteOptions } from "../hooks/useRemoteOptions.js";
import type { FieldComponentProps } from "../types.js";

export function SelectFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
  preview,
}: FieldComponentProps<SelectFieldSchema>) {
  const id = fieldControlId(field.id);

  const { options, loading, error: loadError } = useRemoteOptions(
    field.optionsSource,
    field.options,
    { preview },
  );

  const isApi = field.optionsSource?.type === "api";
  const apiPlaceholder = isApi && preview
    ? `Loaded from API: ${field.optionsSource?.type === "api" ? field.optionsSource.url || "—" : ""}`
    : loading
      ? "Loading options…"
      : null;

  if (field.multiple) {
    const selected = Array.isArray(value)
      ? value.map(String)
      : value == null
        ? []
        : [String(value)];

    return (
      <FieldWrapper field={field} error={error ?? loadError ?? undefined} controlId={id}>
        <select
          id={id}
          name={field.name}
          className="rfb-select"
          multiple
          disabled={disabled || readOnly || loading}
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
          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
        {apiPlaceholder && (
          <p className="rfb-field__hint">{apiPlaceholder}</p>
        )}
      </FieldWrapper>
    );
  }

  const stringValue = value == null ? "" : String(value);

  return (
    <FieldWrapper field={field} error={error ?? loadError ?? undefined} controlId={id}>
      <select
        id={id}
        name={field.name}
        className="rfb-select"
        disabled={disabled || readOnly || loading}
        value={stringValue}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      >
        <option value="" disabled={field.required}>
          {apiPlaceholder ?? field.placeholder ?? "Select…"}
        </option>
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
