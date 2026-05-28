import type { ParagraphField as ParagraphFieldSchema } from "@rfb-ddt/schema";
import type { CSSProperties } from "react";
import type { FieldComponentProps } from "../types.js";

export function ParagraphFieldComponent({
  field,
}: FieldComponentProps<ParagraphFieldSchema>) {
  return (
    <p
      className={["rfb-paragraph", field.className].filter(Boolean).join(" ")}
      data-field-id={field.id}
      style={field.style as CSSProperties | undefined}
    >
      {field.content || field.label || "Paragraph text"}
    </p>
  );
}
