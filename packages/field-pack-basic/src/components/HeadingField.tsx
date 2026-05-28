import type { HeadingField as HeadingFieldSchema } from "@rfb-ddt/schema";
import type { CSSProperties, JSX } from "react";
import type { FieldComponentProps } from "../types.js";

export function HeadingFieldComponent({
  field,
}: FieldComponentProps<HeadingFieldSchema>) {
  const level = Math.max(1, Math.min(6, Number(field.level) || 2));
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag
      className={["rfb-heading", `rfb-heading--h${level}`, field.className]
        .filter(Boolean)
        .join(" ")}
      data-field-id={field.id}
      style={field.style as CSSProperties | undefined}
    >
      {field.content || field.label || "Heading"}
    </Tag>
  );
}
