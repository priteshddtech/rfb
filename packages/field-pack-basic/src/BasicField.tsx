import type { FormField } from "@rfb-ddt/schema";
import type { FieldComponentProps } from "./types.js";
import type { ReactFieldRegistry } from "./registry/ReactFieldRegistry.js";
import { createBasicReactFieldRegistry } from "./registry/registerBasicFieldComponents.js";

export interface BasicFieldProps
  extends Omit<FieldComponentProps, "field"> {
  field: FormField;
  registry?: ReactFieldRegistry;
}

export function BasicField({
  field,
  registry = defaultRegistry,
  ...props
}: BasicFieldProps) {
  const Component = registry.get(field.type);

  if (!Component) {
    return (
      <div className="rfb-field rfb-field--unknown" data-field-type={field.type}>
        <p className="rfb-field__error">
          Unknown field type: <code>{field.type}</code>
        </p>
      </div>
    );
  }

  return <Component field={field} {...props} />;
}

const defaultRegistry = createBasicReactFieldRegistry();
