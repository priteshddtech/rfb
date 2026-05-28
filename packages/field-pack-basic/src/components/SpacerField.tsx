import type { SpacerField as SpacerFieldSchema } from "@rfb-ddt/schema";
import type { CSSProperties } from "react";
import type { FieldComponentProps } from "../types.js";

export function SpacerFieldComponent({
  field,
}: FieldComponentProps<SpacerFieldSchema>) {
  const height = Math.max(0, Number(field.height) || 16);
  const style: CSSProperties = {
    height: `${height}px`,
    ...(field.style as CSSProperties | undefined),
  };
  return (
    <div
      className={["rfb-spacer", field.className].filter(Boolean).join(" ")}
      style={style}
      data-field-id={field.id}
      aria-hidden="true"
    />
  );
}
