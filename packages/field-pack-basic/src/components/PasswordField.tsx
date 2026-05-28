import type { PasswordField as PasswordFieldSchema } from "@rfb-ddt/schema";
import { useState } from "react";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function PasswordFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<PasswordFieldSchema>) {
  const id = fieldControlId(field.id);
  const [revealed, setRevealed] = useState(false);
  const stringValue = value == null ? "" : String(value);
  const showToggle = field.showToggle !== false;

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <div className="rfb-password">
        <input
          id={id}
          name={field.name}
          type={revealed ? "text" : "password"}
          className="rfb-input"
          value={stringValue}
          placeholder={field.placeholder}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={field.maxLength}
          autoComplete="current-password"
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        {showToggle && (
          <button
            type="button"
            className="rfb-password__toggle"
            aria-label={revealed ? "Hide password" : "Show password"}
            tabIndex={-1}
            onClick={() => setRevealed((v) => !v)}
          >
            {revealed ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </FieldWrapper>
  );
}
