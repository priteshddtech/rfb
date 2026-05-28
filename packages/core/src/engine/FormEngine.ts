import type { FormField, FormResponse, FormSchema } from "@rfb-ddt/schema";
import {
  isFieldActive,
  isFieldVisible,
} from "../conditions/fieldVisibility.js";
import { getFieldsForPage, getLayoutPageCount } from "../layout/resolveLayout.js";
import { FieldRegistry } from "../registry/FieldRegistry.js";
import { registerBuiltinFieldTypes } from "../registry/builtins.js";
import type { FieldError } from "../registry/types.js";
import { validateField } from "../validation/validateField.js";
import type {
  AfterSubmitHook,
  BeforeSubmitHook,
  FormEngineOptions,
  FormEngineState,
  SubmitResult,
} from "./types.js";

export class FormEngine {
  private readonly schema: FormSchema;
  private readonly registry: FieldRegistry;
  private values: Record<string, unknown>;
  private errors: Record<string, string> = {};
  private touched: Record<string, boolean> = {};
  private currentPageIndex = 0;
  private readonly beforeSubmitHooks: BeforeSubmitHook[] = [];
  private readonly afterSubmitHooks: AfterSubmitHook[] = [];

  constructor(
    schema: FormSchema,
    registry: FieldRegistry,
    initialValues?: Record<string, unknown>,
  ) {
    this.schema = schema;
    this.registry = registry;
    this.values = {
      ...buildDefaultValues(schema, registry),
      ...initialValues,
    };
  }

  static create(options: FormEngineOptions): FormEngine {
    const registry = new FieldRegistry();
    if (options.registerBuiltins !== false) {
      registerBuiltinFieldTypes(registry);
    }
    return new FormEngine(
      options.schema,
      registry,
      options.initialValues,
    );
  }

  getSchema(): FormSchema {
    return this.schema;
  }

  getRegistry(): FieldRegistry {
    return this.registry;
  }

  getState(): FormEngineState {
    return {
      values: { ...this.values },
      errors: { ...this.errors },
      touched: { ...this.touched },
      currentPageIndex: this.currentPageIndex,
    };
  }

  getValues(): Record<string, unknown> {
    return { ...this.values };
  }

  getValue(fieldName: string): unknown {
    return this.values[fieldName];
  }

  setValue(fieldName: string, value: unknown, touch = true): void {
    this.values[fieldName] = value;
    if (touch) this.touched[fieldName] = true;
    delete this.errors[fieldName];
  }

  setValues(partial: Record<string, unknown>, touch = true): void {
    for (const [name, value] of Object.entries(partial)) {
      this.setValue(name, value, touch);
    }
  }

  reset(initialValues?: Record<string, unknown>): void {
    this.values = {
      ...buildDefaultValues(this.schema, this.registry),
      ...initialValues,
    };
    this.errors = {};
    this.touched = {};
    this.currentPageIndex = 0;
  }

  getErrors(): Record<string, string> {
    return { ...this.errors };
  }

  getFieldErrors(): FieldError[] {
    return Object.entries(this.errors).map(([fieldName, message]) => {
      const field = this.schema.fields.find((f) => f.name === fieldName);
      return {
        fieldName,
        fieldId: field?.id ?? fieldName,
        message,
      };
    });
  }

  onBeforeSubmit(hook: BeforeSubmitHook): () => void {
    this.beforeSubmitHooks.push(hook);
    return () => {
      const index = this.beforeSubmitHooks.indexOf(hook);
      if (index >= 0) this.beforeSubmitHooks.splice(index, 1);
    };
  }

  onAfterSubmit(hook: AfterSubmitHook): () => void {
    this.afterSubmitHooks.push(hook);
    return () => {
      const index = this.afterSubmitHooks.indexOf(hook);
      if (index >= 0) this.afterSubmitHooks.splice(index, 1);
    };
  }

  getMode() {
    return this.schema.settings?.mode ?? "add";
  }

  isReadOnly(): boolean {
    return this.getMode() === "view";
  }

  getCurrentPageIndex(): number {
    return this.currentPageIndex;
  }

  getPageCount(): number {
    return getLayoutPageCount(this.schema);
  }

