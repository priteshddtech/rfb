import type { TextareaField as TextareaFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import { RichTextEditor } from "./RichTextEditor.js";
import type { FieldComponentProps } from "../types.js";

export function TextareaFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  onFocus,
  onClick,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<TextareaFieldSchema>) {
  const id = fieldControlId(field.id);
  const stringValue = value == null ? "" : String(value);

  if (field.richText) {
    return (
      <FieldWrapper field={field} error={error} controlId={id}>
        <RichTextEditor
          id={id}
          name={field.name}
          value={stringValue}
          onChange={(html) => onChange(html)}
          onBlur={onBlur}
          onFocus={onFocus}
          onClick={onClick}
          placeholder={field.placeholder}
          disabled={disabled}
          readOnly={readOnly}
          invalid={!!error}
          toolbar={field.richTextToolbar}
          minHeight={Math.max((field.rows ?? 3) * 24, 96)}
        />
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <textarea
        id={id}
        name={field.name}
        className="rfb-textarea"
        value={stringValue}
        placeholder={field.placeholder}
        rows={field.rows ?? 3}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={field.maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [field.description && `${id}-desc`, error && `${id}-error`]
            .filter(Boolean)
            .join(" ") || undefined
        }
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        onClick={onClick}
      />
    </FieldWrapper>
  );
}
