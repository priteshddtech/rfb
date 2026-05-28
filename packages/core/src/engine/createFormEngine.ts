import type { FieldRegistry } from "../registry/FieldRegistry.js";
import { registerBuiltinFieldTypes } from "../registry/builtins.js";
import { FormEngine } from "./FormEngine.js";
import type { FormEngineOptions } from "./types.js";

export interface CreateFormEngineOptions extends FormEngineOptions {
  registry?: FieldRegistry;
}

export function createFormEngine(options: CreateFormEngineOptions): FormEngine {
  if (options.registry) {
    const registry = options.registry;
    if (options.registerBuiltins !== false) {
      registerBuiltinFieldTypes(registry);
    }
    return new FormEngine(
      options.schema,
      registry,
      options.initialValues,
    );
  }
  return FormEngine.create(options);
}