  getCurrentPageFields(): FormField[] {
    return getFieldsForPage(this.schema, this.currentPageIndex);
  }

  getVisibleFields(pageIndex = this.currentPageIndex): FormField[] {
    const pageFields = getFieldsForPage(this.schema, pageIndex);
    return pageFields.filter((field) =>
      isFieldActive(field, this.schema.fields, this.values),
    );
  }

  goToPage(index: number): boolean {
    if (index < 0 || index >= this.getPageCount()) return false;
    this.currentPageIndex = index;
    return true;
  }

  nextPage(): boolean {
    if (!this.validateCurrentPage()) return false;
    return this.goToPage(this.currentPageIndex + 1);
  }

  previousPage(): boolean {
    return this.goToPage(this.currentPageIndex - 1);
  }

  validateCurrentPage(): boolean {
    const fields = this.getVisibleFields(this.currentPageIndex);
    return this.validateFields(fields);
  }

  validate(fieldNames?: string[]): boolean {
    const fields = fieldNames
      ? this.schema.fields.filter((f) => fieldNames.includes(f.name))
      : this.getVisibleFieldsForAllPages();
    return this.validateFields(fields);
  }

  buildResponse(): FormResponse {
    const data: Record<string, unknown> = {};
    for (const field of this.schema.fields) {
      const typeDef = this.registry.getType(field.type);
      if (typeDef?.isInput === false) continue;
      if (!isFieldVisible(field, this.schema.fields, this.values)) continue;
      data[field.name] = this.values[field.name];
    }

    return {
      formId: this.schema.id,
      submittedAt: new Date().toISOString(),
      data,
    };
  }

  async submit(): Promise<SubmitResult> {
    if (this.isReadOnly()) {
      return { ok: false, cancelled: true, reason: "Form is in view mode" };
    }

    const valid = this.validate();
    if (!valid) {
      return { ok: false, errors: this.getFieldErrors() };
    }

    let values = this.getValues();
    let response = this.buildResponseFromValues(values);

    for (const hook of this.beforeSubmitHooks) {
      const result = await hook({
        schema: this.schema,
        values,
        response,
      });
      if (result?.cancel) {
        return {
          ok: false,
          cancelled: true,
          reason: result.reason ?? "Submission cancelled",
        };
      }
      if (result?.values) {
        values = { ...values, ...result.values };
        this.setValues(result.values, false);
        response = this.buildResponseFromValues(values);
      }
    }

    for (const hook of this.afterSubmitHooks) {
      await hook({ schema: this.schema, values, response });
    }

    return { ok: true, response };
  }

  private buildResponseFromValues(
    values: Record<string, unknown>,
  ): FormResponse {
    const previous = this.values;
    this.values = values;
    const response = this.buildResponse();
    this.values = previous;
    return response;
  }

  private getVisibleFieldsForAllPages(): FormField[] {
    const seen = new Set<string>();
    const result: FormField[] = [];
    for (let i = 0; i < this.getPageCount(); i++) {
      for (const field of this.getVisibleFields(i)) {
        if (!seen.has(field.id)) {
          seen.add(field.id);
          result.push(field);
        }
      }
    }
    return result;
  }

  private validateFields(fields: FormField[]): boolean {
    const nextErrors: Record<string, string> = { ...this.errors };

    for (const field of fields) {
      const typeDef = this.registry.getType(field.type);
      if (typeDef?.isInput === false) continue;

      const fieldErrors = validateField(
        field,
        this.values[field.name],
        this.values,
        this.registry,
      );

      if (fieldErrors.length > 0) {
        nextErrors[field.name] = fieldErrors[0]!.message;
      } else {
        delete nextErrors[field.name];
      }
    }

    this.errors = nextErrors;
    return Object.keys(nextErrors).length === 0;
  }
}

function buildDefaultValues(
  schema: FormSchema,
  registry: FieldRegistry,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of schema.fields) {
    const typeDef = registry.getType(field.type);
    if (typeDef?.isInput === false) continue;
    values[field.name] =
      typeDef?.getDefaultValue?.(field) ?? field.defaultValue ?? "";
  }
  return values;
}
