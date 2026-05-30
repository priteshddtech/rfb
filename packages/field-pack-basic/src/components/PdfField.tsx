import type { PdfField as PdfFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

/**
 * Embed a PDF document via an iframe pointed at the URL.
 * Presentational only — not a submittable input.
 */
export function PdfFieldComponent({
  field,
  error,
}: FieldComponentProps<PdfFieldSchema>) {
  const id = fieldControlId(field.id);
  const width =
    typeof field.width === "number" ? `${field.width}px` : field.width;
  const height =
    typeof field.height === "number"
      ? `${field.height}px`
      : field.height || "480px";

  return (
    <FieldWrapper
      field={field}
      error={error}
      controlId={id}
      showLabel={!!field.label}
    >
      <div className="rfb-pdf" style={{ width }}>
        {field.url ? (
          <iframe
            className="rfb-pdf__frame"
            src={field.url}
            title={field.label || "PDF document"}
            style={{ height }}
          />
        ) : (
          <div className="rfb-pdf__placeholder" style={{ height }}>
            Set a PDF URL to embed.
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
