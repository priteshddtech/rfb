import type { ImageField as ImageFieldSchema } from "@rfb-ddt/schema";
import type { CSSProperties } from "react";
import type { FieldComponentProps } from "../types.js";

function toSize(value: number | string | undefined): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "number") return `${value}px`;
  return value;
}

export function ImageFieldComponent({
  field,
}: FieldComponentProps<ImageFieldSchema>) {
  const imgStyle: CSSProperties = {
    width: toSize(field.width),
    height: toSize(field.height),
  };
  const img = (
    <img
      src={field.src}
      alt={field.alt ?? field.label ?? ""}
      className="rfb-image__img"
      style={imgStyle}
      loading="lazy"
    />
  );

  return (
    <div
      className={["rfb-image", field.className].filter(Boolean).join(" ")}
      data-field-id={field.id}
      style={field.style as CSSProperties | undefined}
    >
      {field.href ? (
        <a href={field.href} target="_blank" rel="noreferrer">
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
}
