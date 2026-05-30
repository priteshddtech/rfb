import type { RecaptchaField as RecaptchaFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

/**
 * reCAPTCHA placeholder. Real Google reCAPTCHA requires loading their
 * external script and a verified site key; this component renders a
 * branded preview box so the form builder can lay it out, and switches
 * to a hint message when no site key is set. Integrations layer is
 * expected to swap in the live widget at runtime.
 */
export function RecaptchaFieldComponent({
  field,
  error,
}: FieldComponentProps<RecaptchaFieldSchema>) {
  const id = fieldControlId(field.id);
  const theme = field.theme ?? "light";
  const variant = field.variant ?? "v2-checkbox";
  const configured = !!field.siteKey;

  return (
    <FieldWrapper
      field={field}
      error={error}
      controlId={id}
      showLabel={!!field.label}
    >
      <div
        className={[
          "rfb-recaptcha",
          `rfb-recaptcha--${theme}`,
          configured && "rfb-recaptcha--configured",
        ]
          .filter(Boolean)
          .join(" ")}
        id={id}
        role="group"
        aria-label="reCAPTCHA"
      >
        {variant === "v2-checkbox" ? (
          <>
            <span
              className="rfb-recaptcha__check"
              aria-hidden="true"
            />
            <span className="rfb-recaptcha__label">I'm not a robot</span>
            <span className="rfb-recaptcha__brand" aria-hidden="true">
              reCAPTCHA
            </span>
          </>
        ) : (
          <span className="rfb-recaptcha__invisible">
            Protected by reCAPTCHA ({variant})
          </span>
        )}
        {!configured && (
          <p className="rfb-recaptcha__hint">
            Set a Google reCAPTCHA site key in the field config to enable the
            live widget.
          </p>
        )}
      </div>
    </FieldWrapper>
  );
}
