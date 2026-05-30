import type { PhotoField as PhotoFieldSchema } from "@rfb-ddt/schema";
import { useState } from "react";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

/**
 * Photo capture — a file input that prompts the camera on mobile (via the
 * `capture` attribute) and shows a thumbnail preview after a shot is taken.
 */
export function PhotoFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<PhotoFieldSchema>) {
  const id = fieldControlId(field.id);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof value === "string" ? value : null,
  );
  const facing = field.facingMode ?? "environment";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      onChange(null);
      setPreviewUrl(null);
      return;
    }
    if (field.maxSize && file.size > field.maxSize) {
      onChange(null);
      setPreviewUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <div className="rfb-photo">
        <label className="rfb-photo__trigger" htmlFor={id}>
          {previewUrl ? "Retake photo" : "Take a photo"}
        </label>
        <input
          id={id}
          name={field.name}
          type="file"
          accept="image/*"
          // `capture` is allowed on input elements per HTML spec, but the
          // React DOM types are out of date in some setups.
          capture={facing as unknown as boolean | undefined}
          className="rfb-photo__input"
          disabled={disabled || readOnly}
          aria-invalid={error ? true : undefined}
          onChange={handleChange}
          onBlur={onBlur}
        />
        {previewUrl && (
          <img
            className="rfb-photo__preview"
            src={previewUrl}
            alt="Captured"
          />
        )}
      </div>
    </FieldWrapper>
  );
}
