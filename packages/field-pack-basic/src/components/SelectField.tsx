import type { SelectField as SelectFieldSchema } from "@rfb-ddt/schema";
import { ComboboxSelect } from "./ComboboxSelect.js";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import { useRemoteOptions } from "../hooks/useRemoteOptions.js";
import type { FieldComponentProps } from "../types.js";

export function SelectFieldComponent({
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
}: FieldComponentProps<SelectFieldSchema>) {
  const id = fieldControlId(field.id);

  const remote = useRemoteOptions(
    field.optionsSource,
    field.options,
    { preview },
  );
  // Dynamic options (from actions) take priority over both static and API.
  const options = dynamicOptions ?? remote.options;
  const loading = dynamicOptions ? false : remote.loading;
  const loadError = dynamicOptions ? null : remote.error;

  const isApi = field.optionsSource?.type === "api";
  const useCombobox = !!(field.multiple || field.searchable || field.creatable);

  if (useCombobox) {
    return (
      <FieldWrapper field={field} error={error ?? loadError ?? undefined} controlId={id}>
        <ComboboxSelect
          field={field}
          controlId={id}
          options={options}
          value={value}
          loading={loading}
          disabled={disabled}
          readOnly={readOnly}
          error={!!error}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onClick={onClick}
        />
        {isApi && preview && options.length === 0 && (
          <p className="rfb-field__hint">Loaded from API at runtime</p>
        )}
      </FieldWrapper>
    );
  }

  const apiPlaceholder = isApi && preview
    ? `Loaded from API: ${field.optionsSource?.type === "api" ? field.optionsSource.url || "—" : ""}`
    : loading
      ? "Loading options…"
      : null;

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
        onFocus={onFocus}
        onClick={onClick}
      >
        <option value="" disabled={field.required}>
          {apiPlaceholder ?? field.placeholder ?? "Select…"}
        </option>
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
