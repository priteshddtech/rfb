import type { FieldComponent } from "../types.js";

export class ReactFieldRegistry {
  private readonly components = new Map<string, FieldComponent>();

  register(type: string, component: FieldComponent): this {
    this.components.set(type, component);
    return this;
  }

  registerMany(entries: Record<string, FieldComponent>): this {
    for (const [type, component] of Object.entries(entries)) {
      this.register(type, component);
    }
    return this;
  }

  get(type: string): FieldComponent | undefined {
    return this.components.get(type);
  }

  has(type: string): boolean {
    return this.components.has(type);
  }

  listTypes(): string[] {
    return [...this.components.keys()];
  }
}
