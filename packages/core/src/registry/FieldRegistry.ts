import type {
  CustomValidatorFn,
  FieldTypeDefinition,
} from "./types.js";

export class FieldRegistry {
  private readonly types = new Map<string, FieldTypeDefinition>();
  private readonly validators = new Map<string, CustomValidatorFn>();

  registerType(definition: FieldTypeDefinition): this {
    this.types.set(definition.type, definition);
    return this;
  }

  registerTypes(definitions: FieldTypeDefinition[]): this {
    for (const definition of definitions) {
      this.registerType(definition);
    }
    return this;
  }

  registerValidator(id: string, validator: CustomValidatorFn): this {
    this.validators.set(id, validator);
    return this;
  }

  getType(type: string): FieldTypeDefinition | undefined {
    return this.types.get(type);
  }

  hasType(type: string): boolean {
    return this.types.has(type);
  }

  getValidator(id: string): CustomValidatorFn | undefined {
    return this.validators.get(id);
  }

  listTypes(): string[] {
    return [...this.types.keys()];
  }
}
