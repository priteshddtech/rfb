import type { FileField as FileFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function FileFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<FileFieldSchema>) {
  const id = fieldControlId(field.id);
  const files = value instanceof FileList ? Array.from(value) : [];

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <input
        id={id}
        name={field.name}
        type="file"
        className="rfb-file"
        accept={field.accept}
        multiple={field.multiple}
        disabled={disabled || readOnly}
        aria-invalid={error ? true : undefined}
        onChange={(e) =>
          onChange(field.multiple ? e.target.files : (e.target.files?.[0] ?? null))
        }
        onBlur={onBlur}
      />
      {files.length > 0 && (
        <ul className="rfb-file__list">
          {files.map((file) => (
            <li key={file.name}>
              {file.name} <small>({Math.round(file.size / 1024)} KB)</small>
            </li>
          ))}
        </ul>
      )}
    </FieldWrapper>
  );
}
