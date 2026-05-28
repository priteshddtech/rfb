import type { FormField } from "@rfb-ddt/schema";
import type { CSSProperties, ReactNode } from "react";

export interface FieldWrapperProps {
  field: FormField;
  error?: string;
  controlId: string;
  children: ReactNode;
  /** Hidden fields skip label wrapper. */
  showLabel?: boolean;
}

export function FieldWrapper({
  field,
  error,
  controlId,
  children,
  showLabel = true,
}: FieldWrapperProps) {
  if (field.type === "hidden") {
    return <>{children}</>;
  }

  const className = [
    "rfb-field",
    `rfb-field--${field.type}`,
    field.size && `rfb-field--size-${field.size}`,
    field.className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      data-field-id={field.id}
      data-field-type={field.type}
      data-size={field.size}
      style={field.style as CSSProperties | undefined}
    >
      {showLabel && field.label && (
        <label className="rfb-field__label" htmlFor={controlId}>
          {field.label}
          {field.required && (
            <span className="rfb-field__required" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
      )}
      {field.description && (
        <p className="rfb-field__description" id={`${controlId}-desc`}>
          {field.description}
        </p>
      )}
      <div className="rfb-field__control">{children}</div>
      {error && (
        <p className="rfb-field__error" role="alert" id={`${controlId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export function fieldControlId(fieldId: string): string {
  return `rfb-field-${fieldId}`;
}
