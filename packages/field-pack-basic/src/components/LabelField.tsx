import type { LabelField as LabelFieldSchema } from "@rfb-ddt/schema";
import type { CSSProperties } from "react";
import type { FieldComponentProps } from "../types.js";

export function LabelFieldComponent({
  field,
}: FieldComponentProps<LabelFieldSchema>) {
  return (
    <div
      className={["rfb-label-block", field.className].filter(Boolean).join(" ")}
      data-field-id={field.id}
      style={field.style as CSSProperties | undefined}
    >
      {field.content || field.label || "Label"}
    </div>
  );
}
