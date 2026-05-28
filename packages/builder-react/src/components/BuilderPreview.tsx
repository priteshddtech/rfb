import { FormRenderer } from "@rfb-ddt/renderer-react";
import type { FormSchema } from "@rfb-ddt/schema";

export interface BuilderPreviewProps {
  schema: FormSchema;
}

export function BuilderPreview({ schema }: BuilderPreviewProps) {
  if (schema.fields.length === 0) {
    return (
      <div className="rfb-builder-preview rfb-builder-preview--empty">
        <p>Add fields to see a live preview</p>
      </div>
    );
  }

  return (
    <div className="rfb-builder-preview">
      <FormRenderer schema={schema} showHeader />
    </div>
  );
}
