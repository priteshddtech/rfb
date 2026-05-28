import type { SpanField as SpanFieldSchema } from "@rfb-ddt/schema";
import type { CSSProperties } from "react";
import type { FieldComponentProps } from "../types.js";

export function SpanFieldComponent({
  field,
}: FieldComponentProps<SpanFieldSchema>) {
  return (
    <span
      className={["rfb-span", field.className].filter(Boolean).join(" ")}
      data-field-id={field.id}
      style={field.style as CSSProperties | undefined}
    >
      {field.content || field.label || "Text"}
    </span>
  );
}
