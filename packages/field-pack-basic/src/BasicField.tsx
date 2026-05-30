import { createContext, useContext } from "react";
import type { FormField } from "@rfb-ddt/schema";
import type { FieldComponentProps } from "./types.js";
import type { ReactFieldRegistry } from "./registry/ReactFieldRegistry.js";
import { createBasicReactFieldRegistry } from "./registry/registerBasicFieldComponents.js";

export interface BasicFieldProps
  extends Omit<FieldComponentProps, "field"> {
  field: FormField;
  registry?: ReactFieldRegistry;
}

/**
 * Context provider used so that container fields (e.g. `repeater`) can render
 * their own children with the same registry the parent renderer is using,
 * without having to thread it through every prop.
 */
const FieldRegistryContext = createContext<ReactFieldRegistry | null>(null);

export const FieldRegistryProvider = FieldRegistryContext.Provider;

export function useFieldRegistry(): ReactFieldRegistry {
  const ctx = useContext(FieldRegistryContext);
  return ctx ?? defaultRegistry;
}

export function BasicField({
  field,
  registry,
  ...props
}: BasicFieldProps) {
  const ctxRegistry = useContext(FieldRegistryContext);
  const effective = registry ?? ctxRegistry ?? defaultRegistry;
  const Component = effective.get(field.type);

  if (!Component) {
    return (
      <div className="rfb-field rfb-field--unknown" data-field-type={field.type}>
        <p className="rfb-field__error">
          Unknown field type: <code>{field.type}</code>
        </p>
      </div>
    );
  }

  // Make the resolved registry available to descendants so nested containers
  // like RepeaterField can render their own children.
  return (
    <FieldRegistryProvider value={effective}>
      <Component field={field} {...props} />
    </FieldRegistryProvider>
  );
}

const defaultRegistry = createBasicReactFieldRegistry();
