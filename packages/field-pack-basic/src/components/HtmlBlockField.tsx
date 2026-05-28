import type { HtmlBlockField as HtmlBlockFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

/**
 * Renders static HTML blocks. Content is trusted form-builder output;
 * sanitize in the host app if end users can author HTML.
 */
export function HtmlBlockFieldComponent({
  field,
}: FieldComponentProps<HtmlBlockFieldSchema>) {
  const id = fieldControlId(field.id);

  return (
    <FieldWrapper
      field={field}
      controlId={id}
      showLabel={!!field.label}
    >
      <div
        className="rfb-html-block"
        dangerouslySetInnerHTML={{ __html: field.content }}
      />
    </FieldWrapper>
  );
}
