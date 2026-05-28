import { isFormSchema, type FormSchema } from "@rfb-ddt/schema";

export interface ApiToSchemaMapper {
  map(response: unknown): FormSchema;
}

/**
 * Use when the API already returns a valid `FormSchema` JSON payload.
 */
export function createPassthroughApiMapper(): ApiToSchemaMapper {
  return {
    map(response: unknown): FormSchema {
      if (!isFormSchema(response)) {
        throw new Error("API response is not a valid FormSchema");
      }
      return response;
    },
  };
}

/**
 * Map a generic API envelope to a form schema.
 * Host apps can provide custom mappers for their backend shape.
 */
export function createEnvelopeApiMapper(options: {
  schemaPath: string;
}): ApiToSchemaMapper {
  return {
    map(response: unknown): FormSchema {
      const schema = getByPath(response, options.schemaPath);
      if (!isFormSchema(schema)) {
        throw new Error(
          `No FormSchema found at path "${options.schemaPath}"`,
        );
      }
      return schema;
    },
  };
}

function getByPath(value: unknown, path: string): unknown {
  const parts = path.split(".").filter(Boolean);
  let current: unknown = value;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
