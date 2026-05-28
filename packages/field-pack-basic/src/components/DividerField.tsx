import type { DividerField as DividerFieldSchema } from "@rfb-ddt/schema";
import type { CSSProperties } from "react";
import type { FieldComponentProps } from "../types.js";

export function DividerFieldComponent({
  field,
}: FieldComponentProps<DividerFieldSchema>) {
  const variant = field.variant ?? "solid";
  return (
    <hr
      className={[
        "rfb-divider",
        `rfb-divider--${variant}`,
        field.className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-field-id={field.id}
      style={field.style as CSSProperties | undefined}
    />
  );
}
