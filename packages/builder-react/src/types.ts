import type { FormSchema } from "@rfb-ddt/schema";

export interface FormBuilderProps {
  /** Controlled schema. */
  schema?: FormSchema;
  /** Initial schema when uncontrolled. */
  defaultSchema?: FormSchema;
  onChange?: (schema: FormSchema) => void;
  className?: string;
  /** Show live preview panel using FormRenderer. Default: true. */
  showPreview?: boolean;
  fullscreen?: boolean;
}

export interface ToolboxFieldMeta {
  type: string;
  label: string;
  description?: string;
  group?:
    | "quick"
    | "input"
    | "choice"
    | "layout"
    | "static"
    | "media"
    | "advanced";
}
