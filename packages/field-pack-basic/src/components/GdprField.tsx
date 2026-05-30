import type { GdprField as GdprFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

/**
 * GDPR / consent checkbox with explanatory text and an optional link to a
 * privacy policy. The stored value is a boolean.
 */
export function GdprFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<GdprFieldSchema>) {
  const id = fieldControlId(field.id);
  const checked = value === true;
  const consentText =
    field.consentText ??
    "I agree to the processing of my personal data in accordance with the privacy policy.";

  return (
    <FieldWrapper field={field} error={error} controlId={id} showLabel={false}>
      <label className="rfb-gdpr" htmlFor={id}>
        <input
          id={id}
          name={field.name}
          type="checkbox"
          className="rfb-gdpr__checkbox"
          checked={checked}
          disabled={disabled || readOnly}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
        />
        <span className="rfb-gdpr__text">
          {consentText}
          {field.policyUrl && (
            <>
              {" "}
              <a
                href={field.policyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rfb-gdpr__link"
                onClick={(e) => e.stopPropagation()}
              >
                {field.policyLabel ?? "Privacy policy"}
              </a>
              .
            </>
          )}
          {field.required && (
            <span className="rfb-field__required" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </span>
      </label>
    </FieldWrapper>
  );
}
